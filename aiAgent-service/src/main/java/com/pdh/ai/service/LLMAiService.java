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
import com.pdh.ai.model.entity.ChatConversation;
import com.pdh.ai.model.entity.ChatMessage;
import com.pdh.common.utils.AuthenticationUtils;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;


import com.pdh.ai.repository.ChatMessageRepository;


@Service
public class LLMAiService implements AiService {

    private final CoreAgent coreAgent;
    private final ConversationService conversationService;
    private final ChatMessageRepository chatMessageRepository;

    public LLMAiService(CoreAgent coreAgent,
                        ConversationService conversationService,
                        ChatMessageRepository chatMessageRepository) {
        this.coreAgent = coreAgent;
        this.conversationService = conversationService;
        this.chatMessageRepository = chatMessageRepository;
    }


    @Override
    public ChatHistoryResponse getChatHistory(String conversationId, String userId) {
        String actualUserId = resolveAuthenticatedUserId(userId);
        UUID conversationUuid = parseConversationId(conversationId);

        var conversation = conversationService.getConversation(conversationUuid)
                .filter(c -> c.getUserId().equals(actualUserId))
                .orElseThrow(() -> new IllegalArgumentException("Conversation not found for user"));

        List<ChatMessage> storedMessages = chatMessageRepository
                .findByConversationIdOrderByTimestampAsc(conversationUuid);

        List<ChatHistoryResponse.ChatMessage> chatMessages = storedMessages.stream()
                .map(entity -> ChatHistoryResponse.ChatMessage.builder()
                        .content(entity.getContent())
                        .role(entity.getRole().name().toLowerCase())
                        .timestamp(LocalDateTime.ofInstant(entity.getTimestamp(), ZoneOffset.UTC))
                        .build())
                .toList();

        Instant createdAt = conversation.getCreatedAt();
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
        UUID conversationUuid = parseConversationId(conversationId);

        if (!conversationService.belongsToUser(conversationUuid, actualUserId)) {
            throw new IllegalArgumentException("Conversation not found for user");
        }

        conversationService.deleteConversation(conversationUuid);
    }

    @Override
    public List<ChatConversationSummaryDto> getUserConversations(String userId) {
        String actualUserId = resolveAuthenticatedUserId(userId);
        return conversationService.listConversations(actualUserId).stream()
                .map(conversation -> ChatConversationSummaryDto.builder()
                        .id(conversation.getId().toString())
                        .title(normalizeTitle(conversation.getTitle()))
                        .createdAt(conversation.getCreatedAt())
                        .lastUpdated(resolveLastUpdated(conversation.getId(), conversation.getCreatedAt()))
                        .build())
                .toList();
    }


    private String getCurrentUserId() {
        try {
            return AuthenticationUtils.extractUserId();
        } catch (Exception e) {

            return null;
        }
    }

    private String resolveUserId(String requestUserId) {
        // If a specific user ID is requested, use it (for backward compatibility)
        if (requestUserId != null && !requestUserId.isBlank()) {
            return requestUserId;
        }

        // Extract user ID from JWT token (the secure way)
        String authenticatedUserId = getCurrentUserId();
        if (authenticatedUserId != null && !authenticatedUserId.isBlank()) {
            return authenticatedUserId;
        }

        // Fallback to anonymous for backward compatibility
        return "anonymous";
    }

    /**
     * Resolves user ID, preferring the provided userId over JWT extraction.
     * This method is more lenient for WebSocket scenarios where userId comes from auth context.
     */
    private String resolveAuthenticatedUserId(String requestUserId) {
        // If a specific user ID is provided (from auth context), use it
        if (requestUserId != null && !requestUserId.isBlank()) {
            return requestUserId;
        }

        // Try to extract user ID from JWT token as fallback
        String authenticatedUserId = getCurrentUserId();
        if (authenticatedUserId != null && !authenticatedUserId.isBlank()) {
            return authenticatedUserId;
        }

        // For WebSocket scenarios, require user ID to be provided
        throw new IllegalStateException("User must be authenticated to perform this operation. Please log in.");
    }

    private UUID ensureConversation(String conversationId, String userId, String title) {
        // Use the new ensureConversationExists method which handles both creation and validation
        ChatConversation conversation = conversationService.ensureConversationExists(conversationId, userId, title);
        return conversation.getId();
    }

    private UUID parseConversationId(String conversationId) {
        try {
            return UUID.fromString(conversationId);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid conversation id", ex);
        }
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

    private Instant resolveLastUpdated(UUID conversationId, Instant createdAt) {
        var latest = chatMessageRepository.findByConversationIdOrderByTimestampDesc(conversationId, PageRequest.of(0, 1));
        if (!latest.isEmpty()) {
            ChatMessage mostRecent = latest.get(0);
            if (mostRecent != null && mostRecent.getTimestamp() != null) {
                return mostRecent.getTimestamp();
            }
        }
        return createdAt != null ? createdAt : Instant.now();
    }


    @Override
    public Mono<StructuredChatPayload> processSyncStructured(String message, String conversationId, String userId) {
        return Mono.fromCallable(() -> {
                    // Use provided userId for WebSocket scenarios
                    String actualUserId = resolveAuthenticatedUserId(userId);
                    return ensureConversation(conversationId, actualUserId, defaultTitle(message));
                })
                .flatMap(conversationUuid -> {
                    String conversationIdStr = conversationUuid.toString();

                    // IMPORTANT: Ensure conversation exists in database BEFORE processing
                    conversationService.getConversation(conversationUuid)
                            .orElseThrow(() -> new IllegalStateException("Conversation must exist before processing: " + conversationIdStr));

                    // Use CoreAgent's sync structured processing
                    return coreAgent.processSyncStructured(message, conversationIdStr)
                            .doOnSubscribe(s -> System.out.println("🔄 Starting sync structured processing for conversation: " + conversationIdStr))
                            .doOnSuccess(result -> System.out.println("✅ Sync structured processing completed for conversation: " + conversationIdStr +
                                    ", results: " + (result != null && result.getResults() != null ? result.getResults().size() : 0)))
                            .doOnError(e -> System.err.println("❌ Sync structured processing failed: " + e.getMessage()));
                })
                .onErrorResume(e -> {
                    System.err.println("❌ Error in processSyncStructured: " + e.getMessage());
                    return Mono.just(buildErrorResponse());
                });
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
