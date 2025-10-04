package com.pdh.ai.service;

import com.pdh.ai.model.entity.ChatConversation;
import com.pdh.ai.repository.ChatConversationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
public class ConversationService {

    private final ChatConversationRepository conversationRepository;

    public ConversationService(ChatConversationRepository conversationRepository) {
        this.conversationRepository = conversationRepository;
    }

    @Transactional
    public UUID createConversation(String userId, String title) {
        return createConversation(userId, title, null);
    }

    @Transactional
    public UUID createConversation(String userId, String title, UUID conversationId) {
        UUID id = conversationId != null ? conversationId : UUID.randomUUID();
        ChatConversation conversation = new ChatConversation(id, userId, title);
        conversationRepository.save(conversation);
        return conversation.getId();
    }

    @Transactional(readOnly = true)
    public Optional<ChatConversation> getConversation(UUID conversationId) {
        return conversationRepository.findById(conversationId);
    }

    @Transactional(readOnly = true)
    public boolean belongsToUser(UUID conversationId, String userId) {
        return conversationRepository.findByIdAndUserId(conversationId, userId).isPresent();
    }

    @Transactional(readOnly = true)
    public java.util.List<ChatConversation> listConversations(String userId) {
        return conversationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public void deleteConversation(UUID conversationId) {
        conversationRepository.deleteById(conversationId);
    }
}
