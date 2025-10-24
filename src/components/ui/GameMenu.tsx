import { X, Save, Settings, Home, Play, Volume2, VolumeX } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useGameStore } from '../../store/gameStore.ts'

interface GameMenuProps {
  onClose: () => void
  onSaveGame: (saveName?: string) => void
  onReturnToMenu: () => void
  audioRef?: React.RefObject<HTMLAudioElement>
}

export default function GameMenu({ onClose, onSaveGame, onReturnToMenu, audioRef }: GameMenuProps) {
  const { cityName, economics, lines, gameTime } = useGameStore()
  const [saveName, setSaveName] = useState(`${cityName} - ${new Date().toLocaleDateString()}`)
  const [showSettings, setShowSettings] = useState(false)
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('transportMaster_volume')
    return saved ? parseFloat(saved) : 0.3
  })
  const [muted, setMuted] = useState(() => {
    const saved = localStorage.getItem('transportMaster_muted')
    return saved === 'true'
  })

  // Apply volume changes to audio
  useEffect(() => {
    if (audioRef?.current) {
      audioRef.current.volume = muted ? 0 : volume
    }
    localStorage.setItem('transportMaster_volume', volume.toString())
    localStorage.setItem('transportMaster_muted', muted.toString())
  }, [volume, muted, audioRef])

  const handleSaveAndContinue = () => {
    onSaveGame(saveName)
    onClose()
  }

  const handleSaveAndExit = () => {
    onSaveGame(saveName)
    onReturnToMenu()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-black bg-opacity-90 backdrop-blur-xl border border-white border-opacity-20 rounded w-[500px]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white border-opacity-10">
          <h2 className="text-white font-light text-xl tracking-wide">Game Menu</h2>
          <button
            onClick={onClose}
            className="text-white text-opacity-40 hover:text-opacity-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Save Name Input */}
        <div className="p-6 border-b border-white border-opacity-10">
          <div className="text-white text-opacity-40 text-xs uppercase tracking-wider mb-3">
            Save Name
          </div>
          <input
            type="text"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            className="w-full px-4 py-3 bg-white bg-opacity-10 border border-white border-opacity-20 rounded text-white placeholder-white placeholder-opacity-30 focus:outline-none focus:border-opacity-40 transition-all"
            placeholder="Enter save name..."
          />
        </div>

        {/* Current Game Info */}
        <div className="p-6 border-b border-white border-opacity-10">
          <div className="text-white text-opacity-40 text-xs uppercase tracking-wider mb-3">
            Current Game
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-white text-opacity-60 text-sm">City</span>
              <span className="text-white font-light">{cityName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white text-opacity-60 text-sm">Date</span>
              <span className="text-white font-light">
                {gameTime.date.toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white text-opacity-60 text-sm">Balance</span>
              <span className="text-white font-light">
                ${(economics.balance / 1000000).toFixed(1)}M
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-white text-opacity-60 text-sm">Lines</span>
              <span className="text-white font-light">{lines.length}</span>
            </div>
          </div>
        </div>

        {/* Menu Options */}
        <div className="p-6 space-y-3">
          <button
            onClick={onClose}
            className="w-full px-6 py-4 bg-white bg-opacity-5 hover:bg-opacity-10 text-white font-light tracking-wide transition-all flex items-center justify-between group rounded"
          >
            <div className="flex items-center space-x-3">
              <Play className="w-5 h-5 text-white text-opacity-60" />
              <span>Resume Game</span>
            </div>
          </button>

          <button
            onClick={handleSaveAndContinue}
            className="w-full px-6 py-4 bg-white bg-opacity-5 hover:bg-opacity-10 text-white font-light tracking-wide transition-all flex items-center justify-between group rounded"
          >
            <div className="flex items-center space-x-3">
              <Save className="w-5 h-5 text-white text-opacity-60" />
              <span>Save Game</span>
            </div>
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className="w-full px-6 py-4 bg-white bg-opacity-5 hover:bg-opacity-10 text-white font-light tracking-wide transition-all flex items-center justify-between group rounded"
          >
            <div className="flex items-center space-x-3">
              <Settings className="w-5 h-5 text-white text-opacity-60" />
              <span>Settings</span>
            </div>
          </button>

          {/* Settings Panel */}
          {showSettings && (
            <div className="p-4 bg-white bg-opacity-5 rounded space-y-4">
              {/* Volume Control */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-opacity-60 text-sm">Music Volume</span>
                  <span className="text-white text-sm">{Math.round(volume * 100)}%</span>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setMuted(!muted)}
                    className="p-2 bg-white bg-opacity-10 hover:bg-opacity-20 transition-all"
                  >
                    {muted ? (
                      <VolumeX className="w-4 h-4 text-white" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-white" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => {
                      setVolume(parseFloat(e.target.value))
                      if (muted) setMuted(false)
                    }}
                    className="flex-1 h-2 bg-white bg-opacity-20 appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #c90a43 0%, #c90a43 ${volume * 100}%, rgba(255,255,255,0.2) ${volume * 100}%, rgba(255,255,255,0.2) 100%)`
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="pt-3 border-t border-white border-opacity-10">
            <button
              onClick={handleSaveAndExit}
              className="w-full px-6 py-4 text-white font-light tracking-wide transition-all flex items-center justify-between group rounded"
              style={{ backgroundColor: '#c90a43' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#a00838'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#c90a43'}
            >
              <div className="flex items-center space-x-3">
                <Home className="w-5 h-5" />
                <span>Save & Exit to Menu</span>
              </div>
            </button>
          </div>
        </div>

        {/* Hint */}
        <div className="px-6 pb-6">
          <div className="text-white text-opacity-30 text-xs text-center">
            Press ESC to close this menu
          </div>
        </div>
      </div>
    </div>
  )
}
