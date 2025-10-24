import { useState } from 'react'
import { X, Plus, Minus, DollarSign, Clock, Trash2 } from 'lucide-react'
import { useGameStore } from '../../store/gameStore.ts'
import { TransportType } from '../../types/game'

interface LineManagerProps {
  onClose: () => void
}

export default function LineManager({ onClose }: LineManagerProps) {
  const { lines, updateLine, removeLine, updateEconomics, setSelectedLine, setBuildMode, setSelectedTool } = useGameStore()
  const [selectedTab, setSelectedTab] = useState<TransportType | 'all'>('all')
  const [bulkPrice, setBulkPrice] = useState('')
  const [bulkFrequency, setBulkFrequency] = useState('')

  const handleEditRoute = (lineId: string) => {
    const line = lines.find(l => l.id === lineId)
    if (!line) return
    
    // Enter edit mode for this line
    setSelectedLine(lineId)
    setSelectedTool(line.type)
    setBuildMode(true)
    onClose()
  }

  const transportTypes: Array<{ type: TransportType | 'all'; label: string; color: string }> = [
    { type: 'all', label: 'All Lines', color: '#ffffff' },
    { type: 'metro', label: 'Metro', color: '#3b82f6' },
    { type: 'train', label: 'Train', color: '#22c55e' },
    { type: 'tram', label: 'Tram', color: '#eab308' },
    { type: 'bus', label: 'Bus', color: '#ef4444' },
  ]

  const filteredLines = selectedTab === 'all' 
    ? lines 
    : lines.filter(l => l.type === selectedTab)

  const applyBulkPrice = () => {
    const price = parseFloat(bulkPrice)
    if (isNaN(price) || price < 0) return

    filteredLines.forEach(line => {
      updateLine(line.id, { 
        // Store price in line or use global economics
      })
    })

    // Update base fare for the type
    if (selectedTab === 'all') {
      updateEconomics({ baseFare: price })
    }
    setBulkPrice('')
  }

  const applyBulkFrequency = () => {
    const freq = parseInt(bulkFrequency)
    if (isNaN(freq) || freq < 1 || freq > 30) return

    filteredLines.forEach(line => {
      updateLine(line.id, { frequency: freq })
    })
    setBulkFrequency('')
  }

  const handleFrequencyChange = (lineId: string, delta: number) => {
    const line = lines.find(l => l.id === lineId)
    if (!line) return
    const newFreq = Math.max(1, Math.min(30, line.frequency + delta))
    updateLine(lineId, { frequency: newFreq })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-[#1a1a1a] rounded-none max-w-5xl w-full mx-4 max-h-[90vh] overflow-hidden border-l-4" style={{ borderLeftColor: '#c90a43' }}>
        {/* Header */}
        <div className="px-6 py-4 bg-[#1a1a1a] border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-normal text-white">Line Management</h2>
              <p className="text-gray-400 text-sm mt-1">{lines.length} active lines</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-1 px-6 pt-3 border-b border-gray-800">
          {transportTypes.map(({ type, label, color }) => {
            const count = type === 'all' ? lines.length : lines.filter(l => l.type === type).length
            return (
              <button
                key={type}
                onClick={() => setSelectedTab(type)}
                className={`px-4 py-2 text-sm font-normal transition-all border-b-2 ${
                  selectedTab === type
                    ? 'text-white border-white'
                    : 'text-gray-400 border-transparent hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span>{label} ({count})</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Bulk Operations */}
        <div className="px-6 py-4 bg-[#1a1a1a] border-b border-gray-800">
          <div className="text-gray-500 text-xs uppercase tracking-wider mb-3">Bulk Operations</div>
          <div className="flex items-center space-x-3">
            {/* Bulk Price */}
            <div className="flex items-center space-x-2 flex-1">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <input
                type="number"
                value={bulkPrice}
                onChange={(e) => setBulkPrice(e.target.value)}
                placeholder="Set price"
                className="flex-1 bg-[#252525] border border-gray-700 px-3 py-2 text-white text-sm focus:outline-none focus:border-gray-600 rounded-none"
                step="0.5"
                min="0"
              />
              <button
                onClick={applyBulkPrice}
                disabled={!bulkPrice}
                className="px-4 py-2 rounded-none font-normal text-sm transition-all disabled:opacity-30 disabled:bg-[#2a2a2a] disabled:text-gray-600"
                style={bulkPrice ? { backgroundColor: '#c90a43' } : {}}
                onMouseEnter={(e) => bulkPrice && (e.currentTarget.style.backgroundColor = '#9b0835')}
                onMouseLeave={(e) => bulkPrice && (e.currentTarget.style.backgroundColor = '#c90a43')}
              >
                Apply to All
              </button>
            </div>

            {/* Bulk Frequency */}
            <div className="flex items-center space-x-2 flex-1">
              <Clock className="w-4 h-4 text-gray-500" />
              <input
                type="number"
                value={bulkFrequency}
                onChange={(e) => setBulkFrequency(e.target.value)}
                placeholder="Frequency (min)"
                className="flex-1 bg-[#252525] border border-gray-700 px-3 py-2 text-white text-sm focus:outline-none focus:border-gray-600 rounded-none"
                min="1"
                max="30"
              />
              <button
                onClick={applyBulkFrequency}
                disabled={!bulkFrequency}
                className="px-4 py-2 rounded-none font-normal text-sm transition-all disabled:opacity-30 disabled:bg-[#2a2a2a] disabled:text-gray-600"
                style={bulkFrequency ? { backgroundColor: '#c90a43' } : {}}
                onMouseEnter={(e) => bulkFrequency && (e.currentTarget.style.backgroundColor = '#9b0835')}
                onMouseLeave={(e) => bulkFrequency && (e.currentTarget.style.backgroundColor = '#c90a43')}
              >
                Apply to All
              </button>
            </div>
          </div>
        </div>

        {/* Lines List */}
        <div className="px-6 pb-6 overflow-y-auto max-h-[calc(90vh-350px)]">
          {filteredLines.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm py-8">
              No {selectedTab === 'all' ? '' : selectedTab} lines yet
            </div>
          ) : (
            filteredLines.map((line) => (
              <div
                key={line.id}
                className="p-4 mb-3 bg-[#252525] hover:bg-[#2a2a2a] transition-colors rounded-none"
                style={{ borderLeft: '3px solid ' + line.color }}
              >
                <div className="flex items-start justify-between">
                  {/* Line Info */}
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h4 className="text-white font-normal text-base">{line.name}</h4>
                        <span className="text-xs text-gray-500 uppercase">
                          {line.type}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-xs">
                        <div>
                          <div className="text-gray-500 mb-0.5">Stations</div>
                          <div className="text-white font-normal">{line.stations.length}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-0.5">Capacity</div>
                          <div className="text-white font-normal">{line.vehicleCapacity} pax</div>
                        </div>
                        <div>
                          <div className="text-gray-500 mb-0.5">Revenue</div>
                          <div className="text-white font-normal">${line.revenue.toFixed(0)}/hr</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-col space-y-2 ml-6">
                    {/* Frequency Control */}
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-500 text-xs w-20">Frequency</span>
                      <button
                        onClick={() => handleFrequencyChange(line.id, -1)}
                        className="p-1 bg-[#2a2a2a] hover:bg-[#333333] transition-all rounded-none"
                      >
                        <Minus className="w-3 h-3 text-white" />
                      </button>
                      <span className="text-white text-sm w-14 text-center">{line.frequency} min</span>
                      <button
                        onClick={() => handleFrequencyChange(line.id, 1)}
                        className="p-1 bg-[#2a2a2a] hover:bg-[#333333] transition-all rounded-none"
                      >
                        <Plus className="w-3 h-3 text-white" />
                      </button>
                    </div>

                    {/* Edit Route Button */}
                    <button
                      onClick={() => handleEditRoute(line.id)}
                      className="flex items-center justify-center space-x-2 px-4 py-2 rounded-none font-normal text-sm transition-all text-white"
                      style={{ backgroundColor: '#c90a43' }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#9b0835')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#c90a43')}
                    >
                      <Plus className="w-4 h-4" />
                      <span>Edit Route</span>
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => {
                        if (confirm(`Delete ${line.name}?`)) {
                          removeLine(line.id)
                        }
                      }}
                      className="flex items-center justify-center space-x-2 px-4 py-2 bg-[#2a2a2a] hover:bg-[#333333] text-white text-sm transition-all rounded-none font-normal"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
