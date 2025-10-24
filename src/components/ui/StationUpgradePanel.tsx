import { X, ArrowUp, Check } from 'lucide-react'
import { useGameStore } from '../../store/gameStore'

export default function StationUpgradePanel() {
  const { selectedStation, stations, setSelectedStation, upgradeStation, economics } = useGameStore()

  const station = stations.find(s => s.id === selectedStation)

  if (!station) return null

  const upgrades = [
    {
      id: 'elevator',
      name: 'Elevator',
      description: 'Improve accessibility for passengers',
      cost: 500000,
      benefit: '+20% accessibility',
      available: !station.hasElevator,
      icon: '🛗',
    },
    {
      id: 'escalator',
      name: 'Escalator',
      description: 'Reduce wait times and improve flow',
      cost: 300000,
      benefit: '+10% accessibility',
      available: !station.hasEscalator,
      icon: '⬆️',
    },
    {
      id: 'retail',
      name: 'Retail Space',
      description: 'Generate additional revenue',
      cost: 200000,
      benefit: '+$1,000/hr revenue',
      available: !station.hasRetail,
      icon: '🏪',
    },
    {
      id: 'platform',
      name: 'Additional Platform',
      description: 'Increase station capacity by 50%',
      cost: 1000000,
      benefit: '+50% capacity',
      available: station.platforms < 4,
      icon: '🚉',
    },
  ]

  const availableUpgrades = upgrades.filter(u => u.available)

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black bg-opacity-50 backdrop-blur-lg border border-white border-opacity-20 rounded-sm w-[500px] z-30">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white border-opacity-10">
        <div>
          <h2 className="text-white font-light text-lg tracking-wide mb-1">{station.name}</h2>
          <div className="text-white text-opacity-40 text-xs uppercase tracking-wider">
            {station.type} Station • Depth: {station.depth}
          </div>
        </div>
        <button
          onClick={() => setSelectedStation(null)}
          className="text-white text-opacity-40 hover:text-opacity-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Current Stats */}
      <div className="p-6 border-b border-white border-opacity-10">
        <div className="text-white text-opacity-40 text-xs tracking-wide uppercase mb-3">
          Current Status
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-white text-opacity-60 text-xs mb-1">Capacity</div>
            <div className="text-white font-light">{station.capacity}/hr</div>
          </div>
          <div>
            <div className="text-white text-opacity-60 text-xs mb-1">Passengers</div>
            <div className="text-white font-light">{Math.round(station.passengers)}/hr</div>
          </div>
          <div>
            <div className="text-white text-opacity-60 text-xs mb-1">Crowding</div>
            <div className={`font-light ${station.crowdingLevel > 0.8 ? 'text-red-400' : 'text-white'}`}>
              {(station.crowdingLevel * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mt-3">
          <div>
            <div className="text-white text-opacity-60 text-xs mb-1">Accessibility</div>
            <div className="text-white font-light">{station.accessibility}%</div>
          </div>
          <div>
            <div className="text-white text-opacity-60 text-xs mb-1">Cleanliness</div>
            <div className="text-white font-light">{station.cleanliness}%</div>
          </div>
          <div>
            <div className="text-white text-opacity-60 text-xs mb-1">Safety</div>
            <div className="text-white font-light">{station.safety}%</div>
          </div>
        </div>
      </div>

      {/* Available Upgrades */}
      <div className="p-6">
        <div className="text-white text-opacity-40 text-xs tracking-wide uppercase mb-4">
          Available Upgrades
        </div>

        {availableUpgrades.length === 0 ? (
          <div className="text-center py-8">
            <Check className="w-8 h-8 text-green-400 mx-auto mb-3" />
            <div className="text-white text-opacity-60 text-sm">
              All upgrades completed
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {availableUpgrades.map((upgrade) => {
              const canAfford = economics.balance >= upgrade.cost

              return (
                <button
                  key={upgrade.id}
                  onClick={() => {
                    if (canAfford) {
                      upgradeStation(station.id, upgrade.id)
                    }
                  }}
                  disabled={!canAfford}
                  className={`w-full bg-white bg-opacity-5 border border-white border-opacity-10 rounded-sm p-4 transition-all text-left ${
                    canAfford 
                      ? 'hover:bg-opacity-10 cursor-pointer' 
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <div className="text-2xl">{upgrade.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-white font-light tracking-wide">{upgrade.name}</h4>
                        <div className="text-white text-opacity-60 text-xs">
                          ${upgrade.cost.toLocaleString()}
                        </div>
                      </div>
                      <p className="text-white text-opacity-60 text-xs mb-2">
                        {upgrade.description}
                      </p>
                      <div className="flex items-center space-x-2">
                        <ArrowUp className="w-3 h-3 text-green-400" />
                        <span className="text-green-400 text-xs">{upgrade.benefit}</span>
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Balance Display */}
      <div className="px-6 pb-6">
        <div className="bg-white bg-opacity-5 rounded-sm p-3 flex items-center justify-between">
          <span className="text-white text-opacity-60 text-xs">Your Balance</span>
          <span className="text-white font-light">${economics.balance.toLocaleString()}</span>
        </div>
      </div>
    </div>
  )
}
