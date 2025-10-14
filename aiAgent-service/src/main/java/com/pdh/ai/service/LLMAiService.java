package com.pdh.ai.service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import com.pdh.ai.agent.CoreAgent;
import com.pdh.ai.model.dto.ChatConversationSummaryDto;
import com.pdh.ai.model.dto.ChatHistoryResponse;
import com.pdh.ai.model.dto.StructuredChatPayload;

import com.pdh.ai.model.entity.ChatMessage;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;


import com.pdh.ai.repository.ChatMessageRepository;


@Service
public class LLMAiService implements AiService {

    private final CoreAgent coreAgent;
    private final ChatMessageRepository chatMessageRepository;

    public LLMAiService(CoreAgent coreAgent,
                        ChatMessageRepository chatMessageRepository) {
        this.coreAgent = coreAgent;
        this.chatMessageRepository = chatMessageRepository;
    }
    @Override
    public Flux<StructuredChatPayload> processStreamStructured(String message, String conversationId, String userId) {
        String actualUserId = resolveAuthenticatedUserId(userId);
        String conversationKey = formatConversationKey(actualUserId, conversationId);


        return coreAgent.processStreamStructured(message,conversationId);
    }

    @Override
    public ChatHistoryResponse getChatHistory(String conversationId, String userId) {
        String actualUserId = resolveAuthenticatedUserId(userId);
        String conversationKey = formatConversationKey(actualUserId, conversationId);

        List<ChatMessage> storedMessages = chatMessageRepository
                .findByConversationIdOrderByTimestampAsc(conversationKey);

        List<ChatHistoryResponse.ChatMessage> chatMessages = storedMessages.stream()
                .map(entity -> ChatHistoryResponse.ChatMessage.builder()
                        .content(entity.getContent())
                        .role(entity.getRole().name().toLowerCase())
                        .timestamp(LocalDateTime.ofInstant(entity.getTimestamp(), ZoneOffset.UTC))
                        .build())
                .toList();

        // For this implementation, we'll use the timestamp of the first message as createdAt
        // and the last message as lastUpdated, or current time if no messages exist
        Instant createdAt = storedMessages.isEmpty() ? Instant.now() 
            : storedMessages.get(0).getTimestamp();
        Instant lastUpdatedInstant = storedMessages.isEmpty()
                ? createdAt
                : storedMessages.get(storedMessages.size() - 1).getTimestamp();

        return ChatHistoryResponse.builder()
                .conversationId(conversationId)
                .messages(chatMessages)
                .createdAt(LocalDateTime.ofInstant(createdAt, ZoneOffset.UTC))
                .lastUpdated(LocalDateTime.ofInstant(lastUpdatedInstant, ZoneOffset.UTC))
                .build();
    }

    @Override
    public void clearChatHistory(String conversationId, String userId) {
        String actualUserId = resolveAuthenticatedUserId(userId);
        String conversationKey = formatConversationKey(actualUserId, conversationId);
        
        // Simply delete all messages with this conversation key
        chatMessageRepository.deleteByConversationId(conversationKey);
    }

    @Override
    public List<ChatConversationSummaryDto> getUserConversations(String userId) {
        String actualUserId = resolveAuthenticatedUserId(userId);
        
        // Get all unique conversation IDs for this user
        // Since we don't have a dedicated conversation table anymore, we'll query the messages table
        // to get distinct conversation IDs for this user
        List<String> conversationKeys = chatMessageRepository
            .findByConversationIdStartingWithOrderByTimestampDesc(actualUserId + ":", PageRequest.of(0, 50))
            .stream()
            .map(ChatMessage::getConversationId)
            .distinct()
            .toList();

        // For each conversation, find the most recent message to determine the title and last updated
        return conversationKeys.stream().map(key -> {
            // Extract the conversationId from the full key (user:convId)
            String conversationId = extractConversationIdFromKey(key);
            String title = extractTitleFromMessages(key);
            Instant createdAt = extractCreatedAtFromMessages(key);
            Instant lastUpdated = extractLastUpdatedFromMessages(key);

            return ChatConversationSummaryDto.builder()
                    .id(conversationId) // Just the conversation ID, not the full key
                    .title(normalizeTitle(title))
                    .createdAt(createdAt)
                    .lastUpdated(lastUpdated)
                    .build();
        }).toList();
    }


    /**
     * Validates and resolves the authenticated user ID.
     * Since the userId parameter comes from the controller which extracts it from OAuth2 principal,
     * we just validate it's not null or empty.
     */
    private String resolveAuthenticatedUserId(String requestUserId) {
        // If a specific user ID is provided (from auth context), use it
        if (requestUserId != null && !requestUserId.isBlank()) {
            return requestUserId;
        }

        // For WebSocket scenarios, require user ID to be provided
        throw new IllegalStateException("User must be authenticated to perform this operation. Please log in.");
    }

    private String defaultTitle() {
        return "Conversation " + LocalDateTime.now(ZoneOffset.UTC);
    }

    private String defaultTitle(String message) {
        if (message == null || message.isBlank()) {
            return defaultTitle();
        }
        int maxLength = 60;
        String sanitized = message.replaceAll("\s+", " ").trim();
        return sanitized.length() <= maxLength ? sanitized : sanitized.substring(0, maxLength) + "...";
    }

    private String normalizeTitle(String title) {
        if (title != null) {
            String trimmed = title.trim();
            if (!trimmed.isEmpty()) {
                return trimmed;
            }
        }
        return defaultTitle();
    }

    /**
     * Format conversation key as {userId}:{conversationId}
     */
    private String formatConversationKey(String userId, String conversationId) {
        return String.format("%s:%s", userId, conversationId);
    }

    /**
     * Extract conversation ID from the full key
     */
    private String extractConversationIdFromKey(String conversationKey) {
        int separatorIndex = conversationKey.lastIndexOf(':');
        if (separatorIndex >= 0) {
            return conversationKey.substring(separatorIndex + 1);
        }
        return conversationKey; // If no separator, return the whole string
    }

    /**
     * Extract a title from the messages in a conversation
     */
    private String extractTitleFromMessages(String conversationKey) {
        List<ChatMessage> messages = chatMessageRepository
            .findByConversationIdOrderByTimestampAsc(conversationKey);
        
        if (!messages.isEmpty()) {
            // Use the content of the first user message as the title
            for (ChatMessage message : messages) {
                if (message.getRole().equals(org.springframework.ai.chat.messages.MessageType.USER)) {
                    String content = message.getContent();
                    if (content != null && !content.trim().isEmpty()) {
                        int maxLength = 60;
                        String sanitized = content.replaceAll("\\s+", " ").trim();
                        return sanitized.length() <= maxLength ? sanitized : sanitized.substring(0, maxLength) + "...";
                    }
                }
            }
            // If no user message found, use the first message
            String content = messages.get(0).getContent();
            if (content != null && !content.trim().isEmpty()) {
                int maxLength = 60;
                String sanitized = content.replaceAll("\\s+", " ").trim();
                return sanitized.length() <= maxLength ? sanitized : sanitized.substring(0, maxLength) + "...";
            }
        }
        return "New Conversation";
    }

    /**
     * Get the creation time of the first message in the conversation
     */
    private Instant extractCreatedAtFromMessages(String conversationKey) {
        List<ChatMessage> messages = chatMessageRepository
            .findByConversationIdOrderByTimestampAsc(conversationKey);
        
        if (!messages.isEmpty()) {
            return messages.get(0).getTimestamp();
        }
        return Instant.now();
    }

    /**
     * Get the timestamp of the last message in the conversation
     */
    private Instant extractLastUpdatedFromMessages(String conversationKey) {
        List<ChatMessage> messages = chatMessageRepository
            .findByConversationIdOrderByTimestampDesc(conversationKey, PageRequest.of(0, 1));
        
        if (!messages.isEmpty()) {
            return messages.get(0).getTimestamp();
        }
        return Instant.now();
    }


    /**
     * Ensures payload has valid fields.
     */
    private StructuredChatPayload ensureValidPayload(StructuredChatPayload payload) {
        if (payload == null) {
            return buildErrorResponse();
        }

        if (payload.getMessage() == null || payload.getMessage().isBlank()) {
            payload.setMessage("Tôi đã xử lý yêu cầu của bạn nhưng không thể tạo phản hồi phù hợp.");
        }

        if (payload.getResults() == null) {
            payload.setResults(Collections.emptyList());
        }

        return payload;
    }

    /**
     * Builds error response for reactive error handling.
     */
    private StructuredChatPayload buildErrorResponse() {
        return StructuredChatPayload.builder()
                .message("Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại.")
                .results(Collections.emptyList())
                .build();
    }

}
