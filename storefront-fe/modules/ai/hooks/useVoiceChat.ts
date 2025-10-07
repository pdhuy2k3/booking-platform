import { useState, useEffect, useCallback, useRef } from 'react';
import { aiChatService } from '../service/ai-chat';
import type { VoiceMessageRequest, VoiceMessageResponse } from '../types';

export interface UseVoiceChatOptions {
  userId?: string;
  conversationId?: string;
  onTranscription?: (text: string) => void;
  onResponse?: (message: string, results?: any[]) => void;
  onError?: (error: string) => void;
  autoConnect?: boolean;
}

export interface UseVoiceChatReturn {
  // Connection state
  isConnected: boolean;
  isProcessing: boolean;
  
  // Current stage
  currentStage: 'idle' | 'transcription' | 'processing' | 'response';
  
  // Voice data
  transcription: string | null;
  response: string | null;
  results: any[] | null;
  suggestions: string[];
  error: string | null;
  processingTime: number | null;
  
  // Actions
  connect: () => void;
  disconnect: () => void;
  sendAudio: (audioBlob: Blob, format?: string, language?: string) => Promise<void>;
  clearState: () => void;
}

export function useVoiceChat(options: UseVoiceChatOptions): UseVoiceChatReturn {
  const {
    userId,
    conversationId,
    onTranscription,
    onResponse,
    onError,
    autoConnect = false,
  } = options;

  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Current stage
  const [currentStage, setCurrentStage] = useState<'idle' | 'transcription' | 'processing' | 'response'>('idle');
  
  // Voice data
  const [transcription, setTranscription] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);
  const [results, setResults] = useState<any[] | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [processingTime, setProcessingTime] = useState<number | null>(null);
  const [clientUserId, setClientUserId] = useState<string | null>(userId?.trim() || null);

  useEffect(() => {
    if (userId && userId.trim().length > 0) {
      setClientUserId(userId.trim());
    } else {
      setClientUserId(null);
    }
  }, [userId]);

  const isInitialized = useRef(false);

  // Handle incoming WebSocket messages
  const handleVoiceMessage = useCallback((message: VoiceMessageResponse) => {
    console.log('📨 Processing voice message:', message);

    // Clear error on new message
    setError(null);

    switch (message.type) {
      case 'TRANSCRIPTION':
        setCurrentStage('transcription');
        if (message.transcribedText) {
          setTranscription(message.transcribedText);
          onTranscription?.(message.transcribedText);
          console.log('📝 Transcription:', message.transcribedText);
        }
        break;

      case 'PROCESSING':
        setCurrentStage('processing');
        setIsProcessing(true);
        console.log('⚙️ Processing...');
        break;

      case 'RESPONSE':
        setCurrentStage('response');
        setIsProcessing(false);
        
        if (message.aiResponse) {
          setResponse(message.aiResponse);
          console.log('💬 AI Response:', message.aiResponse.substring(0, 50) + '...');
        }

        if (message.results) {
          setResults(message.results);
          console.log('📊 Results:', message.results.length, 'items');
        }

        // Handle suggestions from multiple possible field names
        const rawSuggestions = message.nextRequestSuggestions ?? message.next_request_suggestions ?? [];
        if (rawSuggestions && rawSuggestions.length > 0) {
          const suggestionList = rawSuggestions
            .map((item) => (typeof item === 'string' ? item.trim() : String(item ?? '').trim()))
            .filter((item): item is string => item.length > 0);
          setSuggestions(suggestionList);
          console.log('💡 Suggestions:', suggestionList);
        } else {
          setSuggestions([]);
        }
        
        if (message.processingTimeMs) {
          setProcessingTime(message.processingTimeMs);
          console.log('⏱️ Processing time:', message.processingTimeMs, 'ms');
        }
        
        onResponse?.(message.aiResponse || '', message.results);
        
        // Reset to idle after a delay
        setTimeout(() => {
          setCurrentStage('idle');
        }, 1000);
        break;

      case 'ERROR':
        setCurrentStage('idle');
        setIsProcessing(false);
        const errorMsg = message.error || 'Unknown error occurred';
        setError(errorMsg);
        console.error('❌ Voice chat error:', errorMsg);
        onError?.(errorMsg);
        setSuggestions([]);
        break;

      default:
        console.warn('⚠️ Unknown message type:', (message as any).type);
    }
  }, [onTranscription, onResponse, onError]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    const resolvedUserId = clientUserId || userId?.trim();
    if (!resolvedUserId) {
      const errorMsg = 'Không xác định được người dùng để kết nối voice chat.';
      console.error('❌ Voice chat connect error:', errorMsg);
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setClientUserId(resolvedUserId);

    if (aiChatService.isWebSocketConnected()) {
      console.log('✅ Reusing existing WebSocket connection for voice chat');
    } else {
      console.log('🔌 Connecting WebSocket for user:', resolvedUserId);
    }

    aiChatService.initializeWebSocket(
      resolvedUserId,
      undefined,
      handleVoiceMessage,
      () => {
        console.log('✅ WebSocket connected successfully');
        setIsConnected(true);
        setError(null);
      },
      (error) => {
        console.error('❌ WebSocket connection error:', error);
        setIsConnected(false);
        setError(error?.message || 'Failed to connect to voice chat');
        onError?.(error?.message || 'Failed to connect to voice chat');
      }
    );
  }, [clientUserId, userId, handleVoiceMessage, onError]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting WebSocket...');
    aiChatService.disconnectWebSocket();
    setIsConnected(false);
    setIsProcessing(false);
    setCurrentStage('idle');
  }, []);

  // Send audio to server
  const sendAudio = useCallback(async (
    audioBlob: Blob,
    format: string = 'audio/webm',
    language: string = 'vi'
  ): Promise<void> => {
    if (!aiChatService.isWebSocketConnected()) {
      const errorMsg = 'WebSocket not connected. Please connect first.';
      setError(errorMsg);
      onError?.(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      const resolvedUserId = clientUserId || userId?.trim();

      if (!resolvedUserId) {
        const errorMsg = 'Không xác định được người dùng. Vui lòng đăng nhập để sử dụng voice chat.';
        console.error('❌ Voice chat error:', errorMsg);
        setError(errorMsg);
        setIsProcessing(false);
        setCurrentStage('idle');
        onError?.(errorMsg);
        throw new Error(errorMsg);
      }

      // Clear previous state
      setTranscription(null);
      setResponse(null);
      setResults(null);
      setSuggestions([]);
      setError(null);
      setProcessingTime(null);
      setCurrentStage('idle');
      setIsProcessing(true);

      // Convert audio blob to base64
      const base64Audio = await blobToBase64(audioBlob);

      // Create voice message request
      const request: VoiceMessageRequest = {
        userId: resolvedUserId,
        conversationId: conversationId || undefined,
        audioData: base64Audio,
        audioFormat: format,
        language,
        durationMs: audioBlob.size, // Approximate duration
      };

      console.log('🎤 Sending audio:', {
        format,
        language,
        sizeKB: Math.round(audioBlob.size / 1024),
      });

      // Send via WebSocket
      aiChatService.sendVoiceMessage(request);

    } catch (error: any) {
      console.error('❌ Failed to send audio:', error);
      const errorMsg = error?.message || 'Failed to send audio';
      setError(errorMsg);
      setIsProcessing(false);
      setCurrentStage('idle');
      onError?.(errorMsg);
      throw error;
    }
  }, [clientUserId, userId, conversationId, onError]);

  // Clear all state
  const clearState = useCallback(() => {
    setTranscription(null);
    setResponse(null);
    setResults(null);
    setSuggestions([]);
    setError(null);
    setProcessingTime(null);
    setCurrentStage('idle');
    setIsProcessing(false);
  }, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect && !isInitialized.current) {
      isInitialized.current = true;
      connect();
    }

    // Cleanup on unmount
    return () => {
      if (isInitialized.current) {
        disconnect();
      }
    };
  }, [autoConnect, connect, disconnect]);

  return {
    // Connection state
    isConnected,
    isProcessing,
    
    // Current stage
    currentStage,
    
    // Voice data
    transcription,
    response,
    results,
    error,
    suggestions,
    processingTime,
    
    // Actions
    connect,
    disconnect,
    sendAudio,
    clearState,
  };
}

// Helper function to convert Blob to base64
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data URL prefix (e.g., "data:audio/webm;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
