"use client"

import React, { useState, useEffect } from "react"
import { Map as MapIcon, Compass, MapPin, Search, TrendingUp, Calendar, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { aiChatService } from "@/modules/ai/service/ai-chat"
import { usePreferences } from "@/contexts/preferences-context"
import { env } from "@/env.mjs"

interface RecommendPanelProps {
  results?: any[]
  className?: string
  externalLocation?: { lat: number; lng: number; title: string; description?: string } | null
  onExternalLocationHandled?: () => void
}

type TabMode = "explore" | "map"

interface LocationData {
  lng: number
  lat: number
  title: string
  description?: string
  index: number
}

export interface RecommendPanelRef {
  showLocationOnMap: (location: { lat: number; lng: number; title: string; description?: string }) => void
}

export const RecommendPanel = React.forwardRef<RecommendPanelRef, RecommendPanelProps>(
  ({ results = [], className, externalLocation, onExternalLocationHandled }, ref) => {
    const { locationInfo } = usePreferences()
    const [activeTab, setActiveTab] = useState<TabMode>("explore")
    const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null)
    const [selectedLocationIndex, setSelectedLocationIndex] = useState<number>(0)
    const [markers, setMarkers] = useState<mapboxgl.Marker[]>([])
    const [externalMarker, setExternalMarker] = useState<mapboxgl.Marker | null>(null)
    const mapContainerRef = React.useRef<HTMLDivElement>(null)
    
    // Explore tab state
    const [exploreQuery, setExploreQuery] = useState("")
    const [exploreResults, setExploreResults] = useState<any[]>([])
    const [exploreLoading, setExploreLoading] = useState(false)
    const [exploreMessage, setExploreMessage] = useState("")

  // Extract coordinates from results
  const extractCoordinates = (): LocationData[] => {
    const coords: LocationData[] = []
    
    results.forEach((result, index) => {
      // Check for coordinates in metadata
      if (result.metadata?.coordinates) {
        const coordStr = result.metadata.coordinates
        const [lat, lng] = coordStr.split(',').map((s: string) => parseFloat(s.trim()))
        if (!isNaN(lat) && !isNaN(lng)) {
          coords.push({
            lng,
            lat,
            title: result.title || 'Location',
            description: result.subtitle || result.metadata?.location,
            index
          })
        }
      }
      
      // Check for direct lat/lng fields
      else if (result.latitude && result.longitude) {
        coords.push({
          lng: parseFloat(result.longitude),
          lat: parseFloat(result.latitude),
          title: result.title || 'Location',
          description: result.subtitle || result.description,
          index
        })
      }
      
      // Check for location string that might contain coordinates
      else if (result.metadata?.location) {
        const locationStr = result.metadata.location
        // Try to extract coordinates from location string
        const coordMatch = locationStr.match(/(-?\d+\.?\d*),\s*(-?\d+\.?\d*)/)
        if (coordMatch) {
          const lat = parseFloat(coordMatch[1])
          const lng = parseFloat(coordMatch[2])
          if (!isNaN(lat) && !isNaN(lng)) {
            coords.push({
              lng,
              lat,
              title: result.title || 'Location',
              description: result.subtitle || locationStr,
              index
            })
          }
        }
      }
    })
    
    return coords
  }

  // Handle card click to navigate to location on map
  const handleCardClick = (index: number) => {
    const locations = extractCoordinates()
    const location = locations.find(loc => loc.index === index)
    
    if (location && mapInstance) {
      // Switch to map tab if not already there
      if (activeTab !== 'map') {
        setActiveTab('map')
      }
      
      setSelectedLocationIndex(index)
      
      // Fly to the location
      mapInstance.flyTo({
        center: [location.lng, location.lat],
        zoom: 15,
        duration: 1500,
        essential: true
      })
      
      // Update markers to highlight selected one
      updateMarkers(locations, index)
    }
  }

  // Explore destinations handlers
  const handleExploreSearch = async () => {
    if (!exploreQuery.trim()) return
    
    setExploreLoading(true)
    setExploreMessage("")
    
    try {
      // Get user's country from location info
      const userCountry = locationInfo?.country
      const response = await aiChatService.exploreDestinations(exploreQuery, userCountry)
      
      // Parse response - expecting { message, results } structure
      if (response.aiResponse) {
        try {
          const parsed = JSON.parse(response.aiResponse)
          setExploreMessage(parsed.message || "")
          setExploreResults(parsed.results || [])
        } catch {
          // If not JSON, treat as plain message
          setExploreMessage(response.aiResponse)
          setExploreResults([])
        }
      }
    } catch (error) {
      console.error("Explore search error:", error)
      setExploreMessage("Xin lỗi, không thể tìm kiếm địa điểm lúc này.")
      setExploreResults([])
    } finally {
      setExploreLoading(false)
    }
  }

  const handleTrendingClick = async () => {
    setExploreLoading(true)
    setExploreMessage("")
    setExploreQuery("Trending destinations")
    
    try {
      // Get user's country from location info
      const userCountry = locationInfo?.country
      const response = await aiChatService.getTrendingDestinations(userCountry)
      
      if (response.aiResponse) {
        try {
          const parsed = JSON.parse(response.aiResponse)
          setExploreMessage(parsed.message || "")
          setExploreResults(parsed.results || [])
        } catch {
          setExploreMessage(response.aiResponse)
          setExploreResults([])
        }
      }
    } catch (error) {
      console.error("Trending error:", error)
      setExploreMessage("Xin lỗi, không thể tải địa điểm thịnh hành.")
      setExploreResults([])
    } finally {
      setExploreLoading(false)
    }
  }

  const handleSeasonalClick = async () => {
    setExploreLoading(true)
    setExploreMessage("")
    setExploreQuery("Seasonal destinations")
    
    try {
      // Determine current season based on month
      const month = new Date().getMonth() + 1
      let season = "summer"
      if (month >= 3 && month <= 5) season = "spring"
      else if (month >= 6 && month <= 8) season = "summer"
      else if (month >= 9 && month <= 11) season = "fall"
      else season = "winter"
      
      // Get user's country from location info
      const userCountry = locationInfo?.country
      const response = await aiChatService.getSeasonalDestinations(season, userCountry)
      
      if (response.aiResponse) {
        try {
          const parsed = JSON.parse(response.aiResponse)
          setExploreMessage(parsed.message || "")
          setExploreResults(parsed.results || [])
        } catch {
          setExploreMessage(response.aiResponse)
          setExploreResults([])
        }
      }
    } catch (error) {
      console.error("Seasonal error:", error)
      setExploreMessage("Xin lỗi, không thể tải gợi ý theo mùa.")
      setExploreResults([])
    } finally {
      setExploreLoading(false)
    }
  }

  const handleExploreCardClick = (index: number) => {
    const location = exploreResults[index]
    if (location?.metadata?.latitude && location?.metadata?.longitude) {
      setActiveTab('map')
      setSelectedLocationIndex(index)
      
      if (mapInstance) {
        mapInstance.flyTo({
          center: [location.metadata.longitude, location.metadata.latitude],
          zoom: 15,
          duration: 1500,
          essential: true
        })
        
        // Update markers for explore results
        const exploreLocations: LocationData[] = exploreResults.map((r, i) => ({
          lng: r.metadata?.longitude || 0,
          lat: r.metadata?.latitude || 0,
          title: r.title || '',
          description: r.subtitle || '',
          index: i
        })).filter(l => l.lat !== 0 && l.lng !== 0)
        
        updateMarkers(exploreLocations, index)
      }
    }
  }

  // Update markers with selection state
  const updateMarkers = (locations: LocationData[], selectedIndex: number) => {
    // Clear existing markers
    markers.forEach(marker => marker.remove())
    
    if (!mapInstance) return
    
    const newMarkers: mapboxgl.Marker[] = []
    
    locations.forEach((coord) => {
      const isSelected = coord.index === selectedIndex
      
      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <h3 class="font-semibold text-sm mb-1">${coord.title}</h3>
          ${coord.description ? `<p class="text-xs text-gray-600">${coord.description}</p>` : ''}
        </div>
      `)

      // Create marker with different styling for selected/unselected
      const markerElement = document.createElement('div')
      markerElement.className = 'custom-marker'
      markerElement.style.width = isSelected ? '40px' : '30px'
      markerElement.style.height = isSelected ? '40px' : '30px'
      markerElement.style.backgroundImage = 'url(https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png)'
      markerElement.style.backgroundSize = '100%'
      markerElement.style.cursor = 'pointer'
      markerElement.style.borderRadius = '50%'
      markerElement.style.border = isSelected ? '3px solid #3B82F6' : '2px solid #64748B'
      markerElement.style.backgroundColor = isSelected ? '#3B82F6' : '#E2E8F0'
      markerElement.style.transition = 'all 0.3s ease'
      
      const marker = new mapboxgl.Marker({ 
        element: markerElement,
        anchor: 'center'
      })
        .setLngLat([coord.lng, coord.lat])
        .setPopup(popup)
        .addTo(mapInstance)
      
      // Add click handler to marker
      markerElement.addEventListener('click', () => {
        setSelectedLocationIndex(coord.index)
        updateMarkers(locations, coord.index)
        
        // Open popup automatically
        popup.addTo(mapInstance)
      })
      
      // Auto-open popup for selected marker
      if (isSelected) {
        popup.addTo(mapInstance)
      }
      
      newMarkers.push(marker)
    })
    
    setMarkers(newMarkers)
  }

  // Expose imperative handle for parent components
  React.useImperativeHandle(ref, () => ({
    showLocationOnMap: (location: { lat: number; lng: number; title: string; description?: string }) => {
      // Switch to map tab
      setActiveTab('map')
      
      // Wait for map to be ready
      setTimeout(() => {
        if (mapInstance) {
          // Clear external marker if exists
          if (externalMarker) {
            externalMarker.remove()
          }
          
          // Fly to location
          mapInstance.flyTo({
            center: [location.lng, location.lat],
            zoom: 15,
            duration: 1500,
            essential: true
          })
          
          // Create popup
          const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="p-2">
              <h3 class="font-semibold text-sm mb-1">${location.title}</h3>
              ${location.description ? `<p class="text-xs text-gray-600">${location.description}</p>` : ''}
            </div>
          `)
          
          // Create marker element
          const markerElement = document.createElement('div')
          markerElement.className = 'external-marker'
          markerElement.style.width = '45px'
          markerElement.style.height = '45px'
          markerElement.style.backgroundImage = 'url(https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png)'
          markerElement.style.backgroundSize = '100%'
          markerElement.style.cursor = 'pointer'
          markerElement.style.borderRadius = '50%'
          markerElement.style.border = '4px solid #EF4444'
          markerElement.style.backgroundColor = '#EF4444'
          markerElement.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'
          markerElement.style.animation = 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          
          // Create and add marker
          const marker = new mapboxgl.Marker({
            element: markerElement,
            anchor: 'center'
          })
            .setLngLat([location.lng, location.lat])
            .setPopup(popup)
            .addTo(mapInstance)
          
          // Auto-open popup
          popup.addTo(mapInstance)
          
          setExternalMarker(marker)
        }
      }, 100)
    }
  }))

  // Handle external location prop changes
  useEffect(() => {
    if (externalLocation && mapInstance) {
      // Clear external marker if exists
      if (externalMarker) {
        externalMarker.remove()
      }
      
      // Switch to map tab
      setActiveTab('map')
      
      // Fly to location
      mapInstance.flyTo({
        center: [externalLocation.lng, externalLocation.lat],
        zoom: 15,
        duration: 1500,
        essential: true
      })
      
      // Create popup
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <h3 class="font-semibold text-sm mb-1">${externalLocation.title}</h3>
          ${externalLocation.description ? `<p class="text-xs text-gray-600">${externalLocation.description}</p>` : ''}
        </div>
      `)
      
      // Create marker element with red styling
      const markerElement = document.createElement('div')
      markerElement.className = 'external-marker'
      markerElement.style.width = '45px'
      markerElement.style.height = '45px'
      markerElement.style.backgroundImage = 'url(https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png)'
      markerElement.style.backgroundSize = '100%'
      markerElement.style.cursor = 'pointer'
      markerElement.style.borderRadius = '50%'
      markerElement.style.border = '4px solid #EF4444'
      markerElement.style.backgroundColor = '#EF4444'
      markerElement.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)'
      
      // Create and add marker
      const marker = new mapboxgl.Marker({
        element: markerElement,
        anchor: 'center'
      })
        .setLngLat([externalLocation.lng, externalLocation.lat])
        .setPopup(popup)
        .addTo(mapInstance)
      
      // Auto-open popup
      popup.addTo(mapInstance)
      
      setExternalMarker(marker)
      
      // Notify parent that location has been handled
      onExternalLocationHandled?.()
    }
  }, [externalLocation, mapInstance])

  // Initialize Mapbox
  useEffect(() => {
    if (activeTab !== "map" || !mapContainerRef.current) return
    if (mapInstance) return // Don't re-initialize if map already exists

    // Get API key from environment variables
    const apiKey = env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if (!apiKey) {
      console.error('❌ Mapbox API key not found. Please set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in your environment variables.')
      return
    }

    console.log('🗺️ Initializing Mapbox with token:', apiKey.substring(0, 10) + '...')
    mapboxgl.accessToken = apiKey

    const coordinates = extractCoordinates()
    
    // Default center (Da Nang, Vietnam)
    const defaultCenter: [number, number] = [108.2022, 16.0544]
    const center = coordinates.length > 0 
      ? [coordinates[selectedLocationIndex]?.lng || coordinates[0].lng, coordinates[selectedLocationIndex]?.lat || coordinates[0].lat] as [number, number]
      : defaultCenter

    console.log('🗺️ Creating map with center:', center, 'coordinates:', coordinates.length)

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: center,
      zoom: coordinates.length > 0 ? 15 : 11
    })

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-right')

    map.on('load', () => {
      console.log('✅ Mapbox loaded successfully')
      setMapInstance(map)
      
      // Initial marker setup
      if (coordinates.length > 0) {
        updateMarkers(coordinates, selectedLocationIndex)
      }
    })

    map.on('error', (e) => {
      console.error('❌ Mapbox error:', e)
    })

    return () => {
      console.log('🗺️ Cleaning up map instance')
      markers.forEach(marker => marker.remove())
      setMarkers([])
      if (map) {
        map.remove()
      }
      setMapInstance(null)
    }
  }, [activeTab])
  
  // Update markers when results change
  useEffect(() => {
    if (mapInstance && activeTab === 'map') {
      const coordinates = extractCoordinates()
      console.log('🗺️ Updating markers for', coordinates.length, 'locations')
      
      if (coordinates.length > 0) {
        updateMarkers(coordinates, selectedLocationIndex)
        
        // Fit bounds if multiple locations
        if (coordinates.length > 1) {
          const bounds = new mapboxgl.LngLatBounds()
          coordinates.forEach(coord => {
            bounds.extend([coord.lng, coord.lat])
          })
          mapInstance.fitBounds(bounds, { padding: 50, duration: 1000 })
        }
      }
    }
  }, [results, exploreResults, mapInstance, activeTab])

  // Update selected location when it changes
  useEffect(() => {
    if (mapInstance && activeTab === 'map') {
      const coordinates = extractCoordinates()
      const selectedLocation = coordinates.find(loc => loc.index === selectedLocationIndex)
      
      if (selectedLocation) {
        mapInstance.flyTo({
          center: [selectedLocation.lng, selectedLocation.lat],
          zoom: 15,
          duration: 1000,
          essential: true
        })
        
        updateMarkers(coordinates, selectedLocationIndex)
      }
    }
  }, [selectedLocationIndex, mapInstance, activeTab])

  const tabs = [
    { id: "explore" as const, label: "Khám phá", icon: Compass },
    { id: "map" as const, label: "Bản đồ", icon: MapIcon },
  ]

  return (
    <div className={cn("flex flex-col h-full bg-white", className)}>
      {/* Tab Navigation */}
      <div className="flex items-center border-b bg-white px-4 py-2">
        <div className="flex bg-gray-100 rounded-lg p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                  activeTab === tab.id
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "explore" && (
          <div className="h-full flex flex-col">
            {/* Explore Search Bar */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="Tìm kiếm điểm đến... (VD: bãi biển đẹp ở Việt Nam)"
                  value={exploreQuery}
                  onChange={(e) => setExploreQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleExploreSearch()}
                  disabled={exploreLoading}
                  className="flex-1"
                />
                <Button 
                  onClick={handleExploreSearch}
                  disabled={exploreLoading || !exploreQuery.trim()}
                  size="icon"
                >
                  {exploreLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTrendingClick}
                  disabled={exploreLoading}
                  className="flex-1"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Thịnh hành
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSeasonalClick}
                  disabled={exploreLoading}
                  className="flex-1"
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  Theo mùa
                </Button>
              </div>
            </div>

            {/* Explore Results */}
            <div className="flex-1 overflow-y-auto p-4">
              {exploreLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-blue-600" />
                    <p className="text-sm text-gray-600">Đang tìm kiếm điểm đến...</p>
                  </div>
                </div>
              ) : exploreResults.length === 0 && !exploreMessage ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Compass className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm">Khám phá điểm đến mới</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Tìm kiếm hoặc chọn Thịnh hành / Theo mùa
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {exploreMessage && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                      <p className="text-sm text-blue-900">{exploreMessage}</p>
                    </div>
                  )}
                  
                  {exploreResults.map((result, index) => {
                    const hasLocation = !!(result.metadata?.latitude && result.metadata?.longitude)
                    
                    return (
                      <Card 
                        key={index} 
                        className={cn(
                          "p-4 transition-all duration-200",
                          hasLocation && "cursor-pointer hover:shadow-md hover:border-blue-300"
                        )}
                        onClick={() => hasLocation && handleExploreCardClick(index)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-sm text-gray-900">{result.title}</h3>
                              {hasLocation && (
                                <MapPin className="h-4 w-4 text-blue-600 shrink-0 ml-2" />
                              )}
                            </div>
                            {result.subtitle && (
                              <p className="text-xs text-gray-600 mb-2">{result.subtitle}</p>
                            )}
                            {result.metadata?.highlights && Array.isArray(result.metadata.highlights) && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {result.metadata.highlights.map((highlight: string, i: number) => (
                                  <span key={i} className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                    {highlight}
                                  </span>
                                ))}
                              </div>
                            )}
                            {result.metadata?.best_time && (
                              <p className="text-xs text-gray-500 mt-2">
                                <Calendar className="h-3 w-3 inline mr-1" />
                                Thời gian tốt nhất: {result.metadata.best_time}
                              </p>
                            )}
                            {result.metadata?.estimated_cost && (
                              <p className="text-xs text-gray-500 mt-1">
                                💰 Chi phí ước tính: {result.metadata.estimated_cost}
                              </p>
                            )}
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Chat Results (from parent) */}
        {activeTab === "explore" && results.length > 0 && exploreResults.length === 0 && !exploreLoading && (
          <div className="h-full overflow-y-auto p-4">
            {results.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Compass className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm">Chưa có kết quả để hiển thị</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Hãy chat với AI để khám phá địa điểm thú vị
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {results.map((result, index) => {
                  const hasLocation = !!(
                    result.metadata?.coordinates || 
                    (result.latitude && result.longitude) ||
                    result.metadata?.location
                  )
                  const isSelected = index === selectedLocationIndex
                  
                  return (
                    <Card 
                      key={index} 
                      className={cn(
                        "p-4 transition-all duration-200",
                        hasLocation && "cursor-pointer hover:shadow-md hover:border-blue-300",
                        isSelected && hasLocation && "border-blue-500 shadow-md bg-blue-50/50"
                      )}
                      onClick={() => hasLocation && handleCardClick(index)}
                    >
                      <div className="flex items-start gap-3">
                        {result.imageUrl && (
                          <img
                            src={result.imageUrl}
                            alt={result.title}
                            className="w-20 h-20 rounded-lg object-cover shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-semibold text-sm text-gray-900 truncate flex-1">
                              {result.title}
                            </h3>
                            {hasLocation && (
                              <MapPin className={cn(
                                "h-4 w-4 shrink-0",
                                isSelected ? "text-blue-600" : "text-gray-400"
                              )} />
                            )}
                          </div>
                          {result.subtitle && (
                            <p className="text-xs text-gray-600 mb-2">{result.subtitle}</p>
                          )}
                          {result.description && (
                            <p className="text-xs text-gray-500 line-clamp-2">{result.description}</p>
                          )}
                          <div className="mt-2 flex flex-wrap gap-2 items-center">
                            {result.metadata?.category && (
                              <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                                {result.metadata.category}
                              </span>
                            )}
                            {hasLocation && isSelected && (
                              <span className="inline-block px-2 py-1 bg-green-50 text-green-700 text-xs rounded font-medium">
                                Hiển thị trên bản đồ
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "map" && (
          <div className="h-full w-full relative">
            {extractCoordinates().length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500 bg-gray-50">
                <div className="text-center p-4">
                  <MapIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm font-medium">Không có vị trí để hiển thị</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Kết quả không chứa thông tin tọa độ
                  </p>
                </div>
              </div>
            ) : (
              <div ref={mapContainerRef} className="h-full w-full" />
            )}
          </div>
        )}
      </div>
    </div>
  )
})

RecommendPanel.displayName = 'RecommendPanel'
