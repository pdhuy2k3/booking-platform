"use client"

import { useState, useRef } from "react"
import { Sidebar } from "@/components/sidebar"
import { ChatInterface } from "@/components/chat-interface"
import { BookingModal } from "@/components/booking-modal"
import { WelcomeScreen } from "@/components/welcome-screen"
import dynamic from "next/dynamic"

const ProfilePage = dynamic(() => import("./profile/page"), { ssr: false })
const BookingManagementPage = dynamic(() => import("./bookings/page"), { ssr: false })
const FlightsPage = dynamic(() => import("./flights/page"), { ssr: false })
const HotelsPage = dynamic(() => import("./hotels/page"), { ssr: false })

export default function TravelBookingPage() {
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [showBookingFlow, setShowBookingFlow] = useState(false)
  const [bookingType, setBookingType] = useState<"flight" | "hotel" | "both">("flight")
  const [chatStarted, setChatStarted] = useState(false)
  const [currentView, setCurrentView] = useState("Chat")
  const chatInterfaceRef = useRef<any>(null)

  const handleItemSelect = (item: any) => {
    console.log("[v0] Item selected for modal:", item)
    setSelectedItem(item)
  }

  const handleCloseModal = () => {
    setSelectedItem(null)
  }

  const handleStartBooking = (type: "flight" | "hotel" | "both") => {
    setBookingType(type)
    setShowBookingFlow(true)
  }

  const handleSearchResults = (results: any[], type: string) => {
    if (results.length === 1) {
      setSelectedItem(results[0])
    }
    console.log("[v0] Search results received:", results, type)
  }

  const handleChatStart = () => {
    setChatStarted(true)
  }

  const handleExampleClick = (prompt: string) => {
    setChatStarted(true)
    requestAnimationFrame(() => {
      if (chatInterfaceRef.current) {
        chatInterfaceRef.current.handleExamplePrompt(prompt)
      }
    })
  }

  const handleNavigate = (view: string) => {
    setCurrentView(view)
    if (view === "Chat") {
      setChatStarted(false)
    }
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case "Profile":
        return <ProfilePage />
      case "Bookings":
        return <BookingManagementPage />
      case "Flights":
        return <FlightsPage />
      case "Hotels":
        return <HotelsPage />
      case "Chat":
        return !chatStarted ? (
          <WelcomeScreen onExampleClick={handleExampleClick} />
        ) : (
          <ChatInterface
            ref={chatInterfaceRef}
            onSearchResults={handleSearchResults}
            onStartBooking={handleStartBooking}
            onChatStart={handleChatStart}
            onItemSelect={handleItemSelect}
          />
        )
      default:
        return (
          <div className="flex-1 flex items-center justify-center bg-gray-950">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">{currentView}</h2>
              <p className="text-gray-400">This section is coming soon...</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentView={currentView} onNavigate={handleNavigate} />

      <main className="flex-1 flex flex-col relative overflow-y-auto">{renderCurrentView()}</main>

      {selectedItem && <BookingModal item={selectedItem} onClose={handleCloseModal} />}
    </div>
  )
}
