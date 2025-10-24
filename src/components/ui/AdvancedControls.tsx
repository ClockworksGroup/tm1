import { Layers, Eye, EyeOff, TrendingUp, AlertTriangle } from 'lucide-react'
import { useGameStore } from '../../store/gameStore'

export default function AdvancedControls() {
  const { viewLayers, toggleViewLayer, showUnderground, toggleUndergroundView, gameTime } = useGameStore()

  return (
    <div className="absolute top-28 left-8 bg-black bg-opacity-30 backdrop-blur-md border border-white border-opacity-10 rounded-sm p-6 z-10">
      <h3 className="text-white font-light text-xs tracking-widest mb-4 uppercase opacity-60">
        View Options
      </h3>

      {/* Time info */}
      <div className="mb-6 pb-4 border-b border-white border-opacity-10">
        <div className="text-white text-opacity-40 text-xs tracking-wide uppercase mb-2">
          Time
        </div>
        <div className="text-white font-light text-sm">
          {gameTime.date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </div>
        <div className="text-white text-opacity-60 text-xs mt-1">
          {gameTime.timeOfDay.replace('_', ' ')} • {gameTime.dayType}
        </div>
        {gameTime.rushHourMultiplier > 1.5 && (
          <div className="flex items-center space-x-2 mt-2 text-yellow-400 text-xs">
            <AlertTriangle className="w-3 h-3" />
            <span>Rush hour ({gameTime.rushHourMultiplier.toFixed(1)}x demand)</span>
          </div>
        )}
      </div>

      {/* Layer toggles */}
      <div className="space-y-2">
        <button
          onClick={toggleUndergroundView}
          className={`w-full flex items-center justify-between px-4 py-3 transition-all ${
            showUnderground
              ? 'text-white bg-white bg-opacity-10 border-l-2 border-white'
              : 'text-white text-opacity-50 hover:text-opacity-100 hover:bg-white hover:bg-opacity-5'
          }`}
        >
          <div className="flex items-center space-x-3">
            {showUnderground ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span className="font-light text-sm tracking-wide">Underground</span>
          </div>
        </button>

        <button
          onClick={() => toggleViewLayer('demandHeatmap')}
          className={`w-full flex items-center justify-between px-4 py-3 transition-all ${
            viewLayers.demandHeatmap
              ? 'text-white bg-white bg-opacity-10 border-l-2 border-white'
              : 'text-white text-opacity-50 hover:text-opacity-100 hover:bg-white hover:bg-opacity-5'
          }`}
        >
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-4 h-4" />
            <span className="font-light text-sm tracking-wide">Demand</span>
          </div>
        </button>

        <button
          onClick={() => toggleViewLayer('satisfactionHeatmap')}
          className={`w-full flex items-center justify-between px-4 py-3 transition-all ${
            viewLayers.satisfactionHeatmap
              ? 'text-white bg-white bg-opacity-10 border-l-2 border-white'
              : 'text-white text-opacity-50 hover:text-opacity-100 hover:bg-white hover:bg-opacity-5'
          }`}
        >
          <div className="flex items-center space-x-3">
            <Layers className="w-4 h-4" />
            <span className="font-light text-sm tracking-wide">Satisfaction</span>
          </div>
        </button>

        <button
          onClick={() => toggleViewLayer('elevationView')}
          className={`w-full flex items-center justify-between px-4 py-3 transition-all ${
            viewLayers.elevationView
              ? 'text-white bg-white bg-opacity-10 border-l-2 border-white'
              : 'text-white text-opacity-50 hover:text-opacity-100 hover:bg-white hover:bg-opacity-5'
          }`}
        >
          <div className="flex items-center space-x-3">
            <Layers className="w-4 h-4" />
            <span className="font-light text-sm tracking-wide">Elevation</span>
          </div>
        </button>

        <button
          onClick={() => toggleViewLayer('noiseZones')}
          className={`w-full flex items-center justify-between px-4 py-3 transition-all ${
            viewLayers.noiseZones
              ? 'text-white bg-white bg-opacity-10 border-l-2 border-white'
              : 'text-white text-opacity-50 hover:text-opacity-100 hover:bg-white hover:bg-opacity-5'
          }`}
        >
          <div className="flex items-center space-x-3">
            <Layers className="w-4 h-4" />
            <span className="font-light text-sm tracking-wide">Noise</span>
          </div>
        </button>
      </div>
    </div>
  )
}
