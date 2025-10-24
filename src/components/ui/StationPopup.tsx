import { X, Users, Clock, AlertCircle } from 'lucide-react'
import { Station } from '../../types/game'
import { useGameStore } from '../../store/gameStore.ts'

interface StationPopupProps {
  station: Station
  onClose: () => void
  position: { x: number; y: number }
}

export default function StationPopup({ station, onClose, position }: StationPopupProps) {
  const { lines, stations } = useGameStore()
  
  // Get live station data from store instead of using the prop
  const liveStation = stations.find(s => s.id === station.id) || station
  
  // Find all lines that serve this station
  const servingLines = lines.filter(line => 
    line.stations.some(s => s.id === liveStation.id)
  )
  const getCrowdingStatus = () => {
    if (liveStation.crowdingLevel < 0.3) return { label: 'Low', color: 'text-green-400' }
    if (liveStation.crowdingLevel < 0.7) return { label: 'Medium', color: 'text-yellow-400' }
    return { label: 'High', color: 'text-red-400' }
  }

  const crowding = getCrowdingStatus()

  // Calculate safe position to keep popup visible
  const safeTop = Math.max(20, position.y - 400) // Keep at least 20px from top
  const safeLeft = Math.max(160, Math.min(position.x, window.innerWidth - 160)) // Keep within bounds

  return (
    <>
      {/* Backdrop to close on click */}
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      <div 
        className="fixed bg-[#1a1a1a] rounded-none border-l-4 shadow-2xl z-50 w-80"
        style={{ 
          left: `${safeLeft}px`, 
          top: `${safeTop}px`,
          transform: 'translateX(-50%)',
          borderLeftColor: '#c90a43'
        }}
        onClick={(e) => e.stopPropagation()}
      >
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: getStationColor(liveStation.type) }}
          />
          <div>
            <h3 className="text-white font-normal">{liveStation.name}</h3>
            <div className="text-gray-500 text-xs uppercase tracking-wide">
              {liveStation.type} Station
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Stats */}
      <div className="p-4 space-y-3">
        {/* Current Passengers */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-gray-400 text-sm">
            <Users className="w-4 h-4" />
            <span>Current Passengers</span>
          </div>
          <div className="text-white font-normal">{Math.floor(liveStation.passengers)}</div>
        </div>

        {/* Capacity */}
        <div className="flex items-center justify-between">
          <div className="text-gray-400 text-sm">Capacity</div>
          <div className="text-white font-normal">{liveStation.capacity} pax/hr</div>
        </div>

        {/* Wait Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-gray-400 text-sm">
            <Clock className="w-4 h-4" />
            <span>Avg Wait Time</span>
          </div>
          <div className="text-white font-normal">{liveStation.waitTime.toFixed(1)} min</div>
        </div>

        {/* Crowding */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-gray-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Crowding</span>
          </div>
          <div className={`font-normal ${crowding.color}`}>
            {crowding.label} ({(liveStation.crowdingLevel * 100).toFixed(0)}%)
          </div>
        </div>

        {/* Progress Bar */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-gray-500 text-xs">Utilization</span>
            <span className="text-gray-400 text-xs">
              {((liveStation.passengers / liveStation.capacity) * 100).toFixed(0)}%
            </span>
          </div>
          <div className="bg-gray-800 rounded-none h-2 overflow-hidden">
            <div 
              className={`h-full transition-all ${
                liveStation.crowdingLevel < 0.7 ? 'bg-green-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(100, (liveStation.passengers / liveStation.capacity) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Lines Serving This Station */}
      {servingLines.length > 0 && (
        <div className="p-4 border-t border-gray-800">
          <div className="text-gray-500 text-xs uppercase tracking-wide mb-2">
            Lines ({servingLines.length})
          </div>
          <div className="space-y-1.5">
            {servingLines.map(line => (
              <div 
                key={line.id}
                className="flex items-center space-x-2 bg-[#252525] rounded-none px-2 py-1.5"
              >
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: line.color }}
                />
                <span className="text-white text-xs font-normal flex-1">{line.name}</span>
                <span className="text-gray-500 text-xs">{line.frequency} min</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Infrastructure */}
      <div className="p-4 bg-[#252525] border-t border-gray-800">
        <div className="text-gray-500 text-xs uppercase tracking-wide mb-2">
          Infrastructure
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">Platforms</span>
            <span className="text-white">{liveStation.platforms}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Cleanliness</span>
            <span className="text-white">{liveStation.cleanliness}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Safety</span>
            <span className="text-white">{liveStation.safety}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Accessibility</span>
            <span className="text-white">{liveStation.accessibility}%</span>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

function getStationColor(type: string): string {
  const colors: Record<string, string> = {
    metro: '#3b82f6',
    train: '#22c55e',
    tram: '#eab308',
    bus: '#ef4444'
  }
  return colors[type] || '#ffffff'
}
