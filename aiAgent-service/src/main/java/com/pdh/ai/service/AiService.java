package com.pdh.ai.service;

import com.pdh.ai.model.dto.ChatHistoryResponse;
import com.pdh.ai.model.dto.StructuredChatPayload;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface AiService {
    // Synchronous methods for regular chat and history operations
    StructuredChatPayload complete(String message);
    StructuredChatPayload completeWithConversation(String message, String conversationId, String userId);
    ChatHistoryResponse getChatHistory(String conversationId, String userId);
    void clearChatHistory(String conversationId, String userId);
    java.util.List<String> getUserConversations(String userId);
    
    // Reactive methods only for chat interactions with LLM
    Mono<StructuredChatPayload> completeAsync(String message);
    Mono<StructuredChatPayload> completeWithConversationAsync(String message, String conversationId, String userId);
    Flux<String> completeStream(String message);
    Flux<String> completeWithConversationStream(String message, String conversationId, String userId);
}
