import { useEffect, useRef } from 'react'
import { useGameStore } from '../store/gameStore'
import { vehicleSimulator } from '../utils/vehicleSimulation'
import { vehicleSpawner } from '../utils/vehicleSpawner'

/**
 * Main game loop hook
 * Handles continuous updates for simulation systems
 */
export function useGameLoop() {
  const gameSpeed = useGameStore(state => state.gameSpeed)
  const lines = useGameStore(state => state.lines)
  const vehicles = useGameStore(state => state.vehicles)
  const updateVehiclePositions = useGameStore(state => state.updateVehiclePositions)
  const addVehicle = useGameStore(state => state.addVehicle)
  
  const lastUpdateRef = useRef<number>(Date.now())
  const lastSpawnCheckRef = useRef<number>(Date.now())
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    if (gameSpeed === 0) {
      // Game is paused
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      return
    }

    const gameLoop = () => {
      const now = Date.now()
      lastUpdateRef.current = now

      // Update vehicle simulation
      const vehicleStates = vehicleSimulator.update(gameSpeed, lines, vehicles)
      
      // Update store with new vehicle positions
      updateVehiclePositions(vehicleStates)

      // Check for vehicle spawning every second
      if (now - lastSpawnCheckRef.current >= 1000) {
        const newVehicles = vehicleSpawner.update(lines, vehicles)
        if (newVehicles.length > 0) {
          console.log(`[GameLoop] Spawning ${newVehicles.length} vehicles`)
        }
        newVehicles.forEach(vehicle => addVehicle(vehicle))
        lastSpawnCheckRef.current = now
      }

      // Continue loop
      animationFrameRef.current = requestAnimationFrame(gameLoop)
    }

    // Start the loop
    animationFrameRef.current = requestAnimationFrame(gameLoop)

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [gameSpeed, lines, vehicles, updateVehiclePositions, addVehicle])
}
