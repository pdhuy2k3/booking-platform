import { useState, useCallback, useEffect, useRef } from 'react';
import { aiChatService } from '../service';
import { ChatMessage, ChatContext, ChatStructuredResult, ChatMessageResponse } from '../types';
import { useAuth } from '@/contexts/auth-context';

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
    startNewConversation: () => void;
    loadChatHistory: () => Promise<void>;
    suggestions: string[];
    getSuggestions: () => Promise<void>;
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

const createInitialMessages = (): ChatMessage[] => [
    {
        id: '1',
        content: 'Xin chào! Tôi có thể giúp bạn tìm kiếm chuyến bay, khách sạn hoặc lên kế hoạch du lịch. Bạn muốn đi đâu?',
        isUser: false,
        timestamp: new Date(),
        results: [],
        suggestions: [],
    },
];

const createMessageId = (prefix: 'user' | 'assistant'): string => {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

export function useAiChat(options: UseAiChatOptions = {}): UseAiChatReturn {
    const {
        conversationId: initialConversationId,
        loadHistoryOnMount = false,
        context,
        onError
    } = options;

    const [messages, setMessages] = useState<ChatMessage[]>(() => createInitialMessages());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [conversationId, setConversationId] = useState<string | null>(initialConversationId || null);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const { user, refreshChatConversations } = useAuth();
    const currentAssistantMessageIdRef = useRef<string | null>(null);
    const conversationIdRef = useRef(conversationId);
    const onErrorRef = useRef(onError);
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        conversationIdRef.current = conversationId;
    }, [conversationId]);

    useEffect(() => {
        onErrorRef.current = onError;
    }, [onError]);

    useEffect(() => {
        if (initialConversationId === undefined) {
            return;
        }

        if (initialConversationId !== conversationId) {
            setConversationId(initialConversationId || null);
        }
    }, [initialConversationId, conversationId]);

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
                        results: [...(parsed?.results ?? [])],
                        suggestions: [...(parsed?.suggestions ?? [])],
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

        // Cancel any ongoing request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
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

        currentAssistantMessageIdRef.current = assistantMessageId;
        abortControllerRef.current = new AbortController();

        try {
            const stream = await aiChatService.streamMessage(trimmedMessage, effectiveConversationId);

            if (!stream) {
                throw new Error('Failed to establish streaming connection');
            }

            const reader = stream.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            let assistantMessageContent = '';
            let assistantResults: ChatStructuredResult[] = [];
            let assistantSuggestions: string[] = [];

            try {
                while (true) {
                    const { done, value } = await reader.read();

                    if (done) {
                        console.log('✅ Stream completed');
                        break;
                    }

                    // Decode and add to buffer
                    buffer += decoder.decode(value, { stream: true });

                    // Process complete lines from buffer
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || ''; // Keep incomplete line in buffer

                    for (const line of lines) {
                        const trimmedLine = line.trim();

                        if (!trimmedLine) continue;

                        // Handle SSE format: "data: {...}"
                        if (trimmedLine.startsWith('data:')) {
                            const dataStr = trimmedLine.substring(5).trim();

                            // Check for stream end marker
                            if (dataStr === '[DONE]') {
                                console.log('🏁 Received [DONE] marker');
                                break;
                            }

                            try {
                                const payload = JSON.parse(dataStr);

                                // Update content progressively
                                if (payload.message !== undefined) {
                                    assistantMessageContent = payload.message;
                                }

                                if (payload.results !== undefined) {
                                    assistantResults = Array.isArray(payload.results) ? payload.results : [];
                                }

                                if (payload.next_request_suggestions !== undefined || payload.nextRequestSuggestions !== undefined) {
                                    assistantSuggestions = payload.next_request_suggestions || payload.nextRequestSuggestions || [];
                                }

                                // Update UI in real-time
                                setMessages(prev => {
                                    const newMessages = [...prev];
                                    const messageIndex = newMessages.findIndex(msg => msg.id === assistantMessageId);

                                    if (messageIndex !== -1) {
                                        newMessages[messageIndex] = {
                                            ...newMessages[messageIndex],
                                            content: assistantMessageContent,
                                            results: [...assistantResults],
                                            suggestions: [...assistantSuggestions],
                                        };
                                    }

                                    return newMessages;
                                });

                                console.log('📦 Stream chunk processed:', {
                                    messageLength: assistantMessageContent.length,
                                    resultsCount: assistantResults.length,
                                    suggestionsCount: assistantSuggestions.length
                                });

                            } catch (parseError) {
                                console.error('❌ Error parsing stream data:', parseError, 'Data:', dataStr);
                            }
                        }
                    }
                }
            } finally {
                reader.releaseLock();
            }

            const shouldRefreshConversations = !conversationId || effectiveConversationId !== conversationId;

            if (effectiveConversationId !== conversationId) {
                setConversationId(effectiveConversationId);
            }

            if (shouldRefreshConversations) {
                refreshChatConversations().catch((err) => {
                    console.error('Failed to refresh conversations:', err);
                });
            }

            currentAssistantMessageIdRef.current = null;

        } catch (err: any) {
            // Don't show error if request was aborted
            if (err.name === 'AbortError') {
                console.log('Stream aborted by user');
                return;
            }

            const errorMessage = 'Không thể gửi tin nhắn. Vui lòng thử lại.';
            setError(errorMessage);
            onError?.(errorMessage);

            setMessages(prev => {
                const newMessages = [...prev];
                const messageIndex = newMessages.findIndex(msg => msg.id === assistantMessageId);

                if (messageIndex !== -1) {
                    newMessages[messageIndex] = {
                        ...newMessages[messageIndex],
                        content: errorMessage,
                        results: [],
                        timestamp: new Date(),
                        suggestions: [],
                    };
                }

                return newMessages;
            });

            currentAssistantMessageIdRef.current = null;

        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    }, [isLoading, conversationId, context, refreshChatConversations, onError]);

    const startNewConversation = useCallback(() => {
        // Cancel any ongoing request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        setMessages(createInitialMessages());
        setError(null);
        setConversationId(null);
    }, []);

    const clearMessages = useCallback(async () => {
        // Cancel any ongoing request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

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

        setMessages(createInitialMessages());
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

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    return {
        messages,
        isLoading,
        error,
        conversationId,
        sendMessage,
        clearMessages,
        startNewConversation,
        loadChatHistory,
        suggestions,
        getSuggestions,
    };
}