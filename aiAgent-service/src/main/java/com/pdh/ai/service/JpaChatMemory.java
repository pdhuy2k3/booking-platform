package com.pdh.ai.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.ai.model.entity.ChatMessage;
import com.pdh.ai.repository.ChatConversationRepository;
import com.pdh.ai.repository.ChatMessageRepository;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.ToolResponseMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@org.springframework.context.annotation.Primary
public class JpaChatMemory implements ChatMemory {

    private final ChatMessageRepository chatMessageRepository;
    private final ChatConversationRepository chatConversationRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public JpaChatMemory(ChatMessageRepository chatMessageRepository,
                         ChatConversationRepository chatConversationRepository) {
        this.chatMessageRepository = chatMessageRepository;
        this.chatConversationRepository = chatConversationRepository;
    }

    @Override
    @Transactional
    public void add(String conversationId, List<Message> messages) {
        UUID persistableId = resolvePersistableConversationId(conversationId);
        if (persistableId == null) {
            System.out.println("⚠️ Skipping memory save for conversation: " + conversationId);
            return;
        }

        try {
            List<ChatMessage> entities = messages.stream()
                    .map(message -> new ChatMessage(persistableId, mapRole(message), extractContent(message), Instant.now()))
                    .collect(Collectors.toList());
            chatMessageRepository.saveAll(entities);
        } catch (Exception e) {
            // Log error but don't fail - conversation might not exist yet
            System.err.println("Warning: Could not save chat message for conversation " + conversationId + ": " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<Message> get(String conversationId) {
        return get(conversationId, 0);
    }

    @Transactional(readOnly = true)
    public List<Message> get(String conversationId, int lastN) {
        try {
            UUID id = parseConversationId(conversationId);
            if (lastN > 0) {
                List<ChatMessage> latest = chatMessageRepository.findByConversationIdOrderByTimestampDesc(id,
                        PageRequest.of(0, lastN));
                Collections.reverse(latest);
                return latest.stream().map(this::toMessage).toList();
            }
            return chatMessageRepository.findByConversationIdOrderByTimestampAsc(id)
                    .stream()
                    .map(this::toMessage)
                    .toList();
        } catch (Exception e) {
            // Return empty list if conversation doesn't exist or any error occurs
            System.err.println("Warning: Could not retrieve chat messages for conversation " + conversationId + ": " + e.getMessage());
            return List.of();
        }
    }

    @Override
    @Transactional
    public void clear(String conversationId) {
        UUID id = parseConversationId(conversationId);
        chatMessageRepository.deleteByConversationId(id);
    }

    /**
     * Parses conversation ID string to UUID, handling special cases like "default".
     * 
     * @param conversationId The conversation ID string
     * @return Valid UUID for the conversation
     */
    private UUID parseConversationId(String conversationId) {
        if (conversationId == null || conversationId.trim().isEmpty()) {
            return UUID.randomUUID();
        }

        // Handle Spring AI's default conversation ID
        if ("default".equals(conversationId)) {
            return UUID.fromString("00000000-0000-0000-0000-000000000001");
        }
        
        try {
            return UUID.fromString(conversationId);
        } catch (IllegalArgumentException e) {
            // If not a valid UUID, create a deterministic UUID from the string
            return UUID.nameUUIDFromBytes(conversationId.getBytes());
        }
    }

    private UUID resolvePersistableConversationId(String conversationId) {
        if (conversationId == null || conversationId.trim().isEmpty()) {
            return null;
        }

        if ("default".equalsIgnoreCase(conversationId)) {
            return null;
        }

        try {
            UUID id = UUID.fromString(conversationId);

            if (!chatConversationRepository.existsById(id)) {
                System.out.println("⚠️ Skipping memory save - conversation not found: " + conversationId);
                return null;
            }

            return id;
        } catch (IllegalArgumentException ex) {
            System.out.println("⚠️ Skipping memory save - invalid conversation ID format: " + conversationId);
            return null;
        }
    }

    private ChatMessage.Role mapRole(Message message) {
        if (message instanceof UserMessage) {
            return ChatMessage.Role.USER;
        }
        if (message instanceof AssistantMessage) {
            return ChatMessage.Role.ASSISTANT;
        }
        if (message instanceof SystemMessage) {
            return ChatMessage.Role.SYSTEM;
        }
        if (message instanceof ToolResponseMessage) {
            return ChatMessage.Role.TOOL;
        }
        return ChatMessage.Role.USER;
    }

    private Message toMessage(ChatMessage entity) {
        return switch (entity.getRole()) {
            case USER -> new UserMessage(entity.getContent());
            case ASSISTANT -> new AssistantMessage(entity.getContent());
            case SYSTEM -> new SystemMessage(entity.getContent());
            case TOOL -> new ToolResponseMessage(readToolResponses(entity.getContent()));
        };
    }

    private String extractContent(Message message) {
        if (message instanceof ToolResponseMessage toolMessage) {
            return writeToolResponses(toolMessage.getResponses());
        }
        return message.getText();
    }

    private List<ToolResponseMessage.ToolResponse> readToolResponses(String payload) {
        if (payload == null || payload.isBlank()) {
            return List.of();
        }
        try {
            return objectMapper.readValue(payload,
                    new TypeReference<List<ToolResponseMessage.ToolResponse>>() {
                    });
        }
        catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to deserialize tool responses", e);
        }
    }

    private String writeToolResponses(List<ToolResponseMessage.ToolResponse> responses) {
        try {
            return objectMapper.writeValueAsString(responses);
        }
        catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize tool responses", e);
        }
    }
}
