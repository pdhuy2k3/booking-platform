import { apiClient } from '@/lib/api-client';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { 
  ChatRequest, 
  ChatResponse, 
  ChatContext, 
  ChatHistoryResponse,
  VoiceMessageRequest,
  VoiceMessageResponse 
} from '../types';

class AiChatService {
  private baseUrl = '/ai';
  private wsClient: Client | null = null;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly RECONNECT_DELAY = 3000;

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
        conversationId: context?.conversationId
        // userId will be automatically extracted from JWT token on backend
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
   * Send a streaming message (for future implementation)
   */
  async sendStreamingMessage(
    message: string,
    onChunk: (chunk: string) => void,
    context?: ChatContext
  ): Promise<void> {
    // TODO: Implement streaming chat if needed
    // For now, fallback to regular message
    const response = await this.sendMessage(message, context);
    onChunk(response.aiResponse);
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

  // ==================== WEBSOCKET VOICE CHAT ====================

  /**
   * Initialize WebSocket connection for voice chat
   */
  initializeWebSocket(
    userId: string,
    onMessage: (message: VoiceMessageResponse) => void,
    onConnect?: () => void,
    onError?: (error: any) => void
  ): void {
    if (this.wsClient?.connected) {
      console.log('✅ WebSocket already connected');
      return;
    }

    try {
      // Get AI agent URL from environment or default
      const wsUrl = `api/ai/ws/voice`;

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
          
          // Subscribe to user's voice topic
          this.wsClient?.subscribe(`api/ai/topic/voice.${userId}`, (message: IMessage) => {
            try {
              const voiceResponse: VoiceMessageResponse = JSON.parse(message.body);
              console.log('📨 Received voice message:', voiceResponse.type, voiceResponse.status);
              onMessage(voiceResponse);
            } catch (error) {
              console.error('❌ Error parsing voice message:', error);
            }
          });

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
      destination: '/api/ai/app/voice.send',
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
