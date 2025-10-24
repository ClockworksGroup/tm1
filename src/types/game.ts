// Core game types
export type TransportType = 'metro' | 'bus' | 'tram' | 'train'
export type StationDepth = 'surface' | 'shallow' | 'medium' | 'deep'
export type ZoneType = 'residential' | 'commercial' | 'industrial' | 'mixed'
export type TimeOfDay = 'early_morning' | 'morning_rush' | 'midday' | 'evening_rush' | 'evening' | 'night'
export type DayType = 'weekday' | 'weekend'
export type ConstructionPhase = 'planning' | 'construction' | 'testing' | 'operational'
export type EventType = 'equipment_failure' | 'weather' | 'strike' | 'accident' | 'vandalism' | 'concert' | 'sports_event' | 'festival' | 'conference'
export type VictoryCondition = 'profit' | 'coverage' | 'satisfaction' | 'efficiency' | 'environmental'
export type ComplaintType = 'crowded' | 'late' | 'dirty' | 'unsafe' | 'expensive' | 'praise'

// Station types
export interface Station {
  id: string
  name: string
  position: [number, number, number]
  type: TransportType
  depth: StationDepth // For metro stations
  
  // Capacity & Infrastructure
  platforms: number
  platformLength: number // meters
  capacity: number // passengers per hour
  
  // Upgrades
  hasElevator: boolean
  hasEscalator: boolean
  hasRetail: boolean
  
  // Operational
  passengers: number // current passengers
  waitTime: number // average wait in minutes
  crowdingLevel: number // 0-1 (0 = empty, 1 = overcrowded)
  
  // Economics
  constructionCost: number
  maintenanceCost: number
  retailRevenue: number
  
  // Satisfaction
  cleanliness: number // 0-100
  safety: number // 0-100
  accessibility: number // 0-100
}

// Transport Line types
export interface TransportLine {
  id: string
  name: string
  type: TransportType
  color: string
  stations: Station[]
  
  // Route properties
  isLoop: boolean
  isBidirectional: boolean
  tunnelSegments?: TunnelSegment[] // For metro
  
  // Service
  frequency: number // minutes between vehicles
  operatingHours: [number, number] // [start, end] in 24h format
  rushHourFrequency: number // reduced headway during peaks
  
  // Fleet
  vehicles: Vehicle[]
  vehicleCapacity: number
  
  // Performance
  averageSpeed: number // km/h
  reliability: number // 0-100 (on-time performance)
  loadFactor: number // 0-1 (capacity utilization)
  
  // Economics
  constructionCost: number
  operatingCost: number // per hour
  revenue: number // per hour
  fareboxRecovery: number // revenue/cost ratio
  
  // Status
  phase: ConstructionPhase
  constructionProgress: number // 0-100
  constructionTimeRemaining: number // days
}

// Tunnel segment for metro
export interface TunnelSegment {
  id: string
  start: [number, number, number]
  end: [number, number, number]
  depth: number
  gradient: number // percentage
  cost: number
  hasObstacles: boolean
  constructionDifficulty: number // 1-10
}

// Vehicle types
export interface Vehicle {
  id: string
  type: TransportType
  model: string
  capacity: number
  speed: number
  age: number // years
  condition: number // 0-100
  isElectric: boolean
  maintenanceCost: number
  currentPosition?: [number, number, number]
  currentLine?: string
}

// Zone/District types
export interface District {
  id: string
  name: string
  type: ZoneType
  center: [number, number]
  radius: number
  population: number
  
  // Demand patterns
  morningDemand: number
  eveningDemand: number
  weekendDemand: number
  
  // Development
  density: number // 0-1
  averageIncome: number
  transitOriented: boolean // bonus if near stations
  
  // Satisfaction
  satisfaction: number // 0-100
  coverage: number // % within 500m of station
}

// Building constraint types
export interface Building {
  id: string
  position: [number, number, number]
  size: [number, number, number]
  type: string
  foundationDepth: number // meters underground
  isProtected: boolean // historic buildings
  propertyValue: number
}

// Road/Street types
export interface Road {
  id: string
  points: [number, number, number][]
  width: number
  type: 'motorway' | 'primary' | 'secondary' | 'residential'
  isOneWay: boolean
  direction?: [number, number, number] // direction vector if one-way
  hasBusLane: boolean
  trafficLevel: number // 0-1 (affects bus speed)
  speedLimit: number // km/h
}

// Time and scheduling
export interface GameTime {
  date: Date
  timeOfDay: TimeOfDay
  dayType: DayType
  hour: number // 0-23
  rushHourMultiplier: number // demand multiplier
}

// Satisfaction factors
export interface SatisfactionFactors {
  waitTime: number // -100 to 100
  travelTime: number
  crowding: number
  reliability: number
  coverage: number
  cleanliness: number
  safety: number
  accessibility: number
  overall: number // weighted average
}

// Economics
export interface Economics {
  balance: number
  
  // Revenue streams
  fareRevenue: number
  advertisingRevenue: number
  retailRevenue: number
  subsidies: number
  
  // Cost breakdown
  operatingCosts: number
  maintenanceCosts: number
  staffCosts: number
  energyCosts: number
  debtService: number
  
  // Fare structure
  baseFare: number
  peakSurcharge: number
  transferDiscount: number
  monthlyPassPrice: number
}

// Random events
export interface GameEvent {
  id: string
  type: EventType
  title: string
  description: string
  affectedLines: string[]
  impact: {
    reliability?: number
    cost?: number
    satisfaction?: number
    duration?: number // hours
  }
  choices?: EventChoice[]
}

export interface EventChoice {
  text: string
  cost: number
  effect: {
    reliability?: number
    satisfaction?: number
    duration?: number
  }
}

// Analytics
export interface Analytics {
  totalPassengers: number
  totalRevenue: number
  totalCosts: number
  netIncome: number
  
  // Performance metrics
  averageWaitTime: number
  averageTravelTime: number
  systemReliability: number
  systemCoverage: number
  
  // Per line metrics
  lineMetrics: Map<string, LineMetrics>
  
  // Trends
  passengerTrend: number[] // last 30 days
  revenueTrend: number[]
  satisfactionTrend: number[]
}

export interface LineMetrics {
  lineId: string
  passengersPerHour: number
  loadFactor: number
  reliability: number
  profitability: number
  bottlenecks: string[] // station IDs
}

// Optimization suggestions
export interface Suggestion {
  id: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: 'capacity' | 'coverage' | 'efficiency' | 'satisfaction'
  title: string
  description: string
  estimatedCost: number
  estimatedBenefit: string
  location?: [number, number, number]
  affectedLines?: string[]
}

// Demand Heatmap
export interface DemandHotspot {
  origin: string // district ID
  destination: string // district ID
  demand: number // passengers per hour
  timeOfDay: TimeOfDay
  satisfied: number // 0-1, how well served
}

export interface DemandHeatmap {
  hotspots: DemandHotspot[]
  unservedDemand: number // total unmet demand
  peakHotspot: DemandHotspot | null
}

// Competition System
export interface CompetitionData {
  districtId: string
  transitShare: number // 0-1, your market share
  carShare: number
  walkShare: number
  bikeShare: number
  trend: 'improving' | 'stable' | 'declining'
}

// Transit-Oriented Development
export interface TODEffect {
  stationId: string
  districtId: string
  populationGrowth: number // per month
  densityIncrease: number // per month
  propertyValueMultiplier: number
}

// Event-Driven Demand
export interface SpecialEvent {
  id: string
  type: 'concert' | 'sports' | 'festival' | 'conference'
  name: string
  location: string // district ID
  startTime: number // hour
  duration: number // hours
  expectedAttendees: number
  demandMultiplier: number
  bonusRevenue: number
}

// Fare Elasticity
export interface FareElasticity {
  districtId: string
  priceElasticity: number // -0.5 = 10% price increase = 5% ridership decrease
  optimalFare: number
  currentFare: number
}

// Bottleneck System
export interface Bottleneck {
  id: string
  type: 'station' | 'segment' | 'vehicle'
  location: string // station/line ID
  severity: 'minor' | 'moderate' | 'severe' | 'critical'
  issue: string
  impact: {
    passengersAffected: number
    delayMinutes: number
    satisfactionLoss: number
  }
  solutions: BottleneckSolution[]
}

export interface BottleneckSolution {
  description: string
  cost: number
  timeToImplement: number // days
  effectiveness: number // 0-1
}

// Victory Conditions
export interface VictoryProgress {
  condition: VictoryCondition
  name: string
  description: string
  progress: number // 0-100
  target: number
  current: number
  achieved: boolean
}

// Scenario System
export interface Scenario {
  id: string
  name: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  objectives: ScenarioObjective[]
  constraints: ScenarioConstraint[]
  timeLimit?: number // months
  startingConditions: {
    balance: number
    existingLines?: TransportLine[]
    existingStations?: Station[]
  }
}

export interface ScenarioObjective {
  id: string
  description: string
  type: 'coverage' | 'profit' | 'satisfaction' | 'passengers' | 'efficiency'
  target: number
  current: number
  completed: boolean
  reward: number
}

export interface ScenarioConstraint {
  type: 'budget' | 'time' | 'area' | 'technology'
  description: string
  value: number
}

// Passenger Complaints
export interface PassengerComplaint {
  id: string
  type: ComplaintType
  message: string
  lineId: string
  stationId?: string
  timestamp: Date
  severity: number // 0-1
  icon: string
}

// Line Profitability
export interface LineProfitability {
  lineId: string
  revenue: number
  costs: number
  profit: number
  margin: number // percentage
  roi: number // return on investment
  breakEvenDate?: Date
  status: 'highly_profitable' | 'profitable' | 'breaking_even' | 'losing_money' | 'failing'
}

// NEW ADVANCED FEATURES

// 1. Real-Time Vehicle Tracking
export interface VehicleTracking {
  vehicleId: string
  lineId: string
  position: [number, number, number]
  heading: number // degrees
  speed: number // km/h
  currentLoad: number // passengers
  capacity: number
  nextStationId: string
  delayMinutes: number
  status: 'on_time' | 'delayed' | 'early' | 'breakdown'
}

// 2. Dynamic Pricing
export interface PricingZone {
  id: string
  name: string
  districtIds: string[]
  baseFare: number
  peakMultiplier: number
  offPeakDiscount: number
}

export interface FareStructure {
  zones: PricingZone[]
  transferFee: number
  monthlyPassPrice: number
  seniorDiscount: number
  studentDiscount: number
}

// 3. Upgrade Paths
export type UpgradeLevel = 'bus' | 'brt' | 'light_rail' | 'metro' | 'regional_rail'

export interface UpgradePath {
  lineId: string
  currentLevel: UpgradeLevel
  availableUpgrades: UpgradeOption[]
  upgradeProgress: number // 0-100 if upgrading
  upgradeTimeRemaining: number // days
}

export interface UpgradeOption {
  toLevel: UpgradeLevel
  cost: number
  timeRequired: number // days
  capacityIncrease: number
  speedIncrease: number
  reliabilityBonus: number
  requirements: string[] // e.g., "Must have 5 stations"
}

// 4. Depot Management
export interface Depot {
  id: string
  name: string
  position: [number, number, number]
  type: TransportType
  capacity: number // number of vehicles
  currentVehicles: string[] // vehicle IDs
  maintenanceBays: number
  constructionCost: number
  operatingCost: number // per hour
  coverageRadius: number // km
}

// 5. Staff Management
export interface StaffMember {
  id: string
  role: 'driver' | 'mechanic' | 'station_staff' | 'manager'
  experience: number // years
  skill: number // 0-100
  salary: number // per month
  morale: number // 0-100
  assignedTo?: string // line/station/depot ID
}

export interface Union {
  id: string
  name: string
  memberCount: number
  satisfaction: number // 0-100
  demands: UnionDemand[]
  strikeRisk: number // 0-1
  lastNegotiation: Date
}

export interface UnionDemand {
  type: 'wage_increase' | 'better_conditions' | 'more_staff' | 'safety_improvements'
  description: string
  cost: number
  urgency: 'low' | 'medium' | 'high' | 'critical'
}

// 6. Loans & Debt
export interface Loan {
  id: string
  amount: number
  interestRate: number // annual percentage
  monthlyPayment: number
  remainingBalance: number
  monthsRemaining: number
  purpose: string
  takenDate: Date
}

export interface CreditRating {
  score: number // 0-100
  rating: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC' | 'D'
  availableCredit: number
  interestRateModifier: number
}

// 7. Induced Demand
export interface InducedDemand {
  districtId: string
  baselineDemand: number // before transit
  currentDemand: number // with transit
  growthRate: number // % per month
  elasticity: number // how responsive to service improvements
}

// 8. Maintenance & Degradation
export interface MaintenanceRecord {
  assetId: string // vehicle or station ID
  assetType: 'vehicle' | 'station' | 'track'
  condition: number // 0-100
  lastMaintenance: Date
  nextScheduledMaintenance: Date
  maintenanceCost: number
  breakdownRisk: number // 0-1
  deferredMaintenance: number // accumulated cost
}

export interface AssetDegradation {
  assetId: string
  age: number // years
  usage: number // hours or passenger-km
  degradationRate: number // condition loss per month
  replacementCost: number
  replacementUrgency: 'none' | 'low' | 'medium' | 'high' | 'critical'
}

// 9. Political System
export interface PoliticalFaction {
  id: string
  name: string
  ideology: 'progressive' | 'conservative' | 'centrist' | 'populist'
  support: number // 0-100
  priorities: string[]
}

export interface CityCouncil {
  factions: PoliticalFaction[]
  mayorFaction: string
  subsidyLevel: number // 0-1
  nextElection: Date
  approvalRating: number // 0-100
}

export interface PoliticalDemand {
  id: string
  factionId: string
  type: 'route_demand' | 'fare_cap' | 'service_improvement' | 'expansion'
  description: string
  deadline: Date
  reward: number
  penalty: number
  completed: boolean
}

// 10. Competitor AI
export interface Competitor {
  id: string
  name: string
  type: 'public' | 'private' | 'regional'
  lines: TransportLine[]
  marketShare: number // 0-1
  strategy: 'aggressive' | 'defensive' | 'opportunistic'
  cashReserves: number
  reputation: number // 0-100
  aiPersonality: {
    riskTolerance: number // 0-1
    expansionRate: number // 0-1
    priceCompetitiveness: number // 0-1
  }
}

export interface CompetitorAction {
  competitorId: string
  action: 'new_line' | 'price_cut' | 'service_improvement' | 'acquisition_attempt'
  target?: string // line or district ID
  impact: string
  timestamp: Date
}
