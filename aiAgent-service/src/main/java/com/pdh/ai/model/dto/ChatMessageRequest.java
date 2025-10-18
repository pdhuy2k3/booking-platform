package com.pdh.ai.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for chat messages sent via REST API.
 * 
 * <p>Message Flow:</p>
 * <ol>
 * <li>Client types message and sends ChatMessageRequest via REST POST</li>
 * <li>Server extracts userId from JWT token automatically</li>
 * <li>Server processes message using AgenticWorkflowService</li>
 * <li>Server sends StructuredChatPayload back</li>
 * </ol>
 * 
 * <p>Note: userId is NOT included in request body - it's extracted from JWT authentication</p>
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
    
    /**
     * Processing mode: "stream" for real-time streaming, "sync" for synchronous response.
     * Defaults to "sync" if not specified.
     */
    @Builder.Default
    private String mode = "sync";
}
