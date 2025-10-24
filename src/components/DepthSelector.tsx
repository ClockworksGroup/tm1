import { useState, useEffect } from 'react'
import { StationDepth } from '../types/game'
import { foundationAnalyzer, DepthOption } from '../utils/foundationAnalysis'
import { useGameStore } from '../store/gameStore'

interface DepthSelectorProps {
  position: [number, number, number]
  onSelect: (depth: StationDepth, cost: number) => void
  onCancel: () => void
}

/**
 * UI for selecting station depth with cost and obstacle information
 */
export default function DepthSelector({ position, onSelect, onCancel }: DepthSelectorProps) {
  const buildings = useGameStore(state => state.buildings)
  const stations = useGameStore(state => state.stations)
  const [options, setOptions] = useState<DepthOption[]>([])
  const [selectedDepth, setSelectedDepth] = useState<StationDepth | null>(null)

  useEffect(() => {
    // Analyze foundation conditions only once on mount
    const depthOptions = foundationAnalyzer.analyzeLocation(position, buildings, stations)
    setOptions(depthOptions)
    
    // Auto-select recommended option
    const recommended = depthOptions.find(o => o.recommended)
    if (recommended) {
      setSelectedDepth(recommended.depth)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSelect = () => {
    if (!selectedDepth) return
    
    const option = options.find(o => o.depth === selectedDepth)
    if (!option) return

    const totalCost = option.baseCost * option.totalCostMultiplier
    onSelect(selectedDepth, totalCost)
  }

  const getDepthColor = (depth: StationDepth): string => {
    const colors: Record<StationDepth, string> = {
      surface: '#22c55e',
      shallow: '#eab308',
      medium: '#f97316',
      deep: '#ef4444'
    }
    return colors[depth]
  }

  const getSeverityColor = (severity: string): string => {
    const colors: Record<string, string> = {
      minor: '#eab308',
      moderate: '#f97316',
      severe: '#ef4444',
      blocking: '#dc2626'
    }
    return colors[severity] || '#6b7280'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] rounded-none max-w-5xl w-full mx-4 max-h-[90vh] overflow-hidden border-l-4" style={{ borderLeftColor: '#c90a43' }}>
        {/* Header */}
        <div className="px-8 py-6 bg-[#1a1a1a]">
          <h2 className="text-2xl font-normal text-white">Select Station Depth</h2>
          <p className="text-gray-400 text-sm mt-1">
            Choose construction depth based on cost, obstacles, and construction time
          </p>
        </div>

        {/* Content */}
        <div className="px-8 pb-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {options.map((option) => {
              const totalCost = option.baseCost * option.totalCostMultiplier
              const isSelected = selectedDepth === option.depth
              const isBlocked = option.totalCostMultiplier > 10

              return (
                <div
                  key={option.depth}
                  onClick={() => !isBlocked && setSelectedDepth(option.depth)}
                  className={`
                    relative p-5 rounded-none cursor-pointer transition-all
                    ${isSelected 
                      ? 'bg-[#2a2a2a]' 
                      : isBlocked
                      ? 'bg-[#252525] cursor-not-allowed opacity-50'
                      : 'bg-[#252525] hover:bg-[#2a2a2a]'
                    }
                  `}
                  style={isSelected ? { borderLeft: '3px solid #c90a43' } : { borderLeft: '3px solid transparent' }}
                >
                  {/* Recommended badge */}
                  {option.recommended && !isBlocked && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                      Recommended
                    </div>
                  )}

                  {/* Blocked badge */}
                  {isBlocked && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      Blocked
                    </div>
                  )}

                  {/* Depth indicator */}
                  <div className="flex items-center gap-4 mb-4">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                      style={{ backgroundColor: getDepthColor(option.depth) }}
                    >
                      {option.depthMeters}m
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-medium text-base capitalize">{option.depth}</h3>
                      <p className="text-gray-500 text-xs mt-0.5">{option.description}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <div className="text-gray-500 text-xs mb-0.5">Base Cost</div>
                      <div className="text-white font-normal text-sm">
                        ${(option.baseCost / 1000000).toFixed(1)}M
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs mb-0.5">Total Cost</div>
                      <div className="text-white font-normal text-sm">
                        ${(totalCost / 1000000).toFixed(1)}M
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs mb-0.5">Time</div>
                      <div className="text-white font-normal text-sm">
                        {(option.constructionTime / 30).toFixed(0)} months
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 text-xs mb-0.5">Difficulty</div>
                      <div className="text-white font-normal text-sm">
                        {option.difficulty}/10
                      </div>
                    </div>
                  </div>

                  {/* Obstacles */}
                  {option.obstacles.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-800">
                      <div className="text-gray-500 text-xs mb-2">Obstacles:</div>
                      <div className="space-y-1">
                        {option.obstacles.map((obstacle, idx) => (
                          <div 
                            key={idx}
                            className="flex items-start gap-2 text-xs"
                          >
                            <div 
                              className="w-2 h-2 rounded-full mt-1 flex-shrink-0"
                              style={{ backgroundColor: getSeverityColor(obstacle.severity) }}
                            />
                            <div className="text-gray-300">{obstacle.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {option.obstacles.length === 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-800">
                      <div className="text-green-500 text-xs flex items-center gap-2">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        No obstacles detected
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#1a1a1a] px-8 py-4 flex justify-between items-center border-t border-gray-800">
          <button
            onClick={onCancel}
            className="px-6 py-2 text-gray-400 hover:text-white transition-colors font-normal text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={!selectedDepth}
            className={`
              px-8 py-2 rounded-none font-normal text-sm transition-all
              ${selectedDepth
                ? 'text-white'
                : 'bg-[#2a2a2a] text-gray-600 cursor-not-allowed'
              }
            `}
            style={selectedDepth ? { backgroundColor: '#c90a43' } : {}}
            onMouseEnter={(e) => selectedDepth && (e.currentTarget.style.backgroundColor = '#9b0835')}
            onMouseLeave={(e) => selectedDepth && (e.currentTarget.style.backgroundColor = '#c90a43')}
          >
            Confirm Selection
          </button>
        </div>
      </div>
    </div>
  )
}
