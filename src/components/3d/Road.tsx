import { useMemo } from 'react'
import * as THREE from 'three'

interface RoadProps {
  points: [number, number, number][]
  width: number
}

export default function Road({ points, width }: RoadProps) {
  const geometry = useMemo(() => {
    if (points.length < 2) return null

    const curve = new THREE.CatmullRomCurve3(
      points.map(p => new THREE.Vector3(...p))
    )

    const tubeGeometry = new THREE.TubeGeometry(curve, points.length * 2, width / 2, 8, false)
    return tubeGeometry
  }, [points, width])

  if (!geometry) return null

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial color="#3a3a3a" />
    </mesh>
  )
}
