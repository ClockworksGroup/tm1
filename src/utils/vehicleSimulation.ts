import { Vehicle, TransportLine } from '../types/game'

/**
 * Vehicle simulation system
 * Handles real-time movement of vehicles along routes
 */

export interface VehicleState {
  vehicleId: string
  lineId: string
  currentSegment: number // index of current station pair
  progress: number // 0-1 along current segment
  direction: 'forward' | 'backward'
  passengers: number
  nextStationId: string
  estimatedArrival: number // seconds
  status: 'moving' | 'stopped' | 'boarding' | 'maintenance'
  delay: number // seconds behind schedule
  boardingStartTime?: number // timestamp when boarding started
}

export class VehicleSimulator {
  private vehicleStates: Map<string, VehicleState> = new Map()
  private lastUpdate: number = Date.now()

  /**
   * Initialize a vehicle on a line
   */
  initializeVehicle(vehicle: Vehicle, line: TransportLine, startingStationIndex: number = 0): VehicleState {
    const state: VehicleState = {
      vehicleId: vehicle.id,
      lineId: line.id,
      currentSegment: startingStationIndex,
      progress: 0,
      direction: 'forward',
      passengers: 0,
      nextStationId: line.stations[startingStationIndex + 1]?.id || line.stations[0].id,
      estimatedArrival: 0,
      status: 'moving',
      delay: 0
    }

    this.vehicleStates.set(vehicle.id, state)
    return state
  }

  /**
   * Update all vehicles - call this every game tick
   */
  update(_deltaTime: number, _lines: TransportLine[], vehicles: Vehicle[]): Map<string, VehicleState> {
    const now = Date.now()
    const dt = (now - this.lastUpdate) / 1000 // seconds
    this.lastUpdate = now

    for (const vehicle of vehicles) {
      const state = this.vehicleStates.get(vehicle.id)
      if (!state) continue

      const line = _lines.find((l: TransportLine) => l.id === state.lineId)
      if (!line || line.stations.length < 2) continue

      this.updateVehicle(state, line, vehicle, dt)
    }

    return this.vehicleStates
  }

  /**
   * Update a single vehicle's position
   */
  private updateVehicle(state: VehicleState, line: TransportLine, vehicle: Vehicle, deltaTime: number) {
    if (state.status === 'maintenance') return

    const stations = line.stations
    const currentStation = stations[state.currentSegment]
    const nextStation = stations[state.currentSegment + 1] || stations[0]

    // Calculate distance between stations (simplified - using straight line)
    const distance = this.calculateDistance(currentStation.position, nextStation.position)
    
    // Speed in km/h converted to units per second
    const speed = vehicle.speed / 3600 // km/h to km/s
    const progressIncrement = (speed / distance) * deltaTime

    if (state.status === 'moving') {
      // Move vehicle
      state.progress += progressIncrement

      // Arrived at station
      if (state.progress >= 1) {
        state.progress = 0
        state.status = 'stopped'
        state.currentSegment++

        // Handle end of line
        if (state.currentSegment >= stations.length - 1) {
          if (line.isLoop) {
            state.currentSegment = 0
          } else if (line.isBidirectional) {
            state.direction = state.direction === 'forward' ? 'backward' : 'forward'
            state.currentSegment = stations.length - 2
          } else {
            state.currentSegment = 0 // Reset to start
          }
        }

        // Update next station
        state.nextStationId = stations[state.currentSegment + 1]?.id || stations[0].id

        // Start boarding process
        this.startBoarding(state, line)
      }
    } else if (state.status === 'stopped' || state.status === 'boarding') {
      // Boarding time based on passengers (simplified)
      const boardingTime = Math.max(5, state.passengers / 10) // seconds
      
      // Use a counter instead of setTimeout
      if (!state.boardingStartTime) {
        state.boardingStartTime = Date.now()
      }
      
      const elapsed = (Date.now() - state.boardingStartTime) / 1000
      if (elapsed >= boardingTime) {
        state.status = 'moving'
        state.boardingStartTime = undefined
      }
    }

    // Update estimated arrival
    const remainingDistance = distance * (1 - state.progress)
    state.estimatedArrival = (remainingDistance / speed)
  }

  /**
   * Start boarding passengers at a station
   */
  private startBoarding(state: VehicleState, _line: TransportLine) {
    state.status = 'boarding'
    
    // Simulate passenger boarding/alighting
    // This will be enhanced with actual demand simulation
    const boardingPassengers = Math.floor(Math.random() * 50)
    const alightingPassengers = Math.floor(Math.random() * Math.min(state.passengers, 30))
    
    state.passengers = state.passengers - alightingPassengers + boardingPassengers
    state.passengers = Math.min(state.passengers, 200) // Vehicle capacity limit
  }

  /**
   * Calculate distance between two points (Haversine formula)
   */
  private calculateDistance(pos1: [number, number, number], pos2: [number, number, number]): number {
    const R = 6371 // Earth's radius in km
    const lat1 = pos1[0] * Math.PI / 180
    const lat2 = pos2[0] * Math.PI / 180
    const dLat = (pos2[0] - pos1[0]) * Math.PI / 180
    const dLon = (pos2[1] - pos1[1]) * Math.PI / 180

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  /**
   * Get current position of a vehicle (interpolated between stations)
   */
  getVehiclePosition(vehicleId: string, line: TransportLine): [number, number, number] | null {
    const state = this.vehicleStates.get(vehicleId)
    if (!state || !line) {
      console.warn(`[VehicleSimulator] No state or line for vehicle ${vehicleId}`)
      return null
    }

    const stations = line.stations
    if (!stations || stations.length === 0) {
      console.warn(`[VehicleSimulator] No stations for line ${line.id}`)
      return null
    }
    
    const currentStation = stations[state.currentSegment]
    if (!currentStation) {
      console.warn(`[VehicleSimulator] No current station at segment ${state.currentSegment} for vehicle ${vehicleId}`)
      return null
    }
    
    const nextStation = stations[state.currentSegment + 1] || stations[0]
    if (!nextStation) return currentStation.position

    // Linear interpolation between stations
    const lat = currentStation.position[0] + (nextStation.position[0] - currentStation.position[0]) * state.progress
    const lng = currentStation.position[1] + (nextStation.position[1] - currentStation.position[1]) * state.progress
    const alt = currentStation.position[2] + (nextStation.position[2] - currentStation.position[2]) * state.progress

    return [lat, lng, alt]
  }

  /**
   * Get all vehicle states
   */
  getAllStates(): Map<string, VehicleState> {
    return this.vehicleStates
  }

  /**
   * Remove a vehicle from simulation
   */
  removeVehicle(vehicleId: string) {
    this.vehicleStates.delete(vehicleId)
  }
}

// Singleton instance
export const vehicleSimulator = new VehicleSimulator()
