import { apiClient } from '@/lib/api-client';
import {
  ChatResponse,
  ChatContext,
  ChatHistoryResponse,
  ChatMessageRequest,
  StructuredChatPayload,
  ChatConversationSummary,
  ChatMessageResponse,
} from '../types';

class AiChatService {
  private baseUrl = '/ai';

  private generateRequestId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `ws-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  private getWebSocketUrl(): string {
    if (typeof window === 'undefined') {
      throw new Error('WebSocket chat requires a browser environment');
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/api/ai/ws/chat`;
  }

  private normalizeTimestamp(value?: string): string {
    if (!value) {
      return new Date().toISOString();
    }
    return value;
  }

  private generateConversationId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  private mapPayloadToChatResponse(
    payload: StructuredChatPayload,
    overrides?: { userMessage?: string; conversationId?: string }
  ): ChatResponse {
    const suggestionsRaw = payload.nextRequestSuggestions ?? payload.next_request_suggestions;
    const suggestions = Array.isArray(suggestionsRaw) ? suggestionsRaw : [];
    const conversationId = overrides?.conversationId || this.generateConversationId();
    return {
      userMessage: overrides?.userMessage ?? '',
      aiResponse: payload.message ?? '',
      conversationId,
      timestamp: new Date().toISOString(),
      results: payload.results ?? [],
      nextRequestSuggestions: suggestions,
      requiresConfirmation: payload.requiresConfirmation,
      confirmationContext: payload.confirmationContext
    };
  }

  async streamPrompt(
    message: string,
    options: {
      conversationId?: string;
      onEvent?: (event: ChatMessageResponse) => void;
    } = {}
  ): Promise<ChatMessageResponse> {
    const trimmed = message.trim();
    if (!trimmed) {
      throw new Error('Message cannot be empty');
    }

    const requestId = this.generateRequestId();
    const conversationId = options.conversationId ?? this.generateConversationId();
    const wsUrl = this.getWebSocketUrl();

    return new Promise<ChatMessageResponse>((resolve, reject) => {
      let settled = false;
      const socket = new WebSocket(wsUrl);

      const cleanup = () => {
        if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
          socket.close();
        }
      };

      socket.onopen = () => {
        const payload = {
          type: 'prompt',
          requestId,
          conversationId,
          message: trimmed,
          timestamp: Date.now(),
        };
        socket.send(JSON.stringify(payload));
      };

      socket.onmessage = (event) => {
        try {
          const data: ChatMessageResponse = JSON.parse(event.data);
          if (data.status === 'keepalive') {
            return;
          }
          data.requestId = data.requestId ?? requestId;
          data.conversationId = data.conversationId ?? conversationId;
          data.timestamp = this.normalizeTimestamp(data.timestamp);

          options.onEvent?.(data);

          if (data.type === 'ERROR') {
            settled = true;
            cleanup();
            reject(new Error(data.error || 'AI assistant encountered an error'));
          } else if (data.type === 'RESPONSE') {
            settled = true;
            cleanup();
            resolve(data);
          }
        } catch (err) {
          console.error('Failed to parse AI chat stream payload', err);
        }
      };

      socket.onerror = () => {
        if (!settled) {
          settled = true;
          cleanup();
          reject(new Error('WebSocket connection error'));
        }
      };

      socket.onclose = () => {
        if (!settled) {
          settled = true;
          reject(new Error('WebSocket connection closed before completion'));
        }
      };
    });
  }

  /**
   * Send a message to the AI chatbot (Synchronous - waits for complete response)
   * Uses REST API with Agentic Workflow Orchestration (Routing + Parallelization + Evaluation)
   * Note: userId is automatically extracted from JWT token on backend
   */
  async sendMessage(
    message: string, 
    context?: ChatContext
  ): Promise<ChatResponse> {
    try {
      const response = await this.streamPrompt(message, {
        conversationId: context?.conversationId,
      });

      return {
        userMessage: message,
        aiResponse: response.aiResponse ?? '',
        conversationId: response.conversationId,
        requestId: response.requestId,
        userId: response.userId,
        timestamp: this.normalizeTimestamp(response.timestamp),
        results: response.results ?? [],
        nextRequestSuggestions: response.nextRequestSuggestions ?? response.next_request_suggestions,
        requiresConfirmation: response.requiresConfirmation,
        confirmationContext: response.confirmationContext,
      };
    } catch (error: any) {
      console.error('AI Chat Service Error:', error);
      
      // Return a fallback response
      return {
        userMessage: message,
        aiResponse: 'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.',
        conversationId: context?.conversationId || this.generateConversationId(),
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
  async listConversations(): Promise<ChatConversationSummary[]> {
    try {
      const response = await apiClient.get<ChatConversationSummary[]>(
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
   * Get chat suggestions based on current context
   */
  async getChatSuggestions(context?: ChatContext): Promise<string[]> {
    try {
      return [
        "Tìm chuyến bay từ Hồ Chí Minh đến Đà Nẵng",
        "Gợi ý khách sạn 4 sao tại Đà Nẵng", 
        "Lập kế hoạch du lịch 3 ngày 2 đêm",
        "Tìm địa điểm ăn uống ngon tại Hội An"
      ];
    } catch (error) {
      console.error('Error getting chat suggestions:', error);
      return [];
    }
  }

  async getDefaultDestinations(): Promise<ChatResponse> {
    try {
      const payload = await apiClient.get<StructuredChatPayload>(
        `${this.baseUrl}/explore/default`
      );
      return this.mapPayloadToChatResponse(payload, {
        conversationId: `explore-${this.generateConversationId()}`
      });
    } catch (error: any) {
      console.error('Get Default Destinations Error:', error);
      return this.mapPayloadToChatResponse({
        message: 'Xin lỗi, tôi không thể tải gợi ý du lịch lúc này.',
        results: [],
        next_request_suggestions: []
      }, { conversationId: `explore-${this.generateConversationId()}` });
    }
  }

  async exploreDestinations(query: string, userCountry?: string): Promise<ChatResponse> {
    try {
      const params: any = { query };
      if (userCountry) {
        params.userCountry = userCountry;
      }
      const payload = await apiClient.get<StructuredChatPayload>(
        `${this.baseUrl}/explore`,
        { params }
      );
      return this.mapPayloadToChatResponse(payload, {
        userMessage: query,
        conversationId: `explore-${this.generateConversationId()}`
      });
    } catch (error: any) {
      console.error('Explore Destinations Error:', error);
      return this.mapPayloadToChatResponse({
        message: 'Xin lỗi, tôi không thể tìm kiếm địa điểm lúc này. Vui lòng thử lại sau.',
        results: [],
        next_request_suggestions: []
      }, {
        userMessage: query,
        conversationId: `explore-${this.generateConversationId()}`
      });
    }
  }

  async getTrendingDestinations(userCountry?: string): Promise<ChatResponse> {
    try {
      const params: any = {};
      if (userCountry) {
        params.userCountry = userCountry;
      }
      const payload = await apiClient.get<StructuredChatPayload>(
        `${this.baseUrl}/explore/trending`,
        { params }
      );
      return this.mapPayloadToChatResponse(payload, {
        userMessage: 'Gợi ý điểm đến thịnh hành',
        conversationId: `explore-${this.generateConversationId()}`
      });
    } catch (error: any) {
      console.error('Get Trending Destinations Error:', error);
      return this.mapPayloadToChatResponse({
        message: 'Xin lỗi, tôi không thể tải điểm đến phổ biến lúc này.',
        results: [],
        next_request_suggestions: []
      }, {
        userMessage: 'Gợi ý điểm đến thịnh hành',
        conversationId: `explore-${this.generateConversationId()}`
      });
    }
  }

  async getSeasonalDestinations(season?: string, userCountry?: string): Promise<ChatResponse> {
    try {
      const params: any = {};
      if (season) {
        params.season = season;
      }
      if (userCountry) {
        params.userCountry = userCountry;
      }
      const payload = await apiClient.get<StructuredChatPayload>(
        `${this.baseUrl}/explore/seasonal`,
        { params }
      );
      const userMessage = season
        ? `Gợi ý điểm đến phù hợp mùa ${season}`
        : 'Gợi ý điểm đến theo mùa';
      return this.mapPayloadToChatResponse(payload, {
        userMessage,
        conversationId: `explore-${this.generateConversationId()}`
      });
    } catch (error: any) {
      console.error('Get Seasonal Destinations Error:', error);
      const userMessage = season
        ? `Gợi ý điểm đến phù hợp mùa ${season}`
        : 'Gợi ý điểm đến theo mùa';
      return this.mapPayloadToChatResponse({
        message: 'Xin lỗi, tôi không thể tải gợi ý theo mùa lúc này.',
        results: [],
        next_request_suggestions: []
      }, {
        userMessage,
        conversationId: `explore-${this.generateConversationId()}`
      });
    }
  }
}

export const aiChatService = new AiChatService();
export default aiChatService;
