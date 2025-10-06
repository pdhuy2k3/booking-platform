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

    /**
     * Ensures a conversation exists. Creates it if it doesn't exist.
     * This is idempotent - safe to call multiple times.
     * 
     * @param conversationId The conversation ID to ensure exists
     * @param userId The user ID who owns the conversation
     * @param title The title for the conversation (used only if creating new)
     * @return The conversation entity (existing or newly created)
     */
    @Transactional
    public ChatConversation ensureConversationExists(UUID conversationId, String userId, String title) {
        // Check if conversation already exists
        Optional<ChatConversation> existing = conversationRepository.findById(conversationId);
        
        if (existing.isPresent()) {
            ChatConversation conversation = existing.get();
            
            // Verify it belongs to the correct user
            if (!conversation.getUserId().equals(userId)) {
                throw new IllegalArgumentException(
                    "Conversation " + conversationId + " belongs to different user");
            }
            
            return conversation;
        }
        
        // Create new conversation if it doesn't exist
        ChatConversation newConversation = new ChatConversation(conversationId, userId, title);
        return conversationRepository.save(newConversation);
    }

    /**
     * Ensures a conversation exists with auto-generated ID if needed.
     * 
     * @param conversationId The conversation ID (can be null for auto-generation)
     * @param userId The user ID who owns the conversation
     * @param title The title for the conversation
     * @return The conversation entity with guaranteed valid ID
     */
    @Transactional
    public ChatConversation ensureConversationExists(String conversationId, String userId, String title) {
        UUID id;
        
        if (conversationId == null || conversationId.trim().isEmpty()) {
            // Generate new UUID if no ID provided
            id = UUID.randomUUID();
        } else {
            try {
                id = UUID.fromString(conversationId);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid conversation ID format: " + conversationId);
            }
        }
        
        return ensureConversationExists(id, userId, title);
    }
}
