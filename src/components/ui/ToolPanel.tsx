import { Train, Bus, TrainTrack, Cable } from 'lucide-react'
import { TransportType } from '../../types/game'
import { useGameStore } from '../../store/gameStore'

export default function ToolPanel() {
  const { selectedTool, setSelectedTool, setBuildMode } = useGameStore()

  const tools: { type: TransportType; icon: any; label: string }[] = [
    { type: 'metro', icon: TrainTrack, label: 'Metro' },
    { type: 'train', icon: Train, label: 'Train' },
    { type: 'tram', icon: Cable, label: 'Tram' },
    { type: 'bus', icon: Bus, label: 'Bus' },
  ]

  const handleToolSelect = (type: TransportType) => {
    if (selectedTool === type) {
      setSelectedTool(null)
      setBuildMode(false)
    } else {
      setSelectedTool(type)
      setBuildMode(true)
    }
  }

  return (
    <div className="absolute left-4 top-12 bg-black bg-opacity-70 backdrop-blur-2xl border border-white border-opacity-20 z-10 overflow-hidden">
      {/* Accent line at top */}
      <div className="h-[2px] bg-[#c90a43]" />
      
      <div className="p-3">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-[2px] h-4 bg-[#c90a43]" />
          <h3 className="text-white font-light text-[10px] tracking-widest uppercase opacity-60">Tools</h3>
        </div>
        
        <div className="space-y-0.5">
          {tools.map(({ type, icon: Icon, label }) => (
            <button
              key={type}
              onClick={() => handleToolSelect(type)}
              className={`w-full flex items-center space-x-2 px-2 py-1.5 transition-all ${
                selectedTool === type
                  ? 'text-white bg-[#c90a43]'
                  : 'text-white text-opacity-50 hover:text-opacity-100 hover:bg-white hover:bg-opacity-10'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-light text-xs tracking-wide">{label}</span>
            </button>
          ))}
        </div>

        {selectedTool && (
          <div className="mt-2 pt-2 border-t border-white border-opacity-10">
            <p className="text-[10px] text-white text-opacity-40 font-light tracking-wide">
              Click map to place stations
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
