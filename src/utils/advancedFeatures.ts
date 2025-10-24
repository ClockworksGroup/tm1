import {
  TransportLine, Station, /* Vehicle, */ VehicleTracking, /* UpgradePath, */ UpgradeOption,
  Depot, /* StaffMember, */ Union, UnionDemand, /* Loan, */ CreditRating, InducedDemand,
  MaintenanceRecord, /* AssetDegradation, */ CityCouncil, PoliticalFaction, PoliticalDemand,
  Competitor, CompetitorAction, District, UpgradeLevel, TransportType
} from '../types/game'

// ===== 1. REAL-TIME VEHICLE TRACKING =====
export function updateVehiclePositions(
  lines: TransportLine[],
  currentTime: number // hour of day
): VehicleTracking[] {
  const tracking: VehicleTracking[] = []
  
  lines.forEach(line => {
    if (line.phase !== 'operational' || line.stations.length < 2) return
    
    const vehiclesOnLine = Math.ceil(60 / line.frequency) // Number of vehicles needed
    
    for (let i = 0; i < vehiclesOnLine; i++) {
      // Calculate position along route
      const routeProgress = (i / vehiclesOnLine + (currentTime % 1)) % 1 // 0-1 along route
      const stationIndex = Math.floor(routeProgress * line.stations.length)
      const nextStationIndex = (stationIndex + 1) % line.stations.length
      
      const currentStation = line.stations[stationIndex]
      const nextStation = line.stations[nextStationIndex]
      
      // Interpolate position between stations
      const segmentProgress = (routeProgress * line.stations.length) % 1
      const position: [number, number, number] = [
        currentStation.position[0] + (nextStation.position[0] - currentStation.position[0]) * segmentProgress,
        currentStation.position[1] + (nextStation.position[1] - currentStation.position[1]) * segmentProgress,
        currentStation.position[2] + (nextStation.position[2] - currentStation.position[2]) * segmentProgress,
      ]
      
      // Calculate heading
      const dx = nextStation.position[0] - currentStation.position[0]
      const dy = nextStation.position[1] - currentStation.position[1]
      const heading = Math.atan2(dy, dx) * (180 / Math.PI)
      
      // Determine status
      const delay = line.reliability < 90 ? Math.random() * 5 : 0
      const status: VehicleTracking['status'] = 
        delay > 3 ? 'delayed' : 
        delay < -1 ? 'early' : 
        Math.random() < 0.02 ? 'breakdown' : 'on_time'
      
      tracking.push({
        vehicleId: `${line.id}-vehicle-${i}`,
        lineId: line.id,
        position,
        heading,
        speed: line.averageSpeed,
        currentLoad: Math.floor(line.vehicleCapacity * line.loadFactor),
        capacity: line.vehicleCapacity,
        nextStationId: nextStation.id,
        delayMinutes: delay,
        status,
      })
    }
  })
  
  return tracking
}

// ===== 2. DYNAMIC PRICING =====
export function calculateOptimalFare(
  district: District,
  baseFare: number,
  competition: number // 0-1, how much car competition
): number {
  // Wealthier areas can afford higher fares
  const incomeMultiplier = 1 + (district.averageIncome / 100000) * 0.5
  
  // More competition = need lower fares
  const competitionDiscount = 1 - (competition * 0.3)
  
  // High density = can charge more (captive audience)
  const densityMultiplier = 1 + (district.density * 0.2)
  
  return baseFare * incomeMultiplier * competitionDiscount * densityMultiplier
}

export function applyFareElasticity(
  currentRidership: number,
  fareChange: number, // percentage change
  priceElasticity: number // typically -0.3 to -0.7
): number {
  // Elasticity formula: % change in quantity = elasticity × % change in price
  const ridershipChange = priceElasticity * fareChange
  return currentRidership * (1 + ridershipChange)
}

// ===== 3. UPGRADE PATHS =====
export function getAvailableUpgrades(line: TransportLine): UpgradeOption[] {
  const currentLevel = getLineLevel(line.type)
  const upgrades: UpgradeOption[] = []
  
  const upgradeTree: Record<UpgradeLevel, UpgradeOption | null> = {
    bus: {
      toLevel: 'brt',
      cost: 50000000,
      timeRequired: 180,
      capacityIncrease: 50,
      speedIncrease: 10,
      reliabilityBonus: 10,
      requirements: ['Must have at least 5 stations', 'Average load factor > 70%'],
    },
    brt: {
      toLevel: 'light_rail',
      cost: 200000000,
      timeRequired: 365,
      capacityIncrease: 100,
      speedIncrease: 20,
      reliabilityBonus: 15,
      requirements: ['Must have at least 8 stations', 'Dedicated right-of-way'],
    },
    light_rail: {
      toLevel: 'metro',
      cost: 1000000000,
      timeRequired: 730,
      capacityIncrease: 200,
      speedIncrease: 30,
      reliabilityBonus: 20,
      requirements: ['Must have at least 10 stations', 'Underground approval'],
    },
    metro: {
      toLevel: 'regional_rail',
      cost: 2000000000,
      timeRequired: 1095,
      capacityIncrease: 300,
      speedIncrease: 50,
      reliabilityBonus: 25,
      requirements: ['Must connect to other cities'],
    },
    regional_rail: null,
  }
  
  const nextUpgrade = upgradeTree[currentLevel]
  if (nextUpgrade) {
    upgrades.push(nextUpgrade)
  }
  
  return upgrades
}

function getLineLevel(type: TransportType): UpgradeLevel {
  const mapping: Record<TransportType, UpgradeLevel> = {
    bus: 'bus',
    tram: 'light_rail',
    metro: 'metro',
    train: 'regional_rail',
  }
  return mapping[type] || 'bus'
}

// ===== 4. DEPOT MANAGEMENT =====
export function calculateDepotCoverage(
  depot: Depot,
  stations: Station[]
): string[] {
  const coveredStations: string[] = []
  
  stations.forEach(station => {
    if (station.type !== depot.type) return
    
    const distance = Math.hypot(
      station.position[0] - depot.position[0],
      station.position[1] - depot.position[1]
    )
    
    // Convert to km (assuming coordinates are in degrees, rough approximation)
    const distanceKm = distance * 111 // 1 degree ≈ 111 km
    
    if (distanceKm <= depot.coverageRadius) {
      coveredStations.push(station.id)
    }
  })
  
  return coveredStations
}

export function calculateDeadheadCost(
  depot: Depot,
  line: TransportLine
): number {
  if (line.stations.length === 0) return 0
  
  // Find closest station to depot
  let minDistance = Infinity
  line.stations.forEach(station => {
    const distance = Math.hypot(
      station.position[0] - depot.position[0],
      station.position[1] - depot.position[1]
    )
    minDistance = Math.min(minDistance, distance)
  })
  
  // Cost per km of deadhead travel
  const distanceKm = minDistance * 111
  return distanceKm * 500 // $500 per km per vehicle per day
}

// ===== 5. STAFF MANAGEMENT =====
export function calculateStaffNeeds(lines: TransportLine[], stations: Station[]): {
  drivers: number
  mechanics: number
  stationStaff: number
} {
  const drivers = lines.reduce((sum, line) => {
    if (line.phase !== 'operational') return sum
    const vehiclesNeeded = Math.ceil(60 / line.frequency)
    return sum + vehiclesNeeded * 2 // 2 shifts
  }, 0)
  
  const mechanics = Math.ceil(drivers * 0.1) // 1 mechanic per 10 drivers
  const stationStaff = stations.length * 3 // 3 staff per station
  
  return { drivers, mechanics, stationStaff }
}

export function updateUnionSatisfaction(
  _union: Union,
  avgSalary: number,
  workConditions: number, // 0-100
  staffingLevel: number // 0-1, how well staffed
): number {
  const salaryFactor = Math.min(100, (avgSalary / 50000) * 50) // $50k baseline
  const conditionsFactor = workConditions * 0.3
  const staffingFactor = staffingLevel * 20
  
  return Math.min(100, salaryFactor + conditionsFactor + staffingFactor)
}

export function generateUnionDemands(union: Union): UnionDemand[] {
  const demands: UnionDemand[] = []
  
  if (union.satisfaction < 50) {
    demands.push({
      type: 'wage_increase',
      description: '10% wage increase for all members',
      cost: union.memberCount * 5000,
      urgency: 'high',
    })
  }
  
  if (union.satisfaction < 40) {
    demands.push({
      type: 'better_conditions',
      description: 'Improved break rooms and facilities',
      cost: 1000000,
      urgency: 'medium',
    })
  }
  
  if (Math.random() < 0.1) {
    demands.push({
      type: 'more_staff',
      description: 'Hire 20 additional staff members',
      cost: 1000000,
      urgency: 'low',
    })
  }
  
  return demands
}

// ===== 6. LOANS & DEBT =====
export function calculateCreditRating(
  balance: number,
  totalDebt: number,
  monthlyIncome: number,
  debtServiceRatio: number // debt payments / income
): CreditRating {
  let score = 50
  
  // Positive balance
  if (balance > 100000000) score += 20
  else if (balance > 50000000) score += 10
  else if (balance < 0) score -= 30
  
  // Debt level
  if (totalDebt < balance * 0.5) score += 15
  else if (totalDebt > balance * 2) score -= 20
  
  // Income
  if (monthlyIncome > 10000000) score += 10
  else if (monthlyIncome < 0) score -= 25
  
  // Debt service
  if (debtServiceRatio < 0.3) score += 5
  else if (debtServiceRatio > 0.6) score -= 15
  
  score = Math.max(0, Math.min(100, score))
  
  let rating: CreditRating['rating'] = 'D'
  if (score >= 90) rating = 'AAA'
  else if (score >= 80) rating = 'AA'
  else if (score >= 70) rating = 'A'
  else if (score >= 60) rating = 'BBB'
  else if (score >= 50) rating = 'BB'
  else if (score >= 40) rating = 'B'
  else if (score >= 30) rating = 'CCC'
  
  const interestRateModifier = (100 - score) / 100 // 0-1, higher score = lower rate
  const availableCredit = Math.max(0, balance * 2 - totalDebt)
  
  return { score, rating, availableCredit, interestRateModifier }
}

export function calculateLoanPayment(
  principal: number,
  annualRate: number,
  months: number
): number {
  const monthlyRate = annualRate / 12
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
         (Math.pow(1 + monthlyRate, months) - 1)
}

// ===== 7. INDUCED DEMAND =====
export function calculateInducedDemand(
  district: District,
  transitQuality: number, // 0-100
  monthsSinceService: number
): InducedDemand {
  const baselineDemand = district.population * 0.1 // 10% baseline transit usage
  
  // Better service induces more demand
  const qualityMultiplier = 1 + (transitQuality / 100) * 0.5
  
  // Demand grows over time as people adjust habits
  const timeMultiplier = Math.min(2, 1 + (monthsSinceService / 24) * 0.5)
  
  const currentDemand = baselineDemand * qualityMultiplier * timeMultiplier
  const growthRate = transitQuality > 70 ? 2 : transitQuality > 50 ? 1 : 0.5
  const elasticity = 0.3 + (district.transitOriented ? 0.2 : 0)
  
  return {
    districtId: district.id,
    baselineDemand,
    currentDemand,
    growthRate,
    elasticity,
  }
}

// ===== 8. MAINTENANCE & DEGRADATION =====
export function updateAssetCondition(
  asset: MaintenanceRecord,
  hoursUsed: number,
  maintenancePerformed: boolean
): MaintenanceRecord {
  let condition = asset.condition
  
  // Degradation based on usage
  const degradation = hoursUsed * 0.01 // 1% per 100 hours
  condition -= degradation
  
  // Maintenance restores condition
  if (maintenancePerformed) {
    condition = Math.min(100, condition + 30)
    asset.lastMaintenance = new Date()
    asset.nextScheduledMaintenance = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    asset.deferredMaintenance = 0
  } else {
    // Deferred maintenance accumulates
    asset.deferredMaintenance += asset.maintenanceCost * 0.1
  }
  
  // Breakdown risk increases with poor condition
  const breakdownRisk = Math.max(0, (100 - condition) / 100)
  
  return {
    ...asset,
    condition: Math.max(0, condition),
    breakdownRisk,
  }
}

export function shouldBreakdown(asset: MaintenanceRecord): boolean {
  return Math.random() < asset.breakdownRisk
}

// ===== 9. POLITICAL SYSTEM =====
export function initializeCityCouncil(): CityCouncil {
  const factions: PoliticalFaction[] = [
    {
      id: 'progressive',
      name: 'Progressive Alliance',
      ideology: 'progressive',
      support: 35,
      priorities: ['environmental', 'equity', 'public_transit'],
    },
    {
      id: 'conservative',
      name: 'Fiscal Conservatives',
      ideology: 'conservative',
      support: 30,
      priorities: ['cost_efficiency', 'private_sector', 'low_taxes'],
    },
    {
      id: 'centrist',
      name: 'Centrist Coalition',
      ideology: 'centrist',
      support: 25,
      priorities: ['balanced_budget', 'service_quality', 'growth'],
    },
    {
      id: 'populist',
      name: 'People First Party',
      ideology: 'populist',
      support: 10,
      priorities: ['low_fares', 'coverage', 'jobs'],
    },
  ]
  
  return {
    factions,
    mayorFaction: 'progressive',
    subsidyLevel: 0.3,
    nextElection: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    approvalRating: 60,
  }
}

export function generatePoliticalDemand(council: CityCouncil, districts: District[]): PoliticalDemand | null {
  if (Math.random() > 0.1) return null // 10% chance
  
  const faction = council.factions[Math.floor(Math.random() * council.factions.length)]
  const district = districts[Math.floor(Math.random() * districts.length)]
  
  const demands = {
    progressive: {
      type: 'expansion' as const,
      description: `Expand service to ${district.name} for environmental justice`,
      reward: 5000000,
      penalty: -10,
    },
    conservative: {
      type: 'fare_cap' as const,
      description: 'Reduce operating costs by 15%',
      reward: 3000000,
      penalty: -5,
    },
    centrist: {
      type: 'service_improvement' as const,
      description: 'Improve reliability to 90% system-wide',
      reward: 4000000,
      penalty: -8,
    },
    populist: {
      type: 'route_demand' as const,
      description: `Add route to underserved ${district.name}`,
      reward: 2000000,
      penalty: -15,
    },
  }
  
  const demand = demands[faction.ideology]
  
  return {
    id: `demand-${Date.now()}`,
    factionId: faction.id,
    ...demand,
    deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    completed: false,
  }
}

// ===== 10. COMPETITOR AI =====
export function initializeCompetitor(id: string, _cityDistricts: District[]): Competitor {
  const names = ['MetroLink', 'CityExpress', 'RapidTransit Co', 'Urban Mobility Inc']
  const name = names[Math.floor(Math.random() * names.length)]
  
  return {
    id,
    name,
    type: Math.random() < 0.5 ? 'private' : 'public',
    lines: [],
    marketShare: 0.1 + Math.random() * 0.2,
    strategy: ['aggressive', 'defensive', 'opportunistic'][Math.floor(Math.random() * 3)] as any,
    cashReserves: 100000000 + Math.random() * 200000000,
    reputation: 50 + Math.random() * 30,
    aiPersonality: {
      riskTolerance: Math.random(),
      expansionRate: Math.random(),
      priceCompetitiveness: Math.random(),
    },
  }
}

export function competitorTakeTurn(
  competitor: Competitor,
  _playerLines: TransportLine[],
  districts: District[]
): CompetitorAction | null {
  if (Math.random() > 0.2) return null // 20% chance to act
  
  const actions: CompetitorAction['action'][] = ['new_line', 'price_cut', 'service_improvement']
  const action = actions[Math.floor(Math.random() * actions.length)]
  
  let impact = ''
  let target: string | undefined
  
  switch (action) {
    case 'new_line':
      const unservedDistrict = districts.find(d => d.coverage < 0.5)
      if (unservedDistrict) {
        target = unservedDistrict.id
        impact = `${competitor.name} opened new route to ${unservedDistrict.name}`
        competitor.marketShare += 0.05
      }
      break
    case 'price_cut':
      impact = `${competitor.name} reduced fares by 20%`
      competitor.marketShare += 0.03
      break
    case 'service_improvement':
      impact = `${competitor.name} increased frequency on popular routes`
      competitor.reputation += 5
      break
  }
  
  return {
    competitorId: competitor.id,
    action,
    target,
    impact,
    timestamp: new Date(),
  }
}
