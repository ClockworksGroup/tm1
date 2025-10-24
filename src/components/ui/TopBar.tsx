import { DollarSign, Calendar, Users, TrendingUp, Play, Pause, FastForward } from 'lucide-react'
import { useGameStore } from '../../store/gameStore.ts'
import { useEffect } from 'react'

export default function TopBar() {
  const { economics, gameTime, analytics, satisfactionFactors, gameSpeed, setGameSpeed, tick } = useGameStore()

  // Game loop
  useEffect(() => {
    if (gameSpeed === 0) return

    const interval = setInterval(() => {
      tick()
    }, 1000 / gameSpeed) // Faster intervals for higher speeds

    return () => clearInterval(interval)
  }, [gameSpeed, tick])

  const formatMoney = (amount: number) => {
    if (Math.abs(amount) >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    }
    if (Math.abs(amount) >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`
    }
    return `$${amount.toFixed(0)}`
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="absolute top-0 left-0 right-0 bg-black bg-opacity-70 backdrop-blur-2xl text-white z-10">
      {/* Accent line at top */}
      <div className="h-[2px] bg-[#c90a43]" />
      
      <div className="flex items-center justify-between px-4 py-1.5">
        {/* Left side - Game title */}
        <div className="flex items-center space-x-3">
          <div className="w-[2px] h-6 bg-[#c90a43]" />
          <h1 className="text-sm font-light tracking-widest text-white uppercase">
            Transport Master
          </h1>
        </div>

        {/* Center - Stats */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 bg-white bg-opacity-5 px-2 py-1">
            <DollarSign className="w-3.5 h-3.5 text-[#c90a43]" />
            <span className="font-light text-xs tracking-wide">{formatMoney(economics.balance)}</span>
          </div>

          <div className="w-px h-4 bg-white bg-opacity-10" />

          <div className="flex items-center space-x-1.5 bg-white bg-opacity-5 px-2 py-1">
            <Calendar className="w-3.5 h-3.5 text-white text-opacity-40" />
            <span className="font-light text-xs tracking-wide">{formatDate(gameTime.date)}</span>
          </div>

          <div className="w-px h-4 bg-white bg-opacity-10" />

          <div className="flex items-center space-x-1.5 bg-white bg-opacity-5 px-2 py-1">
            <Users className="w-3.5 h-3.5 text-white text-opacity-40" />
            <span className="font-light text-xs tracking-wide">{analytics.totalPassengers.toLocaleString()}</span>
          </div>

          <div className="w-px h-4 bg-white bg-opacity-10" />

          <div className="flex items-center space-x-1.5 bg-white bg-opacity-5 px-2 py-1">
            <TrendingUp className="w-3.5 h-3.5 text-white text-opacity-40" />
            <span className="font-light text-xs tracking-wide">{satisfactionFactors.overall.toFixed(0)}%</span>
          </div>
        </div>

        {/* Right side - Game speed controls */}
        <div className="flex items-center space-x-1 bg-white bg-opacity-5 px-1.5 py-1">
          <button
            onClick={() => setGameSpeed(0)}
            className={`p-1.5 transition-all ${
              gameSpeed === 0 ? 'bg-[#c90a43] text-white' : 'text-white text-opacity-40 hover:text-opacity-100 hover:bg-white hover:bg-opacity-10'
            }`}
            title="Pause"
          >
            <Pause className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setGameSpeed(1)}
            className={`p-1.5 transition-all ${
              gameSpeed === 1 ? 'bg-[#c90a43] text-white' : 'text-white text-opacity-40 hover:text-opacity-100 hover:bg-white hover:bg-opacity-10'
            }`}
            title="Play (1x)"
          >
            <Play className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setGameSpeed(2)}
            className={`p-1.5 transition-all ${
              gameSpeed === 2 ? 'bg-[#c90a43] text-white' : 'text-white text-opacity-40 hover:text-opacity-100 hover:bg-white hover:bg-opacity-10'
            }`}
            title="Fast (2x)"
          >
            <FastForward className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setGameSpeed(3)}
            className={`p-1.5 transition-all ${
              gameSpeed === 3 ? 'bg-[#c90a43] text-white' : 'text-white text-opacity-40 hover:text-opacity-100 hover:bg-white hover:bg-opacity-10'
            }`}
            title="Very Fast (3x)"
          >
            <div className="flex items-center">
              <FastForward className="w-3.5 h-3.5" />
              <FastForward className="w-3.5 h-3.5 -ml-1.5" />
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
