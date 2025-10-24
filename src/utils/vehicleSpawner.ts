import { TransportLine, Vehicle } from '../types/game'
import { vehicleSimulator } from './vehicleSimulation'

/**
 * Vehicle spawning system
 * Automatically creates and manages vehicles for lines based on frequency
 */

interface SpawnSchedule {
  lineId: string
  lastSpawnTime: number
  spawnInterval: number // milliseconds
  vehicleCount: number
}

export class VehicleSpawner {
  private schedules: Map<string, SpawnSchedule> = new Map()
  private vehicleCounter: number = 0

  /**
   * Initialize spawning for a line
   */
  initializeLine(line: TransportLine) {
    // Calculate spawn interval based on frequency
    // frequency is in minutes, convert to milliseconds
    const spawnInterval = line.frequency * 60 * 1000

    this.schedules.set(line.id, {
      lineId: line.id,
      lastSpawnTime: Date.now(),
      spawnInterval: spawnInterval,
      vehicleCount: 0
    })
  }

  /**
   * Update spawner - call this every game tick
   * Returns array of new vehicles that should be added
   */
  update(lines: TransportLine[], existingVehicles: Vehicle[]): Vehicle[] {
    const now = Date.now()
    const newVehicles: Vehicle[] = []

    for (const line of lines) {
      // Skip lines that aren't operational
      if (line.phase !== 'operational') continue
      if (line.stations.length < 2) continue

      // Initialize schedule if needed
      let isNewLine = false
      if (!this.schedules.has(line.id)) {
        this.initializeLine(line)
        isNewLine = true
      }

      const schedule = this.schedules.get(line.id)!
      
      // Check if it's time to spawn a new vehicle (or if this is a new line)
      if (isNewLine || now - schedule.lastSpawnTime >= schedule.spawnInterval) {
        // Check how many vehicles this line currently has
        const lineVehicles = existingVehicles.filter(v => v.currentLine === line.id)
        
        // Calculate optimal vehicle count based on line length and frequency
        const optimalCount = this.calculateOptimalVehicleCount(line)
        
        if (lineVehicles.length < optimalCount) {
          const vehicle = this.createVehicle(line, schedule.vehicleCount)
          newVehicles.push(vehicle)
          
          // Initialize in simulator with staggered start
          const startingStation = schedule.vehicleCount % line.stations.length
          vehicleSimulator.initializeVehicle(vehicle, line, startingStation)
          
          schedule.vehicleCount++
          schedule.lastSpawnTime = now
        }
      }
    }

    return newVehicles
  }

  /**
   * Calculate optimal number of vehicles for a line
   */
  private calculateOptimalVehicleCount(line: TransportLine): number {
    // Simple calculation: one vehicle per 3 stations, minimum 1, maximum 10
    const baseCount = Math.ceil(line.stations.length / 3)
    
    // Adjust based on frequency (more frequent = more vehicles)
    const frequencyMultiplier = Math.max(1, 15 / line.frequency)
    
    const optimalCount = Math.ceil(baseCount * frequencyMultiplier)
    
    return Math.min(Math.max(optimalCount, 1), 10)
  }

  /**
   * Create a new vehicle for a line
   */
  private createVehicle(line: TransportLine, index: number): Vehicle {
    this.vehicleCounter++
    
    const vehicleModels: Record<string, string[]> = {
      metro: ['Metro Series 7000', 'Metro Series 8000', 'Metro Series 9000'],
      bus: ['City Bus 300', 'City Bus 400', 'Articulated Bus 500'],
      tram: ['Tram Model A', 'Tram Model B', 'Modern Tram C'],
      train: ['Regional Train RT-100', 'Express Train ET-200', 'Commuter Train CT-300']
    }

    const models = vehicleModels[line.type] || ['Generic Vehicle']
    const model = models[index % models.length]

    // Vehicle characteristics based on type
    const characteristics: Record<string, { capacity: number, speed: number, isElectric: boolean }> = {
      metro: { capacity: 200, speed: 60, isElectric: true },
      bus: { capacity: 80, speed: 40, isElectric: false },
      tram: { capacity: 150, speed: 45, isElectric: true },
      train: { capacity: 300, speed: 100, isElectric: true }
    }

    const char = characteristics[line.type] || { capacity: 100, speed: 50, isElectric: false }

    return {
      id: `vehicle-${this.vehicleCounter}`,
      type: line.type,
      model: model,
      capacity: char.capacity,
      speed: char.speed,
      age: 0,
      condition: 100,
      isElectric: char.isElectric,
      maintenanceCost: char.capacity * 0.5,
      currentLine: line.id,
      currentPosition: line.stations[0].position
    }
  }

  /**
   * Remove all vehicles for a line
   */
  removeLine(lineId: string) {
    this.schedules.delete(lineId)
  }

  /**
   * Update line frequency
   */
  updateLineFrequency(lineId: string, newFrequency: number) {
    const schedule = this.schedules.get(lineId)
    if (schedule) {
      schedule.spawnInterval = newFrequency * 60 * 1000
    }
  }
}

// Singleton instance
export const vehicleSpawner = new VehicleSpawner()
