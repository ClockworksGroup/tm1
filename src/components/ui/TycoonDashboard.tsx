import { useGameStore } from '../../store/gameStore'
import { TrendingUp, TrendingDown, Target, AlertTriangle, Users, DollarSign } from 'lucide-react'

export default function TycoonDashboard() {
  const { 
    lineProfitability, 
    victoryConditions, 
    competition, 
    bottlenecks,
    demandHeatmap,
    activeSpecialEvent 
  } = useGameStore()

  return (
    <div className="fixed left-6 bottom-24 w-96 space-y-2 z-10">
      {/* Special Event Alert */}
      {activeSpecialEvent && (
        <div className="bg-[#1a1a1a] border-l-4 border-yellow-500 rounded-none p-3">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xl">🎉</span>
            <span className="text-white font-normal text-sm">{activeSpecialEvent.name}</span>
          </div>
          <p className="text-gray-500 text-xs">
            {activeSpecialEvent.expectedAttendees.toLocaleString()} attendees • 
            {activeSpecialEvent.demandMultiplier}x demand
          </p>
        </div>
      )}

      {/* Victory Progress */}
      {victoryConditions.length > 0 && (
        <div className="bg-[#1a1a1a] border-l-4 border-[#c90a43] rounded-none p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-4 h-4 text-[#c90a43]" />
            <span className="text-white font-normal text-xs">Victory Progress</span>
          </div>
          {victoryConditions.slice(0, 2).map(vc => (
            <div key={vc.condition} className="mb-2">
              <div className="flex justify-between text-[10px] mb-1">
                <span className="text-gray-500">{vc.name}</span>
                <span className="text-white">{vc.progress.toFixed(0)}%</span>
              </div>
              <div className="bg-[#2a2a2a] rounded-full h-1 overflow-hidden">
                <div 
                  className={`h-full transition-all ${vc.achieved ? 'bg-green-500' : 'bg-[#c90a43]'}`}
                  style={{ width: `${Math.min(100, vc.progress)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Line Profitability Summary */}
      {lineProfitability.length > 0 && (
        <div className="bg-[#1a1a1a] border-l-4 border-green-500 rounded-none p-3">
          <div className="flex items-center space-x-2 mb-2">
            <DollarSign className="w-4 h-4 text-green-500" />
            <span className="text-white font-normal text-xs">Line Performance</span>
          </div>
          <div className="space-y-1">
            {lineProfitability.slice(0, 3).map(lp => {
              const line = useGameStore.getState().lines.find(l => l.id === lp.lineId)
              return (
                <div key={lp.lineId} className="flex items-center justify-between text-[10px]">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: line?.color || '#666' }}
                    />
                    <span className="text-gray-400">{line?.name || 'Line'}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    {lp.profit >= 0 ? (
                      <TrendingUp className="w-3 h-3 text-green-400" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-red-400" />
                    )}
                    <span className={lp.profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                      ${Math.abs(lp.profit).toLocaleString()}/hr
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Bottleneck Alert */}
      {bottlenecks.length > 0 && (
        <div className="bg-[#1a1a1a] border-l-4 border-orange-500 rounded-none p-3">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span className="text-white font-normal text-xs">
              {bottlenecks.length} Bottleneck{bottlenecks.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="space-y-1">
            {bottlenecks.slice(0, 2).map(b => (
              <div key={b.id} className="text-[10px]">
                <p className="text-gray-400">{b.issue}</p>
                <p className="text-gray-600">
                  {b.impact.passengersAffected.toLocaleString()} affected
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Competition Summary */}
      {competition.length > 0 && (
        <div className="bg-[#1a1a1a] border-l-4 border-blue-500 rounded-none p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-white font-normal text-xs">Market Share</span>
          </div>
          <div className="space-y-1">
            {competition.slice(0, 2).map(c => {
              const district = useGameStore.getState().districts.find(d => d.id === c.districtId)
              return (
                <div key={c.districtId} className="text-[10px]">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400">{district?.name || 'District'}</span>
                    <span className={`${
                      c.trend === 'improving' ? 'text-green-400' : 
                      c.trend === 'declining' ? 'text-red-400' : 'text-gray-400'
                    }`}>
                      {(c.transitShare * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Demand Hotspot */}
      {demandHeatmap.peakHotspot && (
        <div className="bg-[#1a1a1a] border-l-4 border-purple-500 rounded-none p-3">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-xl">🔥</span>
            <span className="text-white font-normal text-xs">High Demand Route</span>
          </div>
          <p className="text-gray-500 text-[10px]">
            {demandHeatmap.peakHotspot.demand.toLocaleString()} passengers/hr • 
            {(demandHeatmap.peakHotspot.satisfied * 100).toFixed(0)}% served
          </p>
        </div>
      )}
    </div>
  )
}
