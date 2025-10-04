"use client"

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react"
import Image from "next/image"
import { Send, Mic, Plus, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useAiChat } from "@/modules/ai"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { ChatStructuredResult } from "@/modules/ai"
import { format } from "date-fns"

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
}

export const ChatInterface = forwardRef<any, ChatInterfaceProps>(function ChatInterface(
  { onSearchResults, onStartBooking, onChatStart, onItemSelect, conversationId },
  ref,
) {
  const [input, setInput] = useState("")
  const [selectedResult, setSelectedResult] = useState<ChatStructuredResult | null>(null)
  const [isResultDialogOpen, setIsResultDialogOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Use the AI chat hook
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

  useEffect(() => {
    // Load suggestions on component mount
    getSuggestions()
  }, [getSuggestions])

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

  const formatMessageTimestamp = (value: Date | string) => {
    const date = value instanceof Date ? value : new Date(value)
    if (Number.isNaN(date.getTime())) {
      return null
    }
    return format(date, "HH:mm, dd/MM/yyyy")
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

          return (
            <div key={message.id} className="space-y-3">
              <div
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
                  <div className="whitespace-pre-line leading-relaxed">
                    {message.content}
                  </div>
                  {formattedTimestamp && (
                    <div
                      className={cn(
                        "mt-2 text-xs",
                        message.isUser
                          ? "text-blue-100/80 text-right"
                          : "text-gray-500 text-left"
                      )}
                    >
                      {formattedTimestamp}
                    </div>
                  )}
                </div>
              </div>

              {!message.isUser && message.results && message.results.length > 0 && (
                <div className="flex justify-start">
                  <div className="grid gap-3 sm:grid-cols-2 max-w-[90%]">
                    {message.results.map((result, idx) => (
                      <div
                        key={`${message.id}-result-${idx}`}
                        className="rounded-xl border border-gray-200 bg-white shadow-sm p-3 text-left"
                      >
                        <div className="flex items-start gap-3">
                          {result.imageUrl ? (
                            <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-muted">
                              <Image
                                src={result.imageUrl}
                                alt={result.title ?? "result"}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : null}
                          <div className="space-y-1">
                            {result.type && (
                              <span className="inline-block text-[11px] uppercase tracking-wide text-muted-foreground">
                                {result.type}
                              </span>
                            )}
                            {result.title && (
                              <p className="text-sm font-semibold text-foreground">{result.title}</p>
                            )}
                            {result.subtitle && (
                              <p className="text-xs text-muted-foreground">{result.subtitle}</p>
                            )}
                          </div>
                        </div>
                        {result.description && (
                          <p className="mt-2 text-xs text-muted-foreground leading-snug">
                            {result.description}
                          </p>
                        )}
                        {result.metadata && Object.keys(result.metadata).length > 0 && (
                          <div className="mt-3 space-y-1 text-xs">
                            {Object.entries(result.metadata).map(([key, value]) => (
                              <div key={key} className="flex justify-between gap-4 text-muted-foreground">
                                <span className="font-medium capitalize">{key.replace(/_/g, " ")}</span>
                                <span className="text-right text-foreground">
                                  {typeof value === "string" || typeof value === "number"
                                    ? value
                                    : JSON.stringify(value)}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="mt-3 flex justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedResult(result)
                              setIsResultDialogOpen(true)
                            }}
                          >
                            Xem chi tiết
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })}

        {/* Suggestions (show when messages are minimal) */}
        {messages.length <= 2 && suggestions.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm text-gray-500 font-medium">Gợi ý:</div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-xs h-8 rounded-full"
                  onClick={() => handleSubmit(undefined, suggestion)}
                  disabled={isLoading}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

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

      <Dialog open={isResultDialogOpen} onOpenChange={setIsResultDialogOpen}>
        <DialogContent className="max-w-lg">
          {selectedResult && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle>{selectedResult.title ?? "Chi tiết"}</DialogTitle>
              </DialogHeader>
              {selectedResult.imageUrl && (
                <div className="relative h-48 w-full overflow-hidden rounded-lg">
                  <Image src={selectedResult.imageUrl} alt={selectedResult.title ?? "result"} fill className="object-cover" />
                </div>
              )}
              {selectedResult.subtitle && (
                <p className="text-sm text-muted-foreground">{selectedResult.subtitle}</p>
              )}
              {selectedResult.description && (
                <p className="text-sm leading-relaxed text-foreground">{selectedResult.description}</p>
              )}
              {selectedResult.metadata && Object.keys(selectedResult.metadata).length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">Thông tin chi tiết</h4>
                  <div className="grid gap-2">
                    {Object.entries(selectedResult.metadata).map(([key, value]) => (
                      <div key={key} className="flex items-start justify-between gap-4 text-sm">
                        <span className="min-w-[120px] font-medium capitalize">{key.replace(/_/g, " ")}</span>
                        <span className="text-right text-muted-foreground">
                          {typeof value === "string" || typeof value === "number"
                            ? value
                            : JSON.stringify(value, null, 2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200 bg-white">
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
              className="w-full rounded-full border-gray-300 pr-20 h-12 text-sm"
              disabled={isLoading}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-gray-100"
                disabled={isLoading}
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
