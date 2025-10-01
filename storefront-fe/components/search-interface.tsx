"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Plane, Hotel, List, Map as MapIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { FlightSearchTab } from "@/components/search/flight-search-tab"
import { HotelSearchTab } from "@/components/search/hotel-search-tab"
import SearchMap from "@/components/search-map"
import { 
  destinationsToMapLocations, 
  flightsToMapLocations, 
  hotelsToMapLocations 
} from "@/lib/map-utils"
import type { FlightSearchResult } from "@/modules/flight/type"
import type { HotelSearchResult } from "@/modules/hotel/type"
import type { DestinationSearchResult } from "@/types/common"

type SearchTab = "flights" | "hotels"
type ViewMode = "list" | "map"

export function SearchInterface() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<SearchTab>("flights")
  const [viewMode, setViewMode] = useState<ViewMode>("list")
  
  // Search results state
  const [flightResults, setFlightResults] = useState<FlightSearchResult[]>([])
  const [hotelResults, setHotelResults] = useState<HotelSearchResult[]>([])
  const [destinationResults, setDestinationResults] = useState<DestinationSearchResult[]>([])

  // Handle URL parameters for searchTab
  useEffect(() => {
    const searchTab = searchParams.get("searchTab") as SearchTab
    const view = searchParams.get("view") as ViewMode
    
    if (searchTab && (searchTab === "flights" || searchTab === "hotels")) {
      setActiveTab(searchTab)
    } else {
      // Default to flights if no searchTab or invalid searchTab
      setActiveTab("flights")
      // Update URL to include default searchTab
      const params = new URLSearchParams(searchParams.toString())
      params.set("tab", "search")
      params.set("searchTab", "flights")
      router.replace(`/?${params.toString()}`, { scroll: false })
    }

    if (view && (view === "list" || view === "map")) {
      setViewMode(view)
    }
  }, [searchParams, router])

  const handleSearchTabChange = (tab: SearchTab) => {
    setActiveTab(tab)
    // Update URL without refreshing the page
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", "search")
    params.set("searchTab", tab)
    
    router.replace(`/?${params.toString()}`, { scroll: false })
  }

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
    // Update URL without refreshing the page
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", "search")
    params.set("searchTab", activeTab)
    params.set("view", mode)
    
    router.replace(`/?${params.toString()}`, { scroll: false })
  }

  // Mock data for demonstration - in real app, this would come from search results
  useEffect(() => {
    // Mock flight data
    if (activeTab === "flights") {
      setFlightResults([
        {
          flightId: "1",
          airline: "Vietnam Airlines",
          flightNumber: "VN234",
          origin: "SGN",
          destination: "HAN",
          departureTime: "08:00",
          arrivalTime: "10:15",
          duration: "2h 15m",
          price: 1500000,
          currency: "VND",
          formattedPrice: "1,500,000 VND",
          seatClass: "Economy",
          availableSeats: 12,
          aircraft: "Airbus A321"
        },
        {
          flightId: "2",
          airline: "Jetstar",
          flightNumber: "BL345",
          origin: "SGN",
          destination: "DAD",
          departureTime: "14:30",
          arrivalTime: "16:00",
          duration: "1h 30m",
          price: 890000,
          currency: "VND",
          formattedPrice: "890,000 VND",
          seatClass: "Economy",
          availableSeats: 8,
          aircraft: "Airbus A320"
        }
      ])
    }
    
    // Mock hotel data
    if (activeTab === "hotels") {
      setHotelResults([
        {
          hotelId: "h1",
          name: "Sheraton Saigon Hotel",
          address: "88 Dong Khoi Street, District 1",
          city: "ho chi minh city",
          rating: 5,
          pricePerNight: 2500000,
          currency: "VND",
          availableRooms: [
            {
              roomTypeId: "rt1",
              roomId: "r1",
              roomType: "Deluxe Room",
              capacity: 2,
              pricePerNight: 2500000,
              amenities: ["WiFi", "Air conditioning", "Mini bar"],
              available: true
            }
          ],
          amenities: ["Pool", "Spa", "Gym", "Restaurant"],
          images: ["/hotel1.jpg"],
          primaryImage: "/hotel1.jpg"
        },
        {
          hotelId: "h2",
          name: "InterContinental Hanoi Westlake",
          address: "5 Tu Hoa Street, Tay Ho District",
          city: "hanoi",
          rating: 5,
          pricePerNight: 3200000,
          currency: "VND",
          availableRooms: [
            {
              roomTypeId: "rt2",
              roomId: "r2",
              roomType: "Lake View Room",
              capacity: 2,
              pricePerNight: 3200000,
              amenities: ["WiFi", "Lake view", "Balcony"],
              available: true
            }
          ],
          amenities: ["Pool", "Spa", "Multiple restaurants"],
          images: ["/hotel2.jpg"],
          primaryImage: "/hotel2.jpg"
        }
      ])
    }
  }, [activeTab])

  // Handlers for receiving search results from child components
  const handleFlightResults = (results: FlightSearchResult[]) => {
    setFlightResults(results)
  }

  const handleHotelResults = (results: HotelSearchResult[]) => {
    setHotelResults(results)
  }

  const handleDestinationResults = (results: DestinationSearchResult[]) => {
    setDestinationResults(results)
  }

  const searchTabs = [
    { id: "flights" as const, label: "Flights", icon: Plane },
    { id: "hotels" as const, label: "Stays", icon: Hotel },
  ]

  const viewModes = [
    { id: "list" as const, label: "List", icon: List },
    { id: "map" as const, label: "Map", icon: MapIcon },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Search Tab Navigation */}
      <div className="flex items-center justify-between p-4 bg-background border-b">
        {/* Search Type Tabs */}
        <div className="flex bg-muted rounded-lg p-1">
          {searchTabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => handleSearchTabChange(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                  activeTab === tab.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* View Mode Toggle */}
        <div className="flex bg-muted rounded-lg p-1">
          {viewModes.map((mode) => {
            const Icon = mode.icon
            return (
              <button
                key={mode.id}
                onClick={() => handleViewModeChange(mode.id)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                  viewMode === mode.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {mode.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Search Content */}
      <div className="flex-1 overflow-hidden bg-background">
        {viewMode === "list" && (
          <>
            {activeTab === "flights" && <FlightSearchTab />}
            {activeTab === "hotels" && <HotelSearchTab />}
          </>
        )}
        {viewMode === "map" && (
          <div className="h-full">
            <SearchMap 
              className="h-full"
              locations={
                activeTab === "flights" 
                  ? flightsToMapLocations(flightResults)
                  : activeTab === "hotels"
                  ? hotelsToMapLocations(hotelResults)
                  : destinationsToMapLocations(destinationResults)
              }
              showToggle={false}
              defaultExpanded={true}
            />
          </div>
        )}
      </div>
    </div>
  )
}
