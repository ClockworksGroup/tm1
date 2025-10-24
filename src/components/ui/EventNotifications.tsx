import { X, AlertTriangle } from 'lucide-react'
import { useGameStore } from '../../store/gameStore.ts'

export default function EventNotifications() {
  const { activeEvents, resolveEvent, dismissEvent } = useGameStore()

  if (activeEvents.length === 0) return null

  // Show only the most recent event to avoid overwhelming
  const currentEvent = activeEvents[0]

  return (
    <div className="fixed top-20 right-6 w-80 z-20">
      {[currentEvent].map((event) => (
        <div
          key={event.id}
          className="bg-[#1a1a1a] backdrop-blur-xl border-l-4 border-[#c90a43] rounded-none shadow-2xl animate-slide-in"
        >
          {/* Header */}
          <div className="flex items-start justify-between px-4 py-3 border-b border-gray-800">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-[#c90a43]" />
              <h3 className="text-white font-normal text-sm">{event.title}</h3>
            </div>
            <button
              onClick={() => dismissEvent(event.id)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-4 py-3">
            {/* Description */}
            <p className="text-gray-400 text-xs font-normal mb-3 leading-relaxed">
              {event.description}
            </p>

            {/* Impact - Compact */}
            <div className="bg-[#252525] rounded-none p-2 mb-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                {event.impact.reliability !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Reliability</span>
                    <span className="text-red-400 font-normal">{event.impact.reliability}%</span>
                  </div>
                )}
                {event.impact.cost !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cost</span>
                    <span className="text-red-400 font-normal">${(event.impact.cost / 1000).toFixed(0)}K</span>
                  </div>
                )}
                {event.impact.satisfaction !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Satisfaction</span>
                    <span className="text-red-400 font-normal">{event.impact.satisfaction}%</span>
                  </div>
                )}
                {event.impact.duration !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Duration</span>
                    <span className="text-white font-normal">{event.impact.duration}h</span>
                  </div>
                )}
              </div>
            </div>

            {/* Affected lines - Compact */}
            {event.affectedLines.length > 0 && (
              <div className="mb-3 text-xs text-gray-500">
                Affects {event.affectedLines.length} line{event.affectedLines.length > 1 ? 's' : ''}
              </div>
            )}

            {/* Choices - Compact */}
            {event.choices && event.choices.length > 0 && (
              <div className="space-y-2">
                {event.choices.map((choice, index) => (
                  <button
                    key={index}
                    onClick={() => resolveEvent(event.id, index)}
                    className="w-full bg-[#2a2a2a] hover:bg-[#333333] border border-gray-700 rounded-none px-3 py-2 transition-all text-left"
                  >
                    <div className="text-white font-normal text-xs mb-1">{choice.text}</div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-gray-500">
                        ${(choice.cost / 1000).toFixed(0)}K
                      </span>
                      {choice.effect.duration && (
                        <span className="text-gray-500">
                          {choice.effect.duration}h
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
