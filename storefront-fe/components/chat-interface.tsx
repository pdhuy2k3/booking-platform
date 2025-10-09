"use client"

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react"
import { Send, Plus, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useAiChat } from "@/modules/ai"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useDateFormatter } from "@/hooks/use-date-formatter"
import { AiResponseRenderer } from "@/components/ai-response-renderer"

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
  conversationId?: string | null
  onFlightBook?: (flight: any) => void
  onHotelBook?: (hotel: any, room: any) => void
  onLocationClick?: (location: { lat: number; lng: number; title: string; description?: string }) => void
}

export const ChatInterface = forwardRef<any, ChatInterfaceProps>(function ChatInterface(
  { onSearchResults, onStartBooking, onChatStart, onItemSelect, conversationId, onFlightBook, onHotelBook, onLocationClick },
  ref,
) {
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const { formatDateTime } = useDateFormatter()
  const { user } = useAuth()

  // Use the AI chat hook for text messages
  const { 
    messages, 
    isLoading, 
    error, 
    sendMessage, 
    clearMessages,
    suggestions,
    getSuggestions
  } = useAiChat({
    conversationId: conversationId ?? undefined,
    loadHistoryOnMount: true,
    // Note: userId is automatically extracted from JWT token on backend
    context: {},
    onError: (errorMsg) => {
      console.error('Chat error:', errorMsg);
    }
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Get current suggestions from last message or default
  const currentSuggestions = React.useMemo(() => {
    // Priority 1: Last assistant message suggestions
    const lastAssistantMessage = [...messages].reverse().find(m => !m.isUser);
    if (lastAssistantMessage?.suggestions && lastAssistantMessage.suggestions.length > 0) {
      return lastAssistantMessage.suggestions;
    }
    
    // Priority 2: Default suggestions
    return suggestions;
  }, [messages, suggestions]);

  useEffect(() => {
    // Load suggestions on component mount
    getSuggestions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

    setInput("")
    onChatStart()

    await sendMessage(messageContent)
  }

  const handleSuggestionClick = async (suggestion: string) => {
    if (isLoading) return
    
    onChatStart()
    await sendMessage(suggestion)
  }

  const formatMessageTimestamp = (value: Date | string) => {
    let date: Date | null = null

    if (value instanceof Date) {
      date = value
    } else if (typeof value === 'string') {
      const trimmed = value.trim()
      if (!trimmed) {
        return null
      }

      const hasTimezoneOffset = /([zZ]|[+-]\d{2}:?\d{2})$/.test(trimmed)
      const normalized = hasTimezoneOffset ? trimmed : `${trimmed.endsWith('Z') ? trimmed : `${trimmed}Z`}`

      const parsed = new Date(normalized)
      if (!Number.isNaN(parsed.getTime())) {
        date = parsed
      }
    }

    if (!date || Number.isNaN(date.getTime())) {
      return null
    }

    // Use timezone-aware formatter
    return formatDateTime(date.toISOString())
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header with trip info */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>� Trò chuyện với AI để lên kế hoạch du lịch</span>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {messages.map((message) => {
          const formattedTimestamp = formatMessageTimestamp(message.timestamp)
          const isUserMessage = message.isUser
          const messageSuggestions = Array.isArray(message.suggestions) ? message.suggestions : []

          return (
            <div key={message.id} className={`flex ${isUserMessage ? "justify-end" : "justify-start"}`}>
              <div className={cn("space-y-2", isUserMessage ? "max-w-[80%]" : "w-full max-w-full")}>
                {isUserMessage ? (
                  <div className="bg-blue-600 text-white rounded-2xl px-4 py-2">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {formattedTimestamp && (
                      <div className="mt-2 text-xs text-blue-100/80 text-right">
                        {formattedTimestamp}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-2xl px-4 py-3 w-full">
                    <AiResponseRenderer
                      message={message.content}
                      results={message.results || []}
                      onFlightBook={onFlightBook}
                      onHotelBook={onHotelBook}
                      onLocationClick={onLocationClick}
                      canBook={true}
                    />

                    {formattedTimestamp && (
                      <div className="mt-3 text-xs text-gray-500 text-left">
                        {formattedTimestamp}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}

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
        {/* Suggestions */}
        {currentSuggestions.length > 0 && (
          <div className="mb-3 px-4 py-2 bg-gray-50 rounded-lg border">
            <div className="text-xs text-gray-500 font-medium mb-2">Gợi ý:</div>
            <div className="flex flex-wrap gap-2">
              {currentSuggestions.map((suggestion, index) => (
                <Button
                  key={`suggestion-${index}`}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 rounded-full hover:bg-blue-50 hover:border-blue-300"
                  onClick={() => handleSuggestionClick(suggestion)}
                  disabled={isLoading}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full hover:bg-gray-100"
            onClick={clearMessages}
            title="Xóa cuộc trò chuyện"
          >
            <Plus className="h-5 w-5 text-gray-600" />
          </Button>

          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Hỏi về địa điểm du lịch, khách sạn, chuyến bay..."
              className="w-full rounded-full border-gray-300 pr-12 h-12 text-sm"
              disabled={isLoading}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
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
