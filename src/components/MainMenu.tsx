import { useState, useEffect, useRef } from 'react'
import { Play, Save, Settings, Info, Plus, Trash2, Calendar, DollarSign, Users, BookOpen, Train, Bus, TramFront, TrainTrack } from 'lucide-react'

interface SaveGame {
  id: string
  saveName?: string
  cityName: string
  date: Date
  money: number
  passengers: number
  lines: number
  playtime: number
}

interface MainMenuProps {
  onNewGame: () => void
  onContinue: (saveId: string) => void
}

export default function MainMenu({ onNewGame, onContinue }: MainMenuProps) {
  const [activeTab, setActiveTab] = useState<'main' | 'saves' | 'tutorial' | 'settings' | 'about'>('main')
  const [tutorialTab, setTutorialTab] = useState<'basics' | 'building' | 'economics' | 'tips'>('basics')
  const [savedGames, setSavedGames] = useState<SaveGame[]>(() => {
    // Load saved games from localStorage
    const saved = localStorage.getItem('transportMaster_saves')
    return saved ? JSON.parse(saved) : []
  })
  
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Initialize and play background music
  useEffect(() => {
    audioRef.current = new Audio('/music/track1.mp3')
    audioRef.current.loop = true
    audioRef.current.volume = 0.5 // 50% volume for main menu
    
    // Play music
    audioRef.current.play().catch(err => {
      console.log('Audio autoplay prevented:', err)
    })

    // Cleanup on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const handleDeleteSave = (id: string) => {
    if (confirm('Delete this save game?')) {
      const updated = savedGames.filter(s => s.id !== id)
      setSavedGames(updated)
      localStorage.setItem('transportMaster_saves', JSON.stringify(updated))
    }
  }

  const formatPlaytime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <div className="w-full h-full bg-black flex items-center justify-center relative overflow-hidden">
      {/* Background Image with Low Opacity */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: 'url(/transport_bg.png)' }}
      />
      
      {/* Dark overlay to maintain theme */}
      <div className="absolute inset-0 bg-black opacity-40" />
      
      {/* Content */}
      <div className="relative z-10 max-w-6xl w-full mx-8">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-7xl font-extralight tracking-widest text-white mb-4 uppercase">
            Transport <span style={{ color: '#c90a43' }}>Master</span>
          </h1>
          <p className="text-sm text-white text-opacity-50 font-light tracking-wide">
            Build and manage your city's public transportation network
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Left Panel - Navigation */}
          <div className="space-y-3">
            <button
              onClick={() => setActiveTab('main')}
              className={`w-full px-6 py-4 text-left transition-all ${
                activeTab === 'main'
                  ? 'bg-white bg-opacity-10 border-l-4'
                  : 'bg-white bg-opacity-5 hover:bg-opacity-10 border-l-4 border-transparent'
              }`}
              style={activeTab === 'main' ? { borderLeftColor: '#c90a43' } : {}}
            >
              <div className="flex items-center space-x-3">
                <Play className="w-5 h-5 text-white text-opacity-60" />
                <span className="text-white font-light tracking-wide">Main Menu</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('saves')}
              className={`w-full px-6 py-4 text-left transition-all ${
                activeTab === 'saves'
                  ? 'bg-white bg-opacity-10 border-l-4'
                  : 'bg-white bg-opacity-5 hover:bg-opacity-10 border-l-4 border-transparent'
              }`}
              style={activeTab === 'saves' ? { borderLeftColor: '#c90a43' } : {}}
            >
              <div className="flex items-center space-x-3">
                <Save className="w-5 h-5 text-white text-opacity-60" />
                <span className="text-white font-light tracking-wide">Load Game</span>
                {savedGames.length > 0 && (
                  <span className="ml-auto text-xs text-white text-opacity-40">
                    {savedGames.length}
                  </span>
                )}
              </div>
            </button>

            <button
              onClick={() => setActiveTab('tutorial')}
              className={`w-full px-6 py-4 text-left transition-all ${
                activeTab === 'tutorial'
                  ? 'bg-white bg-opacity-10 border-l-4'
                  : 'bg-white bg-opacity-5 hover:bg-opacity-10 border-l-4 border-transparent'
              }`}
              style={activeTab === 'tutorial' ? { borderLeftColor: '#c90a43' } : {}}
            >
              <div className="flex items-center space-x-3">
                <BookOpen className="w-5 h-5 text-white text-opacity-60" />
                <span className="text-white font-light tracking-wide">How to Play</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full px-6 py-4 text-left transition-all ${
                activeTab === 'settings'
                  ? 'bg-white bg-opacity-10 border-l-4'
                  : 'bg-white bg-opacity-5 hover:bg-opacity-10 border-l-4 border-transparent'
              }`}
              style={activeTab === 'settings' ? { borderLeftColor: '#c90a43' } : {}}
            >
              <div className="flex items-center space-x-3">
                <Settings className="w-5 h-5 text-white text-opacity-60" />
                <span className="text-white font-light tracking-wide">Settings</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('about')}
              className={`w-full px-6 py-4 text-left transition-all ${
                activeTab === 'about'
                  ? 'bg-white bg-opacity-10 border-l-4'
                  : 'bg-white bg-opacity-5 hover:bg-opacity-10 border-l-4 border-transparent'
              }`}
              style={activeTab === 'about' ? { borderLeftColor: '#c90a43' } : {}}
            >
              <div className="flex items-center space-x-3">
                <Info className="w-5 h-5 text-white text-opacity-60" />
                <span className="text-white font-light tracking-wide">About</span>
              </div>
            </button>
          </div>

          {/* Right Panel - Content */}
          <div className="col-span-2 bg-white bg-opacity-5 backdrop-blur-md border border-white border-opacity-10 rounded p-8">
            {activeTab === 'main' && (
              <div className="space-y-4">
                <h2 className="text-2xl font-light text-white mb-6 tracking-wide">Main Menu</h2>
                
                <button
                  onClick={onNewGame}
                  className="w-full px-8 py-6 text-white font-light text-lg tracking-wide transition-all flex items-center justify-between group"
                  style={{ backgroundColor: '#c90a43' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#a00838'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#c90a43'}
                >
                  <span>New Game</span>
                  <Plus className="w-6 h-6 group-hover:scale-110 transition-transform" />
                </button>

                {savedGames.length > 0 && (
                  <button
                    onClick={() => onContinue(savedGames[0].id)}
                    className="w-full px-8 py-6 bg-white bg-opacity-10 hover:bg-opacity-20 text-white font-light text-lg tracking-wide transition-all flex items-center justify-between group"
                  >
                    <div className="text-left">
                      <div>Continue</div>
                      <div className="text-xs text-white text-opacity-60 mt-1">
                        {savedGames[0].saveName || savedGames[0].cityName} • {formatPlaytime(savedGames[0].playtime)}
                      </div>
                    </div>
                    <Play className="w-6 h-6 group-hover:scale-110 transition-transform" />
                  </button>
                )}
              </div>
            )}

            {activeTab === 'saves' && (
              <div>
                <h2 className="text-2xl font-light text-white mb-6 tracking-wide">Saved Games</h2>
                
                {savedGames.length === 0 ? (
                  <div className="text-center py-16">
                    <Save className="w-16 h-16 text-white text-opacity-20 mx-auto mb-4" />
                    <p className="text-white text-opacity-40 font-light">No saved games yet</p>
                    <p className="text-white text-opacity-30 text-sm mt-2">Start a new game to create your first save</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {savedGames.map((save) => (
                      <div
                        key={save.id}
                        className="bg-white bg-opacity-5 hover:bg-opacity-10 border border-white border-opacity-10 rounded p-4 transition-all group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-white font-light text-lg tracking-wide">{save.saveName || save.cityName}</h3>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-white text-opacity-60">
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-3 h-3" />
                                <span>{new Date(save.date).toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <DollarSign className="w-3 h-3" />
                                <span>${(save.money / 1000000).toFixed(1)}M</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="w-3 h-3" />
                                <span>{save.passengers.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => onContinue(save.id)}
                              className="px-4 py-2 text-white text-sm rounded transition-all"
                              style={{ backgroundColor: '#c90a43' }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#a00838'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#c90a43'}
                            >
                              Load
                            </button>
                            <button
                              onClick={() => handleDeleteSave(save.id)}
                              className="p-2 bg-white bg-opacity-5 hover:bg-opacity-10 rounded transition-all"
                              style={{ color: '#c90a43' }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-white text-opacity-40">{save.lines} lines</span>
                          <span className="text-white text-opacity-40">{formatPlaytime(save.playtime)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tutorial' && (
              <div>
                  <h2 className="text-2xl font-light text-white mb-6 tracking-wide">How to Play</h2>
                  
                  {/* Tutorial Tabs */}
                  <div className="flex space-x-2 mb-6 border-b border-white border-opacity-10">
                    <button
                      onClick={() => setTutorialTab('basics')}
                      className={`px-4 py-2 text-sm transition-all ${
                        tutorialTab === 'basics'
                          ? 'text-white border-b-2'
                          : 'text-white text-opacity-50 hover:text-opacity-70'
                      }`}
                      style={tutorialTab === 'basics' ? { borderBottomColor: '#c90a43' } : {}}
                    >
                      Basics
                    </button>
                    <button
                      onClick={() => setTutorialTab('building')}
                      className={`px-4 py-2 text-sm transition-all ${
                        tutorialTab === 'building'
                          ? 'text-white border-b-2'
                          : 'text-white text-opacity-50 hover:text-opacity-70'
                      }`}
                      style={tutorialTab === 'building' ? { borderBottomColor: '#c90a43' } : {}}
                    >
                      Building Lines
                    </button>
                    <button
                      onClick={() => setTutorialTab('economics')}
                      className={`px-4 py-2 text-sm transition-all ${
                        tutorialTab === 'economics'
                          ? 'text-white border-b-2'
                          : 'text-white text-opacity-50 hover:text-opacity-70'
                      }`}
                      style={tutorialTab === 'economics' ? { borderBottomColor: '#c90a43' } : {}}
                    >
                      Economics
                    </button>
                    <button
                      onClick={() => setTutorialTab('tips')}
                      className={`px-4 py-2 text-sm transition-all ${
                        tutorialTab === 'tips'
                          ? 'text-white border-b-2'
                          : 'text-white text-opacity-50 hover:text-opacity-70'
                      }`}
                      style={tutorialTab === 'tips' ? { borderBottomColor: '#c90a43' } : {}}
                    >
                      Tips & Controls
                    </button>
                  </div>

                  {/* Tab Content */}
                  <div className="space-y-6 text-white text-opacity-70 text-sm leading-relaxed">
                    {tutorialTab === 'basics' && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-normal text-white mb-3">Getting Started</h3>
                          <p>• <strong className="text-white">Choose a city</strong> to begin your transport empire</p>
                          <p>• You start with <strong className="text-white">$500M</strong> to build your first lines</p>
                          <p className="flex items-center gap-2">• Select a transport type from the toolbar: <TrainTrack className="w-4 h-4" /> Metro, <Train className="w-4 h-4" /> Train, <TramFront className="w-4 h-4" /> Tram, or <Bus className="w-4 h-4" /> Bus</p>
                        </div>

                        <div>
                          <h3 className="text-lg font-normal text-white mb-3">Transport Types</h3>
                          <div className="space-y-3">
                            <div className="bg-white bg-opacity-5 p-3 rounded">
                              <p className="text-white font-normal mb-1 flex items-center gap-2"><TrainTrack className="w-5 h-5" /> Metro</p>
                              <p>High capacity (1200 pax), underground, expensive ($50M/km), fast (40 km/h)</p>
                            </div>
                            <div className="bg-white bg-opacity-5 p-3 rounded">
                              <p className="text-white font-normal mb-1 flex items-center gap-2"><Train className="w-5 h-5" /> Train</p>
                              <p>Medium capacity (800 pax), surface only, moderate cost ($30M/km), fastest (60 km/h)</p>
                            </div>
                            <div className="bg-white bg-opacity-5 p-3 rounded">
                              <p className="text-white font-normal mb-1 flex items-center gap-2"><TramFront className="w-5 h-5" /> Tram</p>
                              <p>Low capacity (200 pax), surface only, cheap ($10M/km), slow (25 km/h)</p>
                            </div>
                            <div className="bg-white bg-opacity-5 p-3 rounded">
                              <p className="text-white font-normal mb-1 flex items-center gap-2"><Bus className="w-5 h-5" /> Bus</p>
                              <p>Lowest capacity (80 pax), surface only, very cheap ($500K/km), slowest (20 km/h)</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {tutorialTab === 'building' && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-normal text-white mb-3">How to Build Lines</h3>
                          <p>• <strong className="text-white">Click on the map</strong> to place stations (minimum 2 stations)</p>
                          <p>• For metro/train, <strong className="text-white">choose station depth</strong>: Surface, Shallow, Medium, or Deep</p>
                          <p>• Deeper stations cost more but avoid obstacles like buildings and utilities</p>
                          <p>• <strong className="text-white">Press ENTER</strong> to complete the line or <strong className="text-white">ESC</strong> to cancel</p>
                          <p>• Lines automatically connect stations and start operating</p>
                        </div>

                        <div>
                          <h3 className="text-lg font-normal text-white mb-3">Station Depths (Metro/Train)</h3>
                          <div className="space-y-2">
                            <p>• <strong className="text-white">Surface (0m)</strong> - Cheapest, easiest, but may have obstacles</p>
                            <p>• <strong className="text-white">Shallow (10m)</strong> - Recommended for metro, good balance</p>
                            <p>• <strong className="text-white">Medium (25m)</strong> - Avoids most obstacles, more expensive</p>
                            <p>• <strong className="text-white">Deep (50m)</strong> - Avoids all obstacles, very expensive and slow to build</p>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-normal text-white mb-3">Passenger Satisfaction</h3>
                          <p>Passengers rate your service based on:</p>
                          <p className="ml-4">- <strong className="text-white">Wait time</strong>: Lower frequency = longer waits</p>
                          <p className="ml-4">- <strong className="text-white">Travel time</strong>: Faster vehicles = happier passengers</p>
                          <p className="ml-4">- <strong className="text-white">Crowding</strong>: Overcrowded vehicles reduce satisfaction</p>
                          <p className="ml-4">- <strong className="text-white">Reliability</strong>: Events like strikes hurt reliability</p>
                          <p className="mt-2">• Watch for <strong className="text-white">passenger complaints</strong> (bottom-right) for feedback</p>
                          <p>• High satisfaction = more riders and government subsidies!</p>
                        </div>
                      </div>
                    )}

                    {tutorialTab === 'economics' && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-normal text-white mb-3">Revenue Sources</h3>
                          <p>• <strong className="text-white">Fares</strong>: $2.50 base fare per passenger</p>
                          <p>• <strong className="text-white">Advertising</strong>: $150 per station per hour</p>
                          <p>• <strong className="text-white">Retail</strong>: Income from station shops and kiosks</p>
                          <p>• <strong className="text-white">Subsidies</strong>: Government provides 30% support if satisfaction &gt; 70%</p>
                        </div>

                        <div>
                          <h3 className="text-lg font-normal text-white mb-3">Operating Costs</h3>
                          <p>• <strong className="text-white">Staff</strong>: $2K per station + $5K per line (daily)</p>
                          <p>• <strong className="text-white">Maintenance</strong>: $1K per station + $2K per line (daily)</p>
                          <p>• <strong className="text-white">Energy</strong>: $500 per station + $1.5K per line (daily)</p>
                          <p>• <strong className="text-white">Operations</strong>: Varies by transport type and frequency</p>
                          <p className="mt-3 text-yellow-400 flex items-center gap-2"><Info className="w-4 h-4" /> Transit systems typically run at 30-40% cost recovery - losses are normal!</p>
                        </div>

                        <div>
                          <h3 className="text-lg font-normal text-white mb-3">Random Events</h3>
                          <p>• <strong className="text-white">Equipment failures</strong>, <strong className="text-white">strikes</strong>, <strong className="text-white">accidents</strong>, and <strong className="text-white">vandalism</strong> can occur</p>
                          <p>• Choose how to respond: fast & expensive, slow & cheap, or ignore (risky!)</p>
                          <p>• <strong className="text-white">Special events</strong> like concerts and festivals boost demand temporarily</p>
                        </div>
                      </div>
                    )}

                    {tutorialTab === 'tips' && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-normal text-white mb-3">Pro Tips</h3>
                          <p>• Start with <strong className="text-white">buses or trams</strong> - they're cheap and let you learn the game</p>
                          <p>• Build lines connecting <strong className="text-white">residential to commercial/industrial</strong> areas</p>
                          <p>• <strong className="text-white">Rush hours</strong> (7-9 AM, 5-7 PM) have 2x demand - plan accordingly</p>
                          <p>• Use <strong className="text-white">shallow depth</strong> for metro stations - best balance of cost and speed</p>
                          <p>• Check the <strong className="text-white">Financial tab</strong> regularly to monitor your budget</p>
                          <p>• Don't panic if you're losing money - subsidies help cover the gap!</p>
                        </div>

                        <div>
                          <h3 className="text-lg font-normal text-white mb-3">Keyboard Controls</h3>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white bg-opacity-5 p-3 rounded">
                              <p className="text-white font-normal">SPACE</p>
                              <p className="text-xs">Pause/Unpause game</p>
                            </div>
                            <div className="bg-white bg-opacity-5 p-3 rounded">
                              <p className="text-white font-normal">ESC</p>
                              <p className="text-xs">Cancel / Open menu</p>
                            </div>
                            <div className="bg-white bg-opacity-5 p-3 rounded">
                              <p className="text-white font-normal">ENTER</p>
                              <p className="text-xs">Complete line</p>
                            </div>
                            <div className="bg-white bg-opacity-5 p-3 rounded">
                              <p className="text-white font-normal">1-4</p>
                              <p className="text-xs">Select transport type</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h2 className="text-2xl font-light text-white mb-6 tracking-wide">Settings</h2>
                <div className="space-y-6">
                  <div>
                    <label className="text-white text-opacity-60 text-sm mb-2 block">Auto-save</label>
                    <select className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded px-4 py-3 text-white">
                      <option>Every 5 minutes</option>
                      <option>Every 10 minutes</option>
                      <option>Every 30 minutes</option>
                      <option>Disabled</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-white text-opacity-60 text-sm mb-2 block">Graphics Quality</label>
                    <select className="w-full bg-white bg-opacity-10 border border-white border-opacity-20 rounded px-4 py-3 text-white">
                      <option>High</option>
                      <option>Medium</option>
                      <option>Low</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-white text-opacity-60 text-sm mb-2 block">Show Tutorials</label>
                    <input type="checkbox" className="w-5 h-5" defaultChecked />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div>
                <h2 className="text-2xl font-light text-white mb-6 tracking-wide">About</h2>
                <div className="space-y-4 text-white text-opacity-60 font-light">
                  <p>
                    <strong className="text-white">Transport Master</strong> is a comprehensive public transportation management simulation game.
                  </p>
                  <p>
                    Build metro lines, bus routes, tram networks, and train systems. Manage frequencies, ticket prices, and passenger satisfaction to create the perfect transit network.
                  </p>
                  <div className="pt-4 border-t border-white border-opacity-10">
                    <div className="text-xs text-white text-opacity-40">
                      Version 1.0.0 • © 2024 Transport Master
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
