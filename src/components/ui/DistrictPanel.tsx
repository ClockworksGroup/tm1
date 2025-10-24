import { MapPin, Users, TrendingUp, Home, Building2, Factory } from 'lucide-react'
import { useGameStore } from '../../store/gameStore'

export default function DistrictPanel() {
  const { districts, selectedDistrict, setSelectedDistrict } = useGameStore()

  const district = districts.find(d => d.id === selectedDistrict)

  if (!district) {
    // Show district list
    if (districts.length === 0) return null

    return (
      <div className="px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {districts.map((d) => {
            const getIcon = () => {
              switch (d.type) {
                case 'residential': return <Home className="w-4 h-4" />
                case 'commercial': return <Building2 className="w-4 h-4" />
                case 'industrial': return <Factory className="w-4 h-4" />
                default: return <MapPin className="w-4 h-4" />
              }
            }

            return (
              <button
                key={d.id}
                onClick={() => setSelectedDistrict(d.id)}
                className="w-full p-4 bg-[#252525] hover:bg-[#2a2a2a] transition-colors text-left rounded-none"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-gray-400">
                      {getIcon()}
                    </div>
                    <div>
                      <h4 className="text-white font-normal">{d.name}</h4>
                      <div className="text-xs text-gray-500 uppercase">
                        {d.type}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Population</span>
                    <span className="text-white font-normal">{Math.round(d.population).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Coverage</span>
                    <span className="text-white font-normal">{(d.coverage * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Satisfaction</span>
                    <span className={`font-normal ${d.satisfaction > 70 ? 'text-green-400' : d.satisfaction > 50 ? 'text-white' : 'text-red-400'}`}>
                      {d.satisfaction.toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Density</span>
                    <span className="text-white font-normal">{(d.density * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  // Show detailed district view
  const getIcon = () => {
    switch (district.type) {
      case 'residential': return <Home className="w-5 h-5" />
      case 'commercial': return <Building2 className="w-5 h-5" />
      case 'industrial': return <Factory className="w-5 h-5" />
      default: return <MapPin className="w-5 h-5" />
    }
  }

  return (
    <div className="px-6 py-4">
      {/* Header */}
      <div className="pb-4 border-b border-gray-800 mb-4">
        <button
          onClick={() => setSelectedDistrict(null)}
          className="text-gray-400 hover:text-white text-xs mb-3 transition-colors"
        >
          ← Back to districts
        </button>
        <div className="flex items-center space-x-3">
          <div className="text-gray-400">
            {getIcon()}
          </div>
          <div>
            <h3 className="text-white font-normal text-lg">{district.name}</h3>
            <div className="text-xs text-gray-500 uppercase">
              {district.type} District
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-4">
        {/* Population & Demographics */}
        <div className="border-b border-gray-800 pb-4">
          <div className="text-gray-500 text-xs tracking-wide uppercase mb-3">
            Demographics
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <Users className="w-3 h-3 text-gray-500" />
                <span className="text-gray-500 text-xs">Population</span>
              </div>
              <div className="text-white font-normal">{Math.round(district.population).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs mb-1">Avg Income</div>
              <div className="text-white font-normal">${Math.round(district.averageIncome).toLocaleString()}</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs mb-1">Density</div>
              <div className="text-white font-normal">{(district.density * 100).toFixed(0)}%</div>
            </div>
            <div>
              <div className="text-gray-500 text-xs mb-1">Transit Oriented</div>
              <div className="text-white font-normal">{district.transitOriented ? 'Yes' : 'No'}</div>
            </div>
          </div>
        </div>

        {/* Demand Patterns */}
        <div className="border-b border-gray-800 pb-4">
          <div className="text-gray-500 text-xs tracking-wide uppercase mb-3">
            Travel Patterns
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Morning demand</span>
                <span className="text-white font-normal">{(district.morningDemand * 100).toFixed(0)}%</span>
              </div>
              <div className="bg-[#2a2a2a] rounded-full h-1 overflow-hidden">
                <div 
                  className="bg-white h-full transition-all"
                  style={{ width: `${district.morningDemand * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Evening demand</span>
                <span className="text-white font-normal">{(district.eveningDemand * 100).toFixed(0)}%</span>
              </div>
              <div className="bg-[#2a2a2a] rounded-full h-1 overflow-hidden">
                <div 
                  className="bg-white h-full transition-all"
                  style={{ width: `${district.eveningDemand * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Weekend demand</span>
                <span className="text-white font-normal">{(district.weekendDemand * 100).toFixed(0)}%</span>
              </div>
              <div className="bg-[#2a2a2a] rounded-full h-1 overflow-hidden">
                <div 
                  className="bg-white h-full transition-all"
                  style={{ width: `${district.weekendDemand * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Service Quality */}
        <div>
          <div className="text-gray-500 text-xs tracking-wide uppercase mb-3">
            Service Quality
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-gray-500 text-xs mb-1">Coverage</div>
              <div className={`font-normal text-lg ${district.coverage > 0.7 ? 'text-green-400' : district.coverage > 0.4 ? 'text-white' : 'text-red-400'}`}>
                {(district.coverage * 100).toFixed(0)}%
              </div>
            </div>
            <div>
              <div className="text-gray-500 text-xs mb-1">Satisfaction</div>
              <div className={`font-normal text-lg ${district.satisfaction > 70 ? 'text-green-400' : district.satisfaction > 50 ? 'text-white' : 'text-red-400'}`}>
                {district.satisfaction.toFixed(0)}%
              </div>
            </div>
          </div>

          {district.coverage < 0.5 && (
            <div className="mt-4 bg-yellow-500 bg-opacity-10 border border-yellow-500 border-opacity-30 rounded-none p-3">
              <div className="flex items-start space-x-2">
                <TrendingUp className="w-4 h-4 text-yellow-400 mt-0.5" />
                <div>
                  <div className="text-yellow-400 text-xs font-normal mb-1">Low Coverage</div>
                  <div className="text-gray-400 text-xs">
                    Consider adding stations to improve transit access
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
