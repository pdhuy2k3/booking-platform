package com.pdh.ai.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for chat messages sent via WebSocket.
 * 
 * <p>Message Flow:</p>
 * <ol>
 * <li>Client types message and sends ChatMessageRequest via WebSocket</li>
 * <li>Server processes message using CoreAgent + Gemini</li>
 * <li>Server sends ChatMessageResponse back</li>
 * </ol>
 * 
 * @author PDH
 * @since 2025-01-05
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageRequest {
    
    /**
     * User ID from JWT token or session.
     */
    private String userId;
    
    /**
     * Conversation ID for context tracking.
     * Generated on first message if not provided.
     */
    private String conversationId;
    
    /**
     * The text message from the user.
     */
    private String message;
    
    /**
     * Client timestamp when message was sent.
     */
    private Long timestamp;
}
