"use client"

import { useState, useRef } from "react"
import { ChatInterface } from "@/components/chat-interface"
import { BookingModal } from "@/components/booking-modal"
import { WelcomeScreen } from "@/components/welcome-screen"
import MainLayout from "./main-layout"

export default function HomePage() {
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [showBookingFlow, setShowBookingFlow] = useState(false)
  const [bookingType, setBookingType] = useState<"flight" | "hotel" | "both">("flight")
  const [chatStarted, setChatStarted] = useState(false)
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

  return (
    <MainLayout>
      <div className="w-full h-full">
        {!chatStarted ? (
          <WelcomeScreen onExampleClick={handleExampleClick} />
        ) : (
          <ChatInterface
            ref={chatInterfaceRef}
            onSearchResults={handleSearchResults}
            onStartBooking={handleStartBooking}
            onChatStart={handleChatStart}
            onItemSelect={handleItemSelect}
          />
        )}
        {selectedItem && <BookingModal item={selectedItem} onClose={handleCloseModal} />}
      </div>
    </MainLayout>
  )
}