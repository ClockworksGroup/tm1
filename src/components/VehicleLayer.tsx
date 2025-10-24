import { useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import { useGameStore } from '../store/gameStore'
import { vehicleSimulator } from '../utils/vehicleSimulation'

interface VehicleLayerProps {
  map: maplibregl.Map | null
}

/**
 * Renders moving vehicles on the map
 */
export default function VehicleLayer({ map }: VehicleLayerProps) {
  const vehicleStates = useGameStore(state => state.vehicleStates)
  const vehicles = useGameStore(state => state.vehicles)
  const lines = useGameStore(state => state.lines)
  const vehicleMarkersRef = useRef<Map<string, maplibregl.Marker>>(new Map())

  useEffect(() => {
    if (!map) return

    const updateVehicleMarkers = () => {
      const vehicles = useGameStore.getState().vehicles
      const lines = useGameStore.getState().lines
      const vehicleStates = vehicleSimulator.getAllStates()
      
      if (vehicles.length > 0) {
        console.log(`[VehicleLayer] Rendering ${vehicles.length} vehicles`)
      }
      // Remove markers for vehicles that no longer exist
      vehicleMarkersRef.current.forEach((marker, vehicleId) => {
        if (!vehicles.find(v => v.id === vehicleId)) {
          marker.remove()
          vehicleMarkersRef.current.delete(vehicleId)
        }
      })

      // Update or create markers for each vehicle
      vehicles.forEach(vehicle => {
        const state = vehicleStates.get(vehicle.id)
        if (!state) {
          console.warn(`[VehicleLayer] No state for vehicle ${vehicle.id}`)
          return
        }

        const line = lines.find(l => l.id === state.lineId)
        if (!line) {
          console.warn(`[VehicleLayer] No line found for vehicle ${vehicle.id}`)
          return
        }

        // Get current position
        const position = vehicleSimulator.getVehiclePosition(vehicle.id, line)
        if (!position) {
          console.warn(`[VehicleLayer] No position for vehicle ${vehicle.id}`)
          return
        }
        
        console.log(`[VehicleLayer] Vehicle ${vehicle.id} at position:`, position, `-> [${position[1]}, ${position[0]}]`)

        let marker = vehicleMarkersRef.current.get(vehicle.id)

        if (!marker) {
          // Create new marker
          const el = document.createElement('div')
          el.className = 'vehicle-marker'
          el.style.width = '16px'
          el.style.height = '16px'
          el.style.borderRadius = '50%'
          el.style.backgroundColor = line.color
          el.style.border = '2px solid white'
          el.style.boxShadow = '0 0 8px rgba(0,0,0,0.5)'
          el.style.cursor = 'pointer'
          el.style.transition = 'all 0.1s ease-out'
          el.style.zIndex = '100'

          // Add vehicle type icon/indicator
          const icon = getVehicleIcon(vehicle.type)
          el.innerHTML = `<div style="
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: white;
            font-weight: bold;
          ">${icon}</div>`

          // Click handler to show vehicle info
          el.addEventListener('click', (e) => {
            e.stopPropagation()
            showVehicleInfo(vehicle, state, line)
          })

          marker = new maplibregl.Marker({ element: el })
            .setLngLat([position[1], position[0]])
            .addTo(map)

          vehicleMarkersRef.current.set(vehicle.id, marker)
        } else {
          // Update existing marker position
          marker.setLngLat([position[1], position[0]])
          
          // Update visual state based on vehicle status
          const el = marker.getElement()
          if (state.status === 'stopped' || state.status === 'boarding') {
            el.style.transform = 'scale(1.2)'
          } else {
            el.style.transform = 'scale(1)'
          }
        }
      })
    }

    // Update markers every frame
    const animationFrame = requestAnimationFrame(function animate() {
      updateVehicleMarkers()
      requestAnimationFrame(animate)
    })

    return () => {
      cancelAnimationFrame(animationFrame)
      // Clean up all markers
      vehicleMarkersRef.current.forEach(marker => marker.remove())
      vehicleMarkersRef.current.clear()
    }
  }, [map, vehicles, vehicleStates, lines])

  return null // This component doesn't render anything directly
}

/**
 * Get icon for vehicle type
 */
function getVehicleIcon(type: string): string {
  const icons: Record<string, string> = {
    metro: 'M',
    bus: 'B',
    tram: 'T',
    train: 'R'
  }
  return icons[type] || '?'
}

/**
 * Show vehicle information popup
 */
function showVehicleInfo(vehicle: any, state: any, line: any) {
  console.log('Vehicle Info:', {
    id: vehicle.id,
    type: vehicle.type,
    line: line.name,
    status: state.status,
    passengers: state.passengers,
    nextStation: state.nextStationId,
    delay: state.delay
  })
  
  // TODO: Create a proper vehicle info popup component
  alert(`
    Vehicle: ${vehicle.model || vehicle.type}
    Line: ${line.name}
    Status: ${state.status}
    Passengers: ${state.passengers}/${vehicle.capacity}
    Delay: ${state.delay}s
  `)
}
