import { useState, useCallback, useEffect, useRef } from 'react';
import { aiChatService } from '../service';
import { ChatMessage, ChatContext, ChatStructuredResult, ChatMessageResponse } from '../types';
import { useAuth } from '@/contexts/auth-context';

interface UseAiChatOptions {
  conversationId?: string;
  loadHistoryOnMount?: boolean;
  context?: ChatContext;
  onError?: (error: string) => void;
  useWebSocket?: boolean; // Enable WebSocket mode
  mode?: 'stream' | 'sync'; // Processing mode
}

interface UseAiChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  conversationId: string | null;
  isConnected: boolean; // WebSocket connection status
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  loadChatHistory: () => Promise<void>;
  suggestions: string[];
  getSuggestions: () => Promise<void>;
  mode: 'stream' | 'sync';
  setMode: (mode: 'stream' | 'sync') => void;
}

interface ParsedStructuredPayload {
  message: string;
  results: ChatStructuredResult[];
  suggestions: string[];
}

const parseStructuredPayload = (raw?: string | null): ParsedStructuredPayload | null => {
  if (!raw) {
    return null;
  }

  let content = raw.trim();
  if (!content) {
    return null;
  }

  console.log('🔍 Parsing structured payload, raw length:', content.length);
  console.log('🔍 First 200 chars:', content.substring(0, 200));

  if (content.startsWith('```')) {
    const newlineIndex = content.indexOf('\n');
    if (newlineIndex > 0) {
      content = content.substring(newlineIndex + 1);
    } else {
      content = content.substring(3);
    }
  }

  if (content.endsWith('```')) {
    content = content.substring(0, content.length - 3);
  }

  content = content.trim();

  // Remove optional language identifiers (e.g. "json") that may prefix the payload
  if (content.startsWith('json')) {
    content = content.substring(4).trim();
  }

  const tryParse = (value: string): any => {
    try {
      const result = JSON.parse(value);
      console.log('✅ Parse successful:', Object.keys(result));
      return result;
    } catch (err) {
      console.log('❌ Parse failed:', err);
      return null;
    }
  };

  let parsed: any = tryParse(content);

  if (!parsed) {
    const start = content.indexOf('{');
    const end = content.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      parsed = tryParse(content.substring(start, end + 1));
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    return null;
  }

  const message = typeof parsed.message === 'string' && parsed.message.trim().length > 0
    ? parsed.message
    : raw;

  const results = Array.isArray(parsed.results)
    ? parsed.results.filter(Boolean) as ChatStructuredResult[]
    : [];

  const rawSuggestions = parsed.next_request_suggestions ?? parsed.nextRequestSuggestions ?? [];
  const suggestionArray = Array.isArray(rawSuggestions)
    ? rawSuggestions
    : rawSuggestions && typeof rawSuggestions === 'object'
      ? Object.values(rawSuggestions as Record<string, unknown>)
      : [];

  const suggestions: string[] = suggestionArray
    .map((item: unknown) => {
      if (typeof item === 'string') return item.trim();
      if (item && typeof item === 'object' && 'value' in item && typeof (item as { value: unknown }).value === 'string') {
        return ((item as { value: string }).value).trim();
      }
      return String(item ?? '').trim();
    })
    .filter((item: string) => item.length > 0);

  return { message, results, suggestions };
};

const createConversationId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const createMessageId = (prefix: 'user' | 'assistant'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

export function useAiChat(options: UseAiChatOptions = {}): UseAiChatReturn {
  const { 
    conversationId: initialConversationId, 
    loadHistoryOnMount = false, 
    context, 
    onError,
    useWebSocket = true, // Default to WebSocket
    mode: initialMode = 'sync' // Default to sync mode
  } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Xin chào! Tôi có thể giúp bạn tìm kiếm chuyến bay, khách sạn hoặc lên kế hoạch du lịch. Bạn muốn đi đâu?',
      isUser: false,
      timestamp: new Date(),
      suggestions: [],
    },
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId || null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [mode, setMode] = useState<'stream' | 'sync'>(initialMode);
  const { user, refreshChatConversations } = useAuth();
  const pendingMessageRef = useRef<string | null>(null);
  const currentAssistantMessageIdRef = useRef<string | null>(null);
  const conversationIdRef = useRef(conversationId);
  const onErrorRef = useRef(onError);

  // Keep refs updated
  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  // Initialize WebSocket connection (only once per user)
  useEffect(() => {
    if (!useWebSocket || !user?.id) {
      return;
    }

    console.log('🔌 Initializing WebSocket for text chat...');

    aiChatService.initializeWebSocket(
      user.id,
      (response: ChatMessageResponse) => {
        console.log('📨 Received WebSocket response:', response.type, response.status);

        if (response.type === 'PROCESSING') {
          // Update loading state
          setIsLoading(true);
        } else if (response.type === 'RESPONSE') {
          // Sync response: Immediate complete response with all data
          console.log('📨 Full response object:', response);
          const parsed = parseStructuredPayload(response.aiResponse);
          console.log('📨 Parsed payload:', parsed);

          // Extract suggestions from multiple possible sources
          const extractedSuggestions = 
            response.nextRequestSuggestions ?? 
            response.next_request_suggestions ??
            parsed?.suggestions ?? 
            [];

          console.log('📋 Extracted suggestions:', extractedSuggestions);
          console.log('📋 From response.nextRequestSuggestions:', response.nextRequestSuggestions);
          console.log('📋 From response.next_request_suggestions:', response.next_request_suggestions);
          console.log('📋 From parsed.suggestions:', parsed?.suggestions);

          // Update the specific assistant message using the stored message ID
          const targetMessageId = currentAssistantMessageIdRef.current;
          if (targetMessageId) {
            setMessages(prev => prev.map(msg => {
              if (msg.id === targetMessageId && !msg.isUser) {
                return {
                  ...msg,
                  content: parsed?.message ?? response.aiResponse ?? '',
                  results: response.results ?? parsed?.results ?? [],
                  timestamp: new Date(response.timestamp),
                  suggestions: extractedSuggestions,
                };
              }
              return msg;
            }));
          }
          
          // Sync response is always complete
          setIsLoading(false);
          currentAssistantMessageIdRef.current = null; // Clear the reference
          
          // Update conversation ID if needed
          if (response.conversationId && response.conversationId !== conversationIdRef.current) {
            setConversationId(response.conversationId);
            refreshChatConversations().catch(console.error);
          }
        } else if (response.type === 'ERROR') {
          setError(response.error ?? 'Đã xảy ra lỗi');
          setIsLoading(false);
          onErrorRef.current?.(response.error ?? 'Đã xảy ra lỗi');
          
          // Update the specific assistant message with error
          const targetMessageId = currentAssistantMessageIdRef.current;
          if (targetMessageId) {
            setMessages(prev => prev.map(msg => {
              if (msg.id === targetMessageId && !msg.isUser) {
                return {
                  ...msg,
                  content: response.error ?? 'Đã xảy ra lỗi',
                  timestamp: new Date(response.timestamp),
                  suggestions: [],
                };
              }
              return msg;
            }));
          }
          currentAssistantMessageIdRef.current = null; // Clear the reference
        }
      },
      undefined, // No voice message handler
      () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);
      },
      (error) => {
        console.error('❌ WebSocket error:', error);
        setIsConnected(false);
        setError('Không thể kết nối WebSocket');
      }
    );

    return () => {
      console.log('🔌 Disconnecting WebSocket...');
      aiChatService.disconnectWebSocket();
      setIsConnected(false);
    };
    // Only reconnect if user changes, not on every conversation change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useWebSocket, user?.id]);

  useEffect(() => {
    if (initialConversationId === undefined) {
      return;
    }

    if (initialConversationId !== conversationId) {
      setConversationId(initialConversationId || null);
    }
  }, [initialConversationId, conversationId]);

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
       const historyMessages: ChatMessage[] = historyResponse.messages.map((msg, index) => {
         const parsed = parseStructuredPayload(msg.content);

          return {
            id: `history-${index}`,
            content: parsed?.message ?? msg.content,
            isUser: msg.role === 'user',
            timestamp: new Date(msg.timestamp),
            results: parsed?.results ?? [],
            suggestions: parsed?.suggestions ?? [],
          };
        });
        
        setMessages(historyMessages);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  }, [conversationId]);

  const sendMessage = useCallback(async (messageContent: string) => {
    const trimmedMessage = messageContent.trim();
    if (!trimmedMessage || isLoading) {
      return;
    }

    const effectiveConversationId = conversationId || context?.conversationId || createConversationId();
    const userMessageId = createMessageId('user');
    const assistantMessageId = createMessageId('assistant');

    const userMessage: ChatMessage = {
      id: userMessageId,
      content: trimmedMessage,
      isUser: true,
      timestamp: new Date(),
      results: [],
      suggestions: [],
    };

    const assistantPlaceholder: ChatMessage = {
      id: assistantMessageId,
      content: '',
      isUser: false,
      timestamp: new Date(),
      results: [],
      suggestions: [],
    };

    setMessages(prev => [...prev, userMessage, assistantPlaceholder]);
    setIsLoading(true);
    setError(null);

    if (!conversationId) {
      setConversationId(effectiveConversationId);
    }

    // Store the assistant message ID for WebSocket updates
    currentAssistantMessageIdRef.current = assistantMessageId;

    // Use WebSocket if enabled and connected (SYNC PROCESSING)
    if (useWebSocket && user?.id) {
      try {
        if (!aiChatService.isWebSocketConnected()) {
          throw new Error('WebSocket not connected');
        }

        // Send via WebSocket with selected mode
        aiChatService.sendTextMessage({
          userId: user.id,
          conversationId: effectiveConversationId,
          message: trimmedMessage,
          timestamp: Date.now(),
          mode,
        });
        
        // Response will be handled by WebSocket listener
        return;
      } catch (wsError) {
        console.error('WebSocket send failed, falling back to REST:', wsError);
        // Fall through to REST API
      }
    }

    // Fallback to REST API (sync)
    try {
      const chatContext: ChatContext = {
        ...context,
        conversationId: effectiveConversationId,
      };

      const response = await aiChatService.sendMessage(trimmedMessage, chatContext);

      const shouldRefreshConversations = !conversationId || response.conversationId !== conversationId;

      if (response.conversationId && response.conversationId !== conversationId) {
        setConversationId(response.conversationId);
      }

      if (shouldRefreshConversations) {
        refreshChatConversations().catch((err) => {
          console.error('Failed to refresh conversations:', err);
        });
      }

      if (response.error) {
        setError(response.error);
        onError?.(response.error);
      }

      // Parse structured response
      const parsedResponse = parseStructuredPayload(response.aiResponse);

      setMessages(prev => prev.map(msg => {
        if (msg.id !== assistantMessageId) {
          return msg;
        }
        return {
          ...msg,
          content: parsedResponse?.message ?? response.aiResponse,
          results: parsedResponse?.results ?? [],
          timestamp: new Date(response.timestamp || Date.now()),
          suggestions: response.nextRequestSuggestions ?? parsedResponse?.suggestions ?? [],
        };
      }));

      // Clear the assistant message reference when using REST API
      currentAssistantMessageIdRef.current = null;
    } catch (err) {
      const errorMessage = 'Không thể gửi tin nhắn. Vui lòng thử lại.';
      setError(errorMessage);
      onError?.(errorMessage);

      setMessages(prev => prev.map(msg => {
        if (msg.id !== assistantMessageId) {
          return msg;
        }
        return {
          ...msg,
          content: errorMessage,
          results: [],
          timestamp: new Date(),
          suggestions: [],
        };
      }));

      // Clear the assistant message reference on error
      currentAssistantMessageIdRef.current = null;
    } finally {
      // Only set loading to false if using REST API
      // WebSocket responses handle this in the listener
      if (!useWebSocket) {
        setIsLoading(false);
        // Clear the reference for REST API cases
        currentAssistantMessageIdRef.current = null;
      }
    }
  }, [isLoading, conversationId, context, refreshChatConversations, onError, useWebSocket, user]);

  const clearMessages = useCallback(async () => {
    if (conversationId) {
      try {
        await aiChatService.clearChatHistory(conversationId);
        refreshChatConversations().catch((err) => {
          console.error('Failed to refresh conversations:', err);
        });
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
        results: [],
        suggestions: [],
      },
    ]);
    setError(null);
    setConversationId(null);
  }, [conversationId, refreshChatConversations]);

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
    isConnected,
    sendMessage,
    clearMessages,
    loadChatHistory,
    suggestions,
    getSuggestions,
    mode,
    setMode,
  };
}
