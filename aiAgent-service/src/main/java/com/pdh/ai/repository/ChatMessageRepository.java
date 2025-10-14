package com.pdh.ai.repository;

import com.pdh.ai.model.entity.ChatMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    List<ChatMessage> findByConversationIdOrderByTimestampAsc(String conversationId);

    List<ChatMessage> findByConversationIdOrderByTimestampDesc(String conversationId, Pageable pageable);

    long deleteByConversationId(String conversationId);
    
    @Query("SELECT cm FROM ChatMessage cm WHERE cm.conversationId LIKE :prefix% ORDER BY cm.timestamp DESC")
    List<ChatMessage> findByConversationIdStartingWithOrderByTimestampDesc(@Param("prefix") String prefix, Pageable pageable);
}
