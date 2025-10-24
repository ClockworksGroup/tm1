import { Station, Building, StationDepth } from '../types/game'

/**
 * Foundation Analysis System
 * Analyzes underground conditions for metro/train construction
 */

export interface FoundationObstacle {
  type: 'building_foundation' | 'bedrock' | 'water_table' | 'utility' | 'archaeological'
  depth: number // meters below surface
  severity: 'minor' | 'moderate' | 'severe' | 'blocking'
  costMultiplier: number
  description: string
  position: [number, number]
}

export interface DepthOption {
  depth: StationDepth
  depthMeters: number
  baseCost: number
  obstacles: FoundationObstacle[]
  totalCostMultiplier: number
  constructionTime: number // days
  difficulty: number // 1-10
  description: string
  recommended: boolean
}

export class FoundationAnalyzer {
  /**
   * Analyze foundation conditions for a station location
   */
  analyzeLocation(
    position: [number, number, number],
    _buildings: Building[],
    _existingStations: Station[]
  ): DepthOption[] {
    const [_lat, _lng] = position

    // Define depth options
    const depthOptions: DepthOption[] = [
      {
        depth: 'surface',
        depthMeters: 0,
        baseCost: 5000000, // $5M
        obstacles: [],
        totalCostMultiplier: 1.0,
        constructionTime: 180, // 6 months
        difficulty: 2,
        description: 'Surface station - easiest and cheapest',
        recommended: false
      },
      {
        depth: 'shallow',
        depthMeters: 10,
        baseCost: 15000000, // $15M
        obstacles: [],
        totalCostMultiplier: 1.0,
        constructionTime: 365, // 1 year
        difficulty: 4,
        description: 'Shallow tunnel (10m) - cut-and-cover method',
        recommended: false
      },
      {
        depth: 'medium',
        depthMeters: 25,
        baseCost: 35000000, // $35M
        obstacles: [],
        totalCostMultiplier: 1.0,
        constructionTime: 547, // 1.5 years
        difficulty: 6,
        description: 'Medium depth (25m) - bored tunnel',
        recommended: false
      },
      {
        depth: 'deep',
        depthMeters: 50,
        baseCost: 75000000, // $75M
        obstacles: [],
        totalCostMultiplier: 1.0,
        constructionTime: 730, // 2 years
        difficulty: 8,
        description: 'Deep tunnel (50m) - avoids most obstacles',
        recommended: false
      }
    ]

    // Detect obstacles at each depth
    for (const option of depthOptions) {
      option.obstacles = this.detectObstacles(position, option.depthMeters, _buildings)
      option.totalCostMultiplier = this.calculateCostMultiplier(option.obstacles)
    }

    // Determine recommended depth
    this.determineRecommendedDepth(depthOptions)

    return depthOptions
  }

  /**
   * Detect obstacles at a specific depth
   */
  private detectObstacles(
    position: [number, number, number],
    depth: number,
    buildings: Building[]
  ): FoundationObstacle[] {
    const obstacles: FoundationObstacle[] = []
    const [lat, lng] = position

    // Check for building foundations nearby
    const nearbyBuildings = buildings.filter(b => {
      const distance = Math.hypot(
        (b.position[0] - lat) * 111000, // rough conversion to meters
        (b.position[1] - lng) * 111000
      )
      return distance < 100 // within 100m
    })

    for (const building of nearbyBuildings) {
      if (building.foundationDepth >= depth - 5 && building.foundationDepth <= depth + 5) {
        obstacles.push({
          type: 'building_foundation',
          depth: building.foundationDepth,
          severity: building.isProtected ? 'blocking' : 'severe',
          costMultiplier: building.isProtected ? 10.0 : 2.5,
          description: building.isProtected 
            ? `Protected building foundation - cannot build here`
            : `Building foundation requires careful excavation`,
          position: [building.position[0], building.position[1]] as [number, number]
        })
      }
    }

    // Simulate bedrock (deeper = more likely)
    if (depth > 30 && Math.random() < 0.3) {
      obstacles.push({
        type: 'bedrock',
        depth: depth,
        severity: 'moderate',
        costMultiplier: 1.5,
        description: 'Hard bedrock requires specialized boring equipment',
        position: [position[0], position[1]] as [number, number]
      })
    }

    // Simulate water table (shallow depths more likely)
    if (depth < 20 && Math.random() < 0.4) {
      obstacles.push({
        type: 'water_table',
        depth: depth,
        severity: 'moderate',
        costMultiplier: 1.8,
        description: 'High water table requires waterproofing and pumping',
        position: [position[0], position[1]] as [number, number]
      })
    }

    // Simulate utilities (shallow depths)
    if (depth < 15 && Math.random() < 0.5) {
      obstacles.push({
        type: 'utility',
        depth: depth,
        severity: 'minor',
        costMultiplier: 1.2,
        description: 'Underground utilities need relocation',
        position: [position[0], position[1]] as [number, number]
      })
    }

    // Simulate archaeological sites (rare but expensive)
    if (Math.random() < 0.05) {
      obstacles.push({
        type: 'archaeological',
        depth: depth,
        severity: 'severe',
        costMultiplier: 3.0,
        description: 'Archaeological site requires excavation and documentation',
        position: [position[0], position[1]] as [number, number]
      })
    }

    return obstacles
  }

  /**
   * Calculate total cost multiplier from obstacles
   */
  private calculateCostMultiplier(obstacles: FoundationObstacle[]): number {
    if (obstacles.length === 0) return 1.0

    // Check for blocking obstacles
    const hasBlocking = obstacles.some(o => o.severity === 'blocking')
    if (hasBlocking) return 999.0 // Effectively impossible

    // Multiply all obstacle cost multipliers
    return obstacles.reduce((total, obstacle) => total * obstacle.costMultiplier, 1.0)
  }

  /**
   * Determine which depth is recommended
   */
  private determineRecommendedDepth(options: DepthOption[]) {
    // Default to shallow depth for metro (best balance of cost and underground operation)
    let bestOption = options.find(o => o.depth === 'shallow') || options[0]
    let bestScore = Infinity

    for (const option of options) {
      if (option.totalCostMultiplier > 10) continue // Skip if too expensive

      const totalCost = option.baseCost * option.totalCostMultiplier
      const score = totalCost / 1000000 + option.difficulty * 2 + option.constructionTime / 100

      // Strongly prefer shallow depth for metro (large bonus to override surface cost advantage)
      const depthBonus = option.depth === 'shallow' ? -50 : 0
      const finalScore = score + depthBonus

      if (finalScore < bestScore) {
        bestScore = finalScore
        bestOption = option
      }
    }

    bestOption.recommended = true
  }

  /**
   * Calculate tunnel segment between two stations
   */
  calculateTunnelSegment(
    start: Station,
    end: Station,
    _targetDepth: number
  ): {
    gradient: number
    isValid: boolean
    warnings: string[]
  } {
    const warnings: string[] = []
    
    // Calculate horizontal distance
    const R = 6371000 // Earth radius in meters
    const lat1 = start.position[0] * Math.PI / 180
    const lat2 = end.position[0] * Math.PI / 180
    const dLat = (end.position[0] - start.position[0]) * Math.PI / 180
    const dLon = (end.position[1] - start.position[1]) * Math.PI / 180

    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    const horizontalDistance = R * c

    // Get depth values
    const startDepth = this.getDepthMeters(start.depth)
    const endDepth = this.getDepthMeters(end.depth)
    const verticalChange = Math.abs(endDepth - startDepth)

    // Calculate gradient (percentage)
    const gradient = (verticalChange / horizontalDistance) * 100

    // Check gradient limits
    const maxGradient = start.type === 'metro' ? 6.0 : 3.0 // Metro can be steeper
    let isValid = gradient <= maxGradient

    if (gradient > maxGradient) {
      warnings.push(`Gradient ${gradient.toFixed(1)}% exceeds maximum ${maxGradient}%`)
      warnings.push(`Consider intermediate station or adjust depths`)
    }

    if (gradient > maxGradient * 0.8) {
      warnings.push(`Gradient ${gradient.toFixed(1)}% is steep - may affect speed and energy`)
    }

    // Check if depths are compatible
    if (Math.abs(startDepth - endDepth) > 30) {
      warnings.push(`Large depth change (${Math.abs(startDepth - endDepth).toFixed(0)}m) increases cost`)
    }

    return {
      gradient,
      isValid,
      warnings
    }
  }

  /**
   * Get depth in meters from depth enum
   */
  private getDepthMeters(depth: StationDepth): number {
    const depthMap: Record<StationDepth, number> = {
      'surface': 0,
      'shallow': 10,
      'medium': 25,
      'deep': 50
    }
    return depthMap[depth] || 0
  }

  /**
   * Calculate total construction cost for a station with depth
   */
  calculateStationCost(
    position: [number, number, number],
    depth: StationDepth,
    buildings: Building[]
  ): number {
    const options = this.analyzeLocation(position, buildings, [])
    const selectedOption = options.find(o => o.depth === depth)
    
    if (!selectedOption) return 0

    return selectedOption.baseCost * selectedOption.totalCostMultiplier
  }
}

// Singleton instance
export const foundationAnalyzer = new FoundationAnalyzer()
