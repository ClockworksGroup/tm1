import { useGameStore } from '../../store/gameStore'
import TransportLine from './TransportLine'
import StationMarker from './StationMarker'

export default function TransportNetwork() {
  const { lines, stations } = useGameStore()

  return (
    <group>
      {/* Render all transport lines */}
      {lines.map((line) => (
        <TransportLine key={line.id} line={line} />
      ))}

      {/* Render all stations */}
      {stations.map((station) => (
        <StationMarker key={station.id} station={station} />
      ))}
    </group>
  )
}
