package com.pdh.ai.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for voice messages sent via WebSocket.
 * 
 * <p>Message Flow:</p>
 * <ol>
 * <li>Client records audio and encodes to base64</li>
 * <li>Client sends VoiceMessageRequest via WebSocket</li>
 * <li>Server transcribes audio using Mistral AI</li>
 * <li>Server processes text using Gemini</li>
 * <li>Server sends VoiceMessageResponse back</li>
 * </ol>
 * 
 * @author PDH
 * @since 2025-01-05
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoiceMessageRequest {
    
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
     * Base64-encoded audio data.
     * Supports: mp3, wav, m4a, webm formats.
     */
    private String audioData;
    
    /**
     * Audio format (mime type).
     * Examples: "audio/mp3", "audio/wav", "audio/webm"
     */
    private String audioFormat;
    
    /**
     * Language hint for transcription.
     * Optional, defaults to "vi" (Vietnamese).
     * Supported: "vi", "en", "fr", "de", etc.
     */
    private String language;
    
    /**
     * Audio duration in milliseconds.
     * Used for billing and quality metrics.
     */
    private Long durationMs;
    
    /**
     * Client timestamp when audio was recorded.
     */
    private Long timestamp;
}
