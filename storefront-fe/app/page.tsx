"use client"

import { useState, useEffect, Suspense, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { ChatInterface } from "@/components/chat-interface"
import { SearchInterface } from "@/components/search-interface"
import { BookingModal } from "@/components/booking-modal"
import { useBooking } from "@/contexts/booking-context"
import { useRecommendPanel } from "@/contexts/recommend-panel-context"

type MainTab = "chat" | "search"

function HomePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<MainTab>("chat")
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [newChatSignal, setNewChatSignal] = useState(0)
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false)
  const { setResults: setRecommendResults, clearResults: clearRecommendResults, showLocation } = useRecommendPanel()
  
  const {
    resetBooking, 
    setBookingType, 
    setSelectedFlight, 
    setSelectedHotel, 
    updateBookingData, 
    setStep,
    resumeBooking 
  } = useBooking()

  // Handle URL parameters
  useEffect(() => {
    const tab = searchParams.get("tab") as MainTab
    if (tab && (tab === "chat" || tab === "search")) {
      setActiveTab(tab)
    }

    const newChatParam = searchParams.get("new")
    if (newChatParam === "1") {
      setNewChatSignal((prev) => prev + 1)
      setConversationId(null)
      clearRecommendResults()

      const params = new URLSearchParams(searchParams.toString())
      params.delete("new")
      params.delete("conversationId")
      params.set("tab", "chat")
      router.replace(`/?${params.toString()}`, { scroll: false })
      return
    }

    const resumeBookingId = searchParams.get("resume")
    if (resumeBookingId) {
      const stored = sessionStorage.getItem('bookingResumePayload')
      const paramsClone = new URLSearchParams(searchParams.toString())
      paramsClone.delete("resume")
      router.replace(paramsClone.toString() ? `/?${paramsClone.toString()}` : '/', { scroll: false })

      if (stored) {
        try {
          const payload = JSON.parse(stored)
          void resumeBooking(payload).then(() => {
            setIsBookingModalOpen(true)
          })
        } catch (error) {
          console.error('Failed to resume booking from history', error)
        } finally {
          sessionStorage.removeItem('bookingResumePayload')
        }
      }
      return
    }

    const conversation = searchParams.get("conversationId")
    setConversationId(conversation)
  }, [router, searchParams, clearRecommendResults, resumeBooking])

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
      originLatitude: flight.originLatitude ?? flight.raw?.originLatitude,
      originLongitude: flight.originLongitude ?? flight.raw?.originLongitude,
      destinationLatitude: flight.destinationLatitude ?? flight.raw?.destinationLatitude,
      destinationLongitude: flight.destinationLongitude ?? flight.raw?.destinationLongitude,
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
      hotelLatitude: hotel.hotelLatitude ?? hotel.latitude ?? hotel.location?.latitude,
      hotelLongitude: hotel.hotelLongitude ?? hotel.longitude ?? hotel.location?.longitude,
      rating: hotel.rating,
    roomTypeId: room.roomTypeId,
    roomId: room.id,
    roomType: room.type,
    roomName: room.name,
    price: room.price,
    pricePerNight: room.price,
    totalPrice: room.price * (hotel.rooms ?? 1) * (hotel.nights ?? 1),
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

  const handleLocationClick = useCallback((location: { 
    lat: number; 
    lng: number; 
    title: string; 
    description?: string 
  }) => {
    console.log('📍 Location clicked:', location)
    showLocation(location)
  }, [showLocation])

  const handleSearchResults = useCallback((results: any[], type: string) => {
    console.log('🔍 Search results:', results, type)
    setRecommendResults(Array.isArray(results) ? results : [])
  }, [setRecommendResults])

  const handleConversationChange = useCallback((id: string | null) => {
    setConversationId(id)
  }, [])

  const tabs = [
    { id: "chat" as const, label: "Chat", icon: MessageCircle },
    { id: "search" as const, label: "Search", icon: Search },
  ]

  return (
    <>
      <main 
        className="flex-1 flex flex-col h-full min-w-0 overflow-hidden"
      >
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
              onConversationChange={handleConversationChange}
              newChatTrigger={newChatSignal}
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

      {/* Booking Modal */}
      <BookingModal 
        open={isBookingModalOpen} 
        onOpenChange={setIsBookingModalOpen}
      />
    </>
  )
}

export default function HomePage() {
  return (
    <Suspense 
      fallback={
        <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
          Loading...
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  )
}
