import { apiClient } from '@/lib/api-client';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { 
  ChatRequest, 
  ChatResponse, 
  ChatContext, 
  ChatHistoryResponse,
  ChatMessageRequest,
  ChatMessageResponse,
  VoiceMessageRequest,
  VoiceMessageResponse 
} from '../types';

class AiChatService {
  private baseUrl = '/ai';
  private wsClient: Client | null = null;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly RECONNECT_DELAY = 3000;
  private readonly STREAM_TIMEOUT = 60000; // 60 seconds

  private get apiBase(): string {
    return `/api${this.baseUrl}`;
  }

  private get websocketEndpoint(): string {
    return process.env.NEXT_PUBLIC_AI_AGENT_WS_URL || `${this.apiBase}/ws/chat`;
  }

  private get voiceTopicPrefix(): string {
    return '/topic/voice.';
  }

  private get voiceAppDestination(): string {
    return '/app/voice.send';
  }

  private get textTopicPrefix(): string {
    return '/topic/chat.';
  }

  private get textAppDestination(): string {
    return '/app/chat.stream'; // Always use streaming endpoint
  }

  private generateConversationId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  private normalizeConversationId(conversationId?: string): string {
    return conversationId && conversationId.trim().length > 0
      ? conversationId
      : this.generateConversationId();
  }

  private buildHeaders(conversationId: string, userId?: string) {
    const headers: Record<string, string> = {};
    if (conversationId) {
      headers['X-Conversation-Id'] = conversationId;
    }
    if (userId) {
      headers['X-User-Id'] = userId;
    }
    return headers;
  }

  /**
   * Send a message to the AI chatbot
   */
  async sendMessage(
    message: string, 
    context?: ChatContext
  ): Promise<ChatResponse> {
    try {
      const request: ChatRequest = {
        message: message.trim(),
        conversationId: context?.conversationId,
        userId: context?.userId,
        // Backend still extracts userId from JWT when not provided
      };

      const response = await apiClient.post<ChatResponse>(
        `${this.baseUrl}/chat/message`,
        request,
        {
          timeout: 30000, // 30 second timeout for AI responses
        }
      );

      return response;
    } catch (error: any) {
      console.error('AI Chat Service Error:', error);
      
      // Return a fallback response
      return {
        userMessage: message,
        aiResponse: 'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.',
        conversationId: context?.conversationId || '',
        userId: '', // Backend will handle userId extraction
        timestamp: new Date().toISOString(),
        error: error.message || 'Không thể kết nối với AI service'
      };
    }
  }

  /**
   * Get chat history for a conversation
   */
  async getChatHistory(conversationId: string): Promise<ChatHistoryResponse> {
    try {
      // Backend will automatically extract userId from JWT token
      const response = await apiClient.get<ChatHistoryResponse>(
        `${this.baseUrl}/chat/history/${conversationId}`
      );
      return response;
    } catch (error: any) {
      console.error('Error getting chat history:', error);
      return {
        conversationId,
        messages: [],
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * List user's conversations
   */
  async listConversations(): Promise<string[]> {
    try {
      const response = await apiClient.get<string[]>(
        `${this.baseUrl}/chat/conversations`
      );
      return response;
    } catch (error) {
      console.error('Error listing conversations:', error);
      return [];
    }
  }

  /**
   * Clear chat history for a conversation
   */
  async clearChatHistory(conversationId: string): Promise<boolean> {
    try {
      await apiClient.delete(`${this.baseUrl}/chat/history/${conversationId}`);
      return true;
    } catch (error) {
      console.error('Error clearing chat history:', error);
      return false;
    }
  }

  /**
   * Send a streaming chat message and emit chunks as they arrive.
   */
  async sendStreamingMessage(
    message: string,
    context?: ChatContext,
    handlers?: {
      onStart?: (meta: { conversationId: string; userId: string }) => void;
      onChunk?: (chunk: string, aggregate: string) => void;
      onComplete?: (aggregate: string) => void;
      onError?: (error: Error) => void;
    }
  ): Promise<{ conversationId: string; userId: string; message: string }> {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      throw new Error('Message cannot be empty');
    }

    const conversationId = this.normalizeConversationId(context?.conversationId);

    const request: ChatRequest = {
      message: trimmedMessage,
      conversationId,
      userId: context?.userId,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.STREAM_TIMEOUT);

    try {
      const response = await fetch(`${this.apiBase}/chat/message/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.buildHeaders(conversationId, context?.userId),
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      const responseConversationId =
        response.headers.get('X-Conversation-Id')?.trim() || conversationId;
      const responseUserId = response.headers.get('X-User-Id')?.trim() || context?.userId || '';

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Streaming request failed');
        const error = new Error(errorText || `Request failed with status ${response.status}`);
        handlers?.onError?.(error);
        throw error;
      }

      handlers?.onStart?.({
        conversationId: responseConversationId,
        userId: responseUserId,
      });

      const body = response.body;
      if (!body) {
        const error = new Error('Streaming response body is empty');
        handlers?.onError?.(error);
        throw error;
      }

      const reader = body.getReader();
      const decoder = new TextDecoder();
      let aggregated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          if (chunk) {
            aggregated += chunk;
            handlers?.onChunk?.(chunk, aggregated);
          }
        }
      }

      const finalChunk = decoder.decode();
      if (finalChunk) {
        aggregated += finalChunk;
        handlers?.onChunk?.(finalChunk, aggregated);
      }

      handlers?.onComplete?.(aggregated);

      return {
        conversationId: responseConversationId,
        userId: responseUserId,
        message: aggregated,
      };
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        const abortError = new Error('Streaming request timed out');
        handlers?.onError?.(abortError);
        throw abortError;
      }

      const wrappedError = error instanceof Error ? error : new Error('Streaming request failed');
      handlers?.onError?.(wrappedError);
      throw wrappedError;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Get chat suggestions based on current context
   */
  async getChatSuggestions(context?: ChatContext): Promise<string[]> {
    try {
      // This could be expanded to call a suggestions endpoint
      return [
        "Tìm chuyến bay từ TP.HCM đến Đà Nẵng",
        "Gợi ý khách sạn 4 sao tại Đà Nẵng", 
        "Lập kế hoạch du lịch 3 ngày 2 đêm",
        "Tìm địa điểm ăn uống ngon tại Hội An"
      ];
    } catch (error) {
      console.error('Error getting chat suggestions:', error);
      return [];
    }
  }

  // ==================== WEBSOCKET CHAT ====================

  /**
   * Initialize WebSocket connection for chat (both text and voice)
   */
  initializeWebSocket(
    userId: string,
    onTextMessage?: (message: ChatMessageResponse) => void,
    onVoiceMessage?: (message: VoiceMessageResponse) => void,
    onConnect?: () => void,
    onError?: (error: any) => void
  ): void {
    if (this.wsClient?.connected) {
      console.log('✅ WebSocket already connected');
      return;
    }

    try {
      // Get AI agent URL from environment or default
      const wsUrl = this.websocketEndpoint;

      console.log('🔌 Connecting to WebSocket:', wsUrl);

      // Create SockJS instance
      const socket = new SockJS(wsUrl);

      // Create STOMP client
      this.wsClient = new Client({
        webSocketFactory: () => socket as any,
        reconnectDelay: this.RECONNECT_DELAY,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        debug: (str) => {
          if (process.env.NODE_ENV === 'development') {
            console.log('[STOMP]', str);
          }
        },
        onConnect: () => {
          console.log('✅ WebSocket connected');
          this.reconnectAttempts = 0;
          
          // Subscribe to user's text chat topic
          if (onTextMessage) {
            this.wsClient?.subscribe(`${this.textTopicPrefix}${userId}`, (message: IMessage) => {
              try {
                const textResponse: ChatMessageResponse = JSON.parse(message.body);
                console.log('💬 Received text message:', textResponse.type, textResponse.status);
                onTextMessage(textResponse);
              } catch (error) {
                console.error('❌ Error parsing text message:', error);
              }
            });
          }
          
          // Subscribe to user's voice topic
          if (onVoiceMessage) {
            this.wsClient?.subscribe(`${this.voiceTopicPrefix}${userId}`, (message: IMessage) => {
              try {
                const voiceResponse: VoiceMessageResponse = JSON.parse(message.body);
                console.log('📨 Received voice message:', voiceResponse.type, voiceResponse.status);
                onVoiceMessage(voiceResponse);
              } catch (error) {
                console.error('❌ Error parsing voice message:', error);
              }
            });
          }

          onConnect?.();
        },
        onStompError: (frame) => {
          console.error('❌ STOMP error:', frame.headers['message']);
          console.error('Details:', frame.body);
          onError?.(new Error(frame.headers['message'] || 'STOMP error'));
        },
        onWebSocketClose: () => {
          console.warn('⚠️ WebSocket closed');
          
          if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
            this.reconnectAttempts++;
            console.log(`🔄 Reconnecting... (${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS})`);
          } else {
            console.error('❌ Max reconnection attempts reached');
            onError?.(new Error('Unable to reconnect to WebSocket'));
          }
        },
        onWebSocketError: (error) => {
          console.error('❌ WebSocket error:', error);
          onError?.(error);
        },
      });

      this.wsClient.activate();
    } catch (error) {
      console.error('❌ Failed to initialize WebSocket:', error);
      onError?.(error);
    }
  }

  /**
   * Send text message via WebSocket (always uses streaming)
   */
  sendTextMessage(request: ChatMessageRequest): void {
    if (!this.wsClient?.connected) {
      throw new Error('WebSocket not connected. Call initializeWebSocket first.');
    }

    console.log('🌊 Sending text message (streaming):', {
      userId: request.userId,
      conversationId: request.conversationId,
      messageLength: request.message.length
    });

    this.wsClient.publish({
      destination: this.textAppDestination, // Uses /app/chat.stream
      body: JSON.stringify(request),
    });
  }

  /**
   * Send text message via WebSocket with streaming response (alias for sendTextMessage)
   */
  sendTextMessageStream(request: ChatMessageRequest): void {
    // Both methods now do the same thing - always stream
    this.sendTextMessage(request);
  }

  /**
   * Send voice message via WebSocket
   */
  sendVoiceMessage(request: VoiceMessageRequest): void {
    if (!this.wsClient?.connected) {
      throw new Error('WebSocket not connected. Call initializeWebSocket first.');
    }

    console.log('🎤 Sending voice message:', {
      userId: request.userId,
      conversationId: request.conversationId,
      audioFormat: request.audioFormat,
      audioDataLength: request.audioData.length,
      durationMs: request.durationMs
    });

    this.wsClient.publish({
      destination: this.voiceAppDestination,
      body: JSON.stringify(request),
    });
  }

  /**
   * Disconnect WebSocket
   */
  disconnectWebSocket(): void {
    if (this.wsClient?.connected) {
      console.log('🔌 Disconnecting WebSocket...');
      this.wsClient.deactivate();
      this.wsClient = null;
      this.reconnectAttempts = 0;
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isWebSocketConnected(): boolean {
    return this.wsClient?.connected ?? false;
  }
}

export const aiChatService = new AiChatService();
export default aiChatService;
