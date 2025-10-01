import { apiClient } from '@/lib/api-client';
import { ChatRequest, ChatResponse, ChatContext, ChatHistoryResponse } from '../types';

class AiChatService {
  private baseUrl = '/ai';

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
}

export const aiChatService = new AiChatService();
export default aiChatService;