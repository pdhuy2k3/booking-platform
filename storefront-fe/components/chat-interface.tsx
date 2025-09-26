"use client"

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react"
import { Send, Mic, Plus } from "lucide-react"
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
      content: "Dưới đây là các lựa chọn chuyến bay từ 🛂 Tân Sơn Nhất đến 🛂 Đà Nẵng vào ngày 21/12/2025 mà tôi có thông tin:",
      isUser: false,
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useImperativeHandle(ref, () => ({
    handleExamplePrompt: (prompt: string) => {
      setInput(prompt)
      handleSubmit(undefined, prompt)
    },
  }))

  const handleSubmit = async (e?: React.FormEvent, promptText?: string) => {
    e?.preventDefault()
    
    const messageContent = promptText || input
    if (!messageContent.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: messageContent,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "Tôi đang tìm kiếm chuyến bay từ Tân Sơn Nhất đến Đà Nẵng cho bạn...",
        isUser: false,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, aiMessage])
      setIsLoading(false)
    }, 1000)
  }

  // Mock flight data
  const mockFlights = [
    {
      id: "1",
      airline: "VietJet Air (VJ 620)",
      departure: "6:30 sáng từ 🛂 Tân Sơn Nhất",
      arrival: "7:50 sáng tại 🛂 Đà Nẵng", 
      duration: "1 giờ 20 phút",
      price: "$51.50/người (2 người: $103.00, hạng phổ thông)",
      type: "Không hủy (không dừng)",
      badge: "Best"
    },
    {
      id: "2", 
      airline: "Vietnam Airlines (VN 112)",
      departure: "8:05 sáng từ 🛂 Tân Sơn Nhất",
      arrival: "9:20 sáng tại 🛂 Đà Nẵng",
      duration: "1 giờ 15 phút", 
      price: "Giá không có sẵn",
      type: "Không hủy",
      badge: "Cheapest"
    }
  ]

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header with trip info */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>🛪 tìm kiếm chuyến bay đến đà nẵng từ sân bay Tân Sơn Nhất</span>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.isUser ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                message.isUser
                  ? "bg-blue-600 text-white ml-auto"
                  : "bg-gray-100 text-gray-900"
              )}
            >
              {message.content}
            </div>
          </div>
        ))}

        {/* Flight results section */}
        <div className="space-y-4">
          <div className="text-lg font-semibold text-gray-900">
            Các lựa chọn bay thẳng (không dừng) ✈️
          </div>

          {mockFlights.map((flight) => (
            <div key={flight.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex gap-2">
                  {flight.badge === "Best" && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                      Best
                    </span>
                  )}
                  {flight.badge === "Cheapest" && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                      Cheapest
                    </span>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {flight.price.includes("$") ? flight.price.split("(")[0] : flight.price}
                  </div>
                  {flight.price.includes("per person") && (
                    <div className="text-sm text-gray-500">per person</div>
                  )}
                  {flight.price.includes("$103") && (
                    <div className="text-sm text-gray-500">$103 total</div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <div className="text-sm font-medium text-gray-900">
                    Sun, Dec 21
                  </div>
                  <div className="text-sm font-medium text-gray-900">
                    6:30 AM-7:50 AM
                  </div>
                  <div className="text-sm text-gray-500">
                    1h 20m
                  </div>
                  <div className="text-sm text-gray-500">
                    Nonstop
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {flight.airline.split("(")[0]}
                  </div>
                  <div className="text-sm text-gray-600">
                    SGN-DAD
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-red-600">
                    ❌ {flight.type}
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-blue-600 text-white hover:bg-blue-700 rounded-full px-6"
                    onClick={() => onItemSelect?.(flight)}
                  >
                    Book
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-3 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full hover:bg-gray-100"
          >
            <Plus className="h-5 w-5 text-gray-600" />
          </Button>

          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="w-full rounded-full border-gray-300 pr-20 h-12 text-sm"
              disabled={isLoading}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-gray-100"
              >
                <Mic className="h-4 w-4 text-gray-600" />
              </Button>
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-gray-100"
                disabled={isLoading || !input.trim()}
              >
                <Send className="h-4 w-4 text-gray-600" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
})