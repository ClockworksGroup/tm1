import { create } from 'zustand'
import {
  TransportType, Station, TransportLine, District, Building, Road,
  GameTime, SatisfactionFactors, Economics, GameEvent, Analytics,
  Suggestion, Vehicle, TunnelSegment, DemandHeatmap, CompetitionData,
  TODEffect, SpecialEvent, FareElasticity, Bottleneck, VictoryProgress,
  Scenario, PassengerComplaint, LineProfitability, DayType, // TimeOfDay,
  VehicleTracking, FareStructure, UpgradePath, Depot, StaffMember, Union,
  Loan, CreditRating, InducedDemand, MaintenanceRecord, CityCouncil,
  PoliticalDemand, Competitor, CompetitorAction
} from '../types/game'

// Re-export types needed by other components
export type { Station, TransportLine } from '../types/game'
import {
  getTimeOfDay, getRushHourMultiplier, calculateSatisfaction,
  /* calculateBusSpeed, */ calculateLoadFactor, calculateFareboxRecovery,
  shouldTriggerEvent, generateRandomEvent, identifyBottlenecks,
  /* calculateOptimalFrequency, */ getTransportCharacteristics, calculateDemand
} from '../utils/gameLogic'
import {
  calculateDemandHotspots, calculateCompetition, calculateLineProfitability,
  calculateTODEffects, generateSpecialEvent, calculateFareElasticity,
  identifyBottlenecks as identifySystemBottlenecks, initializeVictoryConditions,
  updateVictoryProgress, generatePassengerComplaint
} from '../utils/tycoonFeatures'
import {
  updateVehiclePositions, getAvailableUpgrades, /* calculateDepotCoverage, */
  calculateStaffNeeds, updateUnionSatisfaction, generateUnionDemands,
  calculateCreditRating, calculateInducedDemand, updateAssetCondition,
  initializeCityCouncil, generatePoliticalDemand, initializeCompetitor,
  competitorTakeTurn
} from '../utils/advancedFeatures'
import { VehicleState } from '../utils/vehicleSimulation'

export interface GameState {
  // City data
  cityName: string
  cityLoaded: boolean
  cityCenter: [number, number]
  osmData: any | null
  buildings: Building[]
  roads: Road[]
  districts: District[]
  
  // Time management
  gameTime: GameTime
  gameSpeed: number // 0 = paused, 1 = normal, 2 = fast, 3 = very fast
  difficulty: 'easy' | 'medium' | 'difficult' | 'sandbox'
  
  // Economics
  economics: Economics
  
  // Transport network
  lines: TransportLine[]
  stations: Station[]
  vehicles: Vehicle[]
  vehicleStates: Map<string, VehicleState> // Real-time vehicle positions
  tunnelSegments: TunnelSegment[]
  
  // Satisfaction
  satisfactionFactors: SatisfactionFactors
  
  // Analytics
  analytics: Analytics
  
  // Events
  activeEvents: GameEvent[]
  eventHistory: GameEvent[]
  
  // Suggestions
  suggestions: Suggestion[]
  
  // NEW FEATURES
  // 1. Demand Heatmap
  demandHeatmap: DemandHeatmap
  
  // 2. Competition
  competition: CompetitionData[]
  
  // 3. Line Profitability
  lineProfitability: LineProfitability[]
  
  // 4. Transit-Oriented Development
  todEffects: TODEffect[]
  
  // 5. Special Events
  specialEvents: SpecialEvent[]
  activeSpecialEvent: SpecialEvent | null
  
  // 6. Fare Elasticity
  fareElasticity: FareElasticity[]
  
  // 7. Bottlenecks
  bottlenecks: Bottleneck[]
  
  // 8. Victory Conditions
  victoryConditions: VictoryProgress[]
  selectedVictory: VictoryProgress | null
  
  // 9. Scenarios
  activeScenario: Scenario | null
  
  // 10. Passenger Complaints
  passengerComplaints: PassengerComplaint[]
  
  // ADVANCED FEATURES (Second Wave)
  // 1. Vehicle Tracking
  vehicleTracking: VehicleTracking[]
  
  // 2. Dynamic Pricing
  fareStructure: FareStructure
  
  // 3. Upgrade Paths
  upgradePaths: UpgradePath[]
  
  // 4. Depots
  depots: Depot[]
  
  // 5. Staff & Unions
  staff: StaffMember[]
  unions: Union[]
  
  // 6. Loans & Debt
  loans: Loan[]
  creditRating: CreditRating
  
  // 7. Induced Demand
  inducedDemand: InducedDemand[]
  
  // 8. Maintenance
  maintenanceRecords: MaintenanceRecord[]
  
  // 9. Politics
  cityCouncil: CityCouncil | null
  politicalDemands: PoliticalDemand[]
  
  // 10. Competitors
  competitors: Competitor[]
  competitorActions: CompetitorAction[]
  
  // UI state
  selectedTool: TransportType | null
  selectedLine: string | null
  selectedStation: string | null
  buildMode: boolean
  showUnderground: boolean
  selectedDistrict: string | null
  
  // View layers
  viewLayers: {
    demandHeatmap: boolean
    satisfactionHeatmap: boolean
    elevationView: boolean
    noiseZones: boolean
    competition: boolean
    profitability: boolean
  }
  
  // Actions - City
  setCityData: (name: string, center: [number, number], osmData: any) => void
  addBuilding: (building: Building) => void
  addRoad: (road: Road) => void
  addDistrict: (district: District) => void
  updateDistrict: (districtId: string, updates: Partial<District>) => void
  
  // Actions - Transport
  addLine: (line: TransportLine) => void
  removeLine: (lineId: string) => void
  updateLine: (lineId: string, updates: Partial<TransportLine>) => void
  addStation: (station: Station) => void
  removeStation: (stationId: string) => void
  updateStation: (stationId: string, updates: Partial<Station>) => void
  upgradeStation: (stationId: string, upgrade: string) => void
  addVehicle: (vehicle: Vehicle) => void
  removeVehicle: (vehicleId: string) => void
  updateVehiclePositions: (vehicleStates: Map<string, VehicleState>) => void
  addTunnelSegment: (segment: TunnelSegment) => void
  
  // Actions - Economics
  updateEconomics: (updates: Partial<Economics>) => void
  chargeCost: (amount: number, description: string) => void
  addRevenue: (amount: number, source: string) => void
  
  // Actions - Events
  triggerEvent: (event: GameEvent) => void
  resolveEvent: (eventId: string, choiceIndex: number) => void
  dismissEvent: (eventId: string) => void
  
  // Actions - UI
  setSelectedTool: (tool: TransportType | null) => void
  setSelectedLine: (lineId: string | null) => void
  setSelectedStation: (stationId: string | null) => void
  setSelectedDistrict: (districtId: string | null) => void
  setBuildMode: (mode: boolean) => void
  setGameSpeed: (speed: number) => void
  toggleViewLayer: (layer: keyof GameState['viewLayers']) => void
  toggleUndergroundView: () => void
  
  // Actions - Simulation
  tick: () => void
  simulateHour: () => void
  updateAnalytics: () => void
  generateSuggestions: () => void
}

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  cityName: '',
  cityLoaded: false,
  cityCenter: [0, 0],
  osmData: null,
  buildings: [],
  roads: [],
  districts: [],
  
  gameTime: {
    date: new Date(2024, 0, 1, 7, 0), // Start at 7 AM
    timeOfDay: 'morning_rush',
    dayType: 'weekday',
    hour: 7,
    rushHourMultiplier: 3.0,
  },
  gameSpeed: 1,
  difficulty: 'medium',
  
  economics: {
    balance: 500000000, // $500M starting budget
    fareRevenue: 0,
    advertisingRevenue: 0,
    retailRevenue: 0,
    subsidies: 0,
    operatingCosts: 0,
    maintenanceCosts: 0,
    staffCosts: 0,
    energyCosts: 0,
    debtService: 0,
    baseFare: 2.5,
    peakSurcharge: 0.5,
    transferDiscount: 0.5,
    monthlyPassPrice: 100,
  },
  
  lines: [],
  stations: [],
  vehicles: [],
  vehicleStates: new Map(),
  tunnelSegments: [],
  
  satisfactionFactors: {
    waitTime: 0,
    travelTime: 0,
    crowding: 0,
    reliability: 100,
    coverage: 0,
    cleanliness: 80,
    safety: 85,
    accessibility: 70,
    overall: 75,
  },
  
  analytics: {
    totalPassengers: 0,
    totalRevenue: 0,
    totalCosts: 0,
    netIncome: 0,
    averageWaitTime: 0,
    averageTravelTime: 0,
    systemReliability: 100,
    systemCoverage: 0,
    lineMetrics: new Map(),
    passengerTrend: [],
    revenueTrend: [],
    satisfactionTrend: [],
  },
  
  activeEvents: [],
  eventHistory: [],
  suggestions: [],
  
  // NEW FEATURES - Initial state
  demandHeatmap: {
    hotspots: [],
    unservedDemand: 0,
    peakHotspot: null,
  },
  competition: [],
  lineProfitability: [],
  todEffects: [],
  specialEvents: [],
  activeSpecialEvent: null,
  fareElasticity: [],
  bottlenecks: [],
  victoryConditions: [],
  selectedVictory: null,
  activeScenario: null,
  passengerComplaints: [],
  
  // ADVANCED FEATURES - Initial state
  vehicleTracking: [],
  fareStructure: {
    zones: [],
    transferFee: 0.5,
    monthlyPassPrice: 100,
    seniorDiscount: 0.5,
    studentDiscount: 0.3,
  },
  upgradePaths: [],
  depots: [],
  staff: [],
  unions: [],
  loans: [],
  creditRating: {
    score: 70,
    rating: 'A',
    availableCredit: 500000000,
    interestRateModifier: 0.3,
  },
  inducedDemand: [],
  maintenanceRecords: [],
  cityCouncil: null,
  politicalDemands: [],
  competitors: [],
  competitorActions: [],
  
  selectedTool: null,
  selectedLine: null,
  selectedStation: null,
  selectedDistrict: null,
  buildMode: false,
  showUnderground: false,
  
  viewLayers: {
    demandHeatmap: false,
    satisfactionHeatmap: false,
    elevationView: false,
    noiseZones: false,
    competition: false,
    profitability: false,
  },
  
  // City actions
  setCityData: (name, center, osmData) => {
    // Parse OSM data to extract buildings, roads, and create districts
    const buildings: Building[] = []
    const roads: Road[] = []
    const districts: District[] = []
    
    // Create initial districts (simplified - would be more complex in production)
    const districtTypes: Array<{ type: any; name: string; offset: [number, number] }> = [
      { type: 'residential', name: 'North District', offset: [0, 0.01] },
      { type: 'commercial', name: 'Downtown', offset: [0, 0] },
      { type: 'industrial', name: 'South District', offset: [0, -0.01] },
      { type: 'mixed', name: 'East District', offset: [0.01, 0] },
    ]
    
    districtTypes.forEach((d, i) => {
      districts.push({
        id: `district-${i}`,
        name: d.name,
        type: d.type,
        center: [center[0] + d.offset[0], center[1] + d.offset[1]],
        radius: 2000,
        population: 50000 + Math.random() * 50000,
        morningDemand: d.type === 'residential' ? 0.8 : 0.2,
        eveningDemand: d.type === 'residential' ? 0.2 : 0.8,
        weekendDemand: d.type === 'commercial' ? 0.6 : 0.3,
        density: Math.random() * 0.5 + 0.5,
        averageIncome: 40000 + Math.random() * 60000,
        transitOriented: false,
        satisfaction: 50,
        coverage: 0,
      })
    })
    
    set({
      cityName: name,
      cityCenter: center,
      osmData,
      buildings,
      roads,
      districts,
      cityLoaded: true,
    })
  },
  
  addBuilding: (building) => set((state) => ({
    buildings: [...state.buildings, building],
  })),
  
  addRoad: (road) => set((state) => ({
    roads: [...state.roads, road],
  })),
  
  addDistrict: (district) => set((state) => ({
    districts: [...state.districts, district],
  })),
  
  updateDistrict: (districtId, updates) => set((state) => ({
    districts: state.districts.map(d => 
      d.id === districtId ? { ...d, ...updates } : d
    ),
  })),
  
  // Transport actions
  addLine: (line) => {
    const state = get()
    const cost = line.constructionCost
    
    console.log('addLine called:', {
      lineName: line.name,
      lineId: line.id,
      cost: cost,
      currentBalance: state.economics.balance,
      canAfford: state.economics.balance >= cost
    })
    
    if (state.economics.balance < cost) {
      console.warn('Insufficient funds to build line. Need:', cost, 'Have:', state.economics.balance)
      return
    }
    
    set((state) => ({
      lines: [...state.lines, line],
      economics: {
        ...state.economics,
        balance: state.economics.balance - cost,
      },
    }))
    
    console.log('Line added successfully. New line count:', get().lines.length)
  },
  
  removeLine: (lineId) => set((state) => ({
    lines: state.lines.filter(l => l.id !== lineId),
  })),
  
  updateLine: (lineId, updates) => set((state) => ({
    lines: state.lines.map(l => l.id === lineId ? { ...l, ...updates } : l),
  })),
  
  addStation: (station) => {
    const state = get()
    const cost = station.constructionCost
    
    if (state.economics.balance < cost) {
      console.warn('Insufficient funds to build station')
      return
    }
    
    set((state) => ({
      stations: [...state.stations, station],
      economics: {
        ...state.economics,
        balance: state.economics.balance - cost,
      },
    }))
  },
  
  removeStation: (stationId) => set((state) => ({
    stations: state.stations.filter(s => s.id !== stationId),
  })),
  
  updateStation: (stationId, updates) => set((state) => ({
    stations: state.stations.map(s => 
      s.id === stationId ? { ...s, ...updates } : s
    ),
  })),
  
  upgradeStation: (stationId, upgrade) => {
    const state = get()
    const station = state.stations.find(s => s.id === stationId)
    if (!station) return
    
    const upgradeCosts: Record<string, number> = {
      elevator: 500000,
      escalator: 300000,
      retail: 200000,
      platform: 1000000,
    }
    
    const cost = upgradeCosts[upgrade] || 0
    
    if (state.economics.balance < cost) {
      console.warn('Insufficient funds for upgrade')
      return
    }
    
    const updates: Partial<Station> = {}
    
    switch (upgrade) {
      case 'elevator':
        updates.hasElevator = true
        updates.accessibility = Math.min(100, station.accessibility + 20)
        break
      case 'escalator':
        updates.hasEscalator = true
        updates.accessibility = Math.min(100, station.accessibility + 10)
        break
      case 'retail':
        updates.hasRetail = true
        updates.retailRevenue = 1000
        break
      case 'platform':
        updates.platforms = station.platforms + 1
        updates.capacity = station.capacity * 1.5
        break
    }
    
    set((state) => ({
      stations: state.stations.map(s => 
        s.id === stationId ? { ...s, ...updates } : s
      ),
      economics: {
        ...state.economics,
        balance: state.economics.balance - cost,
      },
    }))
  },
  
  addVehicle: (vehicle) => set((state) => ({
    vehicles: [...state.vehicles, vehicle],
  })),
  
  removeVehicle: (vehicleId) => set((state) => ({
    vehicles: state.vehicles.filter(v => v.id !== vehicleId),
  })),
  
  updateVehiclePositions: (vehicleStates) => set(() => ({
    vehicleStates: vehicleStates,
  })),
  
  addTunnelSegment: (segment) => set((state) => ({
    tunnelSegments: [...state.tunnelSegments, segment],
  })),
  
  // Economics actions
  updateEconomics: (updates) => set((state) => ({
    economics: { ...state.economics, ...updates },
  })),
  
  chargeCost: (amount, _description) => set((state) => ({
    economics: {
      ...state.economics,
      balance: state.economics.balance - amount,
    },
  })),
  
  addRevenue: (amount, _source) => set((state) => ({
    economics: {
      ...state.economics,
      balance: state.economics.balance + amount,
    },
  })),
  
  // Event actions
  triggerEvent: (event) => set((state) => ({
    activeEvents: [...state.activeEvents, event],
  })),
  
  resolveEvent: (eventId, choiceIndex) => {
    const state = get()
    const event = state.activeEvents.find(e => e.id === eventId)
    if (!event || !event.choices) return
    
    const choice = event.choices[choiceIndex]
    
    // Apply choice effects
    if (choice.cost > 0) {
      get().chargeCost(choice.cost, `Event: ${event.title}`)
    }
    
    // Update affected lines
    event.affectedLines.forEach(lineId => {
      const updates: Partial<TransportLine> = {}
      if (choice.effect.reliability !== undefined) {
        const line = state.lines.find(l => l.id === lineId)
        if (line) {
          updates.reliability = Math.max(0, Math.min(100, 
            line.reliability + choice.effect.reliability
          ))
        }
      }
      get().updateLine(lineId, updates)
    })
    
    // Move to history and remove from active
    set((state) => ({
      activeEvents: state.activeEvents.filter(e => e.id !== eventId),
      eventHistory: [...state.eventHistory, event],
    }))
  },
  
  dismissEvent: (eventId) => set((state) => ({
    activeEvents: state.activeEvents.filter(e => e.id !== eventId),
  })),
  
  // UI actions
  setSelectedTool: (tool) => set({ selectedTool: tool }),
  setSelectedLine: (lineId) => set({ selectedLine: lineId }),
  setSelectedStation: (stationId) => set({ selectedStation: stationId }),
  setSelectedDistrict: (districtId) => set({ selectedDistrict: districtId }),
  setBuildMode: (mode) => set({ buildMode: mode }),
  setGameSpeed: (speed) => set({ gameSpeed: speed }),
  
  toggleViewLayer: (layer) => set((state) => ({
    viewLayers: {
      ...state.viewLayers,
      [layer]: !state.viewLayers[layer],
    },
  })),
  
  toggleUndergroundView: () => set((state) => ({
    showUnderground: !state.showUnderground,
  })),
  
  // Simulation
  tick: () => {
    const state = get()
    if (state.gameSpeed === 0) return
    
    get().simulateHour()
  },
  
  simulateHour: () => {
    const state = get()
    
    // Update time
    const newDate = new Date(state.gameTime.date.getTime() + 3600000) // +1 hour
    const hour = newDate.getHours()
    const timeOfDay = getTimeOfDay(hour)
    const dayType: DayType = newDate.getDay() === 0 || newDate.getDay() === 6 ? 'weekend' : 'weekday'
    const rushHourMultiplier = getRushHourMultiplier(timeOfDay, dayType)
    
    // Calculate demand for each district pair
    let totalPassengers = 0
    let totalRevenue = 0
    let totalOperatingCosts = 0
    let totalWaitTime = 0
    let totalTravelTime = 0
    let stationCount = 0
    
    // STEP 1: Generate passengers at each station based on time, location, and district
    const updatedStations = state.stations.map((station, index) => {
      // Use station ID and index to create more unique randomness
      const stationSeed = (station.id.charCodeAt(0) + index) % 100
      
      // Base passenger generation varies significantly by station
      const baseRate = 30 + Math.floor(Math.random() * 170) + stationSeed // Random between 30-300
      
      // Multiply by transport type attractiveness
      const typeMultiplier = {
        metro: 2.5,  // Metro attracts most passengers
        train: 2.0,  // Trains for longer distances
        tram: 1.2,   // Trams moderate
        bus: 1.0     // Buses baseline
      }[station.type] || 1.0
      
      // Multiply by time of day (rush hour effect)
      const timeMultiplier = rushHourMultiplier
      
      // Additional random variation (±50% for much more variety)
      const randomFactor = 0.5 + Math.random() * 1.0
      
      // Calculate new passengers arriving this hour (ALWAYS INTEGER)
      const newPassengers = Math.floor(baseRate * typeMultiplier * timeMultiplier * randomFactor)
      
      console.log(`Station ${station.name}: baseRate=${baseRate}, newPax=${newPassengers}, current=${station.passengers}`)
      
      // Passengers board vehicles (based on line frequency)
      const linesAtStation = state.lines.filter(line => 
        line.phase === 'operational' && line.stations.some(s => s.id === station.id)
      )
      
      let passengersBoarding = 0
      linesAtStation.forEach(line => {
        // More frequent service = more passengers can board
        const tripsPerHour = 60 / line.frequency
        const boardingCapacity = Math.floor(line.vehicleCapacity * tripsPerHour * 0.7) // 70% fill rate, INTEGER
        passengersBoarding += boardingCapacity
      })
      
      // Update station passenger count (ALWAYS INTEGER)
      // New arrivals + existing - those who boarded
      const maxWaiting = Math.floor(station.capacity * 0.3) // Max 30% of capacity waiting
      const newCount = Math.floor(station.passengers) + newPassengers - passengersBoarding
      const updatedPassengers = Math.floor(Math.max(0, Math.min(newCount, maxWaiting)))
      
      // Update crowding level
      const crowdingLevel = updatedPassengers / maxWaiting
      
      // Update wait time (more crowded = longer waits)
      const baseWaitTime = 60 / (linesAtStation.length > 0 ? 
        Math.min(...linesAtStation.map(l => l.frequency)) : 10)
      const waitTime = baseWaitTime * (1 + crowdingLevel)
      
      totalPassengers += updatedPassengers
      stationCount++
      
      // Return NEW station object (immutable update)
      return {
        ...station,
        passengers: updatedPassengers,
        crowdingLevel,
        waitTime
      }
    })
    
    // Update the stations in the store (this triggers Zustand reactivity)
    set({ stations: updatedStations })
    
    // STEP 2: Calculate revenue and costs for each line
    state.lines.forEach(line => {
      if (line.phase !== 'operational') return
      
      const characteristics = getTransportCharacteristics(line.type)
      
      // Calculate passengers carried this hour
      const tripsPerHour = 60 / line.frequency
      const passengersPerTrip = line.vehicleCapacity * 0.7 // 70% average fill
      const linePassengers = passengersPerTrip * tripsPerHour * line.stations.length
      
      // Revenue from fares (30% to balance economy - transit systems typically run at 30-40% cost recovery)
      const fareRevenue = linePassengers * state.economics.baseFare * 0.3
      totalRevenue += fareRevenue
      
      // Operating costs (scale with stations and trips)
      const baseOperatingCost = characteristics.operatingCost * tripsPerHour
      const stationScaling = 1 + (line.stations.length * 0.1) // +10% per station
      const lineOperatingCost = baseOperatingCost * stationScaling
      totalOperatingCosts += lineOperatingCost
      
      // Update line stats
      line.revenue = fareRevenue
      line.loadFactor = 0.7 // Average 70% full
      
      // Calculate line demand based on connected districts
      let lineDemand = 0
      
      line.stations.forEach((_station, i) => {
        if (i === 0) return
        
        // const originStation = line.stations[i - 1]
        // const destStation = station
        
        // Find nearest districts
        const originDistrict = state.districts[0]
        const destDistrict = state.districts[1]
        
        if (originDistrict && destDistrict) {
          const demand = calculateDemand(
            originDistrict.type,
            destDistrict.type,
            timeOfDay,
            dayType,
            originDistrict.population
          ) * rushHourMultiplier
          
          lineDemand += demand
        }
      })
      
      // Calculate actual passengers (limited by capacity)
      const loadFactor = calculateLoadFactor(
        lineDemand,
        line.vehicleCapacity,
        line.frequency
      )
      
      const actualPassengers = Math.min(lineDemand, 
        (line.vehicleCapacity * 60) / line.frequency
      )
      
      totalPassengers += actualPassengers
      
      // Calculate revenue
      const baseFare = state.economics.baseFare
      const fare = (timeOfDay === 'morning_rush' || timeOfDay === 'evening_rush')
        ? baseFare + state.economics.peakSurcharge
        : baseFare
      
      const lineRevenue = actualPassengers * fare * 0.3 // 30% cost recovery (realistic for transit)
      totalRevenue += lineRevenue
      
      // Calculate costs (scale with network complexity)
      const lineBaseOperatingCost = characteristics.operatingCost * line.stations.length
      const networkScaling = 1 + (line.stations.length * 0.15) // +15% per station
      const operatingCost = lineBaseOperatingCost * networkScaling
      totalOperatingCosts += operatingCost
      
      // Update line metrics
      get().updateLine(line.id, {
        revenue: lineRevenue,
        operatingCost,
        loadFactor,
      })
      
      // Update station metrics
      line.stations.forEach(station => {
        const stationPassengers = actualPassengers / line.stations.length
        const waitTime = line.frequency / 2 // Average wait time
        const crowding = loadFactor
        
        totalWaitTime += waitTime
        totalTravelTime += 30 // Simplified
        stationCount++
        
        get().updateStation(station.id, {
          passengers: stationPassengers,
          waitTime,
          crowdingLevel: Math.min(1, crowding),
        })
      })
    })
    
    // Calculate satisfaction
    const avgWaitTime = stationCount > 0 ? totalWaitTime / stationCount : 0
    const avgTravelTime = stationCount > 0 ? totalTravelTime / stationCount : 0
    const avgCrowding = state.stations.reduce((sum, s) => sum + s.crowdingLevel, 0) / Math.max(1, state.stations.length)
    const avgReliability = state.lines.reduce((sum, l) => sum + l.reliability, 0) / Math.max(1, state.lines.length)
    const coverage = state.districts.reduce((sum, d) => sum + d.coverage, 0) / Math.max(1, state.districts.length)
    const avgCleanliness = state.stations.reduce((sum, s) => sum + s.cleanliness, 0) / Math.max(1, state.stations.length)
    const avgSafety = state.stations.reduce((sum, s) => sum + s.safety, 0) / Math.max(1, state.stations.length)
    const avgAccessibility = state.stations.reduce((sum, s) => sum + s.accessibility, 0) / Math.max(1, state.stations.length)
    
    const overallSatisfaction = calculateSatisfaction({
      waitTime: avgWaitTime,
      travelTime: avgTravelTime,
      crowding: avgCrowding,
      reliability: avgReliability,
      coverage,
      cleanliness: avgCleanliness,
      safety: avgSafety,
      accessibility: avgAccessibility,
    })
    
    // Add retail and advertising revenue (30% of station retail + ads)
    const retailRevenue = state.stations.reduce((sum, s) => sum + s.retailRevenue, 0) * 0.3
    const advertisingRevenue = state.stations.length * 150 // $150 per station per hour
    
    totalRevenue += retailRevenue + advertisingRevenue
    
    // Add network overhead costs (employment, insurance, maintenance)
    const totalStations = state.stations.length
    const totalLines = state.lines.filter(l => l.phase === 'operational').length
    
    // Staff costs: $2000 per station + $5000 per line PER DAY (divide by 24 for hourly)
    const staffCosts = ((totalStations * 2000) + (totalLines * 5000)) / 24
    
    // Maintenance costs: $1000 per station + $2000 per line PER DAY (divide by 24 for hourly)
    const maintenanceCosts = ((totalStations * 1000) + (totalLines * 2000)) / 24
    
    // Energy costs: $500 per station + $1500 per line PER DAY (divide by 24 for hourly)
    const energyCosts = ((totalStations * 500) + (totalLines * 1500)) / 24
    
    // Administrative overhead: 5% of base operating costs
    const adminOverhead = totalOperatingCosts * 0.05
    
    // Insurance/debt service: $1000 per line PER DAY (divide by 24 for hourly)
    const debtService = (totalLines * 1000) / 24
    
    const totalOverhead = staffCosts + maintenanceCosts + energyCosts + adminOverhead + debtService
    totalOperatingCosts += totalOverhead
    
    // Calculate subsidies (government support based on satisfaction)
    const subsidies = overallSatisfaction > 70 ? totalOperatingCosts * 0.3 : 0
    
    // Update economics
    const netIncome = totalRevenue + subsidies - totalOperatingCosts
    
    set({
      gameTime: {
        date: newDate,
        timeOfDay,
        dayType,
        hour,
        rushHourMultiplier,
      },
      economics: {
        ...state.economics,
        balance: state.economics.balance + netIncome,
        fareRevenue: totalRevenue - retailRevenue - advertisingRevenue,
        advertisingRevenue,
        retailRevenue,
        subsidies,
        operatingCosts: totalOperatingCosts,
        maintenanceCosts,
        staffCosts,
        energyCosts,
        debtService,
      },
      satisfactionFactors: {
        waitTime: avgWaitTime,
        travelTime: avgTravelTime,
        crowding: avgCrowding,
        reliability: avgReliability,
        coverage,
        cleanliness: avgCleanliness,
        safety: avgSafety,
        accessibility: avgAccessibility,
        overall: overallSatisfaction,
      },
      analytics: {
        ...state.analytics,
        totalPassengers,
        totalRevenue,
        totalCosts: totalOperatingCosts,
        netIncome,
        averageWaitTime: avgWaitTime,
        averageTravelTime: avgTravelTime,
        systemReliability: avgReliability,
        systemCoverage: coverage,
      },
    })
    
    // ===== NEW TYCOON FEATURES =====
    
    // 1. Update Demand Heatmap
    const hotspots = calculateDemandHotspots(state.districts, state.lines, timeOfDay, dayType)
    const unservedDemand = hotspots.reduce((sum, h) => sum + (h.demand * (1 - h.satisfied)), 0)
    const peakHotspot = hotspots.length > 0 ? hotspots[0] : null
    
    // 2. Update Competition
    const competition = calculateCompetition(state.districts, state.lines, state.satisfactionFactors)
    
    // 3. Calculate Line Profitability
    const lineProfitability = calculateLineProfitability(state.lines)
    
    // 4. Apply Transit-Oriented Development (once per day)
    let updatedDistricts = state.districts
    if (hour === 12) { // Noon update
      const todEffects = calculateTODEffects(state.stations, state.districts)
      updatedDistricts = state.districts.map(district => {
        const effects = todEffects.filter(e => e.districtId === district.id)
        if (effects.length > 0) {
          const totalPopGrowth = effects.reduce((sum, e) => sum + e.populationGrowth, 0)
          const totalDensityIncrease = effects.reduce((sum, e) => sum + e.densityIncrease, 0)
          
          return {
            ...district,
            population: district.population + totalPopGrowth / 30, // Monthly growth divided by 30 days
            density: Math.min(1, district.density + totalDensityIncrease / 30),
          }
        }
        return district
      })
    }
    
    // 5. Generate Special Events
    let activeSpecialEvent = state.activeSpecialEvent
    let specialEvents = state.specialEvents
    
    // Check if current event ended
    if (activeSpecialEvent && hour >= activeSpecialEvent.startTime + activeSpecialEvent.duration) {
      activeSpecialEvent = null
    }
    
    // Try to generate new event
    if (!activeSpecialEvent) {
      const newEvent = generateSpecialEvent(state.districts, hour, dayType)
      if (newEvent) {
        activeSpecialEvent = newEvent
        specialEvents = [...specialEvents, newEvent]
      }
    }
    
    // 6. Update Fare Elasticity
    const fareElasticity = calculateFareElasticity(state.districts, state.economics.baseFare)
    
    // 7. Identify Bottlenecks (every 6 hours)
    let bottlenecks = state.bottlenecks
    if (hour % 6 === 0) {
      bottlenecks = identifySystemBottlenecks(state.lines, state.stations)
    }
    
    // 8. Update Victory Conditions
    let victoryConditions = state.victoryConditions
    if (victoryConditions.length === 0) {
      victoryConditions = initializeVictoryConditions()
    }
    victoryConditions = updateVictoryProgress(victoryConditions, state.analytics, state.satisfactionFactors)
    
    // 10. Generate Passenger Complaints
    const newComplaint = generatePassengerComplaint(state.lines, state.stations)
    let passengerComplaints = state.passengerComplaints
    if (newComplaint) {
      passengerComplaints = [newComplaint, ...passengerComplaints].slice(0, 10) // Keep last 10
    }
    
    // ===== ADVANCED FEATURES (Second Wave) =====
    
    // 1. Update Vehicle Tracking (every hour)
    const vehicleTracking = updateVehiclePositions(state.lines, hour + (newDate.getMinutes() / 60))
    
    // 2. Dynamic Pricing - already using fareElasticity
    
    // 3. Upgrade Paths - calculate available upgrades
    const upgradePaths = state.lines.map(line => ({
      lineId: line.id,
      currentLevel: line.type === 'bus' ? 'bus' as const : 
                    line.type === 'tram' ? 'light_rail' as const :
                    line.type === 'metro' ? 'metro' as const : 'regional_rail' as const,
      availableUpgrades: getAvailableUpgrades(line),
      upgradeProgress: 0,
      upgradeTimeRemaining: 0,
    }))
    
    // 4. Depot Management - calculate coverage
    // (Depots would be created by player, just track them)
    
    // 5. Staff & Unions (update daily at midnight)
    let staff = state.staff
    let unions = state.unions
    if (hour === 0) {
      const staffNeeds = calculateStaffNeeds(state.lines, state.stations)
      
      // Initialize union if we have staff
      if (unions.length === 0 && state.lines.length > 0) {
        unions = [{
          id: 'transit-workers-union',
          name: 'Transit Workers Union',
          memberCount: staffNeeds.drivers + staffNeeds.mechanics + staffNeeds.stationStaff,
          satisfaction: 70,
          demands: [],
          strikeRisk: 0.1,
          lastNegotiation: new Date(),
        }]
      }
      
      // Update union satisfaction
      if (unions.length > 0) {
        const avgSalary = 50000
        const workConditions = state.satisfactionFactors.overall
        const staffingLevel = 0.8
        unions = unions.map(union => ({
          ...union,
          satisfaction: updateUnionSatisfaction(union, avgSalary, workConditions, staffingLevel),
          demands: union.satisfaction < 60 ? generateUnionDemands(union) : [],
          strikeRisk: Math.max(0, (60 - union.satisfaction) / 100),
        }))
      }
    }
    
    // 6. Loans & Debt - calculate credit rating (monthly)
    let creditRating = state.creditRating
    if (hour === 0 && newDate.getDate() === 1) {
      const totalDebt = state.loans.reduce((sum, loan) => sum + loan.remainingBalance, 0)
      const monthlyIncome = state.analytics.netIncome * 24 * 30
      const monthlyDebtPayment = state.loans.reduce((sum, loan) => sum + loan.monthlyPayment, 0)
      const debtServiceRatio = monthlyIncome > 0 ? monthlyDebtPayment / monthlyIncome : 1
      
      creditRating = calculateCreditRating(
        state.economics.balance,
        totalDebt,
        monthlyIncome,
        debtServiceRatio
      )
    }
    
    // 7. Induced Demand - calculate monthly
    let inducedDemand = state.inducedDemand
    if (hour === 0 && newDate.getDate() === 1) {
      inducedDemand = state.districts.map(district => {
        const transitQuality = district.coverage * 100
        const monthsSinceService = 12 // Simplified
        return calculateInducedDemand(district, transitQuality, monthsSinceService)
      })
    }
    
    // 8. Maintenance & Degradation - update daily
    let maintenanceRecords = state.maintenanceRecords
    if (hour === 0) {
      // Initialize maintenance records for vehicles
      if (maintenanceRecords.length === 0 && state.vehicles.length > 0) {
        maintenanceRecords = state.vehicles.map(vehicle => ({
          assetId: vehicle.id,
          assetType: 'vehicle' as const,
          condition: vehicle.condition,
          lastMaintenance: new Date(),
          nextScheduledMaintenance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          maintenanceCost: 5000,
          breakdownRisk: 0.05,
          deferredMaintenance: 0,
        }))
      }
      
      // Update conditions
      maintenanceRecords = maintenanceRecords.map(record => 
        updateAssetCondition(record, 24, Math.random() < 0.1) // 10% chance of maintenance
      )
    }
    
    // 9. Political System - initialize and generate demands
    let cityCouncil = state.cityCouncil
    let politicalDemands = state.politicalDemands
    if (!cityCouncil) {
      cityCouncil = initializeCityCouncil()
    }
    if (hour === 0 && Math.random() < 0.05) { // 5% chance daily
      const newDemand = generatePoliticalDemand(cityCouncil, state.districts)
      if (newDemand) {
        politicalDemands = [...politicalDemands, newDemand]
      }
    }
    
    // 10. Competitors - initialize and take turns
    let competitors = state.competitors
    let competitorActions = state.competitorActions
    if (competitors.length === 0 && state.lines.length > 2) {
      // Add 1-2 competitors once player has established network
      competitors = [
        initializeCompetitor('comp-1', state.districts),
        initializeCompetitor('comp-2', state.districts),
      ]
    }
    if (hour % 6 === 0) { // Every 6 hours
      competitors.forEach(competitor => {
        const action = competitorTakeTurn(competitor, state.lines, state.districts)
        if (action) {
          competitorActions = [action, ...competitorActions].slice(0, 20) // Keep last 20
        }
      })
    }
    
    // Update all new features in state
    set({
      demandHeatmap: {
        hotspots,
        unservedDemand,
        peakHotspot,
      },
      competition,
      lineProfitability,
      todEffects: calculateTODEffects(state.stations, updatedDistricts),
      districts: updatedDistricts,
      specialEvents,
      activeSpecialEvent,
      fareElasticity,
      bottlenecks,
      victoryConditions,
      passengerComplaints,
      // Advanced features
      vehicleTracking,
      upgradePaths,
      staff,
      unions,
      creditRating,
      inducedDemand,
      maintenanceRecords,
      cityCouncil,
      politicalDemands,
      competitors,
      competitorActions,
    })
    
    // Random events (0.5% chance per hour = ~1 event every 8-9 game hours)
    // Only trigger if no active events (prevent spam)
    if (state.activeEvents.length === 0 && shouldTriggerEvent(0.005)) {
      const eventData = generateRandomEvent()
      const affectedLineIds = state.lines
        .slice(0, eventData.affectedLines)
        .map(l => l.id)
      
      const event: GameEvent = {
        id: `event-${Date.now()}`,
        type: eventData.type as any,
        title: getEventTitle(eventData.type),
        description: getEventDescription(eventData.type),
        affectedLines: affectedLineIds,
        impact: {
          reliability: -eventData.severity * 30,
          cost: eventData.severity * 50000,
          satisfaction: -eventData.severity * 20,
          duration: eventData.severity * 4,
        },
        choices: getEventChoices(eventData.type),
      }
      
      get().triggerEvent(event)
    }
    
    // Generate suggestions every 24 hours
    if (hour === 0) {
      get().generateSuggestions()
    }
    
    // Update analytics trends
    get().updateAnalytics()
  },
  
  updateAnalytics: () => {
    const state = get()
    
    set({
      analytics: {
        ...state.analytics,
        passengerTrend: [...state.analytics.passengerTrend.slice(-29), state.analytics.totalPassengers],
        revenueTrend: [...state.analytics.revenueTrend.slice(-29), state.analytics.totalRevenue],
        satisfactionTrend: [...state.analytics.satisfactionTrend.slice(-29), state.satisfactionFactors.overall],
      },
    })
  },
  
  generateSuggestions: () => {
    const state = get()
    const suggestions: Suggestion[] = []
    
    // Identify bottlenecks
    const bottlenecks = identifyBottlenecks(state.stations, 0.8)
    
    bottlenecks.forEach(stationId => {
      const station = state.stations.find(s => s.id === stationId)
      if (!station) return
      
      suggestions.push({
        id: `suggestion-${Date.now()}-${stationId}`,
        priority: station.crowdingLevel > 0.9 ? 'critical' : 'high',
        category: 'capacity',
        title: `Overcrowding at ${station.name}`,
        description: `Station is operating at ${Math.round(station.crowdingLevel * 100)}% capacity. Consider increasing frequency or adding platforms.`,
        estimatedCost: 500000,
        estimatedBenefit: '+20% capacity',
        location: station.position,
      })
    })
    
    // Coverage suggestions
    state.districts.forEach(district => {
      if (district.coverage < 0.5) {
        suggestions.push({
          id: `suggestion-${Date.now()}-${district.id}`,
          priority: 'medium',
          category: 'coverage',
          title: `Low coverage in ${district.name}`,
          description: `Only ${Math.round(district.coverage * 100)}% of residents have access to transit. Consider adding stations.`,
          estimatedCost: 5000000,
          estimatedBenefit: `+${Math.round((1 - district.coverage) * 50)}% coverage`,
        })
      }
    })
    
    // Profitability suggestions
    state.lines.forEach(line => {
      const recovery = calculateFareboxRecovery(line.revenue, line.operatingCost)
      if (recovery < 50 && line.phase === 'operational') {
        suggestions.push({
          id: `suggestion-${Date.now()}-${line.id}`,
          priority: 'medium',
          category: 'efficiency',
          title: `${line.name} is unprofitable`,
          description: `Line only recovers ${Math.round(recovery)}% of operating costs. Consider adjusting frequency or fares.`,
          estimatedCost: 0,
          estimatedBenefit: `+${Math.round(100 - recovery)}% recovery`,
          affectedLines: [line.id],
        })
      }
    })
    
    set({ suggestions })
  },
}))

// Helper functions for events
function getEventTitle(type: string): string {
  const titles: Record<string, string> = {
    equipment_failure: 'Equipment Failure',
    weather: 'Severe Weather',
    strike: 'Labor Strike',
    accident: 'Service Accident',
    vandalism: 'Vandalism Incident',
  }
  return titles[type] || 'Incident'
}

function getEventDescription(type: string): string {
  const descriptions: Record<string, string> = {
    equipment_failure: 'A critical equipment failure has occurred, affecting service reliability.',
    weather: 'Severe weather conditions are impacting multiple lines across the network.',
    strike: 'Transit workers have initiated a strike action, demanding better conditions.',
    accident: 'A service accident has occurred, requiring immediate attention.',
    vandalism: 'Vandalism has been reported at several stations, affecting operations.',
  }
  return descriptions[type] || 'An incident has occurred.'
}

function getEventChoices(type: string): any[] {
  const choices: Record<string, any[]> = {
    equipment_failure: [
      {
        text: 'Emergency repair (Fast, expensive)',
        cost: 100000,
        effect: { reliability: 10, duration: 2 },
      },
      {
        text: 'Standard repair (Slower, cheaper)',
        cost: 50000,
        effect: { reliability: 5, duration: 6 },
      },
      {
        text: 'Delay repair (Risky)',
        cost: 0,
        effect: { reliability: -5, duration: 12, satisfaction: -10 },
      },
    ],
    weather: [
      {
        text: 'Deploy emergency crews',
        cost: 80000,
        effect: { reliability: 15, duration: 3 },
      },
      {
        text: 'Reduce service temporarily',
        cost: 20000,
        effect: { reliability: 5, duration: 8, satisfaction: -5 },
      },
      {
        text: 'Wait it out',
        cost: 0,
        effect: { reliability: 0, duration: 12, satisfaction: -15 },
      },
    ],
    strike: [
      {
        text: 'Accept demands immediately',
        cost: 200000,
        effect: { reliability: 20, duration: 1, satisfaction: 10 },
      },
      {
        text: 'Negotiate compromise',
        cost: 100000,
        effect: { reliability: 10, duration: 4, satisfaction: 5 },
      },
      {
        text: 'Refuse and wait',
        cost: 0,
        effect: { reliability: -10, duration: 16, satisfaction: -20 },
      },
    ],
    accident: [
      {
        text: 'Full investigation & repairs',
        cost: 150000,
        effect: { reliability: 15, duration: 4, satisfaction: 5 },
      },
      {
        text: 'Quick cleanup & resume',
        cost: 60000,
        effect: { reliability: 8, duration: 6, satisfaction: -5 },
      },
      {
        text: 'Minimal response',
        cost: 20000,
        effect: { reliability: 0, duration: 10, satisfaction: -15 },
      },
    ],
    vandalism: [
      {
        text: 'Increase security & repair',
        cost: 120000,
        effect: { reliability: 12, duration: 3, satisfaction: 8 },
      },
      {
        text: 'Basic repairs only',
        cost: 50000,
        effect: { reliability: 6, duration: 6, satisfaction: 0 },
      },
      {
        text: 'Ignore for now',
        cost: 0,
        effect: { reliability: -8, duration: 12, satisfaction: -12 },
      },
    ],
  }
  
  return choices[type] || choices.equipment_failure
}
