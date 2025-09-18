"use client"

import type React from "react"

import Image from "next/image"
import { useState, useEffect, useImperativeHandle, forwardRef } from "react"
import { Send, Mic, Paperclip, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface ChatMessage {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
  results?: any[]
  resultsType?: string
}

interface ChatInterfaceProps {
  onSearchResults: (results: any[], type: string) => void
  onStartBooking: (type: "flight" | "hotel" | "both") => void
  onChatStart: () => void
  onItemSelect?: (item: any) => void
}

export const ChatInterface = forwardRef<any, ChatInterfaceProps>(function ChatInterface(
  { onSearchResults, onStartBooking, onChatStart, onItemSelect },
  ref,
) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      content:
        "Hi! I'm your AI travel assistant. I can help you find flights, hotels, and plan your perfect trip. What can I help you with today?",
      isUser: false,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 2000])
  const [sortBy, setSortBy] = useState("price")
  const [isProcessingPrompt, setIsProcessingPrompt] = useState(false)

  const mockFlights = [
    {
      id: "1",
      type: "flight",
      airline: "Delta Airlines",
      from: "New York (JFK)",
      to: "Paris (CDG)",
      departure: "2024-03-15 08:30",
      arrival: "2024-03-15 21:45",
      duration: "7h 15m",
      price: 899,
      stops: 0,
      image: "/airplane-delta-airlines.png",
    },
    {
      id: "2",
      type: "flight",
      airline: "Air France",
      from: "New York (JFK)",
      to: "Paris (CDG)",
      departure: "2024-03-15 14:20",
      arrival: "2024-03-16 03:35",
      duration: "7h 15m",
      price: 1299,
      stops: 0,
      image: "/airplane-air-france.png",
    },
  ]

  const mockHotels = [
    {
      id: "1",
      type: "hotel",
      name: "Le Grand Hotel Paris",
      location: "Paris, France",
      rating: 4.8,
      reviews: 1247,
      price: 320,
      amenities: ["WiFi", "Pool", "Spa", "Restaurant"],
      image: "/luxury-hotel-paris-grand.png",
    },
    {
      id: "2",
      type: "hotel",
      name: "Hotel des Arts Montmartre",
      location: "Montmartre, Paris",
      rating: 4.5,
      reviews: 892,
      price: 180,
      amenities: ["WiFi", "Restaurant", "Bar"],
      image: "/boutique-hotel-montmartre-paris.png",
    },
  ]

  useEffect(() => {
    const userMessages = messages.filter((msg) => msg.isUser)
    if (userMessages.length > 0) {
      onChatStart()
    }
  }, [messages, onChatStart])

  useImperativeHandle(ref, () => ({
    handleExamplePrompt: (prompt: string) => {
      if (isProcessingPrompt) return
      setIsProcessingPrompt(true)

      setInput(prompt)
      // Automatically send the prompt
      setTimeout(() => {
        handleSendWithPrompt(prompt)
        setIsProcessingPrompt(false)
      }, 100)
    },
  }))

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    handleSendWithPrompt(input)
  }

  const handleSendWithPrompt = async (promptText: string) => {
    if (isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: promptText,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      let aiResponse = ""
      let results: any[] = []
      let resultsType = ""

      if (promptText.toLowerCase().includes("flight")) {
        aiResponse = "I found some great flight options for you! Here are the best flights from New York to Paris:"
        results = mockFlights
        resultsType = "flights"
        onSearchResults(results, "flights")
      } else if (promptText.toLowerCase().includes("hotel")) {
        aiResponse = "Here are some excellent hotel options in Paris:"
        results = mockHotels
        resultsType = "hotels"
        onSearchResults(results, "hotels")
      } else if (promptText.toLowerCase().includes("trip") || promptText.toLowerCase().includes("travel")) {
        aiResponse = "I'd love to help you plan your trip! Let me show you some flight and hotel options:"
        results = [...mockFlights, ...mockHotels]
        resultsType = "mixed"
        onSearchResults(results, "mixed")
      } else {
        aiResponse =
          "I can help you find flights, hotels, or plan complete trips. Try asking me about flights to a specific destination or hotels in a city you'd like to visit!"
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        isUser: false,
        timestamp: new Date(),
        results: results.length > 0 ? results : undefined,
        resultsType: resultsType || undefined,
      }

      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleCardClick = (item: any) => {
    console.log("[v0] Card clicked:", item)
    if (onItemSelect) {
      onItemSelect(item)
    }
  }

  const handlePriceRangeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(event.target.value)
    setPriceRange([0, value])
    console.log("[v0] Price range changed:", [0, value])
  }

  const handleSortChange = () => {
    const newSort = sortBy === "price" ? "rating" : "price"
    setSortBy(newSort)
    console.log("[v0] Sort changed to:", newSort)
  }

  return (
    <div className="flex flex-col h-full bg-card" data-chat-interface>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((message) => (
          <div key={message.id} className="space-y-3">
            <div className={cn("flex", message.isUser ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-xs lg:max-w-md px-4 py-2 rounded-lg text-sm",
                  message.isUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                {message.content}
              </div>
            </div>

            {!message.isUser && message.results && message.results.length > 0 && (
              <div className="ml-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-foreground">Travel Results</h3>
                    <span className="text-sm text-muted-foreground">{message.results.length} options found</span>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1 bg-transparent" onClick={handleSortChange}>
                    {sortBy === "price" ? "Price" : "Rating"} <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>

                <div className="mb-4 p-3 bg-card border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Price Range</span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min="0"
                      max="2000"
                      value={priceRange[1]}
                      onChange={handlePriceRangeChange}
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                      <span>$0</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {message.results
                    .filter((result) => result.price <= priceRange[1])
                    .map((result) => (
                      <div
                        key={result.id}
                        className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors cursor-pointer"
                        onClick={() => handleCardClick(result)}
                      >
                        <div className="aspect-video relative">
                          <Image
                            src={result.image || "/placeholder.svg"}
                            alt={result.type === "flight" ? result.airline : result.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            unoptimized
                          />
                          {result.type === "hotel" && (
                            <div className="absolute bottom-2 right-2">
                              <span className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium">
                                hotels
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="p-4">
                          {result.type === "flight" ? (
                            <>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-foreground">{result.airline}</h4>
                                <span className="text-lg font-bold text-foreground">${result.price}</span>
                              </div>
                              <div className="text-sm text-muted-foreground mb-1">
                                {result.from} → {result.to}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {result.departure} • {result.duration} •{" "}
                                {result.stops === 0 ? "Direct" : `${result.stops} stops`}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-foreground">{result.name}</h4>
                                <span className="text-lg font-bold text-foreground">${result.price}</span>
                              </div>
                              <div className="text-sm text-muted-foreground mb-1">{result.location}</div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>★ {result.rating}</span>
                                <span>({result.reviews} reviews)</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted text-muted-foreground px-4 py-2 rounded-lg text-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-current rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-current rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex-shrink-0 p-4 border-t border-border bg-card sticky bottom-0 z-10">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about flights, hotels, or travel plans..."
              className="pr-20"
              disabled={false}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex space-x-1">
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <Mic className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button onClick={handleSend} disabled={!input.trim() || isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
})
