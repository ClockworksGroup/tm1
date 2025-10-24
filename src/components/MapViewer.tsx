import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useGameStore } from '../store/gameStore.ts'
import { useToast } from '../hooks/useToast.tsx'
import { useGameLoop } from '../hooks/useGameLoop'
import { Station, TransportLine, StationDepth } from '../types/game'
import { getTransportCharacteristics } from '../utils/gameLogic'
import StationPopup from './ui/StationPopup.tsx'
import DepthSelector from './DepthSelector.tsx'

export default function MapViewer() {
  // Start the game loop
  useGameLoop()
  const toast = useToast()
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<maplibregl.Map | null>(null)
  const { 
    cityCenter, 
    cityName, 
    selectedTool, 
    buildMode, 
    addStation, 
    addLine,
    lines,
    selectedLine,
    setSelectedTool,
    setBuildMode,
    updateLine 
  } = useGameStore()
  
  const [tempStations, setTempStations] = useState<Station[]>([])
  const markersRef = useRef<maplibregl.Marker[]>([])
  const lineLayerIdRef = useRef<string | null>(null)
  const isEditingRef = useRef(false)
  const [selectedStation, setSelectedStation] = useState<Station | null>(null)
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 })
  const [highlightedStationId, setHighlightedStationId] = useState<string | null>(null)
  const [showDepthSelector, setShowDepthSelector] = useState(false)
  const [pendingStationPosition, setPendingStationPosition] = useState<[number, number, number] | null>(null)

  useEffect(() => {
    if (!mapContainer.current) return
    
    // Remove existing map if city changed
    if (map.current) {
      map.current.remove()
      map.current = null
    }

    console.log('Initializing map for', cityName, 'at', cityCenter)

    // Use Maptiler Streets with 3D buildings
    const MAPTILER_KEY = 'get_your_own_OpIi9ZULNHzrESv6T2vL'
    
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`,
      center: [cityCenter[1], cityCenter[0]],
      zoom: 16,
      pitch: 60,
      bearing: 0,
      antialias: true as any, // Enable antialiasing for smooth 3D rendering
      fadeDuration: 0, // Disable fade for snappier feel
    } as any)

    // Apply minimal white/gray theme
    map.current.on('style.load', () => {
      if (!map.current) return

      const style = map.current.getStyle()
      const layers = style.layers || []
      
      layers.forEach(layer => {
        const layerId = layer.id.toLowerCase()
        
        // Buildings - BRIGHT WHITE
        if (layerId.includes('building')) {
          if (layer.type === 'fill-extrusion') {
            map.current?.setPaintProperty(layer.id, 'fill-extrusion-color', '#f8f8f8')
            map.current?.setPaintProperty(layer.id, 'fill-extrusion-opacity', 1.0)
          } else if (layer.type === 'fill') {
            map.current?.setPaintProperty(layer.id, 'fill-color', '#f8f8f8')
            map.current?.setPaintProperty(layer.id, 'fill-opacity', 1.0)
          }
        }
        
        // Roads - light gray
        if (layerId.includes('road') || layerId.includes('street') || layerId.includes('highway')) {
          if (layer.type === 'line') {
            map.current?.setPaintProperty(layer.id, 'line-color', '#d0d0d0')
            map.current?.setPaintProperty(layer.id, 'line-opacity', 1.0)
          }
        }
        
        // Water - WHITE (same as background)
        if (layerId.includes('water')) {
          if (layer.type === 'fill') {
            map.current?.setPaintProperty(layer.id, 'fill-color', '#ffffff')
          }
        }
        
        // ALL green/natural areas - dark gray (catch everything)
        if (layer.type === 'fill') {
          if (layerId.includes('park') || 
              layerId.includes('landuse') || 
              layerId.includes('landcover') || 
              layerId.includes('grass') || 
              layerId.includes('wood') ||
              layerId.includes('forest') ||
              layerId.includes('natural') ||
              layerId.includes('vegetation') ||
              layerId.includes('green')) {
            map.current?.setPaintProperty(layer.id, 'fill-color', '#888888')
            map.current?.setPaintProperty(layer.id, 'fill-opacity', 1.0)
          }
        }
        
        // Background - light gray
        if (layerId.includes('background')) {
          map.current?.setPaintProperty(layer.id, 'background-color', '#e8e8e8')
        }
        
        // Hide ALL labels and icons for ultra-clean look
        if (layer.type === 'symbol') {
          map.current?.setLayoutProperty(layer.id, 'visibility', 'none')
        }
      })
    })

    // Change cursor when in build mode
    const updateCursor = () => {
      if (map.current) {
        const canvas = map.current.getCanvas()
        if (buildMode && selectedTool) {
          canvas.style.cursor = 'crosshair'
        } else {
          canvas.style.cursor = ''
        }
      }
    }
    updateCursor()

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [cityCenter, cityName])

  // Handle Enter/ESC/Arrow keys in build mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!buildMode) return
      
      if (e.key === 'Enter' && tempStations.length >= 2) {
        // Finalize and create line
        createLine(tempStations)
      } else if (e.key === 'Escape') {
        // Cancel without creating
        cancelBuildMode()
      } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        // Pan map with arrow keys
        e.preventDefault()
        if (!map.current) return
        
        const panAmount = 100 // pixels to pan
        
        switch (e.key) {
          case 'ArrowUp':
            map.current.panBy([0, -panAmount])
            break
          case 'ArrowDown':
            map.current.panBy([0, panAmount])
            break
          case 'ArrowLeft':
            map.current.panBy([-panAmount, 0])
            break
          case 'ArrowRight':
            map.current.panBy([panAmount, 0])
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [buildMode, tempStations])

  // Load existing line stations when entering edit mode
  useEffect(() => {
    if (buildMode && selectedLine && selectedTool) {
      const line = lines.find(l => l.id === selectedLine)
      if (line && line.stations.length > 0) {
        // Load existing stations
        setTempStations([...line.stations])
        isEditingRef.current = true
        
        // Draw existing stations as markers with delete capability and drag-to-move
        line.stations.forEach((station) => {
          const el = document.createElement('div')
          el.className = 'station-marker'
          el.style.width = '24px'
          el.style.height = '24px'
          el.style.borderRadius = '50%'
          el.style.border = '3px solid white'
          el.style.cursor = 'pointer'
          el.style.boxShadow = '0 0 15px rgba(0,0,0,0.5)'
          el.style.transition = 'all 0.2s'
          
          const colors: Record<string, string> = {
            metro: '#3b82f6',
            train: '#22c55e',
            tram: '#eab308',
            bus: '#ef4444'
          }
          el.style.backgroundColor = selectedTool ? (colors[selectedTool] || '#ffffff') : '#ffffff'
          
          // Function to update highlight state
          const updateHighlight = (isHighlighted: boolean) => {
            if (isHighlighted) {
              el.style.width = '32px'
              el.style.height = '32px'
              el.style.border = '4px solid #fbbf24' // Yellow highlight
              el.style.boxShadow = '0 0 25px rgba(251, 191, 36, 0.8)'
              el.style.zIndex = '1000'
            } else {
              el.style.width = '24px'
              el.style.height = '24px'
              el.style.border = '3px solid white'
              el.style.boxShadow = '0 0 15px rgba(0,0,0,0.5)'
              el.style.zIndex = '1'
            }
          }
          
          // Click to select/highlight station
          el.addEventListener('click', (e) => {
            e.stopPropagation()
            
            // Don't select if shift is pressed (that's for dragging)
            if (e.shiftKey) return
            
            // Toggle selection
            if (highlightedStationId === station.id) {
              setHighlightedStationId(null)
            } else {
              setHighlightedStationId(station.id)
            }
          })
          
          // Update highlight when state changes
          const checkHighlight = () => {
            updateHighlight(highlightedStationId === station.id)
          }
          
          // Initial check
          checkHighlight()
          
          // Watch for changes (we'll need to re-render when highlightedStationId changes)
          const intervalId = setInterval(checkHighlight, 100)
          
          // Cleanup on unmount
          setTimeout(() => clearInterval(intervalId), 60000) // Clear after 1 minute max

          // Right-click to delete station
          el.addEventListener('contextmenu', (e) => {
            e.preventDefault()
            e.stopPropagation()
            
            if (tempStations.length <= 2) {
              toast.error('A line must have at least 2 stations')
              return
            }
            
            // Get current index from tempStations
            setTempStations(prev => {
              const stationId = station.id
              const currentIndex = prev.findIndex(s => s.id === stationId)
              if (currentIndex === -1) return prev
              
              const newStations = prev.filter((_, i) => i !== currentIndex)
              
              // Clear existing temp line
              if (lineLayerIdRef.current && map.current) {
                if (map.current.getLayer(lineLayerIdRef.current)) {
                  map.current.removeLayer(lineLayerIdRef.current)
                }
                if (map.current.getSource(lineLayerIdRef.current)) {
                  map.current.removeSource(lineLayerIdRef.current)
                }
                lineLayerIdRef.current = null
              }
              
              // Redraw line with new stations
              setTimeout(() => {
                if (newStations.length >= 2) {
                  drawTempLine(newStations)
                }
              }, 50)
              
              return newStations
            })
            
            // Remove the marker
            const markerIndex = markersRef.current.findIndex(m => m.getElement() === el)
            if (markerIndex !== -1) {
              markersRef.current[markerIndex].remove()
              markersRef.current.splice(markerIndex, 1)
            }
          })

          // Create marker - draggable only with Shift key
          const marker = new maplibregl.Marker({ 
            element: el,
            draggable: false // Start as non-draggable
          })
            .setLngLat([station.position[1], station.position[0]])
            .addTo(map.current!)

          // Track if shift is pressed
          let isShiftPressed = false
          
          const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Shift' && !isShiftPressed) {
              isShiftPressed = true
              marker.setDraggable(true)
              el.style.cursor = 'grab'
            }
          }
          
          const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'Shift') {
              isShiftPressed = false
              marker.setDraggable(false)
              el.style.cursor = 'pointer'
            }
          }
          
          window.addEventListener('keydown', handleKeyDown)
          window.addEventListener('keyup', handleKeyUp)

          // Handle drag start
          marker.on('dragstart', () => {
            el.style.cursor = 'grabbing'
          })

          // Handle drag end - update station position
          marker.on('dragend', () => {
            el.style.cursor = isShiftPressed ? 'grab' : 'pointer'
            const lngLat = marker.getLngLat()
            const stationId = station.id
            
            // Update the station position in tempStations
            setTempStations(prev => {
              const currentIndex = prev.findIndex(s => s.id === stationId)
              if (currentIndex === -1) return prev
              
              const newStations = [...prev]
              newStations[currentIndex] = {
                ...newStations[currentIndex],
                position: [lngLat.lat, lngLat.lng, newStations[currentIndex].position[2]]
              }
              
              // Clear existing temp line
              if (lineLayerIdRef.current && map.current) {
                if (map.current.getLayer(lineLayerIdRef.current)) {
                  map.current.removeLayer(lineLayerIdRef.current)
                }
                if (map.current.getSource(lineLayerIdRef.current)) {
                  map.current.removeSource(lineLayerIdRef.current)
                }
                lineLayerIdRef.current = null
              }
              
              // Redraw line with updated positions
              setTimeout(() => {
                if (newStations.length >= 2) {
                  drawTempLine(newStations)
                }
              }, 50)
              
              return newStations
            })
            
            console.log('Station dragged to:', lngLat.lat, lngLat.lng)
          })

          markersRef.current.push(marker)
        })
        
        // Draw the line
        if (line.stations.length >= 2) {
          drawTempLine(line.stations)
        }
      }
    } else if (!buildMode || !selectedTool) {
      clearTempStations()
      isEditingRef.current = false
      setHighlightedStationId(null)
    }
  }, [buildMode, selectedTool, selectedLine])

  // Track line IDs and station counts to detect when lines are added/removed/modified
  const lineSignatureRef = useRef<string>('')
  const hasInitialDrawn = useRef<boolean>(false)
  
  // Redraw lines when they change
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return
    
    // Create signature that includes line IDs and station counts
    const currentSignature = lines.map(l => `${l.id}:${l.stations.length}`).sort().join(',')
    
    // Always draw on first load, then only when signature changes
    if (!hasInitialDrawn.current || currentSignature !== lineSignatureRef.current) {
      lineSignatureRef.current = currentSignature
      hasInitialDrawn.current = true
      console.log('Drawing existing lines, count:', lines.length)
      
      // Clear all existing line layers before redrawing
      lines.forEach(l => {
        const lineId = `line-${l.id}`
        if (map.current?.getLayer(lineId)) {
          map.current.removeLayer(lineId)
        }
        if (map.current?.getSource(lineId)) {
          map.current.removeSource(lineId)
        }
      })
      
      drawExistingLines()
    }
  }, [lines, map.current?.isStyleLoaded()]) // Check on every update but only redraw if line signature changed or map loads

  // Handle map clicks - updates when buildMode or selectedTool changes
  useEffect(() => {
    if (!map.current) return

    const handleMapClick = async (e: maplibregl.MapMouseEvent) => {
      console.log('Map clicked!', { buildMode, selectedTool })
      if (!buildMode || !selectedTool) {
        console.log('Not in build mode or no tool selected')
        return
      }

      const { lng, lat } = e.lngLat
      
      // For metro/train, show depth selector first
      if (selectedTool === 'metro' || selectedTool === 'train') {
        setPendingStationPosition([lat, lng, 0])
        setShowDepthSelector(true)
        return
      }

      // For bus/tram, create station immediately at surface level
      createStationAtPosition([lat, lng, 0], 'surface', 0)
    }
    
    // Helper function to create station at a position with selected depth
    const createStationAtPosition = async (
      position: [number, number, number],
      depth: StationDepth,
      additionalCost: number
    ) => {
      const [lat, lng] = position
      const characteristics = getTransportCharacteristics(selectedTool!)
      
      // Create new station
      const stationId = `station-${Date.now()}`
      
      // Get street name for bus stations
      let stationName = `${selectedTool!.charAt(0).toUpperCase() + selectedTool!.slice(1)} Station ${tempStations.length + 1}`
      
      // For bus stations, try to get the street name
      if (selectedTool === 'bus') {
        const streetName = await getStreetName(lat, lng)
        if (streetName) {
          stationName = streetName
        }
      }
      
      // Calculate depth in meters for position
      const depthMeters = depth === 'surface' ? 0 : depth === 'shallow' ? -10 : depth === 'medium' ? -25 : -50
      
      const newStation: Station = {
        id: stationId,
        name: stationName,
        position: [lat, lng, depthMeters],
        type: selectedTool!,
        depth: depth,
        platforms: 2,
        platformLength: 150,
        capacity: characteristics.capacity,
        hasElevator: depth !== 'surface',
        hasEscalator: depth === 'deep' || depth === 'medium',
        hasRetail: false,
        passengers: 0,
        waitTime: 0,
        crowdingLevel: 0,
        constructionCost: (characteristics.baseCost * 0.1) + additionalCost,
        maintenanceCost: characteristics.baseCost * 0.002,
        retailRevenue: 0,
        cleanliness: 80,
        safety: 85,
        accessibility: depth === 'surface' ? 100 : depth === 'shallow' ? 80 : 70,
      }

      // Add marker to map
      const el = document.createElement('div')
      el.className = 'station-marker'
      el.style.width = '20px'
      el.style.height = '20px'
      el.style.borderRadius = '50%'
      el.style.border = '3px solid white'
      el.style.cursor = 'pointer'
      el.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)'
      
      const colors: Record<string, string> = {
        metro: '#3b82f6',
        train: '#22c55e',
        tram: '#eab308',
        bus: '#ef4444'
      }
      el.style.backgroundColor = selectedTool ? (colors[selectedTool] || '#ffffff') : '#ffffff'

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(map.current!)

      markersRef.current.push(marker)

      // Always append new stations at the end
      // User can reorder by dragging with Shift if needed
      const updatedStations = [...tempStations, newStation]
      
      setTempStations(updatedStations)

      console.log('Updated stations:', updatedStations.length)

      // Draw line between stations
      if (updatedStations.length >= 2) {
        console.log('Drawing temp line with', updatedStations.length, 'stations')
        drawTempLine(updatedStations)
      }
    }

    map.current.on('click', handleMapClick)

    return () => {
      if (map.current) {
        map.current.off('click', handleMapClick)
      }
    }
  }, [buildMode, selectedTool, tempStations])

  // Update cursor and map interaction when build mode changes
  useEffect(() => {
    if (map.current) {
      const canvas = map.current.getCanvas()
      if (buildMode && selectedTool) {
        // In edit mode, show move cursor for dragging stations, otherwise crosshair
        canvas.style.cursor = isEditingRef.current ? 'default' : 'crosshair'
        
        // Enable drag pan only when Shift is held
        let isShiftPressed = false
        
        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'Shift') {
            isShiftPressed = true
            canvas.style.cursor = 'grab'
            map.current?.dragPan.enable()
          }
        }
        
        const handleKeyUp = (e: KeyboardEvent) => {
          if (e.key === 'Shift') {
            isShiftPressed = false
            canvas.style.cursor = isEditingRef.current ? 'default' : 'crosshair'
            map.current?.dragPan.disable()
          }
        }
        
        const handleMouseDown = () => {
          if (isShiftPressed) {
            canvas.style.cursor = 'grabbing'
          }
        }
        
        const handleMouseUp = () => {
          if (isShiftPressed) {
            canvas.style.cursor = 'grab'
          }
        }
        
        window.addEventListener('keydown', handleKeyDown)
        window.addEventListener('keyup', handleKeyUp)
        canvas.addEventListener('mousedown', handleMouseDown)
        canvas.addEventListener('mouseup', handleMouseUp)
        
        // Initially disable drag pan
        map.current.dragPan.disable()
        // Keep scroll zoom enabled
        map.current.scrollZoom.enable()
        
        return () => {
          window.removeEventListener('keydown', handleKeyDown)
          window.removeEventListener('keyup', handleKeyUp)
          canvas.removeEventListener('mousedown', handleMouseDown)
          canvas.removeEventListener('mouseup', handleMouseUp)
        }
      } else {
        canvas.style.cursor = ''
        map.current.dragPan.enable()
      }
    }
  }, [buildMode, selectedTool])

  const createLine = (stations: Station[]) => {
    if (!selectedTool || stations.length < 2) return

    // If editing existing line, update it
    if (isEditingRef.current && selectedLine) {
      const line = lines.find(l => l.id === selectedLine)
      if (line) {
        // Update station positions in the global store
        const { updateStation } = useGameStore.getState()
        stations.forEach(station => {
          updateStation(station.id, { position: station.position })
        })
        
        // Update line with new stations
        updateLine(selectedLine, { stations: stations })
        
        // Force remove the old line layer
        const lineId = `line-${selectedLine}`
        if (map.current) {
          if (map.current.getLayer(lineId)) {
            map.current.removeLayer(lineId)
          }
          if (map.current.getSource(lineId)) {
            map.current.removeSource(lineId)
          }
        }
        
        // Clear temp stations and exit build mode
        clearTempStations()
        setSelectedTool(null)
        setBuildMode(false)
        isEditingRef.current = false
        
        // Force redraw after a short delay to ensure state is updated
        setTimeout(() => {
          if (map.current && map.current.isStyleLoaded()) {
            drawExistingLines()
          }
        }, 100)
        
        console.log('Updated line:', line.name, 'now has', stations.length, 'stations')
        toast.success(`${line.name} updated successfully`)
        return
      }
    }

    // Otherwise create new line
    const characteristics = getTransportCharacteristics(selectedTool)
    const lineId = `line-${Date.now()}`
    const lineNumber = lines.filter(l => l.type === selectedTool).length + 1
    
    // Generate unique color for each line of the same type with STRICT constraints
    const getUniqueLineColor = (type: string, lineNum: number): string => {
      const colorRanges = {
        // Metro: Blues and purples (200-280°)
        metro: {
          hueMin: 200,
          hueMax: 280,
          saturation: [70, 95],
          lightness: [45, 65]
        },
        // Bus: Reds (340-20°)
        bus: {
          hueMin: 340,
          hueMax: 380, // Will wrap around to 20
          saturation: [75, 95],
          lightness: [45, 65]
        },
        // Tram: Yellows and oranges (30-60°)
        tram: {
          hueMin: 30,
          hueMax: 60,
          saturation: [80, 100],
          lightness: [45, 60]
        },
        // Train: Greens (90-160°)
        train: {
          hueMin: 90,
          hueMax: 160,
          saturation: [60, 85],
          lightness: [40, 60]
        }
      }
      
      const range = colorRanges[type as keyof typeof colorRanges] || colorRanges.bus
      
      // Distribute lines evenly within the hue range
      const hueRange = range.hueMax - range.hueMin
      const hueStep = hueRange / Math.max(5, lineNum + 2) // Divide range by expected lines
      let h = range.hueMin + (lineNum - 1) * hueStep
      
      // Handle wrap-around for reds
      if (h >= 360) h = h % 360
      
      // Vary saturation and lightness slightly for distinction
      const satVariation = ((lineNum - 1) % 3) * 5
      const lightVariation = ((lineNum - 1) % 4) * 5
      
      const s = Math.min(range.saturation[1], range.saturation[0] + satVariation)
      const l = Math.min(range.lightness[1], range.lightness[0] + lightVariation)
      
      return `hsl(${Math.round(h)}, ${s}%, ${l}%)`
    }
    
    const lineColor = getUniqueLineColor(selectedTool, lineNumber)

    // Check which stations already exist (BEFORE creating the line)
    const existingStationIds = new Set(useGameStore.getState().stations.map(s => s.id))
    const newStationsCount = stations.filter(s => !existingStationIds.has(s.id)).length
    
    console.log('=== CREATING LINE ===')
    console.log('Total stations:', stations.length)
    console.log('Existing stations:', stations.filter(s => existingStationIds.has(s.id)).map(s => s.name))
    console.log('New stations:', stations.filter(s => !existingStationIds.has(s.id)).map(s => s.name))
    console.log('Cost will be:', characteristics.baseCost * newStationsCount)

    const newLine: TransportLine = {
      id: lineId,
      name: `${selectedTool.charAt(0).toUpperCase() + selectedTool.slice(1)} Line ${lineNumber}`,
      type: selectedTool,
      color: lineColor,
      stations: stations,
      isLoop: false,
      isBidirectional: true,
      frequency: 10,
      operatingHours: [5, 24],
      rushHourFrequency: 6,
      vehicles: [],
      vehicleCapacity: characteristics.capacity,
      averageSpeed: characteristics.baseSpeed,
      reliability: 100,
      loadFactor: 0,
      constructionCost: characteristics.baseCost * newStationsCount, // Only charge for NEW stations
      operatingCost: characteristics.operatingCost * stations.length,
      revenue: 0,
      fareboxRecovery: 0,
      phase: 'operational',
      constructionProgress: 100,
      constructionTimeRemaining: 0,
    }

    // Check if we can afford the line BEFORE adding stations
    const currentBalance = useGameStore.getState().economics.balance
    if (currentBalance < newLine.constructionCost) {
      toast.error(`Insufficient funds! Need $${(newLine.constructionCost / 1000000).toFixed(0)}M but only have $${(currentBalance / 1000000).toFixed(0)}M`)
      clearTempStations()
      setSelectedTool(null)
      setBuildMode(false)
      return
    }
    
    // Success notification
    toast.success(`${newLine.name} created successfully! ${newStationsCount} new stations added.`)
    
    // Add the line FIRST (this deducts money)
    console.log('Adding line to store:', newLine.name, 'ID:', newLine.id, 'Color:', newLine.color)
    addLine(newLine)
    
    // Only add NEW stations AFTER line is successfully added
    stations.forEach(station => {
      if (!existingStationIds.has(station.id)) {
        console.log('Adding new station:', station.name)
        addStation(station)
      } else {
        console.log('Station already exists, skipping:', station.name)
      }
    })
    
    console.log('Total lines after adding:', lines.length + 1)

    // Clear temp stations and exit build mode
    clearTempStations()
    setSelectedTool(null)
    setBuildMode(false)

    console.log('Created line:', newLine.name, 'with', stations.length, 'stations')
    
    // Force redraw after a short delay
    setTimeout(() => {
      console.log('Force redrawing lines')
      if (map.current && map.current.isStyleLoaded()) {
        drawExistingLines()
      }
    }, 100)
  }

  const drawExistingLines = () => {
    if (!map.current) return
    console.log('drawExistingLines called for', lines.length, 'lines')

    lines.forEach(async (line) => {
      if (line.stations.length < 2) {
        console.log('Skipping line', line.id, '- not enough stations')
        return
      }

      const lineId = `line-${line.id}`
      
      // Skip if already exists - don't redraw
      if (map.current!.getLayer(lineId)) {
        console.log('Line layer', lineId, 'already exists, skipping')
        return
      }

      console.log('Drawing line', lineId, 'with', line.stations.length, 'stations')

      // Create line coordinates with proper routing
      let coordinates: number[][]
      
      if (line.type === 'bus') {
        coordinates = await getStreetRoute(line.stations)
      } else {
        coordinates = getSmoothCurve(line.stations)
      }
      
      console.log('Got', coordinates.length, 'coordinates for line', lineId)

      // Add line source and layer
      console.log('Adding source and layer for', lineId)
      map.current!.addSource(lineId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: coordinates
          }
        }
      })

      map.current!.addLayer({
        id: lineId,
        type: 'line',
        source: lineId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': line.color,
          'line-width': 5,
          'line-opacity': 0.9
        }
      })
      
      console.log('Successfully added layer', lineId)

      // Add station markers for existing lines
      line.stations.forEach((station) => {
        const el = document.createElement('div')
        el.className = 'station-marker'
        el.style.width = '16px'
        el.style.height = '16px'
        el.style.borderRadius = '50%'
        el.style.border = '2px solid white'
        el.style.backgroundColor = line.color
        el.style.boxShadow = '0 0 8px rgba(0,0,0,0.4)'
        el.style.cursor = 'pointer'
        
        // Add click handler
        el.addEventListener('click', (e) => {
          e.stopPropagation()
          
          // Get current state from store
          const currentState = useGameStore.getState()
          const currentBuildMode = currentState.buildMode
          const currentTool = currentState.selectedTool
          
          console.log('Station clicked:', station.name, 'BuildMode:', currentBuildMode, 'Tool:', currentTool, 'Station type:', station.type)
          
          // If in build mode and same transport type, add to route
          if (currentBuildMode && currentTool === station.type) {
            console.log('Adding existing station to route:', station.name)
            
            // Check if not already in temp stations
            setTempStations(prev => {
              if (prev.find(s => s.id === station.id)) {
                console.log('Station already in route')
                return prev
              }
              
              const updatedStations = [...prev, station]
              
              // Draw line if we have enough stations
              if (updatedStations.length >= 2) {
                setTimeout(() => drawTempLine(updatedStations), 0)
              }
              
              return updatedStations
            })
          } else {
            // Otherwise show station info popup
            console.log('Showing station popup')
            const rect = el.getBoundingClientRect()
            setPopupPosition({ 
              x: rect.left + rect.width / 2, 
              y: rect.top 
            })
            setSelectedStation(station)
          }
        })

        // Create marker - NOT draggable by default
        new maplibregl.Marker({ element: el })
          .setLngLat([station.position[1], station.position[0]])
          .addTo(map.current!)
      })
    })
  }

  const drawTempLine = async (stations: Station[]) => {
    if (!map.current || stations.length < 2) return

    // Remove existing temp line
    if (lineLayerIdRef.current) {
      if (map.current.getLayer(lineLayerIdRef.current)) {
        map.current.removeLayer(lineLayerIdRef.current)
      }
      if (map.current.getSource(lineLayerIdRef.current)) {
        map.current.removeSource(lineLayerIdRef.current)
      }
    }

    const lineId = `temp-line-${Date.now()}`
    lineLayerIdRef.current = lineId

    // Color based on transport type
    const colors: Record<string, string> = {
      metro: '#3b82f6',
      train: '#22c55e',
      tram: '#eab308',
      bus: '#ef4444'
    }

    let coordinates: number[][]

    // For buses, use street routing
    if (selectedTool === 'bus') {
      coordinates = await getStreetRoute(stations)
    } else {
      // For metro/train/tram, use smooth curves
      coordinates = getSmoothCurve(stations)
    }

    // Add line source and layer
    map.current.addSource(lineId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: coordinates
        }
      }
    })

    map.current.addLayer({
      id: lineId,
      type: 'line',
      source: lineId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': colors[selectedTool!] || '#ffffff',
        'line-width': selectedTool === 'bus' ? 3 : 4,
        'line-opacity': 0.8
      }
    })
  }

  // Clear temporary stations and markers
  const clearTempStations = () => {
    // Remove all markers
    markersRef.current.forEach(marker => marker.remove())
    markersRef.current = []
    
    // Clear temp line
    if (lineLayerIdRef.current && map.current) {
      if (map.current.getLayer(lineLayerIdRef.current)) {
        map.current.removeLayer(lineLayerIdRef.current)
      }
      if (map.current.getSource(lineLayerIdRef.current)) {
        map.current.removeSource(lineLayerIdRef.current)
      }
      lineLayerIdRef.current = null
    }
    
    setTempStations([])
    setHighlightedStationId(null)
  }

  // Cancel build mode
  const cancelBuildMode = () => {
    clearTempStations()
    setBuildMode(false)
    isEditingRef.current = false
  }

  // Helper function to create station at a position with selected depth
  const createStationAtPosition = async (
    position: [number, number, number],
    depth: StationDepth,
    additionalCost: number
  ) => {
    if (!selectedTool || !map.current) return
    
    const [lat, lng] = position
    const characteristics = getTransportCharacteristics(selectedTool)
    
    // Create new station
    const stationId = `station-${Date.now()}`
    
    // Get street name for bus stations
    let stationName = `${selectedTool.charAt(0).toUpperCase() + selectedTool.slice(1)} Station ${tempStations.length + 1}`
    
    // For bus stations, try to get the street name
    if (selectedTool === 'bus') {
      const streetName = await getStreetName(lat, lng)
      if (streetName) {
        stationName = streetName
      }
    }
    
    // Calculate depth in meters for position
    const depthMeters = depth === 'surface' ? 0 : depth === 'shallow' ? -10 : depth === 'medium' ? -25 : -50
    
    const newStation: Station = {
      id: stationId,
      name: stationName,
      position: [lat, lng, depthMeters],
      type: selectedTool,
      depth: depth,
      platforms: 2,
      platformLength: 150,
      capacity: characteristics.capacity,
      hasElevator: depth !== 'surface',
      hasEscalator: depth === 'deep' || depth === 'medium',
      hasRetail: false,
      passengers: 0,
      waitTime: 0,
      crowdingLevel: 0,
      constructionCost: (characteristics.baseCost * 0.1) + additionalCost,
      maintenanceCost: characteristics.baseCost * 0.002,
      retailRevenue: 0,
      cleanliness: 80,
      safety: 85,
      accessibility: depth === 'surface' ? 100 : depth === 'shallow' ? 80 : 70,
    }

    // Add marker to map
    const el = document.createElement('div')
    el.className = 'station-marker'
    el.style.width = '20px'
    el.style.height = '20px'
    el.style.borderRadius = '50%'
    el.style.border = '3px solid white'
    el.style.cursor = 'pointer'
    el.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)'
    
    const colors: Record<string, string> = {
      metro: '#3b82f6',
      train: '#22c55e',
      tram: '#eab308',
      bus: '#ef4444'
    }
    el.style.backgroundColor = colors[selectedTool] || '#ffffff'

    const marker = new maplibregl.Marker({ element: el })
      .setLngLat([lng, lat])
      .addTo(map.current)

    markersRef.current.push(marker)

    // Always append new stations at the end
    const updatedStations = [...tempStations, newStation]
    setTempStations(updatedStations)

    console.log('Updated stations:', updatedStations.length)

    // Draw line between stations
    if (updatedStations.length >= 2) {
      console.log('Drawing temp line with', updatedStations.length, 'stations')
      drawTempLine(updatedStations)
    }
  }

  // Get street name from coordinates using reverse geocoding
  const getStreetName = async (lat: number, lng: number): Promise<string | null> => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'TransportMaster/1.0'
        }
      })
      const data = await response.json()
      
      if (data.address) {
        const { road, suburb, neighbourhood } = data.address
        
        // Create a descriptive name
        if (road && suburb) {
          return `${road} & ${suburb}`
        } else if (road) {
          return road
        } else if (neighbourhood) {
          return neighbourhood
        }
      }
      
      return null
    } catch (error) {
      console.error('Error fetching street name:', error)
      return null
    }
  }

  // Get street routing for buses using OSRM (Open Source Routing Machine)
  const getStreetRoute = async (stations: Station[]): Promise<number[][]> => {
    try {
      // Build waypoints string for OSRM API
      const waypoints = stations
        .map(s => `${s.position[1]},${s.position[0]}`)
        .join(';')
      
      // Use public OSRM demo server (for production, host your own or use Mapbox)
      const url = `https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=full&geometries=geojson`
      
      const response = await fetch(url)
      const data = await response.json()
      
      if (data.code === 'Ok' && data.routes && data.routes[0]) {
        // Return the route geometry coordinates
        return data.routes[0].geometry.coordinates
      } else {
        console.warn('OSRM routing failed, falling back to straight line')
        return getFallbackRoute(stations)
      }
    } catch (error) {
      console.error('Error fetching street route:', error)
      return getFallbackRoute(stations)
    }
  }

  // Fallback to straight line if routing fails
  const getFallbackRoute = (stations: Station[]): number[][] => {
    const coordinates: number[][] = []
    
    for (let i = 0; i < stations.length; i++) {
      const station = stations[i]
      coordinates.push([station.position[1], station.position[0]])
      
      // Add intermediate points
      if (i < stations.length - 1) {
        const nextStation = stations[i + 1]
        const steps = 5
        
        for (let j = 1; j < steps; j++) {
          const t = j / steps
          const lng = station.position[1] + (nextStation.position[1] - station.position[1]) * t
          const lat = station.position[0] + (nextStation.position[0] - station.position[0]) * t
          coordinates.push([lng, lat])
        }
      }
    }
    
    return coordinates
  }

  // Get smooth curve for metro/train/tram using Catmull-Rom spline
  const getSmoothCurve = (stations: Station[]): number[][] => {
    if (stations.length === 2) {
      // Just two points, return straight line
      return stations.map(s => [s.position[1], s.position[0]])
    }

    const coordinates: number[][] = []
    const points = stations.map(s => [s.position[1], s.position[0]])
    
    // Add first point
    coordinates.push(points[0])
    
    // Generate smooth curve through middle points
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)]
      const p1 = points[i]
      const p2 = points[i + 1]
      const p3 = points[Math.min(points.length - 1, i + 2)]
      
      // Generate curve segments
      const segments = 10
      for (let t = 0; t < segments; t++) {
        const u = t / segments
        const point = catmullRom(p0, p1, p2, p3, u)
        coordinates.push(point)
      }
    }
    
    // Add last point
    coordinates.push(points[points.length - 1])
    
    return coordinates
  }

  // Catmull-Rom spline interpolation
  const catmullRom = (
    p0: number[], 
    p1: number[], 
    p2: number[], 
    p3: number[], 
    t: number
  ): number[] => {
    const t2 = t * t
    const t3 = t2 * t
    
    const v0 = (p2[0] - p0[0]) * 0.5
    const v1 = (p3[0] - p1[0]) * 0.5
    const lng = (2 * p1[0] - 2 * p2[0] + v0 + v1) * t3 +
                (-3 * p1[0] + 3 * p2[0] - 2 * v0 - v1) * t2 +
                v0 * t + p1[0]
    
    const v0y = (p2[1] - p0[1]) * 0.5
    const v1y = (p3[1] - p1[1]) * 0.5
    const lat = (2 * p1[1] - 2 * p2[1] + v0y + v1y) * t3 +
                (-3 * p1[1] + 3 * p2[1] - 2 * v0y - v1y) * t2 +
                v0y * t + p1[1]
    
    return [lng, lat]
  }

  return (
    <>
      <div 
        ref={mapContainer} 
        className="w-full h-full"
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      
      {/* Station Popup */}
      {selectedStation && (
        <StationPopup 
          station={selectedStation} 
          onClose={() => setSelectedStation(null)}
          position={popupPosition}
        />
      )}
      
      {/* Build Mode Overlay Indicator */}
      {buildMode && selectedTool && (
        <div className="absolute top-4 right-4 pointer-events-none z-30">
          <div className="bg-black bg-opacity-80 backdrop-blur-md rounded px-6 py-4 border border-white border-opacity-20">
            <div className="text-right">
              <div className="text-white text-opacity-40 text-xs uppercase tracking-widest mb-2">
                {isEditingRef.current ? 'Edit Mode' : 'Build Mode'}
              </div>
              <div className="text-white font-light text-lg tracking-wide mb-2">
                {isEditingRef.current ? 'Add/Edit Stations' : 'Click to Place Station'}
              </div>
              <div className="text-white text-opacity-60 text-sm">
                {tempStations.length} station{tempStations.length !== 1 ? 's' : ''} 
                {isEditingRef.current ? ' on route' : ' placed'}
                {tempStations.length < 2 && ` • Need ${2 - tempStations.length} more`}
                {tempStations.length >= 2 && ' • Press Enter to save'}
              </div>
              {isEditingRef.current && (
                <div className="text-white text-opacity-40 text-xs mt-2">
                  Shift+drag to move stations • Right-click to delete
                </div>
              )}
              <div className="text-white text-opacity-40 text-xs mt-1">
                Click to add at end • Arrow keys to pan • Esc to cancel
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Depth Selector for metro/train stations */}
      {showDepthSelector && pendingStationPosition && (
        <DepthSelector
          position={pendingStationPosition}
          onSelect={(depth, cost) => {
            createStationAtPosition(pendingStationPosition, depth, cost)
            setShowDepthSelector(false)
            setPendingStationPosition(null)
          }}
          onCancel={() => {
            setShowDepthSelector(false)
            setPendingStationPosition(null)
          }}
        />
      )}
    </>
  )
}
