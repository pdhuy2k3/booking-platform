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
            // Delegate to CoreAgent for intelligent workflow processing
            StructuredChatPayload payload = coreAgent.process(message, conversationUuid.toString());

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

}
