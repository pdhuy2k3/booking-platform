"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ChatInterface } from "@/components/chat-interface"
import { BookingModal } from "@/components/booking-modal"
import { WelcomeScreen } from "@/components/welcome-screen"

export default function TravelBookingPage() {
  const router = useRouter()
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [chatStarted, setChatStarted] = useState(false)
  const chatInterfaceRef = useRef<any>(null)

  const handleItemSelect = (item: any) => {
    setSelectedItem(item)
  }

  const handleCloseModal = () => {
    setSelectedItem(null)
  }

  const handleStartBooking = (type: "flight" | "hotel" | "both") => {
    if (type === "flight") router.push("/flights")
    else if (type === "hotel") router.push("/hotels")
    else router.push("/bookings")
  }

  const handleSearchResults = (results: any[], _type: string) => {
    if (results.length === 1) {
      setSelectedItem(results[0])
    }
  }

  const handleChatStart = () => setChatStarted(true)

  const handleExampleClick = (prompt: string) => {
    setChatStarted(true)
    requestAnimationFrame(() => {
      if (chatInterfaceRef.current) {
        chatInterfaceRef.current.handleExamplePrompt(prompt)
      }
    })
  }

  return (
    <>
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
    </>
  )
}
