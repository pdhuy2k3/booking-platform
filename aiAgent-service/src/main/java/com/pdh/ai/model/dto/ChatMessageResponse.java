package com.pdh.ai.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for chat responses sent via WebSocket.
 * 
 * <p>Response Stages:</p>
 * <ol>
 * <li>PROCESSING: AI is processing the message</li>
 * <li>RESPONSE: Final answer ready</li>
 * <li>ERROR: Something went wrong</li>
 * </ol>
 * 
 * @author PDH
 * @since 2025-01-05
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {
    
    /**
     * Response type indicating the stage of processing.
     */
    public enum ResponseType {
        PROCESSING,  // AI is processing the message
        RESPONSE,    // Final response ready
        ERROR        // Error occurred
    }
    
    /**
     * The type of this response.
     */
    private ResponseType type;
    
    /**
     * User ID who sent the message.
     */
    private String userId;
    
    /**
     * Conversation ID for context tracking.
     */
    private String conversationId;
    
    /**
     * The original user message (echoed back).
     */
    private String userMessage;
    
    /**
     * AI response message.
     */
    private String aiResponse;
    
    /**
     * Structured results from the AI (flights, hotels, etc.).
     */
    private List<StructuredResultItem> results;
    
    /**
     * Current status message (e.g., "Processing...", "Complete").
     */
    private String status;
    
    /**
     * Error message if type is ERROR.
     */
    private String error;
    
    /**
     * Response timestamp.
     */
    private LocalDateTime timestamp;
    
    /**
     * Total processing time in milliseconds.
     */
    private Long processingTimeMs;
}
