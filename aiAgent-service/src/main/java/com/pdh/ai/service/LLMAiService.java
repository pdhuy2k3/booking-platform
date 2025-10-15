package com.pdh.ai.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.ai.agent.CoreAgent;
import com.pdh.ai.model.dto.ChatConversationSummaryDto;
import com.pdh.ai.model.dto.ChatHistoryResponse;
import com.pdh.ai.model.dto.StructuredChatPayload;
import com.pdh.ai.model.entity.ChatMessage;
import com.pdh.ai.repository.ChatMessageRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
public class LLMAiService implements AiService {

    private final CoreAgent coreAgent;
    private final ChatMessageRepository chatMessageRepository;
    private final ObjectMapper objectMapper;

    public LLMAiService(CoreAgent coreAgent,
                        ChatMessageRepository chatMessageRepository,
                        ObjectMapper objectMapper) {
        this.coreAgent = coreAgent;
        this.chatMessageRepository = chatMessageRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    public Flux<StructuredChatPayload> processStreamStructured(String message, String conversationId, String userId) {
        String actualUserId = resolveAuthenticatedUserId(userId);
        String conversationKey = formatConversationKey(actualUserId, conversationId);
        Instant now = Instant.now();

        ChatMessage parent = chatMessageRepository.findTopByConversationIdOrderByTimestampAsc(conversationKey).orElse(null);

        ChatMessage userMessage = ChatMessage.builder()
                .conversationId(conversationKey)
                .role(org.springframework.ai.chat.messages.MessageType.USER)
                .content(message)
                .timestamp(now)
                .build();

        ChatMessage savedUserMessage;
        if (parent == null) {
            userMessage.setTitle(defaultTitle(message));
            savedUserMessage = chatMessageRepository.save(userMessage);
        } else {
            userMessage.setParentMessage(parent);
            savedUserMessage = chatMessageRepository.save(userMessage);
        }

        final ChatMessage effectiveParent = (parent == null) ? savedUserMessage : parent;

        try {
            List<StructuredChatPayload> payloads = new ArrayList<>();
            return coreAgent.processStreamStructured(message, conversationKey)
                    .map(this::ensureValidPayload)
                    .doOnNext(payloads::add)
                    .doOnComplete(() -> {
                        if (!payloads.isEmpty()) {
                            try {
                                String assistantContent = payloads.size() == 1 ?
                                        objectMapper.writeValueAsString(payloads.get(0)) :
                                        objectMapper.writeValueAsString(payloads);

                                ChatMessage assistantMessage = ChatMessage.builder()
                                        .conversationId(conversationKey)
                                        .role(org.springframework.ai.chat.messages.MessageType.ASSISTANT)
                                        .content(assistantContent)
                                        .timestamp(Instant.now())
                                        .parentMessage(effectiveParent)
                                        .build();
                                chatMessageRepository.save(assistantMessage);
                            } catch (JsonProcessingException e) {
                                // Consider logging this error
                                e.printStackTrace();
                            }
                        }
                    })
                    .onErrorResume(e -> {
                        e.printStackTrace();
                        return Mono.just(buildErrorResponse());
                    });
        } catch (Exception e) {
            e.printStackTrace();
            return Flux.just(buildErrorResponse());
        }
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
        String userIdPrefix = actualUserId + ":";

        List<ChatMessageRepository.ConversationInfo> conversations = chatMessageRepository.findUserConversations(userIdPrefix);

        return conversations.stream().map(conv -> {
            String conversationKey = conv.getConversationId();
            String unprefixedId = conversationKey;
            if (conversationKey != null && conversationKey.startsWith(userIdPrefix)) {
                unprefixedId = conversationKey.substring(userIdPrefix.length());
            }
            
            return ChatConversationSummaryDto.builder()
                    .id(unprefixedId)
                    .title(normalizeTitle(conv.getTitle()))
                    .createdAt(conv.getCreatedAt())
                    .lastUpdated(conv.getLastUpdated())
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
