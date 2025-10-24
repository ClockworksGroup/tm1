import { useState } from 'react'
import MapViewer from './components/MapViewer.tsx'
import GameUI from './components/GameUI.tsx'
import CitySelector from './components/CitySelector.tsx'
import MainMenu from './components/MainMenu.tsx'
import { useGameStore } from './store/gameStore.ts'

type GameState = 'menu' | 'citySelect' | 'playing'

function App() {
  const [gameState, setGameState] = useState<GameState>('menu')

  const handleNewGame = () => {
    setGameState('citySelect')
  }

  const handleContinue = (saveId: string) => {
    // Load save game from localStorage
    const saves = localStorage.getItem('transportMaster_saves')
    if (saves) {
      const savedGames = JSON.parse(saves)
      const save = savedGames.find((s: any) => s.id === saveId)
      if (save && save.gameState) {
        console.log('Loading save:', save)
        
        // Restore the entire game state by directly setting the store state
        useGameStore.setState({
          ...save.gameState,
          // Convert date strings back to Date objects
          gameTime: {
            ...save.gameState.gameTime,
            date: new Date(save.gameState.gameTime.date)
          }
        })
        
        console.log('Game state restored successfully')
        setGameState('playing')
      }
    }
  }

  const handleCitySelected = () => {
    setGameState('playing')
  }

  return (
    <div className="w-full h-full relative">
      {gameState === 'menu' && (
        <MainMenu onNewGame={handleNewGame} onContinue={handleContinue} />
      )}
      {gameState === 'citySelect' && (
        <CitySelector 
          onCitySelected={handleCitySelected}
          onBack={() => setGameState('menu')}
        />
      )}
      {gameState === 'playing' && (
        <>
          <MapViewer />
          <GameUI onReturnToMenu={() => setGameState('menu')} />
        </>
      )}
    </div>
  )
}

export default App
