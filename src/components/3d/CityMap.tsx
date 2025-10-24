import { useEffect, useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import Building from './Building'
import Road from './Road'

interface BuildingData {
  id: string
  position: [number, number, number]
  size: [number, number, number]
  type: string
}

interface RoadData {
  id: string
  points: [number, number, number][]
  width: number
}

export default function CityMap() {
  const { osmData } = useGameStore()
  const [buildings, setBuildings] = useState<BuildingData[]>([])
  const [roads, setRoads] = useState<RoadData[]>([])

  useEffect(() => {
    if (!osmData) return

    // Parse OSM data and create 3D representations
    const parsedBuildings = parseBuildings(osmData)
    const parsedRoads = parseRoads(osmData)
    
    setBuildings(parsedBuildings)
    setRoads(parsedRoads)
  }, [osmData])

  return (
    <group>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.1, 0]}>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color="#2d5016" />
      </mesh>

      {/* Buildings */}
      {buildings.map((building) => (
        <Building key={building.id} {...building} />
      ))}

      {/* Roads */}
      {roads.map((road) => (
        <Road key={road.id} {...road} />
      ))}
    </group>
  )
}

function parseBuildings(osmData: any): BuildingData[] {
  if (!osmData || !osmData.buildings) return []

  const buildings: BuildingData[] = []
  
  osmData.buildings.forEach((building: any) => {
    if (!building.nodes || building.nodes.length < 3) return

    // Calculate center and size from nodes
    const lats = building.nodes.map((n: any) => n.lat)
    const lons = building.nodes.map((n: any) => n.lon)
    
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2
    const centerLon = (Math.min(...lons) + Math.max(...lons)) / 2
    
    // Convert lat/lon differences to meters (approximate)
    const width = (Math.max(...lons) - Math.min(...lons)) * 111000 * Math.cos(centerLat * Math.PI / 180)
    const depth = (Math.max(...lats) - Math.min(...lats)) * 111000
    
    const height = building.height || 15
    
    // Convert to local coordinates (relative to center)
    const x = (centerLon - osmData.bounds.minLon) * 111000 * Math.cos(centerLat * Math.PI / 180)
    const z = (centerLat - osmData.bounds.minLat) * 111000
    
    buildings.push({
      id: building.id,
      position: [x, height / 2, z],
      size: [Math.max(width, 5), height, Math.max(depth, 5)],
      type: building.type,
    })
  })

  return buildings
}

function parseRoads(osmData: any): RoadData[] {
  if (!osmData || !osmData.roads) return []

  const roads: RoadData[] = []
  
  osmData.roads.forEach((road: any) => {
    if (!road.nodes || road.nodes.length < 2) return

    // Convert lat/lon to local coordinates
    const points: [number, number, number][] = road.nodes.map((node: any) => {
      const x = (node.lon - osmData.bounds.minLon) * 111000 * Math.cos(node.lat * Math.PI / 180)
      const z = (node.lat - osmData.bounds.minLat) * 111000
      return [x, 0.1, z]
    })

    const width = getRoadWidth(road.type)
    
    roads.push({
      id: road.id,
      points,
      width,
    })
  })

  return roads
}

function getRoadWidth(highway: string): number {
  const widths: Record<string, number> = {
    motorway: 12,
    trunk: 10,
    primary: 8,
    secondary: 6,
    tertiary: 5,
    residential: 4,
    service: 3,
  }
  return widths[highway] || 4
}
