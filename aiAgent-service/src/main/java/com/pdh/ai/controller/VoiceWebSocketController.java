package com.pdh.ai.controller;

import com.pdh.ai.model.dto.StructuredChatPayload;
import com.pdh.ai.model.dto.VoiceMessageRequest;
import com.pdh.ai.model.dto.VoiceMessageResponse;
import com.pdh.ai.service.VoiceProcessingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * WebSocket controller for real-time voice interactions.
 * 
 * <p>Message Flow:</p>
 * <pre>
 * Client sends audio via /app/voice.send
 *    ↓
 * @MessageMapping("voice.send")
 *    ↓
 * VoiceProcessingService (Mistral AI transcription)
 *    ↓
 * AiService (Gemini chat processing)
 *    ↓
 * Response sent to /topic/voice.{userId}
 *    ↓
 * Client receives response
 * </pre>
 * 
 * <p>Endpoints:</p>
 * <ul>
 * <li><b>/app/voice.send</b>: Client → Server (audio chunks)</li>
 * <li><b>/topic/voice.{userId}</b>: Server → Client (responses)</li>
 * </ul>
 * 
 * <p>Response Stages:</p>
 * <ol>
 * <li>TRANSCRIPTION: Audio transcribed</li>
 * <li>PROCESSING: AI processing text</li>
 * <li>RESPONSE: Final answer ready</li>
 * <li>ERROR: Something went wrong</li>
 * </ol>
 * 
 * @author PDH
 * @since 2025-01-05
 */
@Controller
public class VoiceWebSocketController {

    private static final Logger log = LoggerFactory.getLogger(VoiceWebSocketController.class);

    private final VoiceProcessingService voiceProcessingService;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Constructor with dependencies.
     * 
     * @param voiceProcessingService Service for voice processing with Mistral AI
     * @param messagingTemplate WebSocket messaging template for sending responses
     */
    public VoiceWebSocketController(
            VoiceProcessingService voiceProcessingService,
            SimpMessagingTemplate messagingTemplate) {
        this.voiceProcessingService = voiceProcessingService;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Handle voice messages sent via WebSocket.
     * 
     * <p>Processing Flow:</p>
     * <ol>
     * <li>Receive voice message with audio data</li>
     * <li>Send TRANSCRIPTION update to client</li>
     * <li>Transcribe audio using Mistral AI</li>
     * <li>Send PROCESSING update to client</li>
     * <li>Process text using Gemini AI</li>
     * <li>Send final RESPONSE to client</li>
     * </ol>
     * 
     * @param request Voice message request with audio data
     */
    @MessageMapping("voice.send")
    public void handleVoiceMessage(@Payload VoiceMessageRequest request) {
        long startTime = System.currentTimeMillis();
        
        log.info("🎤 Received voice message: userId={}, conversationId={}, duration={}ms",
                request.getUserId(), request.getConversationId(), request.getDurationMs());

        // Generate conversation ID if not provided
        String conversationId = request.getConversationId();
        if (conversationId == null || conversationId.trim().isEmpty()) {
            conversationId = UUID.randomUUID().toString();
            request.setConversationId(conversationId);
        }

        String destination = "/topic/voice." + request.getUserId();

        try {
            // Stage 1: Transcribing audio
            // sendTranscriptionUpdate(destination, request, "Đang nhận dạng giọng nói...");
            
            // String transcribedText = voiceProcessingService.transcribeAudio(request);
            
            // // Send transcription result
            // sendTranscriptionResult(destination, request, transcribedText);
            
            // // Stage 2: Processing with AI
            // sendProcessingUpdate(destination, request, "Đang xử lý yêu cầu...");
            
            // com.pdh.ai.model.dto.StructuredChatPayload payload = voiceProcessingService.processVoiceMessage(request);
            
            // // Stage 3: Send final response
            // long processingTime = System.currentTimeMillis() - startTime;
            // sendFinalResponse(destination, request, transcribedText, payload, processingTime);
            
            // log.info("✅ Voice message completed in {}ms", processingTime);

        } catch (Exception e) {
            log.error("❌ Voice message processing failed: {}", e.getMessage(), e);
            sendErrorResponse(destination, request, e.getMessage());
        }
    }

    /**
     * Send transcription progress update.
     */
    private void sendTranscriptionUpdate(String destination, VoiceMessageRequest request, String status) {
        VoiceMessageResponse response = VoiceMessageResponse.builder()
                .type(VoiceMessageResponse.ResponseType.TRANSCRIPTION)
                .userId(request.getUserId())
                .conversationId(request.getConversationId())
                .status(status)
                .timestamp(LocalDateTime.now())
                .build();
        
        messagingTemplate.convertAndSend(destination, response);
        log.debug("📡 Sent transcription update: {}", status);
    }

    /**
     * Send transcription result.
     */
    private void sendTranscriptionResult(String destination, VoiceMessageRequest request, String transcribedText) {
        VoiceMessageResponse response = VoiceMessageResponse.builder()
                .type(VoiceMessageResponse.ResponseType.TRANSCRIPTION)
                .userId(request.getUserId())
                .conversationId(request.getConversationId())
                .transcribedText(transcribedText)
                .status("Đã nhận dạng: " + transcribedText)
                .timestamp(LocalDateTime.now())
                .build();
        
        messagingTemplate.convertAndSend(destination, response);
        log.debug("📝 Sent transcription result: {}", transcribedText);
    }

    /**
     * Send processing progress update.
     */
    private void sendProcessingUpdate(String destination, VoiceMessageRequest request, String status) {
        VoiceMessageResponse response = VoiceMessageResponse.builder()
                .type(VoiceMessageResponse.ResponseType.PROCESSING)
                .userId(request.getUserId())
                .conversationId(request.getConversationId())
                .status(status)
                .timestamp(LocalDateTime.now())
                .build();
        
        messagingTemplate.convertAndSend(destination, response);
        log.debug("⚙️ Sent processing update: {}", status);
    }

    /**
     * Send final AI response.
     */
    private void sendFinalResponse(
            String destination,
            VoiceMessageRequest request,
            String transcribedText,
            com.pdh.ai.model.dto.StructuredChatPayload payload,
            long processingTime) {
        
        VoiceMessageResponse response = VoiceMessageResponse.builder()
                .type(VoiceMessageResponse.ResponseType.RESPONSE)
                .userId(request.getUserId())
                .conversationId(request.getConversationId())
                .transcribedText(transcribedText)
                .aiResponse(payload.getMessage())
                .results(payload.getResults())
                .status("Hoàn tất")
                .timestamp(LocalDateTime.now())
                .processingTimeMs(processingTime)
                .build();
        
        messagingTemplate.convertAndSend(destination, response);
        log.info("✅ Sent final response: {} characters", payload.getMessage().length());
    }

    /**
     * Send error response.
     */
    private void sendErrorResponse(String destination, VoiceMessageRequest request, String errorMessage) {
        VoiceMessageResponse response = VoiceMessageResponse.builder()
                .type(VoiceMessageResponse.ResponseType.ERROR)
                .userId(request.getUserId())
                .conversationId(request.getConversationId())
                .error(errorMessage)
                .status("Lỗi: " + errorMessage)
                .timestamp(LocalDateTime.now())
                .build();
        
        messagingTemplate.convertAndSend(destination, response);
        log.error("❌ Sent error response: {}", errorMessage);
    }
}
