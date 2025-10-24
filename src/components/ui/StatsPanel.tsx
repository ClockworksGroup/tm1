import { TrendingUp, AlertCircle } from 'lucide-react'
import { useGameStore } from '../../store/gameStore'

export default function StatsPanel() {
  const { lines, economics } = useGameStore()

  const totalRevenue = lines.reduce((sum, line) => sum + line.revenue, 0)
  const totalCosts = lines.reduce((sum, line) => sum + line.operatingCost, 0)
  const netIncome = totalRevenue - totalCosts

  return (
    <div className="absolute right-4 top-12 bg-black bg-opacity-70 backdrop-blur-2xl border border-white border-opacity-20 w-52 z-10 overflow-hidden">
      {/* Accent line at top */}
      <div className="h-[2px] bg-[#c90a43]" />
      
      <div className="p-3">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-[2px] h-4 bg-[#c90a43]" />
          <h3 className="text-white font-light text-[10px] tracking-widest uppercase opacity-60">
            Statistics
          </h3>
        </div>

        <div className="space-y-2">
          {/* Revenue */}
          <div className="border-b border-white border-opacity-10 pb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-white text-opacity-40 text-[10px] tracking-wide uppercase">Revenue</span>
              <TrendingUp className="w-3 h-3 text-white text-opacity-30" />
            </div>
            <div className="text-white font-light text-sm tracking-wide">
              ${totalRevenue.toLocaleString()}
              <span className="text-[10px] text-white text-opacity-40 ml-1">/hr</span>
            </div>
          </div>

          {/* Costs */}
          <div className="border-b border-white border-opacity-10 pb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-white text-opacity-40 text-[10px] tracking-wide uppercase">Costs</span>
              <AlertCircle className="w-3 h-3 text-white text-opacity-30" />
            </div>
            <div className="text-white font-light text-sm tracking-wide">
              ${totalCosts.toLocaleString()}
              <span className="text-[10px] text-white text-opacity-40 ml-1">/hr</span>
            </div>
          </div>

          {/* Net Income */}
          <div className="border-b border-white border-opacity-10 pb-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-white text-opacity-40 text-[10px] tracking-wide uppercase">Net Income</span>
            </div>
            <div className={`font-light text-sm tracking-wide ${netIncome >= 0 ? 'text-white' : 'text-red-400'}`}>
              {netIncome >= 0 ? '+' : ''}${netIncome.toLocaleString()}
              <span className="text-[10px] text-white text-opacity-40 ml-1">/hr</span>
            </div>
          </div>

          {/* Lines Summary */}
          <div>
            <div className="text-white text-opacity-40 text-[10px] tracking-wide uppercase mb-1">Active Lines</div>
            <div className="text-white font-light text-sm tracking-wide">{lines.length}</div>
          </div>
        </div>

        {economics.balance < 0 && (
          <div className="mt-2 pt-2 border-t border-red-500 border-opacity-30">
            <div className="flex items-center space-x-1.5 text-red-400 text-[10px]">
              <AlertCircle className="w-3 h-3" />
              <span className="font-light tracking-wide">Negative balance</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
