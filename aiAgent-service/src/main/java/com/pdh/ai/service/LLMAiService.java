package com.pdh.ai.service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import com.pdh.ai.ChatHistoryResponse;
import com.pdh.ai.model.dto.StructuredChatPayload;
import com.pdh.ai.model.dto.StructuredResultItem;
import com.pdh.ai.model.entity.ChatMessage;
import com.pdh.common.utils.AuthenticationUtils;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

import com.pdh.ai.repository.ChatMessageRepository;

@Service
public class LLMAiService implements AiService {

    private final ChatClient chatClient;
    private final JpaChatMemory chatMemory;
    private final ConversationService conversationService;
    private final ChatMessageRepository chatMessageRepository;
    private final ToolResultCollector toolResultCollector;
    private final BeanOutputConverter<StructuredChatPayload> outputConverter;

    public LLMAiService(ChatClient.Builder builder,
                        @Qualifier("customSyncMcpToolCallbackProvider") ToolCallbackProvider toolCallbackProvider,
                        JpaChatMemory chatMemory,
                        ConversationService conversationService,
                        ChatMessageRepository chatMessageRepository,
                        ToolResultCollector toolResultCollector) {

        this.chatMemory = chatMemory;
        this.conversationService = conversationService;
        this.chatMessageRepository = chatMessageRepository;
        this.toolResultCollector = toolResultCollector;
        this.outputConverter = new BeanOutputConverter<>(StructuredChatPayload.class);
        this.chatClient = builder
                .defaultToolCallbacks(toolCallbackProvider)
                .defaultSystem("""
                        You are a helpful assistant that helps users book travel accommodations including flights and hotels.
                        You orchestrate multi-step plans using available MCP tools such as search_flights, search_hotels. (default for page number is 0 and page size is 20)
                        Use the tools to get information about flights and hotels as needed to help the user.
                        Ask user for any missing information you need to complete the booking.
                        Always remember to ask the user for confirmation before making a booking.
                        If the user asks for something you can't help with, politely decline.
                        %s
                        All dates provided to tools or in metadata must use ISO format YYYY-MM-DD (year-month-day) with zero padding; never swap month and day positions.
                        """)
                .defaultAdvisors(
                        MessageChatMemoryAdvisor.builder(chatMemory)
                                .build())
                                
                .build();
    }

    @Override
    public StructuredChatPayload complete(String message) {
        String userId = resolveUserId(null);
        UUID conversationUuid = ensureConversation(null, userId, defaultTitle());

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

        chatMemory.clear(conversationUuid.toString());
        conversationService.deleteConversation(conversationUuid);
    }

    @Override
    public List<String> getUserConversations(String userId) {
        String actualUserId = resolveUserId(userId);
        return conversationService.listConversations(actualUserId).stream()
                .map(conversation -> conversation.getId().toString())
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

    private StructuredChatPayload executeCompletion(String message, UUID conversationUuid) {
        toolResultCollector.clear();
        try {
            StructuredChatPayload payload = this.chatClient.prompt()
                    .user(userMessage -> userMessage.text(message))
                    .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, conversationUuid.toString()))
                    .call()
                    .entity(outputConverter);

            // Ensure payload has required fields
            if (payload == null) {
                payload = StructuredChatPayload.builder()
                        .message("I apologize, but I couldn't process your request properly.")
                        .results(Collections.emptyList())
                        .build();
            }

            if (payload.getMessage() == null || payload.getMessage().isBlank()) {
                payload.setMessage("I processed your request but couldn't generate a proper response message.");
            }

            // Merge tool results with AI response results
            List<StructuredResultItem> toolResults = toolResultCollector.consume();
            if (!toolResults.isEmpty()) {
                List<StructuredResultItem> merged = new ArrayList<>();
                if (payload.getResults() != null && !payload.getResults().isEmpty()) {
                    merged.addAll(payload.getResults());
                }
                merged.addAll(toolResults);
                payload.setResults(merged);
            } else if (payload.getResults() == null) {
                payload.setResults(Collections.emptyList());
            }

            return payload;
        } finally {
            toolResultCollector.clear();
        }
    }

}
