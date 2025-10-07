package com.pdh.ai.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

/**
 * DTO for voice message responses sent via WebSocket.
 * 
 * <p>Response Types:</p>
 * <ul>
 * <li><b>TRANSCRIPTION</b>: Audio transcribed to text</li>
 * <li><b>PROCESSING</b>: AI is processing the request</li>
 * <li><b>RESPONSE</b>: Final AI response</li>
 * <li><b>ERROR</b>: Error occurred during processing</li>
 * </ul>
 * 
 * @author PDH
 * @since 2025-01-05
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoiceMessageResponse {
    
    /**
     * Response type indicator.
     */
    private ResponseType type;
    
    /**
     * User ID from request.
     */
    private String userId;
    
    /**
     * Conversation ID for context tracking.
     */
    private String conversationId;
    
    /**
     * Transcribed text from audio (if type = TRANSCRIPTION).
     */
    private String transcribedText;
    
    /**
     * AI response message (if type = RESPONSE).
     */
    private String aiResponse;
    
    /**
     * Tool call results (flights, hotels, etc.).
     */
    private List<StructuredResultItem> results;

    /**
     * Suggested follow-up requests for the user.
     */
    
    private List<String> nextRequestSuggestions = Collections.emptyList();
    
    /**
     * Error message (if type = ERROR).
     */
    private String error;
    
    /**
     * Processing status message.
     */
    private String status;
    
    /**
     * Server timestamp.
     */
    private LocalDateTime timestamp;
    
    /**
     * Processing duration in milliseconds.
     */
    private Long processingTimeMs;
    
    /**
     * Response type enum.
     */
    public enum ResponseType {
        /**
         * Audio successfully transcribed to text.
         */
        TRANSCRIPTION,
        
        /**
         * AI is processing the request.
         */
        PROCESSING,
        
        /**
         * Final AI response ready.
         */
        RESPONSE,
        
        /**
         * Error occurred during processing.
         */
        ERROR
    }
}
