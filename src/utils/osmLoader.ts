// OSM Data Loader using Overpass API (free)

export interface OSMBuilding {
  id: string
  lat: number
  lon: number
  height?: number
  levels?: number
  type: string
  nodes: Array<{ lat: number; lon: number }>
}

export interface OSMRoad {
  id: string
  name?: string
  type: string
  nodes: Array<{ lat: number; lon: number }>
  oneway?: boolean
}

export interface OSMData {
  buildings: OSMBuilding[]
  roads: OSMRoad[]
  bounds: {
    minLat: number
    maxLat: number
    minLon: number
    maxLon: number
  }
}

const OVERPASS_API = 'https://overpass-api.de/api/interpreter'

export async function loadCityData(lat: number, lon: number, radius: number = 1000): Promise<OSMData> {
  // Calculate bounding box (approximately 1km radius)
  const latOffset = radius / 111000 // 1 degree lat ≈ 111km
  const lonOffset = radius / (111000 * Math.cos(lat * Math.PI / 180))
  
  const bbox = {
    south: lat - latOffset,
    west: lon - lonOffset,
    north: lat + latOffset,
    east: lon + lonOffset,
  }

  // Overpass QL query for buildings and roads
  const query = `
    [out:json][timeout:25];
    (
      // Buildings
      way["building"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
      
      // Roads
      way["highway"~"motorway|trunk|primary|secondary|tertiary|residential"](${bbox.south},${bbox.west},${bbox.north},${bbox.east});
    );
    out body;
    >;
    out skel qt;
  `

  try {
    const response = await fetch(OVERPASS_API, {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`)
    }

    const data = await response.json()
    
    return parseOSMData(data, bbox)
  } catch (error) {
    console.error('Error loading OSM data:', error)
    // Return fallback mock data if API fails
    return createFallbackData(lat, lon, radius)
  }
}

function parseOSMData(osmResponse: any, bbox: any): OSMData {
  const nodes = new Map<number, { lat: number; lon: number }>()
  const buildings: OSMBuilding[] = []
  const roads: OSMRoad[] = []

  // First pass: collect all nodes
  osmResponse.elements.forEach((element: any) => {
    if (element.type === 'node') {
      nodes.set(element.id, { lat: element.lat, lon: element.lon })
    }
  })

  // Second pass: process ways
  osmResponse.elements.forEach((element: any) => {
    if (element.type === 'way') {
      const wayNodes = element.nodes
        .map((nodeId: number) => nodes.get(nodeId))
        .filter((node: any) => node !== undefined)

      if (wayNodes.length < 2) return

      // Check if it's a building
      if (element.tags?.building) {
        const height = element.tags['height'] 
          ? parseFloat(element.tags['height'])
          : element.tags['building:levels'] 
            ? parseFloat(element.tags['building:levels']) * 3.5 // Assume 3.5m per level
            : 10 + Math.random() * 20 // Random height 10-30m

        buildings.push({
          id: `building-${element.id}`,
          lat: wayNodes[0].lat,
          lon: wayNodes[0].lon,
          height,
          levels: element.tags['building:levels'] ? parseInt(element.tags['building:levels']) : Math.floor(height / 3.5),
          type: element.tags.building,
          nodes: wayNodes,
        })
      }

      // Check if it's a road
      if (element.tags?.highway) {
        roads.push({
          id: `road-${element.id}`,
          name: element.tags.name,
          type: element.tags.highway,
          nodes: wayNodes,
          oneway: element.tags.oneway === 'yes',
        })
      }
    }
  })

  return {
    buildings,
    roads,
    bounds: {
      minLat: bbox.south,
      maxLat: bbox.north,
      minLon: bbox.west,
      maxLon: bbox.east,
    },
  }
}

function createFallbackData(lat: number, lon: number, radius: number): OSMData {
  const buildings: OSMBuilding[] = []
  const roads: OSMRoad[] = []
  
  const latOffset = radius / 111000
  const lonOffset = radius / (111000 * Math.cos(lat * Math.PI / 180))

  // Create a grid of buildings
  const gridSize = 10
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const buildingLat = lat - latOffset + (i / gridSize) * (2 * latOffset)
      const buildingLon = lon - lonOffset + (j / gridSize) * (2 * lonOffset)
      
      // Skip some to create variety
      if (Math.random() > 0.7) continue
      
      const size = 0.0001 + Math.random() * 0.0002
      const height = 10 + Math.random() * 40
      
      buildings.push({
        id: `fallback-building-${i}-${j}`,
        lat: buildingLat,
        lon: buildingLon,
        height,
        levels: Math.floor(height / 3.5),
        type: 'residential',
        nodes: [
          { lat: buildingLat, lon: buildingLon },
          { lat: buildingLat + size, lon: buildingLon },
          { lat: buildingLat + size, lon: buildingLon + size },
          { lat: buildingLat, lon: buildingLon + size },
          { lat: buildingLat, lon: buildingLon },
        ],
      })
    }
  }

  // Create a grid of roads
  for (let i = 0; i <= gridSize; i++) {
    // Horizontal roads
    const roadLat = lat - latOffset + (i / gridSize) * (2 * latOffset)
    roads.push({
      id: `fallback-road-h-${i}`,
      name: `Street ${i}`,
      type: 'residential',
      nodes: [
        { lat: roadLat, lon: lon - lonOffset },
        { lat: roadLat, lon: lon + lonOffset },
      ],
      oneway: false,
    })

    // Vertical roads
    const roadLon = lon - lonOffset + (i / gridSize) * (2 * lonOffset)
    roads.push({
      id: `fallback-road-v-${i}`,
      name: `Avenue ${i}`,
      type: 'residential',
      nodes: [
        { lat: lat - latOffset, lon: roadLon },
        { lat: lat + latOffset, lon: roadLon },
      ],
      oneway: false,
    })
  }

  return {
    buildings,
    roads,
    bounds: {
      minLat: lat - latOffset,
      maxLat: lat + latOffset,
      minLon: lon - lonOffset,
      maxLon: lon + lonOffset,
    },
  }
}
