import { useState, useEffect, useRef } from 'react'
import { Train, Bus, TrainTrack, Cable, BarChart3, Map, X } from 'lucide-react'
import { TransportType } from '../types/game'
import { useGameStore } from '../store/gameStore.ts'
import { useToastStore } from '../hooks/useToast.tsx'
import TopBar from './ui/TopBar.tsx'
import LineManager from './ui/LineManager.tsx'
import LineEditorPanel from './ui/LineEditorPanel.tsx'
import GameMenu from './ui/GameMenu.tsx'
import StationUpgradePanel from './ui/StationUpgradePanel.tsx'
import DistrictPanel from './ui/DistrictPanel.tsx'
import AnalyticsDashboard from './ui/AnalyticsDashboard.tsx'
import EventNotifications from './ui/EventNotifications.tsx'
import PassengerComplaints from './ui/PassengerComplaints.tsx'
import TycoonDashboard from './ui/TycoonDashboard.tsx'
import Toast from './ui/Toast.tsx'

interface GameUIProps {
  onReturnToMenu?: () => void
}

export default function GameUI({ onReturnToMenu }: GameUIProps) {
  const { selectedTool, buildMode, setBuildMode, setSelectedTool, cityName, economics, lines, gameTime } = useGameStore()
  const { toasts, removeToast } = useToastStore()
  const [showLines, setShowLines] = useState(false)
  const [showGameMenu, setShowGameMenu] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [showDistricts, setShowDistricts] = useState(false)
  // const [showQuickStats, setShowQuickStats] = useState(true)
  
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize and play background music at lower volume
  useEffect(() => {
    // Load saved volume settings
    const savedVolume = localStorage.getItem('transportMaster_volume')
    const savedMuted = localStorage.getItem('transportMaster_muted')
    const volume = savedVolume ? parseFloat(savedVolume) : 0.3
    const muted = savedMuted === 'true'
    
    const audio = new Audio('/music/track1.mp3')
    audio.loop = true
    audio.volume = muted ? 0 : volume
    audioRef.current = audio
    
    console.log('Music initialized, volume:', audio.volume)
    
    // Play music
    audio.play().catch(err => {
      console.log('Audio autoplay prevented:', err)
    })

    // Cleanup on unmount ONLY
    return () => {
      console.log('Component unmounting, stopping music')
      audio.pause()
      audio.src = '' // Release the audio resource
    }
  }, []) // Empty deps - only run once on mount

  // Handle ESC key to open game menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      console.log('Key pressed:', e.key, 'BuildMode:', buildMode, 'Current menu state:', showGameMenu)
      if (e.key === 'Escape') {
        e.preventDefault()
        if (!buildMode) {
          console.log('Toggling game menu')
          setShowGameMenu(prev => !prev)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [buildMode, showGameMenu])

  const handleSaveGame = (saveName?: string) => {
    // Save current game state to localStorage
    const saveGame = {
      id: `save-${Date.now()}`,
      saveName: saveName || `${cityName} - ${new Date().toLocaleDateString()}`,
      cityName,
      date: new Date(),
      money: economics.balance,
      passengers: lines.reduce((sum, l) => sum + l.stations.reduce((s, st) => s + st.passengers, 0), 0),
      lines: lines.length,
      playtime: Math.floor((Date.now() - gameTime.date.getTime()) / 60000), // minutes
      gameState: useGameStore.getState() // Save entire game state
    }

    const saves = localStorage.getItem('transportMaster_saves')
    const savedGames = saves ? JSON.parse(saves) : []
    
    // Update existing save or add new one
    const existingIndex = savedGames.findIndex((s: any) => s.cityName === cityName)
    if (existingIndex >= 0) {
      savedGames[existingIndex] = saveGame
    } else {
      savedGames.unshift(saveGame)
    }
    
    localStorage.setItem('transportMaster_saves', JSON.stringify(savedGames))
    console.log('Game saved successfully!')
  }

  const tools: { type: TransportType; icon: any; label: string; color: string }[] = [
    { type: 'metro', icon: TrainTrack, label: 'Metro', color: 'bg-blue-500' },
    { type: 'train', icon: Train, label: 'Train', color: 'bg-green-500' },
    { type: 'tram', icon: Cable, label: 'Tram', color: 'bg-yellow-500' },
    { type: 'bus', icon: Bus, label: 'Bus', color: 'bg-red-500' },
  ]

  const handleToolSelect = (type: TransportType) => {
    if (selectedTool === type) {
      setSelectedTool(null)
      setBuildMode(false)
    } else {
      setSelectedTool(type)
      setBuildMode(true)
    }
  }

  return (
    <>
      {/* Top Bar */}
      <TopBar />

      {/* Bottom Toolbar */}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 backdrop-blur-2xl z-20">
        {/* Accent line at bottom */}
        <div className="h-[2px] bg-[#c90a43]" />
        
        <div className="flex items-center justify-between px-4 py-1.5">
          {/* Left - Transport Tools */}
          <div className="flex items-center space-x-1">
            <div className="flex items-center space-x-2 mr-2">
              <div className="w-[2px] h-6 bg-[#c90a43]" />
              <span className="text-white text-opacity-40 text-[10px] uppercase tracking-widest">Build</span>
            </div>
            {tools.map(({ type, icon: Icon, label }) => (
              <button
                key={type}
                onClick={() => handleToolSelect(type)}
                className={`flex items-center space-x-1.5 px-2 py-1.5 transition-all ${
                  selectedTool === type
                    ? 'bg-[#c90a43] text-white'
                    : 'bg-white bg-opacity-5 text-white text-opacity-50 hover:bg-opacity-10 hover:text-opacity-100'
                }`}
                title={label}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="text-xs font-light">{label}</span>
              </button>
            ))}
          </div>

          {/* Right - View Controls */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setShowLines(!showLines)}
              className={`flex items-center space-x-1.5 px-2 py-1.5 transition-all ${
                showLines
                  ? 'bg-[#c90a43] text-white'
                  : 'bg-white bg-opacity-5 text-white text-opacity-50 hover:bg-opacity-10 hover:text-opacity-100'
              }`}
            >
              <Train className="w-3.5 h-3.5" />
              <span className="text-xs font-light">Lines</span>
            </button>

            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className={`flex items-center space-x-1.5 px-2 py-1.5 transition-all ${
                showAnalytics
                  ? 'bg-[#c90a43] text-white'
                  : 'bg-white bg-opacity-5 text-white text-opacity-50 hover:bg-opacity-10 hover:text-opacity-100'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="text-xs font-light">Analytics</span>
            </button>

            <button
              onClick={() => setShowDistricts(!showDistricts)}
              className={`flex items-center space-x-1.5 px-2 py-1.5 transition-all ${
                showDistricts
                  ? 'bg-[#c90a43] text-white'
                  : 'bg-white bg-opacity-5 text-white text-opacity-50 hover:bg-opacity-10 hover:text-opacity-100'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
              <span className="text-xs font-light">Districts</span>
            </button>
          </div>
        </div>

        {/* Build Mode Helper */}
        {selectedTool && (
          <>
            <div className="h-px bg-white bg-opacity-10" />
            <div className="flex items-center justify-between px-4 py-1">
              <div className="flex items-center space-x-2">
                <span className="text-white text-opacity-40 text-[10px] uppercase tracking-widest">
                  {selectedTool.charAt(0).toUpperCase() + selectedTool.slice(1)} Line
                </span>
              </div>
              <div className="flex items-center space-x-3 text-white text-opacity-40 text-[10px] font-light">
                <span>Click Map: New Station</span>
                <span>•</span>
                <span>Click Existing: Reuse</span>
                <span>•</span>
                <span>Right-Click: Delete</span>
                <span>•</span>
                <span>Enter: Save</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Conditional Panels */}
      {showLines && (
        <LineManager onClose={() => setShowLines(false)} />
      )}

      {showAnalytics && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] rounded-none max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden border-l-4" style={{ borderLeftColor: '#c90a43' }}>
            <div className="px-6 py-4 bg-[#1a1a1a] border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-normal text-white">Analytics Dashboard</h3>
                <button onClick={() => setShowAnalytics(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <AnalyticsDashboard />
            </div>
          </div>
        </div>
      )}

      {showDistricts && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1a] rounded-none max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden border-l-4" style={{ borderLeftColor: '#c90a43' }}>
            <div className="px-6 py-4 bg-[#1a1a1a] border-b border-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-normal text-white">Districts</h3>
                <button onClick={() => setShowDistricts(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <DistrictPanel />
            </div>
          </div>
        </div>
      )}

      {/* Context Panels */}
      <StationUpgradePanel />
      <LineEditorPanel />

      {/* Event Notifications */}
      <EventNotifications />

      {/* Tycoon Features */}
      <PassengerComplaints />
      <TycoonDashboard />

      {/* Game Menu (ESC) */}
      {showGameMenu && (
        <GameMenu
          onClose={() => setShowGameMenu(false)}
          onSaveGame={handleSaveGame}
          onReturnToMenu={() => onReturnToMenu && onReturnToMenu()}
          audioRef={audioRef}
        />
      )}

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  )
}

// Quick Stats Component
/* function QuickStatsPanel({ onClose }: { onClose: () => void }) {
  const { economics, analytics, satisfactionFactors, lines } = useGameStore()
  const [isMinimized, setIsMinimized] = useState(false)

  const formatMoney = (amount: number) => {
    if (Math.abs(amount) >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
    if (Math.abs(amount) >= 1000) return `$${(amount / 1000).toFixed(0)}K`
    return `$${amount.toFixed(0)}`
  }

  return (
    <div className="absolute top-20 left-6 bg-black bg-opacity-50 backdrop-blur-md border border-white border-opacity-10 rounded shadow-lg z-10">
      <div className="flex items-center justify-between p-3 border-b border-white border-opacity-10">
        <h3 className="text-white text-xs uppercase tracking-wider opacity-60">Quick Stats</h3>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white text-opacity-40 hover:text-opacity-100 p-1"
          >
            {isMinimized ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
          <button onClick={onClose} className="text-white text-opacity-40 hover:text-opacity-100 p-1">
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <div className="p-4 space-y-3 w-64">
          <div className="flex justify-between items-center">
            <span className="text-white text-opacity-40 text-xs">Balance</span>
            <span className="text-white font-light">{formatMoney(economics.balance)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white text-opacity-40 text-xs">Passengers</span>
            <span className="text-white font-light">{analytics.totalPassengers.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white text-opacity-40 text-xs">Satisfaction</span>
            <span className={`font-light ${
              satisfactionFactors.overall >= 70 ? 'text-green-400' :
              satisfactionFactors.overall >= 50 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {satisfactionFactors.overall.toFixed(0)}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white text-opacity-40 text-xs">Active Lines</span>
            <span className="text-white font-light">{lines.length}</span>
          </div>
        </div>
      )}
    </div>
  )
} */
