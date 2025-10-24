import { useRef } from 'react'
import { Mesh } from 'three'

interface BuildingProps {
  position: [number, number, number]
  size: [number, number, number]
  type: string
}

export default function Building({ position, size, type }: BuildingProps) {
  const meshRef = useRef<Mesh>(null)

  // Color based on building type
  const getColor = () => {
    if (type === 'commercial') return '#8B7355'
    if (type === 'residential') return '#A0826D'
    if (type === 'industrial') return '#6B6B6B'
    return '#9E9E9E'
  }

  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={getColor()} />
    </mesh>
  )
}
