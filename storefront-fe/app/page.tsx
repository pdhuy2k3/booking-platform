"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { ChatInterface } from "@/components/chat-interface"
import { SearchInterface } from "@/components/search-interface"
import { RecommendPanel, RecommendPanelRef } from "@/components/recommend-panel"
import { BookingModal } from "@/components/booking-modal"
import { useBooking } from "@/contexts/booking-context"

type MainTab = "chat" | "search"

export default function HomePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<MainTab>("chat")
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const [aiResults, setAiResults] = useState<any[]>([])
  const recommendPanelRef = useRef<RecommendPanelRef>(null)
  
  const { 
    resetBooking, 
    setBookingType, 
    setSelectedFlight, 
    setSelectedHotel, 
    updateBookingData, 
    setStep 
  } = useBooking()

  // Handle URL parameters
  useEffect(() => {
    const tab = searchParams.get("tab") as MainTab
    if (tab && (tab === "chat" || tab === "search")) {
      setActiveTab(tab)
    }
    const conversation = searchParams.get("conversationId")
    setConversationId(conversation)
  }, [searchParams])

  const handleTabChange = (tab: MainTab) => {
    setActiveTab(tab)
    // Update URL without refreshing the page
    const params = new URLSearchParams()
    params.set("tab", tab)

    if (tab === "search") {
      // When switching to search tab, default to flights if no searchTab exists
      const currentSearchTab = searchParams.get("searchTab")
      if (!currentSearchTab || (currentSearchTab !== "flights" && currentSearchTab !== "hotels")) {
        params.set("searchTab", "flights")
      } else {
        params.set("searchTab", currentSearchTab)
      }
    }
    if (tab === "chat" && conversationId) {
      params.set("conversationId", conversationId)
    }
    // Don't add searchTab parameter for chat tab
    
    router.replace(`/?${params.toString()}`, { scroll: false })
  }

  const handleFlightBook = (flight: any) => {
    // Reset previous booking
    resetBooking()
    
    // Set booking type to flight
    setBookingType('flight')
    
    // Set selected flight with all required fields
    setSelectedFlight({
      id: flight.id,
      flightNumber: flight.flightNumber,
      airline: flight.airline,
      origin: flight.origin,
      destination: flight.destination,
      departureTime: flight.departureTime,
      arrivalTime: flight.arrivalTime,
      duration: flight.duration,
      price: flight.price,
      currency: flight.currency,
      seatClass: flight.seatClass,
      logo: flight.logo,
      scheduleId: flight.scheduleId,
      fareId: flight.fareId,
    })
    
    // Update booking data
    updateBookingData({ bookingType: 'FLIGHT' })
    
    // Set step to passengers
    setStep('passengers')
    
    // Open booking modal
    setIsBookingModalOpen(true)
  }

  const handleHotelBook = (hotel: any, room: any) => {
    // Reset previous booking
    resetBooking()
    
    // Set booking type to hotel
    setBookingType('hotel')
    
    // Set selected hotel with room details
    setSelectedHotel({
      id: hotel.id,
      name: hotel.name,
      address: hotel.address,
      city: hotel.city,
      country: hotel.country,
      rating: hotel.rating,
      roomTypeId: room.roomTypeId,
      roomId: room.id,
      roomType: room.type,
      roomName: room.name,
      price: room.price,
      currency: hotel.currency || 'VND',
      amenities: room.amenities,
      image: hotel.image,
      checkInDate: hotel.checkInDate,
      checkOutDate: hotel.checkOutDate,
      guests: hotel.guests,
      rooms: hotel.rooms,
      nights: hotel.nights,
    })
    
    // Update booking data
    updateBookingData({ bookingType: 'HOTEL' })
    
    // Set step to passengers
    setStep('passengers')
    
    // Open booking modal
    setIsBookingModalOpen(true)
  }

  const handleLocationClick = (location: { 
    lat: number; 
    lng: number; 
    title: string; 
    description?: string 
  }) => {
    console.log('📍 Location clicked:', location)
    recommendPanelRef.current?.showLocationOnMap(location)
  }

  const handleSearchResults = (results: any[], type: string) => {
    console.log('🔍 Search results:', results, type)
    setAiResults(results)
  }

  const tabs = [
    { id: "chat" as const, label: "Chat", icon: MessageCircle },
    { id: "search" as const, label: "Search", icon: Search },
  ]

  return (
    <>
      <main className="flex-1 flex flex-col h-full w-full md:w-[60%] overflow-hidden">
        {/* Main Tab Navigation */}
        <div className="flex items-center justify-center p-4 border-b border-border shrink-0">
          <div className="flex bg-muted rounded-full p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 md:px-6 py-2 rounded-full text-sm font-medium transition-all duration-200",
                    activeTab === tab.id
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === "chat" && (
            <ChatInterface
              onSearchResults={handleSearchResults}
              onStartBooking={() => {}}
              onChatStart={() => {}}
              conversationId={conversationId}
              onFlightBook={handleFlightBook}
              onHotelBook={handleHotelBook}
              onLocationClick={handleLocationClick}
            />
          )}
          {activeTab === "search" && (
            <SearchInterface />
          )}
        </div>
      </main>

      {/* Recommend Panel - Right */}
      <aside className="hidden md:flex w-full md:w-[30%] h-full border-l flex-col overflow-hidden">
        <RecommendPanel 
          ref={recommendPanelRef}
          results={aiResults}
        />
      </aside>

      {/* Booking Modal */}
      <BookingModal 
        open={isBookingModalOpen} 
        onOpenChange={setIsBookingModalOpen}
      />
    </>
  )
}
