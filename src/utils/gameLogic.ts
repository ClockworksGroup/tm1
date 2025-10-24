import { TransportType, StationDepth, TimeOfDay, DayType, ZoneType } from '../types/game'

// Time management
export function getTimeOfDay(hour: number): TimeOfDay {
  if (hour >= 5 && hour < 7) return 'early_morning'
  if (hour >= 7 && hour < 9) return 'morning_rush'
  if (hour >= 9 && hour < 17) return 'midday'
  if (hour >= 17 && hour < 19) return 'evening_rush'
  if (hour >= 19 && hour < 23) return 'evening'
  return 'night'
}

export function getRushHourMultiplier(timeOfDay: TimeOfDay, dayType: DayType): number {
  if (dayType === 'weekend') {
    return timeOfDay === 'midday' ? 1.5 : 0.8
  }
  
  switch (timeOfDay) {
    case 'morning_rush':
    case 'evening_rush':
      return 3.0
    case 'midday':
      return 1.2
    case 'early_morning':
    case 'evening':
      return 0.8
    case 'night':
      return 0.3
    default:
      return 1.0
  }
}

// Station depth costs and constraints
export function getDepthCost(depth: StationDepth): number {
  const baseCost = 5000000 // $5M for surface station
  const multipliers = {
    surface: 1.0,
    shallow: 1.5,  // 10-20m deep
    medium: 2.5,   // 20-40m deep
    deep: 4.0      // 40m+ deep
  }
  return baseCost * multipliers[depth]
}

export function getDepthMeters(depth: StationDepth): number {
  const depths = {
    surface: 0,
    shallow: 15,
    medium: 30,
    deep: 50
  }
  return depths[depth]
}

export function canBuildAtDepth(
  depth: StationDepth,
  buildingFoundations: number[],
  _position: [number, number, number]
): boolean {
  const stationDepth = getDepthMeters(depth)
  
  // Check if any building foundation conflicts
  for (const foundationDepth of buildingFoundations) {
    if (stationDepth < foundationDepth + 5) { // 5m clearance
      return false
    }
  }
  
  return true
}

// Transport type characteristics
export function getTransportCharacteristics(type: TransportType) {
  const characteristics = {
    metro: {
      baseSpeed: 40, // km/h
      capacity: 1200, // passengers per vehicle
      baseCost: 50000000, // $50M per km
      operatingCost: 500, // per hour
      ticketPrice: 2.5,
      canGoUnderground: true,
      needsDedicatedTrack: true,
      minStationDistance: 800, // meters
      maxGradient: 4, // percentage
    },
    train: {
      baseSpeed: 60,
      capacity: 800,
      baseCost: 30000000,
      operatingCost: 400,
      ticketPrice: 3.0,
      canGoUnderground: false,
      needsDedicatedTrack: true,
      minStationDistance: 2000,
      maxGradient: 3,
    },
    tram: {
      baseSpeed: 25,
      capacity: 200,
      baseCost: 10000000,
      operatingCost: 200,
      ticketPrice: 2.0,
      canGoUnderground: false,
      needsDedicatedTrack: false,
      minStationDistance: 400,
      maxGradient: 6,
    },
    bus: {
      baseSpeed: 20,
      capacity: 80,
      baseCost: 500000,
      operatingCost: 100,
      ticketPrice: 1.5,
      canGoUnderground: false,
      needsDedicatedTrack: false,
      minStationDistance: 300,
      maxGradient: 10,
    },
  }
  
  return characteristics[type]
}

// Demand calculation
export function calculateDemand(
  origin: ZoneType,
  destination: ZoneType,
  timeOfDay: TimeOfDay,
  dayType: DayType,
  population: number
): number {
  let baseDemand = population * 0.1 // 10% of population travels
  
  // Zone-based patterns
  if (dayType === 'weekday') {
    if (timeOfDay === 'morning_rush') {
      if (origin === 'residential' && (destination === 'commercial' || destination === 'industrial')) {
        baseDemand *= 2.5
      }
    } else if (timeOfDay === 'evening_rush') {
      if (origin === 'commercial' && destination === 'residential') {
        baseDemand *= 2.5
      }
    }
  } else {
    // Weekend patterns - more mixed-use travel
    if (timeOfDay === 'midday' && destination === 'commercial') {
      baseDemand *= 1.8
    }
  }
  
  return Math.floor(baseDemand)
}

// Satisfaction calculation
export function calculateSatisfaction(factors: {
  waitTime: number // minutes
  travelTime: number // minutes
  crowding: number // 0-1
  reliability: number // 0-100
  coverage: number // 0-1
  cleanliness: number // 0-100
  safety: number // 0-100
  accessibility: number // 0-100
}): number {
  // Convert to 0-100 scores
  const waitScore = Math.max(0, 100 - factors.waitTime * 5) // penalty for long waits
  const travelScore = Math.max(0, 100 - factors.travelTime * 2)
  const crowdingScore = (1 - factors.crowding) * 100
  const coverageScore = factors.coverage * 100
  
  // Weighted average
  const weights = {
    wait: 0.20,
    travel: 0.15,
    crowding: 0.15,
    reliability: 0.15,
    coverage: 0.10,
    cleanliness: 0.10,
    safety: 0.10,
    accessibility: 0.05,
  }
  
  return (
    waitScore * weights.wait +
    travelScore * weights.travel +
    crowdingScore * weights.crowding +
    factors.reliability * weights.reliability +
    coverageScore * weights.coverage +
    factors.cleanliness * weights.cleanliness +
    factors.safety * weights.safety +
    factors.accessibility * weights.accessibility
  )
}

// Traffic impact on bus speed
export function calculateBusSpeed(
  baseSpeed: number,
  trafficLevel: number, // 0-1
  hasBusLane: boolean,
  timeOfDay: TimeOfDay
): number {
  let speed = baseSpeed
  
  if (!hasBusLane) {
    // Traffic significantly affects buses without dedicated lanes
    const trafficMultiplier = timeOfDay === 'morning_rush' || timeOfDay === 'evening_rush' 
      ? 0.5 // 50% speed during rush hour
      : 0.7
    
    speed *= (1 - trafficLevel * trafficMultiplier)
  } else {
    // Bus lanes help but still some impact
    speed *= (1 - trafficLevel * 0.2)
  }
  
  return Math.max(speed, baseSpeed * 0.3) // minimum 30% of base speed
}

// Construction time calculation
export function calculateConstructionTime(
  type: TransportType,
  length: number, // km
  depth?: StationDepth
): number {
  const baseTime = {
    metro: 365, // days per km
    train: 180,
    tram: 90,
    bus: 30, // mostly just stops
  }
  
  let time = baseTime[type] * length
  
  // Depth multiplier for metro
  if (type === 'metro' && depth) {
    const depthMultipliers = {
      surface: 1.0,
      shallow: 1.3,
      medium: 1.6,
      deep: 2.0,
    }
    time *= depthMultipliers[depth]
  }
  
  return Math.ceil(time)
}

// Load factor calculation
export function calculateLoadFactor(
  currentPassengers: number,
  capacity: number,
  frequency: number // minutes
): number {
  const passengersPerVehicle = (currentPassengers * frequency) / 60
  return Math.min(passengersPerVehicle / capacity, 2.0) // can go over 100% (overcrowding)
}

// Farebox recovery ratio
export function calculateFareboxRecovery(revenue: number, costs: number): number {
  return costs > 0 ? (revenue / costs) * 100 : 0
}

// Vehicle aging and maintenance
export function calculateVehicleCondition(
  age: number, // years
  maintenanceSpending: number // per year
): number {
  const baseDecay = age * 5 // 5% per year
  const maintenanceBonus = Math.min(maintenanceSpending / 10000, 20) // up to 20% bonus
  
  return Math.max(0, Math.min(100, 100 - baseDecay + maintenanceBonus))
}

// Distance calculation
export function calculateDistance(
  point1: [number, number, number],
  point2: [number, number, number]
): number {
  const [x1, y1, z1] = point1
  const [x2, y2, z2] = point2
  
  return Math.sqrt(
    Math.pow(x2 - x1, 2) +
    Math.pow(y2 - y1, 2) +
    Math.pow(z2 - z1, 2)
  )
}

// Check if gradient is acceptable
export function isGradientAcceptable(
  start: [number, number, number],
  end: [number, number, number],
  type: TransportType
): boolean {
  const distance = Math.sqrt(
    Math.pow(end[0] - start[0], 2) +
    Math.pow(end[2] - start[2], 2)
  )
  
  const heightDiff = Math.abs(end[1] - start[1])
  const gradient = (heightDiff / distance) * 100
  
  const maxGradient = getTransportCharacteristics(type).maxGradient
  
  return gradient <= maxGradient
}

// Random event generation
export function shouldTriggerEvent(probability: number = 0.05): boolean {
  return Math.random() < probability
}

export function generateRandomEvent(): {
  type: string
  severity: number
  affectedLines: number
} {
  const events = [
    { type: 'equipment_failure', severity: 0.3, affectedLines: 1 },
    { type: 'weather', severity: 0.5, affectedLines: 3 },
    { type: 'strike', severity: 0.8, affectedLines: 10 },
    { type: 'accident', severity: 0.6, affectedLines: 1 },
    { type: 'vandalism', severity: 0.2, affectedLines: 1 },
  ]
  
  return events[Math.floor(Math.random() * events.length)]
}

// Optimization suggestions
export function identifyBottlenecks(
  stations: Array<{ id: string; crowdingLevel: number; waitTime: number }>,
  threshold: number = 0.8
): string[] {
  return stations
    .filter(s => s.crowdingLevel > threshold || s.waitTime > 10)
    .map(s => s.id)
}

export function calculateOptimalFrequency(
  demand: number,
  capacity: number,
  targetLoadFactor: number = 0.75
): number {
  // Calculate how many vehicles per hour needed
  const vehiclesPerHour = demand / (capacity * targetLoadFactor)
  
  // Convert to minutes between vehicles
  const frequency = 60 / vehiclesPerHour
  
  // Clamp to reasonable values (1-30 minutes)
  return Math.max(1, Math.min(30, Math.round(frequency)))
}
