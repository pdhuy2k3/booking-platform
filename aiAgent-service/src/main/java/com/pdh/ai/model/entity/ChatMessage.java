package com.pdh.ai.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.Instant;

import org.springframework.ai.chat.messages.MessageType;

@Entity
@Table(name = "chat_message", indexes = {
    @Index(name = "idx_conversation_id", columnList = "conversation_id"),
    @Index(name = "idx_conversation_id_timestamp", columnList = "conversation_id, ts")
})
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "conversation_id", nullable = false, length = 255)
    private String conversationId;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 16)
    private MessageType role;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "ts", nullable = false)
    private Instant timestamp;

    public ChatMessage() {
    }

    public ChatMessage(String conversationId, MessageType role, String content, Instant timestamp) {
        this.conversationId = conversationId;
        this.role = role;
        this.content = content;
        this.timestamp = timestamp;
    }

    @PrePersist
    void onCreate() {
        if (timestamp == null) {
            timestamp = Instant.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getConversationId() {
        return conversationId;
    }

    public void setConversationId(String conversationId) {
        this.conversationId = conversationId;
    }

    public MessageType getRole() {
        return role;
    }

    public void setRole(MessageType role) {
        this.role = role;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}
