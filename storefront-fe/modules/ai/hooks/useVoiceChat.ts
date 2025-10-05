import { useState, useEffect, useCallback, useRef } from 'react';
import { aiChatService } from '../service/ai-chat';
import type { VoiceMessageRequest, VoiceMessageResponse } from '../types';

export interface UseVoiceChatOptions {
  userId: string;
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
  const [error, setError] = useState<string | null>(null);
  const [processingTime, setProcessingTime] = useState<number | null>(null);

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
        break;

      default:
        console.warn('⚠️ Unknown message type:', (message as any).type);
    }
  }, [onTranscription, onResponse, onError]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (aiChatService.isWebSocketConnected()) {
      console.log('✅ Already connected');
      setIsConnected(true);
      return;
    }

    console.log('🔌 Connecting WebSocket for user:', userId);

    aiChatService.initializeWebSocket(
      userId,
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
  }, [userId, handleVoiceMessage, onError]);

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
      // Clear previous state
      setTranscription(null);
      setResponse(null);
      setResults(null);
      setError(null);
      setProcessingTime(null);
      setCurrentStage('idle');
      setIsProcessing(true);

      // Convert audio blob to base64
      const base64Audio = await blobToBase64(audioBlob);

      // Create voice message request
      const request: VoiceMessageRequest = {
        userId,
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
  }, [userId, conversationId, onError]);

  // Clear all state
  const clearState = useCallback(() => {
    setTranscription(null);
    setResponse(null);
    setResults(null);
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
