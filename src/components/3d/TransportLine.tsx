import { useMemo } from 'react'
import * as THREE from 'three'
import { TransportLine as TransportLineType } from '../../store/gameStore'

interface TransportLineProps {
  line: TransportLineType
}

export default function TransportLine({ line }: TransportLineProps) {
  const geometry = useMemo(() => {
    if (line.stations.length < 2) return null

    const points = line.stations.map(
      (station: any) => new THREE.Vector3(...station.position)
    )

    const curve = new THREE.CatmullRomCurve3(points)
    
    // Underground lines (metro) should be slightly below ground
    const yOffset = line.type === 'metro' ? -2 : 2
    const adjustedPoints = curve.getPoints(50).map((p: THREE.Vector3) => 
      new THREE.Vector3(p.x, p.y + yOffset, p.z)
    )
    
    const adjustedCurve = new THREE.CatmullRomCurve3(adjustedPoints)
    const tubeGeometry = new THREE.TubeGeometry(adjustedCurve, 50, 0.5, 8, false)
    
    return tubeGeometry
  }, [line.stations, line.type])

  if (!geometry) return null

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial 
        color={line.color} 
        emissive={line.color}
        emissiveIntensity={0.3}
      />
    </mesh>
  )
}
