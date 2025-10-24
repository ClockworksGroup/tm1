import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import { useGameStore } from '../../store/gameStore.ts'
import { Station } from '../../types/game'

interface VehicleAnimationsProps {
  map: maplibregl.Map | null
}

export default function VehicleAnimations({ map }: VehicleAnimationsProps) {
  const { lines, gameSpeed } = useGameStore()
  const vehicleDataRef = useRef<Map<string, any[]>>(new Map())
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    if (!map || !map.isStyleLoaded()) return

    // Remove existing vehicle layer if it exists
    if (map.getLayer('vehicles')) {
      map.removeLayer('vehicles')
    }
    if (map.getSource('vehicles')) {
      map.removeSource('vehicles')
    }

    // Create GeoJSON source for all vehicles
    map.addSource('vehicles', {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: []
      }
    })

    // Add layer for vehicles as rectangles on the map
    // Use 'circle' type which renders below line layers by default
    map.addLayer({
      id: 'vehicles',
      type: 'circle',
      source: 'vehicles',
      paint: {
        'circle-color': ['get', 'color'],
        'circle-radius': 4,
        'circle-opacity': 0.9
      }
    })

    // Initialize vehicle data for each line
    vehicleDataRef.current.clear()
    lines.forEach(line => {
      if (line.phase !== 'operational' || line.stations.length < 2) return

      const numVehicles = Math.max(1, Math.floor(30 / line.frequency))
      const vehicles = []
      
      for (let i = 0; i < numVehicles; i++) {
        vehicles.push({
          progress: i / numVehicles,
          color: line.color,
          type: line.type
        })
      }
      
      vehicleDataRef.current.set(line.id, vehicles)
    })

    // Start animation loop
    let startTime = Date.now()
    
    const animate = async () => {
      const currentTime = Date.now()
      const elapsed = (currentTime - startTime) * gameSpeed

      for (const line of lines) {
        if (line.phase !== 'operational' || line.stations.length < 2) continue

        // Get actual line path coordinates (same as drawn line)
        let coordinates: number[][]
        if (line.type === 'bus') {
          coordinates = await getStreetRoute(line.stations)
        } else {
          coordinates = getSmoothCurve(line.stations)
        }
        
        // Calculate total path length (approximate)
        let totalDistance = 0
        for (let i = 0; i < coordinates.length - 1; i++) {
          const dx = coordinates[i + 1][0] - coordinates[i][0]
          const dy = coordinates[i + 1][1] - coordinates[i][1]
          totalDistance += Math.sqrt(dx * dx + dy * dy)
        }

        // Speed based on line type (in coordinate units per second) - much slower
        const speedMultiplier = {
          metro: 0.00002,
          train: 0.000025,
          tram: 0.000015,
          bus: 0.00001
        }[line.type] || 0.00001

        // Animate each vehicle
        const vehicles = vehicleDataRef.current.get(line.id)
        if (!vehicles) continue

        vehicles.forEach((vehicle, index) => {
          const offset = (index / vehicles.length) * totalDistance
          vehicle.progress = ((elapsed * speedMultiplier + offset) % totalDistance) / totalDistance
        })
      }

      // Update the map with all vehicle positions
      updateVehicleLayer(map, lines, vehicleDataRef.current)

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (map && map.getLayer('vehicles')) {
        map.removeLayer('vehicles')
      }
      if (map && map.getSource('vehicles')) {
        map.removeSource('vehicles')
      }
    }
  }, [map, lines, gameSpeed])

  return null
}

// Update vehicle layer with current positions
async function updateVehicleLayer(map: maplibregl.Map, lines: any[], vehicleData: Map<string, any[]>) {
  const features: any[] = []

  for (const line of lines) {
    if (line.phase !== 'operational' || line.stations.length < 2) continue

    const vehicles = vehicleData.get(line.id)
    if (!vehicles) continue

    // Get line path
    let coordinates: number[][]
    if (line.type === 'bus') {
      coordinates = await getStreetRoute(line.stations)
    } else {
      coordinates = getSmoothCurve(line.stations)
    }

    // Create a feature for each vehicle
    vehicles.forEach(vehicle => {
      const position = getPositionAlongPath(coordinates, vehicle.progress)
      if (!position) return
      
      features.push({
        type: 'Feature',
        properties: {
          color: vehicle.color
        },
        geometry: {
          type: 'Point',
          coordinates: position
        }
      })
    })
  }

  // Update the source
  const source = map.getSource('vehicles') as maplibregl.GeoJSONSource
  if (source) {
    source.setData({
      type: 'FeatureCollection',
      features
    })
  }
}

// Helper functions for routing (same as MapViewer)
async function getStreetRoute(stations: Station[]): Promise<number[][]> {
  try {
    const waypoints = stations
      .map(s => `${s.position[1]},${s.position[0]}`)
      .join(';')
    
    const url = `https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=full&geometries=geojson`
    const response = await fetch(url)
    const data = await response.json()
    
    if (data.code === 'Ok' && data.routes && data.routes[0]) {
      return data.routes[0].geometry.coordinates
    }
  } catch (error) {
    console.error('Error fetching route:', error)
  }
  
  // Fallback to straight line
  return stations.map(s => [s.position[1], s.position[0]])
}

function getSmoothCurve(stations: Station[]): number[][] {
  if (stations.length === 2) {
    return stations.map(s => [s.position[1], s.position[0]])
  }

  const coordinates: number[][] = []
  const points = stations.map(s => [s.position[1], s.position[0]])
  
  coordinates.push(points[0])
  
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[Math.min(points.length - 1, i + 2)]
    
    const segments = 10
    for (let t = 0; t < segments; t++) {
      const u = t / segments
      const point = catmullRom(p0, p1, p2, p3, u)
      coordinates.push(point)
    }
  }
  
  coordinates.push(points[points.length - 1])
  return coordinates
}

function catmullRom(p0: number[], p1: number[], p2: number[], p3: number[], t: number): number[] {
  const t2 = t * t
  const t3 = t2 * t
  
  const v0 = (p2[0] - p0[0]) * 0.5
  const v1 = (p3[0] - p1[0]) * 0.5
  const lng = (2 * p1[0] - 2 * p2[0] + v0 + v1) * t3 +
              (-3 * p1[0] + 3 * p2[0] - 2 * v0 - v1) * t2 +
              v0 * t + p1[0]
  
  const v0y = (p2[1] - p0[1]) * 0.5
  const v1y = (p3[1] - p1[1]) * 0.5
  const lat = (2 * p1[1] - 2 * p2[1] + v0y + v1y) * t3 +
              (-3 * p1[1] + 3 * p2[1] - 2 * v0y - v1y) * t2 +
              v0y * t + p1[1]
  
  return [lng, lat]
}


function getPositionAlongPath(coordinates: number[][], progress: number): [number, number] | null {
  if (coordinates.length < 2) return null

  // Calculate cumulative distances
  const distances: number[] = [0]
  let totalDistance = 0
  
  for (let i = 0; i < coordinates.length - 1; i++) {
    const dx = coordinates[i + 1][0] - coordinates[i][0]
    const dy = coordinates[i + 1][1] - coordinates[i][1]
    const dist = Math.sqrt(dx * dx + dy * dy)
    totalDistance += dist
    distances.push(totalDistance)
  }

  // Find segment
  const targetDistance = progress * totalDistance
  let segmentIndex = 0
  
  for (let i = 0; i < distances.length - 1; i++) {
    if (targetDistance >= distances[i] && targetDistance <= distances[i + 1]) {
      segmentIndex = i
      break
    }
  }

  // Interpolate within segment
  const segmentStart = distances[segmentIndex]
  const segmentEnd = distances[segmentIndex + 1]
  const segmentProgress = (targetDistance - segmentStart) / (segmentEnd - segmentStart)

  const start = coordinates[segmentIndex]
  const end = coordinates[segmentIndex + 1]

  return [
    start[0] + (end[0] - start[0]) * segmentProgress,
    start[1] + (end[1] - start[1]) * segmentProgress
  ]
}
