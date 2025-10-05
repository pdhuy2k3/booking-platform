package com.pdh.ai.service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import com.pdh.ai.agent.CoreAgent;
import com.pdh.ai.model.dto.ChatHistoryResponse;
import com.pdh.ai.model.dto.StructuredChatPayload;
import com.pdh.ai.model.entity.ChatMessage;
import com.pdh.common.utils.AuthenticationUtils;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
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
    public StructuredChatPayload complete(String message) {
        String userId = resolveUserId(null);
        UUID conversationUuid = ensureConversation(null, userId, defaultTitle(message));

        return executeCompletion(message, conversationUuid);
    }

    @Override
    public StructuredChatPayload completeWithConversation(String message, String conversationId, String userId) {
        String actualUserId = resolveUserId(userId);
        UUID conversationUuid = ensureConversation(conversationId, actualUserId, defaultTitle(message));

        return executeCompletion(message, conversationUuid);
    }

    @Override
    public ChatHistoryResponse getChatHistory(String conversationId, String userId) {
        String actualUserId = resolveUserId(userId);
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
        String actualUserId = resolveUserId(userId);
        UUID conversationUuid = parseConversationId(conversationId);

        if (!conversationService.belongsToUser(conversationUuid, actualUserId)) {
            throw new IllegalArgumentException("Conversation not found for user");
        }

        conversationService.deleteConversation(conversationUuid);
    }

    @Override
    public List<String> getUserConversations(String userId) {
        String actualUserId = resolveUserId(userId);
        return conversationService.listConversations(actualUserId).stream()
                .map(conversation -> conversation.getId().toString())
                .toList();
    }

    /**
     * Executes the AI completion using CoreAgent workflow orchestration.
     */
    private StructuredChatPayload executeCompletion(String message, UUID conversationUuid) {
        try {
            // IMPORTANT: Ensure conversation exists in database BEFORE processing
            // This prevents foreign key constraint violations when CoreAgent saves messages
            String conversationId = conversationUuid.toString();
            
            // Delegate to CoreAgent for reactive workflow processing
            // Use block() to convert from reactive to blocking for backward compatibility
            StructuredChatPayload payload = coreAgent.processAsync(message, conversationId)
                .block(); // Convert Mono to blocking call

            // Ensure payload has required fields
            if (payload == null) {
                return StructuredChatPayload.builder()
                        .message("Xin lỗi, tôi không thể xử lý yêu cầu của bạn đúng cách.")
                        .results(Collections.emptyList())
                        .build();
            }

            if (payload.getMessage() == null || payload.getMessage().isBlank()) {
                payload.setMessage("Tôi đã xử lý yêu cầu của bạn nhưng không thể tạo phản hồi phù hợp.");
            }

            if (payload.getResults() == null) {
                payload.setResults(Collections.emptyList());
            }

            return payload;
        } catch (Exception e) {
            System.err.println("Error executing completion: " + e.getMessage());
            e.printStackTrace();

            return StructuredChatPayload.builder()
                    .message("Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại.")
                    .results(Collections.emptyList())
                    .build();
        }
    }

    private String getCurrentUserId() {
        try {
            return AuthenticationUtils.extractUserId();
        } catch (Exception e) {

            return null;
        }
    }

    private String resolveUserId(String requestUserId) {
        if (requestUserId != null && !requestUserId.isBlank()) {
            return requestUserId;
        }
        String authenticatedUserId = getCurrentUserId();
        if (authenticatedUserId != null && !authenticatedUserId.isBlank()) {
            return authenticatedUserId;
        }
        return "anonymous";
    }

    private UUID ensureConversation(String conversationId, String userId, String title) {
        if (conversationId == null || conversationId.isBlank()) {
            return conversationService.createConversation(userId, title);
        }

        UUID conversationUuid = parseConversationId(conversationId);
        var existingConversation = conversationService.getConversation(conversationUuid);

        if (existingConversation.isPresent()) {
            if (!existingConversation.get().getUserId().equals(userId)) {
                throw new IllegalArgumentException("Conversation does not belong to user");
            }
            return conversationUuid;
        }

        conversationService.createConversation(userId, title, conversationUuid);
        return conversationUuid;
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

    // ========== REACTIVE IMPLEMENTATIONS ==========

    @Override
    public Mono<StructuredChatPayload> completeAsync(String message) {
        return Mono.fromCallable(() -> {
            String userId = resolveUserId(null);
            UUID conversationUuid = ensureConversation(null, userId, defaultTitle(message));
            return conversationUuid;
        })
        .flatMap(conversationUuid -> executeCompletionAsync(message, conversationUuid))
        .doOnSubscribe(s -> System.out.println("🚀 Starting async completion"))
        .doOnSuccess(result -> System.out.println("✅ Async completion completed"))
        .onErrorReturn(buildErrorResponse());
    }

    @Override
    public Mono<StructuredChatPayload> completeWithConversationAsync(String message, String conversationId, String userId) {
        return Mono.fromCallable(() -> {
            String actualUserId = resolveUserId(userId);
            UUID conversationUuid = ensureConversation(conversationId, actualUserId, defaultTitle(message));
            return conversationUuid;
        })
        .flatMap(conversationUuid -> executeCompletionAsync(message, conversationUuid))
        .doOnSubscribe(s -> System.out.println("🚀 Starting async completion with conversation"))
        .doOnSuccess(result -> System.out.println("✅ Async completion with conversation completed"))
        .onErrorReturn(buildErrorResponse());
    }

    @Override
    public Flux<String> completeStream(String message) {
        return Mono.fromCallable(() -> {
            String userId = resolveUserId(null);
            UUID conversationUuid = ensureConversation(null, userId, defaultTitle(message));
            return conversationUuid;
        })
        .flatMapMany(conversationUuid -> executeCompletionStream(message, conversationUuid))
        .doOnSubscribe(s -> System.out.println("🌊 Starting streaming completion"))
        .doOnComplete(() -> System.out.println("🎯 Streaming completion completed"));
    }

    @Override
    public Flux<String> completeWithConversationStream(String message, String conversationId, String userId) {
        return Mono.fromCallable(() -> {
            String actualUserId = resolveUserId(userId);
            UUID conversationUuid = ensureConversation(conversationId, actualUserId, defaultTitle(message));
            return conversationUuid;
        })
        .flatMapMany(conversationUuid -> executeCompletionStream(message, conversationUuid))
        .doOnSubscribe(s -> System.out.println("🌊 Starting streaming completion with conversation"))
        .doOnComplete(() -> System.out.println("🎯 Streaming completion with conversation completed"));
    }

    /**
     * Reactive version of executeCompletion using CoreAgent's reactive capabilities.
     */
    private Mono<StructuredChatPayload> executeCompletionAsync(String message, UUID conversationUuid) {
        String conversationId = conversationUuid.toString();
        
        // Use CoreAgent's reactive processing
        return coreAgent.processAsync(message, conversationId)
            .map(this::ensureValidPayload)
            .doOnSubscribe(s -> System.out.println("🔄 Delegating to CoreAgent async processing"))
            .doOnSuccess(result -> System.out.println("✅ CoreAgent async processing completed"))
            .onErrorReturn(buildErrorResponse());
    }

    /**
     * Streaming version of executeCompletion using CoreAgent's streaming capabilities.
     */
    private Flux<String> executeCompletionStream(String message, UUID conversationUuid) {
        String conversationId = conversationUuid.toString();
        
        // Use CoreAgent's streaming processing
        return coreAgent.processStream(message, conversationId)
            .doOnSubscribe(s -> System.out.println("🌊 Delegating to CoreAgent streaming processing"))
            .doOnComplete(() -> System.out.println("🎯 CoreAgent streaming processing completed"))
            .onErrorReturn("Error occurred during streaming processing. Please try again.");
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
