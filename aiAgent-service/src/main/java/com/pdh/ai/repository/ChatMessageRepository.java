package com.pdh.ai.repository;

import com.pdh.ai.model.entity.ChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByConversationIdOrderByTimestampAsc(UUID conversationId);

    List<ChatMessage> findByConversationIdOrderByTimestampDesc(UUID conversationId, Pageable pageable);

    long deleteByConversationId(UUID conversationId);
}
