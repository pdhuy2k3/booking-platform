package com.pdh.ai.repository;

import com.pdh.ai.model.entity.ChatConversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChatConversationRepository extends JpaRepository<ChatConversation, UUID> {

    List<ChatConversation> findByUserIdOrderByCreatedAtDesc(String userId);

    Optional<ChatConversation> findByIdAndUserId(UUID id, String userId);
}
