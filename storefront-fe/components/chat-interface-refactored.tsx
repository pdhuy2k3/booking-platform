"use client"

import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from "react"
import { Send, Mic, MicOff, Loader2, AlertCircle, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AiResponseRenderer } from "@/components/ai-response-renderer"
import { useAiChat } from "@/modules/ai/hooks/useAiChat"
import { useVoiceChat } from "@/modules/ai/hooks/useVoiceChat"
import { useAudioRecorder } from "@/modules/ai/hooks/useAudioRecorder"
import { useAuth } from "@/contexts/auth-context"
import { useDateFormatter } from "@/hooks/use-date-formatter"
import type { ChatMessage } from "@/modules/ai/types"

interface ChatInterfaceProps {
  onSearchResults: (results: any[], type: string) => void
  onStartBooking: (type: "flight" | "hotel" | "both") => void
  onChatStart: () => void
  onItemSelect?: (item: any) => void
  conversationId?: string | null
  onFlightBook?: (flight: any) => void
  onHotelBook?: (hotel: any, room: any) => void
}

export const ChatInterface = forwardRef<any, ChatInterfaceProps>(function ChatInterface(
  { 
    onSearchResults, 
    onStartBooking, 
    onChatStart, 
    onItemSelect,
    conversationId,
    onFlightBook,
    onHotelBook
  },
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
    getSuggestions 
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
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>💬 Trò chuyện với AI để lên kế hoạch du lịch</span>
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
                <div className="bg-blue-600 text-white rounded-2xl px-4 py-2 max-w-[80%]">
                  <p className="text-sm whitespace-pre-wrap">{voiceTranscription}</p>
                </div>
              </div>
            )}

            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-[80%]">
                <AiResponseRenderer
                  message={voiceResponse}
                  results={voiceResults || []}
                  onFlightBook={onFlightBook}
                  onHotelBook={onHotelBook}
                  canBook={true}
                />
              </div>
            </div>
          </div>
        )}

        {/* Text Messages */}
        {messages.map((message) => {
          const formattedTimestamp = formatMessageTimestamp(message.timestamp)

          return (
            <div key={message.id} className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] space-y-2`}>
                {message.isUser ? (
                  <div className="bg-blue-600 text-white rounded-2xl px-4 py-2">
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-2xl px-4 py-3">
                    <AiResponseRenderer
                      message={message.content}
                      results={message.results || []}
                      onFlightBook={onFlightBook}
                      onHotelBook={onHotelBook}
                      canBook={true}
                    />
                  </div>
                )}
                {formattedTimestamp && (
                  <p className="text-xs text-gray-400 px-2">
                    {formattedTimestamp}
                  </p>
                )}
              </div>
            </div>
          )
        })}

        {/* Suggestions (show when messages are minimal) */}
        {messages.length <= 2 && suggestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-gray-500 px-2">Gợi ý cho bạn:</p>
            <div className="grid grid-cols-1 gap-2">
              {suggestions.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="justify-start text-left h-auto py-3 px-4 hover:bg-blue-50 hover:border-blue-300"
                  onClick={() => handleSubmit(undefined, suggestion)}
                >
                  <span className="text-sm">{suggestion}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl px-4 py-3">
              <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
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
            {isRecording && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-700">{getVoiceStatusText()}</span>
                </div>
                <span className="text-sm font-mono text-gray-600">
                  {formatRecordingDuration(recordingDuration)}
                </span>
              </div>
            )}

            {voiceProcessing && (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-sm text-gray-700">{getVoiceStatusText()}</span>
              </div>
            )}

            {voiceTranscription && !voiceProcessing && (
              <div className="space-y-1">
                <span className="text-xs text-gray-500">Bạn đã nói:</span>
                <p className="text-sm text-gray-800">{voiceTranscription}</p>
              </div>
            )}

            {(voiceError || recorderError) && (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{voiceError || recorderError}</span>
              </div>
            )}
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
            <>
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full hover:bg-gray-100"
                onClick={handleVoiceModeToggle}
                title="Chuyển sang chế độ giọng nói"
              >
                <Mic className="h-5 w-5 text-gray-600" />
              </Button>
              <Button
                type="submit"
                size="icon"
                className="h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading || !input.trim()}
              >
                <Send className="h-5 w-5 text-white" />
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant={isRecording ? "destructive" : "default"}
                className="flex-1 h-12"
                onClick={handleVoiceRecord}
                disabled={voiceProcessing}
              >
                {isRecording ? (
                  <>
                    <MicOff className="h-5 w-5 mr-2" />
                    <span>Dừng ghi âm</span>
                  </>
                ) : (
                  <>
                    <Mic className="h-5 w-5 mr-2" />
                    <span>Bắt đầu ghi âm</span>
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full hover:bg-gray-100"
                onClick={handleVoiceModeToggle}
                title="Chuyển sang chế độ văn bản"
              >
                <Mic className="h-5 w-5 text-blue-600" />
              </Button>
            </>
          )}
        </form>
      </div>
    </div>
  )
})
