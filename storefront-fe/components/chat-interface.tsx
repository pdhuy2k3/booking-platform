"use client"

import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react"
import { Send, Mic, MicOff, Plus, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useAiChat, useVoiceChat, useAudioRecorder } from "@/modules/ai"
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
  const [isVoiceMode, setIsVoiceMode] = useState(false)
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
    getSuggestions,
    mode,
    setMode
  } = useAiChat({
    conversationId: conversationId ?? undefined,
    loadHistoryOnMount: true,
    context: user?.id ? { userId: user.id } : undefined,
    onError: (errorMsg) => {
      console.error('Chat error:', errorMsg);
    }
  })

  // Use voice chat hook
  const {
    isConnected: voiceConnected,
    isProcessing: voiceProcessing,
    currentStage: voiceStage,
    transcription: voiceTranscription,
    response: voiceResponse,
    results: voiceResults,
    suggestions: voiceSuggestions,
    error: voiceError,
    connect: connectVoice,
    disconnect: disconnectVoice,
    sendAudio,
    clearState: clearVoiceState,
  } = useVoiceChat({
    userId: user?.id,
    conversationId: conversationId ?? undefined,
    autoConnect: false,
    onTranscription: (text) => {
      console.log('📝 Transcription received:', text);
    },
    onResponse: (message, results) => {
      console.log('💬 Voice response received:', message);
      if (results && results.length > 0) {
        onSearchResults(results, 'voice');
      }
    },
    onError: (error) => {
      console.error('❌ Voice error:', error);
    },
  });

  // Use audio recorder hook
  const {
    isRecording,
    isPaused,
    duration: recordingDuration,
    error: recorderError,
    startRecording,
    stopRecording,
    resetRecording,
    isSupported: audioSupported,
  } = useAudioRecorder({
    maxDuration: 60000, // 60 seconds
    onRecordingComplete: async (audioBlob, audioUrl) => {
      console.log('🎤 Recording complete:', {
        size: audioBlob.size,
        type: audioBlob.type
      });
      
      try {
        await sendAudio(audioBlob, audioBlob.type || 'audio/webm', 'vi');
      } catch (error) {
        console.error('❌ Failed to send audio:', error);
      }
    },
    onError: (error) => {
      console.error('❌ Recorder error:', error);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Get current suggestions from last message, voice chat, or default
  const currentSuggestions = React.useMemo(() => {
    // Priority 1: Voice suggestions (if in voice mode)
    if (isVoiceMode && voiceSuggestions && voiceSuggestions.length > 0) {
      console.log('💡 Using voice suggestions:', voiceSuggestions);
      return voiceSuggestions;
    }
    
    // Priority 2: Last assistant message suggestions
    const lastAssistantMessage = [...messages].reverse().find(m => !m.isUser);
    console.log('💡 Last assistant message:', lastAssistantMessage);
    if (lastAssistantMessage?.suggestions && lastAssistantMessage.suggestions.length > 0) {
      console.log('💡 Using message suggestions:', lastAssistantMessage.suggestions);
      return lastAssistantMessage.suggestions;
    }
    
    // Priority 3: Default suggestions
    console.log('💡 Using default suggestions:', suggestions);
    return suggestions;
  }, [isVoiceMode, voiceSuggestions, messages, suggestions]);

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

  // Handle voice mode toggle
  const handleVoiceModeToggle = () => {
    if (!user?.id) {
      alert('Bạn cần đăng nhập để sử dụng trò chuyện bằng giọng nói.');
      return;
    }

    if (!audioSupported) {
      alert('Trình duyệt của bạn không hỗ trợ ghi âm');
      return;
    }

    setIsVoiceMode((prev) => {
      const newMode = !prev;
      if (newMode) {
        connectVoice();
      } else {
        disconnectVoice();
        if (isRecording) {
          resetRecording();
        }
      }
      return newMode;
    });
  };

  // Handle voice recording
  const handleVoiceRecord = async () => {
    if (!user?.id) {
      alert('Bạn cần đăng nhập để sử dụng trò chuyện bằng giọng nói.');
      return;
    }

    if (isRecording) {
      await stopRecording();
    } else {
      clearVoiceState();
      await startRecording();
    }
  };

  // Get voice status text
  const getVoiceStatusText = (): string => {
    if (isRecording) return 'Đang ghi âm...';
    if (voiceProcessing) {
      switch (voiceStage) {
        case 'transcription':
          return 'Đang nhận dạng giọng nói...';
        case 'processing':
          return 'Đang xử lý yêu cầu...';
        case 'response':
          return 'Đang tạo phản hồi...';
        default:
          return 'Đang xử lý...';
      }
    }
    return '';
  };

  // Format duration (MM:SS)
  const formatRecordingDuration = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

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

        {/* Voice Response Display */}
        {voiceResponse && (
          <div className="space-y-3">
            {voiceTranscription && (
              <div className="flex justify-end">
                <div className="bg-blue-600 text-white rounded-2xl px-4 py-2">
                  <p className="text-sm whitespace-pre-wrap">{voiceTranscription}</p>
                </div>
              </div>
            )}

            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-3 w-full">
                <AiResponseRenderer
                  message={voiceResponse}
                  results={voiceResults || []}
                  onFlightBook={onFlightBook}
                  onHotelBook={onHotelBook}
                  onLocationClick={onLocationClick}
                  canBook={true}
                />
              </div>
            </div>
          </div>
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
        {/* Voice Status Bar */}
        {(isRecording || voiceProcessing || voiceTranscription || voiceError || recorderError) && (
          <div className="mb-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
            {/* Recording Status */}
            {isRecording && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm font-medium text-gray-700">
                    {getVoiceStatusText()}
                  </span>
                </div>
                <span className="text-sm text-gray-500 font-mono">
                  {formatRecordingDuration(recordingDuration)}
                </span>
              </div>
            )}

            {/* Processing Status */}
            {voiceProcessing && (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  {getVoiceStatusText()}
                </span>
              </div>
            )}

            {/* Transcription Display */}
            {voiceTranscription && !voiceProcessing && (
              <div className="space-y-1">
                <div className="text-xs text-gray-500">Đã nhận dạng:</div>
                <div className="text-sm text-gray-900 italic">
                  "{voiceTranscription}"
                </div>
              </div>
            )}

            {/* Error Display */}
            {(voiceError || recorderError) && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  {voiceError || recorderError}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Chat Mode Toggle - Temporarily Hidden */}
        {false && (
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded-lg border mb-4">
            <span className="text-sm font-medium text-gray-700">Chế độ chat:</span>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={mode === 'sync' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMode('sync')}
                className="text-xs"
              >
                Đồng bộ
              </Button>
              <Button
                type="button"
                variant={mode === 'stream' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setMode('stream')}
                className="text-xs"
              >
                Streaming
              </Button>
            </div>
          </div>
        )}

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
                  disabled={isLoading || isRecording || voiceProcessing}
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

          {!isVoiceMode ? (
            // Text Input Mode
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Hỏi về địa điểm du lịch, khách sạn, chuyến bay..."
                className="w-full rounded-full border-gray-300 pr-28 h-12 text-sm"
                disabled={isLoading}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8 rounded-full",
                    audioSupported ? "hover:bg-gray-100" : "opacity-50 cursor-not-allowed"
                  )}
                  onClick={handleVoiceModeToggle}
                  disabled={isLoading || !audioSupported}
                  title={audioSupported ? "Chuyển sang chế độ voice" : "Trình duyệt không hỗ trợ"}
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
          ) : (
            // Voice Input Mode
            <div className="flex-1 flex items-center justify-center gap-4">
              <Button
                type="button"
                variant={isRecording ? "destructive" : "default"}
                size="lg"
                className={cn(
                  "h-14 w-14 rounded-full transition-all",
                  isRecording && "animate-pulse"
                )}
                onClick={handleVoiceRecord}
                disabled={voiceProcessing || !voiceConnected}
              >
                <Mic className="h-6 w-6" />
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-gray-100"
                onClick={handleVoiceModeToggle}
                title="Chuyển về chế độ text"
              >
                <MicOff className="h-4 w-4 text-gray-600" />
              </Button>

              {!voiceConnected && (
                <span className="text-xs text-orange-600">
                  Đang kết nối...
                </span>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  )
})
