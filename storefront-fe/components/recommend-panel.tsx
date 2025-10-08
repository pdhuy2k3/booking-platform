"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { Map as MapIcon, Compass, MapPin, Search, TrendingUp, Calendar, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { aiChatService } from "@/modules/ai/service/ai-chat"
import { usePreferences } from "@/contexts/preferences-context"
import { MapboxMap, type MapLocation } from "@/components/mapbox-map"
import Image from "next/image"

interface RecommendPanelProps {
  results?: any[]
  className?: string
  externalLocation?: { lat: number; lng: number; title: string; description?: string } | null
  onExternalLocationHandled?: () => void
  onWidthChange?: (width: number) => void
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
  ({ results = [], className, externalLocation, onExternalLocationHandled, onWidthChange }, ref) => {
    const { locationInfo } = usePreferences()
    const [activeTab, setActiveTab] = useState<TabMode>("explore")
    const [selectedLocationIndex, setSelectedLocationIndex] = useState<number>(0)
    const [mapCenter, setMapCenter] = useState<[number, number]>([108.2022, 16.0544]) // Da Nang default
    const [mapZoom, setMapZoom] = useState<number>(12)
    const [externalLocationState, setExternalLocationState] = useState<MapLocation | null>(null)
    const [isExpanded, setIsExpanded] = useState<boolean>(true)
    const [panelWidth, setPanelWidth] = useState<number>(0) // 0 means use default CSS width
    const [isResizing, setIsResizing] = useState<boolean>(false)
    
    const panelRef = useRef<HTMLDivElement>(null)
    const MIN_WIDTH = 280 // 280px minimum
    const MAX_WIDTH = 600 // 600px maximum
    
    // Explore tab state
    const [exploreQuery, setExploreQuery] = useState("")
    const [exploreResults, setExploreResults] = useState<any[]>([])
    const [exploreLoading, setExploreLoading] = useState(false)
    const [exploreMessage, setExploreMessage] = useState("")

    // Convert results to MapLocation format
    const mapLocations = React.useMemo((): MapLocation[] => {
      if (activeTab === "map" && results.length > 0) {
        return extractCoordinatesFromResults(results)
      }
      
      if (activeTab === "explore" && exploreResults.length > 0) {
        return extractCoordinatesFromExplore(exploreResults)
      }
      
      return []
    }, [activeTab, results, exploreResults])

    // Handle external location from prop
    const externalLocationFromProp = React.useMemo(() => {
      if (externalLocation) {
        return {
          id: `external-${Date.now()}`,
          name: externalLocation.title,
          latitude: externalLocation.lat,
          longitude: externalLocation.lng,
          description: externalLocation.description || '',
          type: 'custom' as const
        }
      }
      return null
    }, [externalLocation])

    // Add external location to map locations
    const allLocations = React.useMemo(() => {
      const locations = [...mapLocations]
      if (externalLocationFromProp) {
        locations.push(externalLocationFromProp)
      }
      if (externalLocationState) {
        locations.push(externalLocationState)
      }
      return locations
    }, [mapLocations, externalLocationFromProp, externalLocationState])

    // Helper functions to extract coordinates
    function extractCoordinatesFromResults(results: any[]): MapLocation[] {
      const locations: MapLocation[] = []
      let idCounter = 0
      
      results.forEach((result, index) => {
        if (result.hotels?.length > 0) {
          result.hotels.forEach((hotel: any) => {
            if (hotel.latitude && hotel.longitude) {
              locations.push({
                id: `hotel-${hotel.id || idCounter++}`,
                name: hotel.name,
                latitude: parseFloat(hotel.latitude),
                longitude: parseFloat(hotel.longitude),
                description: hotel.address,
                type: 'hotel'
              })
            }
          })
        }
        
        if (result.flights?.length > 0) {
          result.flights.forEach((flight: any) => {
            if (flight.departureAirport?.latitude && flight.departureAirport?.longitude) {
              locations.push({
                id: `dep-${flight.departureAirport.id || idCounter++}`,
                name: flight.departureAirport.name,
                latitude: parseFloat(flight.departureAirport.latitude),
                longitude: parseFloat(flight.departureAirport.longitude),
                description: `${flight.departureAirport.code} - Departure`,
                type: 'airport'
              })
            }
            
            if (flight.arrivalAirport?.latitude && flight.arrivalAirport?.longitude) {
              locations.push({
                id: `arr-${flight.arrivalAirport.id || idCounter++}`,
                name: flight.arrivalAirport.name,
                latitude: parseFloat(flight.arrivalAirport.latitude),
                longitude: parseFloat(flight.arrivalAirport.longitude),
                description: `${flight.arrivalAirport.code} - Arrival`,
                type: 'airport'
              })
            }
          })
        }
      })
      
      return locations
    }

    function extractCoordinatesFromExplore(exploreData: any[]): MapLocation[] {
      const locations: MapLocation[] = []
      let idCounter = 0
      
      // The exploreData is actually the results array from the API response
      exploreData.forEach((item) => {
        // Check if item has metadata with coordinates directly (new structure)
        if (item.metadata?.latitude && item.metadata?.longitude) {
          locations.push({
            id: `explore-${item.id || idCounter++}`,
            name: item.title || item.name,
            latitude: parseFloat(item.metadata.latitude),
            longitude: parseFloat(item.metadata.longitude),
            description: item.subtitle || item.metadata?.highlights?.[0] || item.description,
            type: 'destination'
          })
        }
        // Legacy structure - check for destinations array
        else if (item.destinations?.length > 0) {
          item.destinations.forEach((dest: any) => {
            if (dest.coordinates?.latitude && dest.coordinates?.longitude) {
              locations.push({
                id: `explore-${dest.id || idCounter++}`,
                name: dest.name,
                latitude: dest.coordinates.latitude,
                longitude: dest.coordinates.longitude,
                description: dest.metadata?.highlights?.[0] || dest.description,
                type: 'destination'
              })
            }
          })
        }
      })
      
      return locations
    }

  // Handle card click to navigate to location on map
  const handleCardClick = (index: number) => {
    const location = allLocations[index]
    
    if (location) {
      // Switch to map tab if not already there
      if (activeTab !== 'map') {
        setActiveTab('map')
      }
      
      setSelectedLocationIndex(index)
      setMapCenter([location.longitude, location.latitude])
      setMapZoom(15)
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
      
      setExploreMessage(response.message || "")
      setExploreResults(response.results || [])
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
      
      setExploreMessage(response.message || "")
      setExploreResults(response.results || [])
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
      
      setExploreMessage(response.message || "")
      setExploreResults(response.results || [])
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
      setMapCenter([location.metadata.longitude, location.metadata.latitude])
      setMapZoom(15)
    }
  }

  // Expose imperative handle for parent components
  React.useImperativeHandle(ref, () => ({
    showLocationOnMap: (location: { lat: number; lng: number; title: string; description?: string }) => {
      console.log('🗺️ showLocationOnMap called with:', location)
      
      // Switch to map tab
      setActiveTab('map')
      setMapCenter([location.lng, location.lat])
      setMapZoom(15)
      
      // Set external location state
      setExternalLocationState({
        id: `external-${Date.now()}`,
        name: location.title,
        latitude: location.lat,
        longitude: location.lng,
        description: location.description || '',
        type: 'custom'
      })
    }
  }))

  // Handle external location prop changes
  useEffect(() => {
    if (externalLocation) {
      // Switch to map tab
      setActiveTab('map')
      setMapCenter([externalLocation.lng, externalLocation.lat])
      setMapZoom(15)
      
      // Set external location state for map
      setExternalLocationState({
        id: `external-${Date.now()}`,
        name: externalLocation.title,
        latitude: externalLocation.lat,
        longitude: externalLocation.lng,
        description: externalLocation.description || '',
        type: 'custom'
      })
      
      // Notify parent that location has been handled
      onExternalLocationHandled?.()
    }
  }, [externalLocation, onExternalLocationHandled])

  // Load default explore destinations on component mount
  useEffect(() => {
    const loadDefaultDestinations = async () => {
      if (exploreResults.length > 0) return // Don't reload if we already have data
      
      setExploreLoading(true)
      setExploreMessage("")
      
      try {
        // Load default destinations for Vietnam (cached)
        const response = await aiChatService.getDefaultDestinations()
        
        console.log("🎯 Default destinations response:", response)
        setExploreMessage(response.message || "Gợi ý điểm đến cho bạn")
        setExploreResults(response.results || [])
        console.log("📍 Set exploreResults:", response.results || [])
      } catch (error) {
        console.error("Default destinations error:", error)
        setExploreMessage("Chào mừng! Sử dụng tìm kiếm hoặc nút Thịnh hành để khám phá điểm đến.")
        setExploreResults([])
      } finally {
        setExploreLoading(false)
      }
    }

    // Only load on mount and when we're on explore tab
    if (activeTab === "explore") {
      loadDefaultDestinations()
    }
  }, [activeTab]) // Dependencies: tab change only

  // Handle resize
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing || !panelRef.current) return
      
      const containerRect = panelRef.current.getBoundingClientRect()
      const newWidth = containerRect.right - e.clientX
      
      // Clamp width between MIN and MAX
      const clampedWidth = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, newWidth))
      setPanelWidth(clampedWidth)
      onWidthChange?.(clampedWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'ew-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing, onWidthChange])

  const tabs = [
    { id: "explore" as const, label: "Khám phá", icon: Compass },
    { id: "map" as const, label: "Bản đồ", icon: MapIcon },
  ]

  return (
    <div 
      ref={panelRef}
      className={cn(
        "flex flex-col h-full bg-white relative transition-all",
        !isExpanded && "w-0 overflow-hidden",
        isExpanded && !isResizing && "duration-300",
        className
      )}
      style={isExpanded && panelWidth > 0 ? { width: `${panelWidth}px` } : undefined}
    >
      {/* Resize Handle */}
      {isExpanded && (
        <div
          onMouseDown={handleMouseDown}
          className={cn(
            "absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize z-40 hover:bg-blue-500 transition-colors",
            isResizing && "bg-blue-500"
          )}
          style={{ marginLeft: '-2px' }}
        />
      )}
      {/* Expand/Collapse Button */}
      <button
        onClick={() => {
          setIsExpanded(!isExpanded)
          if (!isExpanded) {
            // Reset to default width when expanding
            setPanelWidth(0)
          }
        }}
        className={cn(
          "absolute top-1/2 -translate-y-1/2 z-50 bg-white border border-gray-300 rounded-l-lg shadow-md hover:shadow-lg transition-all duration-200 hover:bg-gray-50",
          isExpanded ? "-left-8 border-r-0" : "-left-8"
        )}
        style={{ width: '32px', height: '64px' }}
        aria-label={isExpanded ? "Thu gọn panel" : "Mở rộng panel"}
      >
        <div className="flex items-center justify-center h-full">
          {isExpanded ? (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="text-gray-600"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          ) : (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="text-gray-600"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          )}
        </div>
      </button>

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
                  
                  {/* Debug info */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
                      Debug: {exploreResults.length} results found
                    </div>
                  )}
                  
                  {exploreResults.map((result, index) => {
                    console.log("🏷️ Rendering explore result:", index, result)
                    const hasLocation = !!(result.metadata?.latitude && result.metadata?.longitude)
                    // Extract image URL from multiple possible sources
                    const imageUrl = result.imageUrl || 
                                   result.metadata?.image_url || 
                                   result.metadata?.imageUrl || 
                                   result.metadata?.image || 
                                   result.metadata?.thumbnail
                    
                    console.log("🖼️ Image URL found:", imageUrl)
                    
                    return (
                      <Card 
                        key={index} 
                        className={cn(
                          "overflow-hidden transition-all duration-200",
                          hasLocation && "cursor-pointer hover:shadow-md hover:border-blue-300"
                        )}
                        onClick={() => hasLocation && handleExploreCardClick(index)}
                      >
                        {imageUrl && (
                          <div className="w-full h-40 overflow-hidden">
                            <Image 
                              src={imageUrl} 
                              alt={result.title}
                              width={400}
                              height={160}
                              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                // Hide image if it fails to load
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <h3 className="font-semibold text-base text-gray-900">{result.title}</h3>
                                {hasLocation && (
                                  <MapPin className="h-4 w-4 text-blue-600 shrink-0 ml-2" />
                                )}
                              </div>
                              {result.subtitle && (
                                <p className="text-sm text-gray-600 mb-2">{result.subtitle}</p>
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
                          <Image
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
            {/* MapboxMap component */}
            <MapboxMap
              className="h-full w-full"
              locations={allLocations}
              center={mapCenter}
              zoom={mapZoom}
              showControls={true}
              height="100%"
              onLocationClick={(location) => {
                console.log('Map location clicked:', location)
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
})

RecommendPanel.displayName = 'RecommendPanel'
