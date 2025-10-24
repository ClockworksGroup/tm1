import { useRef, useState } from 'react'
import { Mesh } from 'three'
import { Station } from '../../store/gameStore'
import { Html } from '@react-three/drei'

interface StationMarkerProps {
  station: Station
}

export default function StationMarker({ station }: StationMarkerProps) {
  const meshRef = useRef<Mesh>(null)
  const [hovered, setHovered] = useState(false)

  const getColor = () => {
    switch (station.type) {
      case 'metro': return '#FF6B6B'
      case 'train': return '#4ECDC4'
      case 'tram': return '#FFE66D'
      case 'bus': return '#95E1D3'
      default: return '#FFFFFF'
    }
  }

  return (
    <group position={station.position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[hovered ? 2 : 1.5, 16, 16]} />
        <meshStandardMaterial 
          color={getColor()} 
          emissive={getColor()}
          emissiveIntensity={hovered ? 0.5 : 0.2}
        />
      </mesh>

      {hovered && (
        <Html distanceFactor={10}>
          <div className="bg-black bg-opacity-80 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap">
            <div className="font-bold">{station.name}</div>
            <div className="text-xs text-gray-300">
              {station.passengers} passengers/hour
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}
