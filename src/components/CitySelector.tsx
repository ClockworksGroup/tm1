import { useState } from 'react'
import { MapPin, Search, Loader2, ArrowLeft } from 'lucide-react'
import { useGameStore } from '../store/gameStore'

interface City {
  name: string
  country: string
  lat: number
  lon: number
  continent: 'north-america' | 'south-america' | 'europe' | 'asia' | 'oceania' | 'africa'
}

const PRESET_CITIES: City[] = [
  // North America
  { name: 'New York', country: 'USA', lat: 40.7128, lon: -74.0060, continent: 'north-america' },
  { name: 'Los Angeles', country: 'USA', lat: 34.0522, lon: -118.2437, continent: 'north-america' },
  { name: 'Chicago', country: 'USA', lat: 41.8781, lon: -87.6298, continent: 'north-america' },
  { name: 'Toronto', country: 'Canada', lat: 43.6532, lon: -79.3832, continent: 'north-america' },
  { name: 'Mexico City', country: 'Mexico', lat: 19.4326, lon: -99.1332, continent: 'north-america' },
  { name: 'Vancouver', country: 'Canada', lat: 49.2827, lon: -123.1207, continent: 'north-america' },
  
  // South America
  { name: 'São Paulo', country: 'Brazil', lat: -23.5505, lon: -46.6333, continent: 'south-america' },
  { name: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lon: -58.3816, continent: 'south-america' },
  { name: 'Rio de Janeiro', country: 'Brazil', lat: -22.9068, lon: -43.1729, continent: 'south-america' },
  { name: 'Santiago', country: 'Chile', lat: -33.4489, lon: -70.6693, continent: 'south-america' },
  { name: 'Lima', country: 'Peru', lat: -12.0464, lon: -77.0428, continent: 'south-america' },
  { name: 'Bogotá', country: 'Colombia', lat: 4.7110, lon: -74.0721, continent: 'south-america' },
  
  // Europe
  { name: 'London', country: 'UK', lat: 51.5074, lon: -0.1278, continent: 'europe' },
  { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522, continent: 'europe' },
  { name: 'Berlin', country: 'Germany', lat: 52.5200, lon: 13.4050, continent: 'europe' },
  { name: 'Barcelona', country: 'Spain', lat: 41.3851, lon: 2.1734, continent: 'europe' },
  { name: 'Madrid', country: 'Spain', lat: 40.4168, lon: -3.7038, continent: 'europe' },
  { name: 'Rome', country: 'Italy', lat: 41.9028, lon: 12.4964, continent: 'europe' },
  { name: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lon: 4.9041, continent: 'europe' },
  { name: 'Vienna', country: 'Austria', lat: 48.2082, lon: 16.3738, continent: 'europe' },
  { name: 'Prague', country: 'Czech Republic', lat: 50.0755, lon: 14.4378, continent: 'europe' },
  { name: 'Stockholm', country: 'Sweden', lat: 59.3293, lon: 18.0686, continent: 'europe' },
  { name: 'Copenhagen', country: 'Denmark', lat: 55.6761, lon: 12.5683, continent: 'europe' },
  { name: 'Warsaw', country: 'Poland', lat: 52.2297, lon: 21.0122, continent: 'europe' },
  { name: 'Lisbon', country: 'Portugal', lat: 38.7223, lon: -9.1393, continent: 'europe' },
  { name: 'Athens', country: 'Greece', lat: 37.9838, lon: 23.7275, continent: 'europe' },
  
  // Asia
  { name: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503, continent: 'asia' },
  { name: 'Seoul', country: 'South Korea', lat: 37.5665, lon: 126.9780, continent: 'asia' },
  { name: 'Beijing', country: 'China', lat: 39.9042, lon: 116.4074, continent: 'asia' },
  { name: 'Shanghai', country: 'China', lat: 31.2304, lon: 121.4737, continent: 'asia' },
  { name: 'Hong Kong', country: 'China', lat: 22.3193, lon: 114.1694, continent: 'asia' },
  { name: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198, continent: 'asia' },
  { name: 'Bangkok', country: 'Thailand', lat: 13.7563, lon: 100.5018, continent: 'asia' },
  { name: 'Mumbai', country: 'India', lat: 19.0760, lon: 72.8777, continent: 'asia' },
  { name: 'Delhi', country: 'India', lat: 28.7041, lon: 77.1025, continent: 'asia' },
  { name: 'Dubai', country: 'UAE', lat: 25.2048, lon: 55.2708, continent: 'asia' },
  { name: 'Istanbul', country: 'Turkey', lat: 41.0082, lon: 28.9784, continent: 'asia' },
  { name: 'Tel Aviv', country: 'Israel', lat: 32.0853, lon: 34.7818, continent: 'asia' },
  
  // Oceania
  { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093, continent: 'oceania' },
  { name: 'Melbourne', country: 'Australia', lat: -37.8136, lon: 144.9631, continent: 'oceania' },
  { name: 'Auckland', country: 'New Zealand', lat: -36.8485, lon: 174.7633, continent: 'oceania' },
  
  // Africa
  { name: 'Cairo', country: 'Egypt', lat: 30.0444, lon: 31.2357, continent: 'africa' },
  { name: 'Cape Town', country: 'South Africa', lat: -33.9249, lon: 18.4241, continent: 'africa' },
  { name: 'Lagos', country: 'Nigeria', lat: 6.5244, lon: 3.3792, continent: 'africa' },
]

interface CitySelectorProps {
  onCitySelected: () => void
  onBack?: () => void
}

export default function CitySelector({ onCitySelected, onBack }: CitySelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedContinent, setSelectedContinent] = useState<'north-america' | 'south-america' | 'europe' | 'asia' | 'oceania' | 'africa'>('europe')
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'difficult' | 'sandbox'>('medium')
  const { setCityData } = useGameStore()

  const handleCitySelect = async (city: City) => {
    setLoading(true)
    
    try {
      // Dynamically import the OSM loader
      const { loadCityData } = await import('../utils/osmLoader')
      
      // Fetch real OSM data for the city (1km radius)
      const osmData = await loadCityData(city.lat, city.lon, 1000)
      
      console.log(`Loaded ${osmData.buildings.length} buildings and ${osmData.roads.length} roads for ${city.name}`)
      
      setCityData(city.name, [city.lat, city.lon], osmData)
      
      // Apply difficulty settings
      const difficultySettings = {
        easy: { balance: 1000000000, costMultiplier: 0.7, eventChance: 0.3 },
        medium: { balance: 500000000, costMultiplier: 1.0, eventChance: 1.0 },
        difficult: { balance: 250000000, costMultiplier: 1.5, eventChance: 2.0 },
        sandbox: { balance: 999999999999, costMultiplier: 0, eventChance: 0 }
      }
      
      const settings = difficultySettings[selectedDifficulty]
      useGameStore.setState({ 
        difficulty: selectedDifficulty,
        economics: {
          ...useGameStore.getState().economics,
          balance: settings.balance
        }
      })
      
      setLoading(false)
      onCitySelected()
    } catch (error) {
      console.error('Error loading city:', error)
      setLoading(false)
    }
  }

  const filteredCities = PRESET_CITIES.filter(city => {
    const matchesSearch = city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.country.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesContinent = city.continent === selectedContinent
    return matchesSearch && matchesContinent
  })

  return (
    <div className="w-full h-full bg-black flex items-center justify-center relative overflow-hidden">
      {/* Background Image with Low Opacity */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{ backgroundImage: 'url(/transport_bg.png)' }}
      />
      
      {/* Dark overlay to maintain theme */}
      <div className="absolute inset-0 bg-black opacity-40" />
      
      {/* Content */}
      <div className="relative z-10 max-w-5xl w-full mx-8">
        <div className="text-center mb-16">
          <h1 className="text-7xl font-extralight tracking-widest text-white mb-6 uppercase">
            Transport <span style={{ color: '#c90a43' }}>Master</span>
          </h1>
          <p className="text-sm text-white text-opacity-50 font-light tracking-wide">
            Build and manage your city's public transportation network
          </p>
        </div>

        <div className="bg-white bg-opacity-5 backdrop-blur-md border border-white border-opacity-10 rounded-sm p-10 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xs font-light tracking-widest text-white text-opacity-60 uppercase">Select a City</h2>
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center space-x-2 px-4 py-2 bg-white bg-opacity-5 hover:bg-opacity-10 text-white text-opacity-60 hover:text-opacity-100 transition-all rounded"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-light">Back to Menu</span>
              </button>
            )}
          </div>

          {/* Difficulty Selector */}
          <div className="mb-6">
            <h3 className="text-xs font-light tracking-widest text-white text-opacity-60 uppercase mb-3">Difficulty</h3>
            <div className="grid grid-cols-4 gap-3">
              <button
                onClick={() => setSelectedDifficulty('easy')}
                className={`p-4 transition-all border-l-4 ${
                  selectedDifficulty === 'easy'
                    ? 'bg-white bg-opacity-10'
                    : 'bg-white bg-opacity-5 hover:bg-opacity-10'
                }`}
                style={selectedDifficulty === 'easy' ? { borderLeftColor: '#22c55e' } : { borderLeftColor: 'transparent' }}
              >
                <div className="text-white font-light text-sm mb-1">Easy</div>
                <div className="text-white text-opacity-40 text-xs">$1B start • -30% costs</div>
              </button>
              <button
                onClick={() => setSelectedDifficulty('medium')}
                className={`p-4 transition-all border-l-4 ${
                  selectedDifficulty === 'medium'
                    ? 'bg-white bg-opacity-10'
                    : 'bg-white bg-opacity-5 hover:bg-opacity-10'
                }`}
                style={selectedDifficulty === 'medium' ? { borderLeftColor: '#3b82f6' } : { borderLeftColor: 'transparent' }}
              >
                <div className="text-white font-light text-sm mb-1">Medium</div>
                <div className="text-white text-opacity-40 text-xs">$500M start • Normal</div>
              </button>
              <button
                onClick={() => setSelectedDifficulty('difficult')}
                className={`p-4 transition-all border-l-4 ${
                  selectedDifficulty === 'difficult'
                    ? 'bg-white bg-opacity-10'
                    : 'bg-white bg-opacity-5 hover:bg-opacity-10'
                }`}
                style={selectedDifficulty === 'difficult' ? { borderLeftColor: '#ef4444' } : { borderLeftColor: 'transparent' }}
              >
                <div className="text-white font-light text-sm mb-1">Difficult</div>
                <div className="text-white text-opacity-40 text-xs">$250M start • +50% costs</div>
              </button>
              <button
                onClick={() => setSelectedDifficulty('sandbox')}
                className={`p-4 transition-all border-l-4 ${
                  selectedDifficulty === 'sandbox'
                    ? 'bg-white bg-opacity-10'
                    : 'bg-white bg-opacity-5 hover:bg-opacity-10'
                }`}
                style={selectedDifficulty === 'sandbox' ? { borderLeftColor: '#a855f7' } : { borderLeftColor: 'transparent' }}
              >
                <div className="text-white font-light text-sm mb-1">Sandbox</div>
                <div className="text-white text-opacity-40 text-xs">Unlimited money</div>
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-opacity-30 w-4 h-4" />
            <input
              type="text"
              placeholder="Search for a city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white bg-opacity-5 text-white placeholder-white placeholder-opacity-30 border border-white border-opacity-10 rounded-sm focus:outline-none focus:border-opacity-30 transition-all font-light text-sm tracking-wide"
            />
          </div>

          {/* Continent Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 border-b border-white border-opacity-10 pb-4">
            <button
              onClick={() => setSelectedContinent('north-america')}
              className={`px-4 py-2 text-xs transition-all ${
                selectedContinent === 'north-america'
                  ? 'text-white border-b-2'
                  : 'text-white text-opacity-50 hover:text-opacity-70'
              }`}
              style={selectedContinent === 'north-america' ? { borderBottomColor: '#c90a43' } : {}}
            >
              North America (6)
            </button>
            <button
              onClick={() => setSelectedContinent('south-america')}
              className={`px-4 py-2 text-xs transition-all ${
                selectedContinent === 'south-america'
                  ? 'text-white border-b-2'
                  : 'text-white text-opacity-50 hover:text-opacity-70'
              }`}
              style={selectedContinent === 'south-america' ? { borderBottomColor: '#c90a43' } : {}}
            >
              South America (6)
            </button>
            <button
              onClick={() => setSelectedContinent('europe')}
              className={`px-4 py-2 text-xs transition-all ${
                selectedContinent === 'europe'
                  ? 'text-white border-b-2'
                  : 'text-white text-opacity-50 hover:text-opacity-70'
              }`}
              style={selectedContinent === 'europe' ? { borderBottomColor: '#c90a43' } : {}}
            >
              Europe (14)
            </button>
            <button
              onClick={() => setSelectedContinent('asia')}
              className={`px-4 py-2 text-xs transition-all ${
                selectedContinent === 'asia'
                  ? 'text-white border-b-2'
                  : 'text-white text-opacity-50 hover:text-opacity-70'
              }`}
              style={selectedContinent === 'asia' ? { borderBottomColor: '#c90a43' } : {}}
            >
              Asia (12)
            </button>
            <button
              onClick={() => setSelectedContinent('oceania')}
              className={`px-4 py-2 text-xs transition-all ${
                selectedContinent === 'oceania'
                  ? 'text-white border-b-2'
                  : 'text-white text-opacity-50 hover:text-opacity-70'
              }`}
              style={selectedContinent === 'oceania' ? { borderBottomColor: '#c90a43' } : {}}
            >
              Oceania (3)
            </button>
            <button
              onClick={() => setSelectedContinent('africa')}
              className={`px-4 py-2 text-xs transition-all ${
                selectedContinent === 'africa'
                  ? 'text-white border-b-2'
                  : 'text-white text-opacity-50 hover:text-opacity-70'
              }`}
              style={selectedContinent === 'africa' ? { borderBottomColor: '#c90a43' } : {}}
            >
              Africa (3)
            </button>
          </div>

          {/* City grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {filteredCities.map((city) => (
              <button
                key={`${city.name}-${city.country}`}
                onClick={() => handleCitySelect(city)}
                disabled={loading}
                className="bg-white bg-opacity-5 hover:bg-opacity-10 disabled:opacity-30 disabled:cursor-not-allowed border border-white border-opacity-10 rounded-sm p-8 transition-all group"
              >
                <MapPin className="w-6 h-6 text-white text-opacity-40 group-hover:text-opacity-100 mx-auto mb-4 transition-all" />
                <h3 className="text-white font-light text-lg tracking-wide mb-1">{city.name}</h3>
                <p className="text-white text-opacity-40 text-xs tracking-wider uppercase">{city.country}</p>
              </button>
            ))}
          </div>

          {loading && (
            <div className="mt-8 flex items-center justify-center space-x-3 text-white text-opacity-60">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-light text-sm tracking-wide">Loading city data...</span>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-white text-opacity-30 text-xs font-light tracking-wide">
          <p>Tip: Start with a smaller city to learn the mechanics</p>
        </div>
      </div>
    </div>
  )
}

// Helper function to create mock city data
/* function createMockCityData(city: City) {
  // Create a simple mock city with some buildings and roads
  const buildings = []
  const roads = []

  // Generate a grid of buildings
  for (let i = -5; i <= 5; i++) {
    for (let j = -5; j <= 5; j++) {
      if (Math.random() > 0.3) { // 70% chance of building
        buildings.push({
          type: 'Feature',
          properties: {
            building: Math.random() > 0.5 ? 'residential' : 'commercial',
            'building:levels': Math.floor(Math.random() * 10) + 2,
          },
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [city.lon + i * 0.001, city.lat + j * 0.001],
              [city.lon + (i + 0.8) * 0.001, city.lat + j * 0.001],
              [city.lon + (i + 0.8) * 0.001, city.lat + (j + 0.8) * 0.001],
              [city.lon + i * 0.001, city.lat + (j + 0.8) * 0.001],
              [city.lon + i * 0.001, city.lat + j * 0.001],
            ]],
          },
        })
      }
    }
  }

  // Generate some roads
  for (let i = -5; i <= 5; i++) {
    roads.push({
      type: 'Feature',
      properties: { highway: 'primary' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [city.lon + i * 0.001, city.lat - 5 * 0.001],
          [city.lon + i * 0.001, city.lat + 5 * 0.001],
        ],
      },
    })
    roads.push({
      type: 'Feature',
      properties: { highway: 'primary' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [city.lon - 5 * 0.001, city.lat + i * 0.001],
          [city.lon + 5 * 0.001, city.lat + i * 0.001],
        ],
      },
    })
  }

  return {
    type: 'FeatureCollection',
    features: [...buildings, ...roads],
  }
} */
