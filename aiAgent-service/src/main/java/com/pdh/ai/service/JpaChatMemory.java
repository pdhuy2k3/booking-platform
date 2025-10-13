package com.pdh.ai.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.ai.model.entity.ChatMessage;
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
    private final ObjectMapper objectMapper = new ObjectMapper();

    public JpaChatMemory(ChatMessageRepository chatMessageRepository) {
        this.chatMessageRepository = chatMessageRepository;
    }

    @Override
    @Transactional
    public void add(String conversationId, List<Message> messages) {
        UUID id = UUID.fromString(conversationId);
        List<ChatMessage> entities = messages.stream()
                .map(message -> new ChatMessage(id, mapRole(message), extractContent(message), Instant.now()))
                .collect(Collectors.toList());
        chatMessageRepository.saveAll(entities);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Message> get(String conversationId) {
        return get(conversationId, 0);
    }

    @Transactional(readOnly = true)
    public List<Message> get(String conversationId, int lastN) {
        UUID id = UUID.fromString(conversationId);
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
    }

    @Override
    @Transactional
    public void clear(String conversationId) {
        chatMessageRepository.deleteByConversationId(UUID.fromString(conversationId));
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