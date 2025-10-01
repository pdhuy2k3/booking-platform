import { useState, useCallback, useEffect } from 'react';
import { aiChatService } from '../service';
import { ChatMessage, ChatContext } from '../types';

interface UseAiChatOptions {
  conversationId?: string;
  loadHistoryOnMount?: boolean;
  context?: ChatContext;
  onError?: (error: string) => void;
}

interface UseAiChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  conversationId: string | null;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  loadChatHistory: () => Promise<void>;
  suggestions: string[];
  getSuggestions: () => Promise<void>;
}

export function useAiChat(options: UseAiChatOptions = {}): UseAiChatReturn {
  const { conversationId: initialConversationId, loadHistoryOnMount = false, context, onError } = options;
  
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Xin chào! Tôi có thể giúp bạn tìm kiếm chuyến bay, khách sạn hoặc lên kế hoạch du lịch. Bạn muốn đi đâu?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId || null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Load chat history on mount if requested
  useEffect(() => {
    if (loadHistoryOnMount && conversationId) {
      loadChatHistory();
    }
  }, [conversationId, loadHistoryOnMount]);

  const loadChatHistory = useCallback(async () => {
    if (!conversationId) return;

    try {
      const historyResponse = await aiChatService.getChatHistory(conversationId);
      
      if (historyResponse.messages && historyResponse.messages.length > 0) {
        const historyMessages: ChatMessage[] = historyResponse.messages.map((msg, index) => ({
          id: `history-${index}`,
          content: msg.content,
          isUser: msg.role === 'user',
          timestamp: new Date(msg.timestamp),
        }));
        
        setMessages(historyMessages);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  }, [conversationId]);

  const sendMessage = useCallback(async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: messageContent.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const chatContext: ChatContext = {
        conversationId: conversationId || undefined,
        ...context
      };

      const response = await aiChatService.sendMessage(messageContent, chatContext);
      
      // Update conversation ID if it was generated
      if (response.conversationId && response.conversationId !== conversationId) {
        setConversationId(response.conversationId);
      }
      
      if (response.error) {
        setError(response.error);
        onError?.(response.error);
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.aiResponse,
        isUser: false,
        timestamp: new Date(response.timestamp),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage = 'Không thể gửi tin nhắn. Vui lòng thử lại.';
      setError(errorMessage);
      onError?.(errorMessage);
      
      // Add error message to chat
      const errorAiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: errorMessage,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorAiMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, conversationId, context, onError]);

  const clearMessages = useCallback(async () => {
    if (conversationId) {
      try {
        await aiChatService.clearChatHistory(conversationId);
      } catch (err) {
        console.error('Failed to clear chat history:', err);
      }
    }
    
    setMessages([
      {
        id: '1',
        content: 'Xin chào! Tôi có thể giúp bạn tìm kiếm chuyến bay, khách sạn hoặc lên kế hoạch du lịch. Bạn muốn đi đâu?',
        isUser: false,
        timestamp: new Date(),
      },
    ]);
    setError(null);
    setConversationId(null);
  }, [conversationId]);

  const getSuggestions = useCallback(async () => {
    try {
      const newSuggestions = await aiChatService.getChatSuggestions({ 
        conversationId: conversationId || undefined, 
        ...context 
      });
      setSuggestions(newSuggestions);
    } catch (err) {
      console.error('Failed to get suggestions:', err);
    }
  }, [conversationId, context]);

  return {
    messages,
    isLoading,
    error,
    conversationId,
    sendMessage,
    clearMessages,
    loadChatHistory,
    suggestions,
    getSuggestions,
  };
}