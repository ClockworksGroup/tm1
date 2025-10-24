import { X, Plus, Minus, Zap } from 'lucide-react'
import { useGameStore } from '../../store/gameStore'
import { calculateOptimalFrequency } from '../../utils/gameLogic'

export default function LineEditorPanel() {
  const { selectedLine, lines, setSelectedLine, updateLine, removeLine } = useGameStore()

  const line = lines.find(l => l.id === selectedLine)

  if (!line) return null

  const handleFrequencyChange = (delta: number) => {
    const newFrequency = Math.max(1, Math.min(30, line.frequency + delta))
    updateLine(line.id, { frequency: newFrequency })
  }

  const handleRushHourFrequencyChange = (delta: number) => {
    const newFrequency = Math.max(1, Math.min(30, line.rushHourFrequency + delta))
    updateLine(line.id, { rushHourFrequency: newFrequency })
  }

  const optimizeFrequency = () => {
    // Calculate total demand for the line
    const totalDemand = line.stations.reduce((sum, s) => sum + s.passengers, 0)
    const optimal = calculateOptimalFrequency(totalDemand, line.vehicleCapacity, 0.75)
    
    updateLine(line.id, { 
      frequency: optimal,
      rushHourFrequency: Math.max(1, Math.floor(optimal * 0.6)) // 40% more frequent during rush
    })
  }

  const getPhaseColor = () => {
    switch (line.phase) {
      case 'planning': return 'text-blue-400'
      case 'construction': return 'text-yellow-400'
      case 'testing': return 'text-orange-400'
      case 'operational': return 'text-green-400'
      default: return 'text-white'
    }
  }

  const getPhaseLabel = () => {
    switch (line.phase) {
      case 'planning': return 'Planning Phase'
      case 'construction': return `Construction ${line.constructionProgress.toFixed(0)}%`
      case 'testing': return 'Testing Phase'
      case 'operational': return 'Operational'
      default: return 'Unknown'
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
      onClick={() => setSelectedLine(null)}
    >
      <div 
        className="bg-[#1a1a1a] rounded-none max-w-md w-full mx-4 max-h-[90vh] overflow-hidden border-l-4" 
        style={{ borderLeftColor: line.color }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 bg-[#1a1a1a] border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: line.color }}
              />
              <div>
                <h2 className="text-white font-normal text-base">{line.name}</h2>
                <div className="text-gray-500 text-xs uppercase">
                  {line.type} Line • {line.stations.length} stations
                </div>
              </div>
            </div>
            <button
              onClick={() => setSelectedLine(null)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">

          {/* Status */}
          <div className="px-4 py-3 border-b border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-xs tracking-wide uppercase">Status</span>
              <span className={`text-xs font-normal ${getPhaseColor()}`}>
                {getPhaseLabel()}
              </span>
            </div>

            {line.phase === 'construction' && (
              <div className="bg-[#2a2a2a] rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-yellow-400 h-full transition-all duration-500"
                  style={{ width: `${line.constructionProgress}%` }}
                />
              </div>
            )}

            {line.phase === 'construction' && line.constructionTimeRemaining > 0 && (
              <div className="text-gray-400 text-xs mt-1">
                {line.constructionTimeRemaining} days remaining
              </div>
            )}
          </div>

          {/* Performance Metrics */}
          {line.phase === 'operational' && (
            <div className="px-4 py-3 border-b border-gray-800">
              <div className="text-gray-500 text-xs tracking-wide uppercase mb-2">
                Performance
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-gray-500 mb-0.5">Load Factor</div>
                  <div className={`font-normal ${line.loadFactor > 0.9 ? 'text-red-400' : line.loadFactor > 0.7 ? 'text-yellow-400' : 'text-green-400'}`}>
                    {(line.loadFactor * 100).toFixed(0)}%
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 mb-0.5">Reliability</div>
                  <div className={`font-normal ${line.reliability > 90 ? 'text-green-400' : line.reliability > 70 ? 'text-white' : 'text-red-400'}`}>
                    {line.reliability.toFixed(0)}%
                  </div>
                </div>
                <div>
                  <div className="text-gray-500 mb-0.5">Avg Speed</div>
                  <div className="text-white font-normal">{line.averageSpeed.toFixed(0)} km/h</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-0.5">Recovery</div>
                  <div className="text-white font-normal">
                    {line.operatingCost > 0 ? ((line.revenue / line.operatingCost) * 100).toFixed(0) : 0}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Service Settings */}
          {line.phase === 'operational' && (
            <div className="px-4 py-3 border-b border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <div className="text-gray-500 text-xs tracking-wide uppercase">
                  Service Settings
                </div>
                <button
                  onClick={optimizeFrequency}
                  className="flex items-center space-x-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                >
                  <Zap className="w-3 h-3" />
                  <span>Optimize</span>
                </button>
              </div>

              {/* Normal Frequency */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-gray-500 text-xs">Normal Frequency</span>
                  <span className="text-white font-normal text-xs">{line.frequency} min</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleFrequencyChange(1)}
                    className="bg-[#2a2a2a] hover:bg-[#333333] rounded-none p-1 transition-all"
                  >
                    <Plus className="w-3 h-3 text-white" />
                  </button>
                  <div className="flex-1 bg-[#2a2a2a] rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-white h-full transition-all"
                      style={{ width: `${((30 - line.frequency) / 29) * 100}%` }}
                    />
                  </div>
                  <button
                    onClick={() => handleFrequencyChange(-1)}
                    className="bg-[#2a2a2a] hover:bg-[#333333] rounded-none p-1 transition-all"
                  >
                    <Minus className="w-3 h-3 text-white" />
                  </button>
                </div>
                <div className="text-gray-500 text-[10px] mt-1">
                  {Math.floor(60 / line.frequency)} vehicles/hour
                </div>
              </div>

              {/* Rush Hour Frequency */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-gray-500 text-xs">Rush Hour Frequency</span>
                  <span className="text-white font-normal text-xs">{line.rushHourFrequency} min</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleRushHourFrequencyChange(1)}
                    className="bg-[#2a2a2a] hover:bg-[#333333] rounded-none p-1 transition-all"
                  >
                    <Plus className="w-3 h-3 text-white" />
                  </button>
                  <div className="flex-1 bg-[#2a2a2a] rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-yellow-400 h-full transition-all"
                      style={{ width: `${((30 - line.rushHourFrequency) / 29) * 100}%` }}
                    />
                  </div>
                  <button
                    onClick={() => handleRushHourFrequencyChange(-1)}
                    className="bg-[#2a2a2a] hover:bg-[#333333] rounded-none p-1 transition-all"
                  >
                    <Minus className="w-3 h-3 text-white" />
                  </button>
                </div>
                <div className="text-gray-500 text-[10px] mt-1">
                  {Math.floor(60 / line.rushHourFrequency)} vehicles/hour during peaks
                </div>
              </div>
            </div>
          )}

          {/* Economics */}
          <div className="px-4 py-3 border-b border-gray-800">
            <div className="text-gray-500 text-xs tracking-wide uppercase mb-2">
              Economics
            </div>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Revenue/hr</span>
                <span className="text-green-400 font-normal">${line.revenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Operating cost/hr</span>
                <span className="text-red-400 font-normal">${line.operatingCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-1.5 border-t border-gray-800">
                <span className="text-gray-500">Net/hr</span>
                <span className={`font-normal ${(line.revenue - line.operatingCost) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {(line.revenue - line.operatingCost) >= 0 ? '+' : ''}${(line.revenue - line.operatingCost).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-4 py-3">
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to delete ${line.name}?`)) {
                  removeLine(line.id)
                  setSelectedLine(null)
                }
              }}
              className="w-full bg-red-500 bg-opacity-10 hover:bg-opacity-20 border border-red-500 border-opacity-30 rounded-none p-2 transition-all text-red-400 text-xs font-normal"
            >
              Delete Line
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
