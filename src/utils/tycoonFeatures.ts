import {
  District, TransportLine, Station, DemandHotspot, CompetitionData,
  TODEffect, SpecialEvent, FareElasticity, Bottleneck, VictoryProgress,
  PassengerComplaint, LineProfitability, TimeOfDay, DayType, ComplaintType
} from '../types/game'

// ===== 1. DEMAND HEATMAP =====
export function calculateDemandHotspots(
  districts: District[],
  lines: TransportLine[],
  timeOfDay: TimeOfDay,
  dayType: DayType
): DemandHotspot[] {
  const hotspots: DemandHotspot[] = []
  
  for (let i = 0; i < districts.length; i++) {
    for (let j = 0; j < districts.length; j++) {
      if (i === j) continue
      
      const origin = districts[i]
      const destination = districts[j]
      
      // Calculate demand based on district types and time
      let demand = 0
      
      // Morning rush: Residential → Commercial/Industrial
      if (timeOfDay === 'morning_rush') {
        if (origin.type === 'residential' && (destination.type === 'commercial' || destination.type === 'industrial')) {
          demand = origin.population * origin.morningDemand * 0.3
        }
      }
      
      // Evening rush: Commercial/Industrial → Residential
      if (timeOfDay === 'evening_rush') {
        if ((origin.type === 'commercial' || origin.type === 'industrial') && destination.type === 'residential') {
          demand = destination.population * destination.eveningDemand * 0.3
        }
      }
      
      // Weekend: More mixed patterns
      if (dayType === 'weekend') {
        demand = (origin.population + destination.population) * 0.1 * destination.weekendDemand
      }
      
      if (demand > 100) {
        // Check how well this route is served
        const satisfied = calculateRouteSatisfaction(origin, destination, lines)
        
        hotspots.push({
          origin: origin.id,
          destination: destination.id,
          demand,
          timeOfDay,
          satisfied,
        })
      }
    }
  }
  
  return hotspots.sort((a, b) => b.demand - a.demand)
}

function calculateRouteSatisfaction(origin: District, destination: District, lines: TransportLine[]): number {
  // Check if there's a direct connection
  for (const line of lines) {
    const hasOrigin = line.stations.some(s => 
      Math.hypot(s.position[0] - origin.center[0], s.position[1] - origin.center[1]) < 0.01
    )
    const hasDest = line.stations.some(s =>
      Math.hypot(s.position[0] - destination.center[0], s.position[1] - destination.center[1]) < 0.01
    )
    
    if (hasOrigin && hasDest) {
      return 0.8 // Well served
    }
  }
  
  return 0.2 // Poorly served
}

// ===== 2. COMPETITION SYSTEM =====
export function calculateCompetition(
  districts: District[],
  _lines: TransportLine[],
  satisfactionFactors: { overall: number }
): CompetitionData[] {
  return districts.map(district => {
    // Base transit share depends on coverage and satisfaction
    let transitShare = district.coverage * 0.5 + (satisfactionFactors.overall / 100) * 0.3
    
    // Income affects car ownership
    const carOwnershipRate = Math.min(0.8, district.averageIncome / 100000)
    
    // Calculate shares
    const carShare = carOwnershipRate * (1 - transitShare)
    const walkShare = Math.max(0.05, 0.15 - transitShare * 0.1)
    const bikeShare = Math.max(0.05, 0.1 - transitShare * 0.05)
    
    // Normalize
    const total = transitShare + carShare + walkShare + bikeShare
    transitShare /= total
    const normalizedCarShare = carShare / total
    const normalizedWalkShare = walkShare / total
    const normalizedBikeShare = bikeShare / total
    
    // Determine trend
    let trend: 'improving' | 'stable' | 'declining' = 'stable'
    if (satisfactionFactors.overall > 75 && district.coverage > 0.6) {
      trend = 'improving'
    } else if (satisfactionFactors.overall < 50 || district.coverage < 0.3) {
      trend = 'declining'
    }
    
    return {
      districtId: district.id,
      transitShare,
      carShare: normalizedCarShare,
      walkShare: normalizedWalkShare,
      bikeShare: normalizedBikeShare,
      trend,
    }
  })
}

// ===== 3. LINE PROFITABILITY =====
export function calculateLineProfitability(lines: TransportLine[]): LineProfitability[] {
  return lines.map(line => {
    const revenue = line.revenue
    const costs = line.operatingCost
    const profit = revenue - costs
    const margin = costs > 0 ? (profit / revenue) * 100 : 0
    const roi = line.constructionCost > 0 ? (profit * 24 * 365) / line.constructionCost : 0
    
    let status: LineProfitability['status'] = 'breaking_even'
    if (margin > 30) status = 'highly_profitable'
    else if (margin > 10) status = 'profitable'
    else if (margin < -20) status = 'failing'
    else if (margin < 0) status = 'losing_money'
    
    return {
      lineId: line.id,
      revenue,
      costs,
      profit,
      margin,
      roi,
      status,
    }
  })
}

// ===== 4. TRANSIT-ORIENTED DEVELOPMENT =====
export function calculateTODEffects(
  stations: Station[],
  districts: District[]
): TODEffect[] {
  const effects: TODEffect[] = []
  
  stations.forEach(station => {
    // Find nearby districts
    districts.forEach(district => {
      const distance = Math.hypot(
        station.position[0] - district.center[0],
        station.position[1] - district.center[1]
      )
      
      // Stations within 1km affect development
      if (distance < 0.01) {
        const populationGrowth = 50 * (1 - distance / 0.01) // More growth closer to station
        const densityIncrease = 0.01 * (1 - distance / 0.01)
        const propertyValueMultiplier = 1 + (0.2 * (1 - distance / 0.01))
        
        effects.push({
          stationId: station.id,
          districtId: district.id,
          populationGrowth,
          densityIncrease,
          propertyValueMultiplier,
        })
      }
    })
  })
  
  return effects
}

// ===== 5. SPECIAL EVENTS =====
export function generateSpecialEvent(
  districts: District[],
  hour: number,
  dayType: DayType
): SpecialEvent | null {
  // 0.5% chance per hour on weekends, 0.2% on weekdays (~1-2 events per month)
  const chance = dayType === 'weekend' ? 0.005 : 0.002
  
  if (Math.random() > chance) return null
  
  const eventTypes: Array<'concert' | 'sports' | 'festival' | 'conference'> = 
    ['concert', 'sports', 'festival', 'conference']
  const type = eventTypes[Math.floor(Math.random() * eventTypes.length)]
  
  const location = districts[Math.floor(Math.random() * districts.length)]
  
  const events = {
    concert: {
      name: 'Rock Concert',
      attendees: 15000,
      duration: 4,
      multiplier: 3.0,
    },
    sports: {
      name: 'Football Match',
      attendees: 50000,
      duration: 3,
      multiplier: 5.0,
    },
    festival: {
      name: 'City Festival',
      attendees: 30000,
      duration: 8,
      multiplier: 2.5,
    },
    conference: {
      name: 'Tech Conference',
      attendees: 5000,
      duration: 6,
      multiplier: 1.5,
    },
  }
  
  const eventData = events[type]
  
  return {
    id: `event-${Date.now()}`,
    type,
    name: eventData.name,
    location: location.id,
    startTime: hour,
    duration: eventData.duration,
    expectedAttendees: eventData.attendees,
    demandMultiplier: eventData.multiplier,
    bonusRevenue: eventData.attendees * 2, // $2 per attendee bonus
  }
}

// ===== 6. FARE ELASTICITY =====
export function calculateFareElasticity(
  districts: District[],
  baseFare: number
): FareElasticity[] {
  return districts.map(district => {
    // Wealthier districts less price sensitive
    const elasticity = -0.3 - (0.5 * (1 - district.averageIncome / 100000))
    
    // Optimal fare balances revenue and ridership
    const optimalFare = baseFare * (1 + (district.averageIncome / 100000) * 0.5)
    
    return {
      districtId: district.id,
      priceElasticity: elasticity,
      optimalFare,
      currentFare: baseFare,
    }
  })
}

// ===== 7. BOTTLENECK IDENTIFICATION =====
export function identifyBottlenecks(
  lines: TransportLine[],
  _stations: Station[]
): Bottleneck[] {
  const bottlenecks: Bottleneck[] = []
  
  lines.forEach(line => {
    // Check for overcrowded stations
    line.stations.forEach(station => {
      if (station.crowdingLevel > 0.85) {
        const severity = station.crowdingLevel > 0.95 ? 'critical' :
                        station.crowdingLevel > 0.9 ? 'severe' : 'moderate'
        
        bottlenecks.push({
          id: `bottleneck-${station.id}`,
          type: 'station',
          location: station.id,
          severity,
          issue: `Station overcrowded (${(station.crowdingLevel * 100).toFixed(0)}% capacity)`,
          impact: {
            passengersAffected: station.passengers,
            delayMinutes: (station.crowdingLevel - 0.8) * 10,
            satisfactionLoss: (station.crowdingLevel - 0.8) * 20,
          },
          solutions: [
            {
              description: 'Add platform',
              cost: 5000000,
              timeToImplement: 180,
              effectiveness: 0.8,
            },
            {
              description: 'Increase frequency',
              cost: 500000,
              timeToImplement: 7,
              effectiveness: 0.5,
            },
          ],
        })
      }
    })
    
    // Check for low frequency on high-demand lines
    if (line.loadFactor > 0.9 && line.frequency > 5) {
      bottlenecks.push({
        id: `bottleneck-${line.id}`,
        type: 'vehicle',
        location: line.id,
        severity: 'moderate',
        issue: `Insufficient frequency (${line.frequency} min headway)`,
        impact: {
          passengersAffected: line.stations.length * 100,
          delayMinutes: line.frequency / 2,
          satisfactionLoss: 10,
        },
        solutions: [
          {
            description: 'Increase frequency to 3 min',
            cost: 1000000,
            timeToImplement: 30,
            effectiveness: 0.9,
          },
          {
            description: 'Add express service',
            cost: 3000000,
            timeToImplement: 90,
            effectiveness: 0.7,
          },
        ],
      })
    }
  })
  
  return bottlenecks
}

// ===== 8. VICTORY CONDITIONS =====
export function initializeVictoryConditions(): VictoryProgress[] {
  return [
    {
      condition: 'profit',
      name: 'Profit Maximizer',
      description: 'Earn $100M profit in one year',
      progress: 0,
      target: 100000000,
      current: 0,
      achieved: false,
    },
    {
      condition: 'coverage',
      name: 'Coverage Champion',
      description: 'Achieve 90% city coverage',
      progress: 0,
      target: 90,
      current: 0,
      achieved: false,
    },
    {
      condition: 'satisfaction',
      name: 'Satisfaction Master',
      description: 'Maintain 85% satisfaction for 6 months',
      progress: 0,
      target: 180, // days
      current: 0,
      achieved: false,
    },
    {
      condition: 'efficiency',
      name: 'Efficiency Expert',
      description: 'Achieve 120% farebox recovery',
      progress: 0,
      target: 120,
      current: 0,
      achieved: false,
    },
  ]
}

export function updateVictoryProgress(
  conditions: VictoryProgress[],
  analytics: any,
  satisfactionFactors: any
): VictoryProgress[] {
  return conditions.map(condition => {
    let current = condition.current
    let progress = condition.progress
    
    switch (condition.condition) {
      case 'profit':
        current = analytics.netIncome * 24 * 365 // Annual profit
        progress = (current / condition.target) * 100
        break
      case 'coverage':
        current = analytics.systemCoverage * 100
        progress = (current / condition.target) * 100
        break
      case 'satisfaction':
        if (satisfactionFactors.overall >= 85) {
          current += 1 // Increment days
        } else {
          current = 0 // Reset if drops below
        }
        progress = (current / condition.target) * 100
        break
      case 'efficiency':
        current = analytics.totalRevenue > 0 ? 
          (analytics.totalRevenue / analytics.totalCosts) * 100 : 0
        progress = (current / condition.target) * 100
        break
    }
    
    return {
      ...condition,
      current,
      progress: Math.min(100, progress),
      achieved: progress >= 100,
    }
  })
}

// ===== 10. PASSENGER COMPLAINTS =====
const complaintMessages: Record<ComplaintType, string[]> = {
  crowded: [
    "This train is packed like sardines!",
    "Can't even breathe in here!",
    "Way too crowded, need more trains!",
    "Standing room only again...",
  ],
  late: [
    "Where's my train? It's 10 minutes late!",
    "Always delays on this line!",
    "I'm going to be late for work!",
    "Unreliable service as usual.",
  ],
  dirty: [
    "This station is filthy!",
    "When was this place last cleaned?",
    "Disgusting conditions here.",
    "Needs better maintenance.",
  ],
  unsafe: [
    "Don't feel safe here at night.",
    "Need more security presence.",
    "Sketchy people hanging around.",
    "Poor lighting makes me nervous.",
  ],
  expensive: [
    "Fares are too high!",
    "Can't afford these prices.",
    "Highway robbery!",
    "Not worth the money.",
  ],
  praise: [
    "Great service today!",
    "Love this new line!",
    "Clean and on time, perfect!",
    "Best transit system ever!",
  ],
}

export function generatePassengerComplaint(
  lines: TransportLine[],
  _stations: Station[]
): PassengerComplaint | null {
  // 10% chance per hour to generate a complaint
  if (Math.random() > 0.1) return null
  
  // Pick a random line
  if (lines.length === 0) return null
  const line = lines[Math.floor(Math.random() * lines.length)]
  
  // Determine complaint type based on conditions
  let type: ComplaintType = 'praise'
  let severity = 0.3
  
  if (line.loadFactor > 0.85) {
    type = 'crowded'
    severity = line.loadFactor
  } else if (line.reliability < 80) {
    type = 'late'
    severity = 1 - (line.reliability / 100)
  } else if (line.stations.some(s => s.cleanliness < 60)) {
    type = 'dirty'
    severity = 0.6
  } else if (Math.random() < 0.2) {
    type = 'praise'
    severity = 0.1
  }
  
  const messages = complaintMessages[type]
  const message = messages[Math.floor(Math.random() * messages.length)]
  
  return {
    id: `complaint-${Date.now()}`,
    type,
    message,
    lineId: line.id,
    timestamp: new Date(),
    severity,
    icon: type === 'praise' ? '😊' : '😠',
  }
}
