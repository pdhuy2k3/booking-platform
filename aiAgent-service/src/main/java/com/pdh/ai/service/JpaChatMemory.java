package com.pdh.ai.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.ai.model.entity.ChatMessage;
import com.pdh.ai.repository.ChatMessageRepository;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.MessageType;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.ToolResponseMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

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
        ChatMessage rootMessage = chatMessageRepository.findTopByConversationIdOrderByTimestampAsc(conversationId).orElse(null);

        List<ChatMessage> entitiesToSave = new ArrayList<>();
        boolean newConversation = (rootMessage == null);

        for (Message message : messages) {
            MessageType role = mapRole(message);
            if (role == MessageType.TOOL || role == MessageType.SYSTEM) {
                continue;
            }

            ChatMessage chatMessage = ChatMessage.builder()
                    .conversationId(conversationId)
                    .role(role)
                    .content(extractContent(message))
                    .timestamp(Instant.now())
                    .build();

            if (newConversation) {
                // This is a new conversation. The first message in the list is the root.
                chatMessage.setTitle(defaultTitle(message.getText()));
                rootMessage = chatMessage; // Set for subsequent messages in this batch.
                newConversation = false; // Only first message is root.
            } else {
                chatMessage.setParentMessage(rootMessage);
            }
            entitiesToSave.add(chatMessage);
        }

        if (!entitiesToSave.isEmpty()) {
            chatMessageRepository.saveAll(entitiesToSave);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<Message> get(String conversationId) {
        return get(conversationId, 0);
    }

    @Transactional(readOnly = true)
    public List<Message> get(String conversationId, int lastN) {
        if (lastN > 0) {
            List<ChatMessage> latest = chatMessageRepository.findByConversationIdOrderByTimestampDesc(conversationId,
                    PageRequest.of(0, lastN));
            Collections.reverse(latest);
            return latest.stream().map(this::toMessage).toList();
        }
        return chatMessageRepository.findByConversationIdOrderByTimestampAsc(conversationId)
                .stream()
                .map(this::toMessage)
                .toList();
    }

    @Override
    @Transactional
    public void clear(String conversationId) {
        chatMessageRepository.deleteByConversationId(conversationId);
    }

    private MessageType mapRole(Message message) {
        if (message instanceof UserMessage) {
            return MessageType.USER;
        }
        if (message instanceof AssistantMessage) {
            return MessageType.ASSISTANT;
        }
        if (message instanceof SystemMessage) {
            return MessageType.SYSTEM;
        }
        if (message instanceof ToolResponseMessage) {
            return MessageType.TOOL;
        }
        return MessageType.USER;
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

    private String defaultTitle(String message) {
        if (message == null || message.isBlank()) {
            return "New Conversation";
        }
        int maxLength = 60;
        String sanitized = message.replaceAll("\s+", " ").trim();
        return sanitized.length() <= maxLength ? sanitized : sanitized.substring(0, maxLength) + "...";
    }
}