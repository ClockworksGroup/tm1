import { Lightbulb, X, TrendingUp, MapPin, DollarSign } from 'lucide-react'
import { useGameStore } from '../../store/gameStore'
import { useState } from 'react'

export default function SuggestionsPanel() {
  const { suggestions } = useGameStore()
  const [isExpanded, setIsExpanded] = useState(true)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const activeSuggestions = suggestions.filter(s => !dismissed.has(s.id))

  if (activeSuggestions.length === 0) return null

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-red-500 border-opacity-50'
      case 'high': return 'border-yellow-500 border-opacity-50'
      case 'medium': return 'border-blue-500 border-opacity-50'
      default: return 'border-white border-opacity-10'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return '🔴'
      case 'high': return '🟡'
      case 'medium': return '🔵'
      default: return '⚪'
    }
  }

  return (
    <div className="absolute bottom-8 right-8 bg-black bg-opacity-30 backdrop-blur-md border border-white border-opacity-10 rounded-sm w-96 z-10">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-6 cursor-pointer border-b border-white border-opacity-10"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <Lightbulb className="w-4 h-4 text-white text-opacity-60" />
          <h3 className="text-white font-light text-xs tracking-widest uppercase opacity-60">
            Suggestions ({activeSuggestions.length})
          </h3>
        </div>
      </div>

      {/* Suggestions List */}
      {isExpanded && (
        <div className="max-h-96 overflow-y-auto">
          {activeSuggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className={`p-6 border-b border-white border-opacity-5 hover:bg-white hover:bg-opacity-5 transition-colors border-l-2 ${getPriorityColor(suggestion.priority)}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3 flex-1">
                  <span className="text-lg">{getPriorityIcon(suggestion.priority)}</span>
                  <div className="flex-1">
                    <h4 className="text-white font-light tracking-wide mb-1">
                      {suggestion.title}
                    </h4>
                    <div className="text-xs text-white text-opacity-40 uppercase tracking-wider">
                      {suggestion.category}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setDismissed(new Set(dismissed).add(suggestion.id))}
                  className="text-white text-opacity-40 hover:text-opacity-100 transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-white text-opacity-60 text-xs font-light mb-4">
                {suggestion.description}
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-white bg-opacity-5 rounded-sm p-2">
                  <div className="flex items-center space-x-2 mb-1">
                    <DollarSign className="w-3 h-3 text-white text-opacity-40" />
                    <span className="text-white text-opacity-40">Cost</span>
                  </div>
                  <div className="text-white font-light">
                    ${suggestion.estimatedCost.toLocaleString()}
                  </div>
                </div>

                <div className="bg-white bg-opacity-5 rounded-sm p-2">
                  <div className="flex items-center space-x-2 mb-1">
                    <TrendingUp className="w-3 h-3 text-white text-opacity-40" />
                    <span className="text-white text-opacity-40">Benefit</span>
                  </div>
                  <div className="text-white font-light">
                    {suggestion.estimatedBenefit}
                  </div>
                </div>
              </div>

              {suggestion.location && (
                <button className="w-full mt-3 bg-white bg-opacity-5 hover:bg-opacity-10 border border-white border-opacity-10 rounded-sm p-2 transition-all flex items-center justify-center space-x-2">
                  <MapPin className="w-3 h-3 text-white text-opacity-60" />
                  <span className="text-white text-opacity-60 text-xs font-light">
                    View on map
                  </span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
