package com.pdh.ai.controller;

import com.pdh.ai.model.dto.ChatMessageRequest;
import com.pdh.ai.model.dto.ChatMessageResponse;
import com.pdh.ai.model.dto.StructuredChatPayload;
import com.pdh.ai.service.AiService;
import com.pdh.ai.service.LLMAiService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;


@Controller
public class ChatWebSocketController {

    private static final Logger log = LoggerFactory.getLogger(ChatWebSocketController.class);

    private final LLMAiService aiService;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Constructor with dependencies.
     * 
     * @param aiService Service for AI chat processing
     * @param messagingTemplate WebSocket messaging template for sending responses
     */
    public ChatWebSocketController(
            LLMAiService aiService,
            SimpMessagingTemplate messagingTemplate) {
        this.aiService = aiService;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Handle chat messages with streaming response (ALWAYS RETURNS STRUCTURED PAYLOAD).
     * 
     * <p>Processing Flow:</p>
     * <ol>
     * <li>Receive chat message from client</li>
     * <li>Send PROCESSING update to client</li>
     * <li>Stream AI response chunks in real-time</li>
     * <li>Parse final structured payload (message + results)</li>
     * <li>Send final RESPONSE with structured data</li>
     * </ol>
     * 
     * @param request Chat message request with user message
     */
    @MessageMapping("chat.stream")
    public void handleChatMessageStream(@Payload ChatMessageRequest request) {
        long startTime = System.currentTimeMillis();
        
        log.info("🌊 Received streaming chat message: userId={}, conversationId={}, message='{}'",
                request.getUserId(), request.getConversationId(), 
                truncateMessage(request.getMessage()));

        // Validate request
        if (request.getUserId() == null || request.getUserId().trim().isEmpty()) {
            log.warn("❌ No userId provided in streaming request");
            sendErrorResponse(
                    "/topic/chat.anonymous",
                    request,
                    "User ID is required. Please refresh and log in again."
            );
            return;
        }

        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            log.warn("❌ Empty message received from user: {}", request.getUserId());
            sendErrorResponse(
                    "/topic/chat." + request.getUserId(),
                    request,
                    "Message cannot be empty"
            );
            return;
        }

        // Generate conversation ID if not provided
        String conversationId = request.getConversationId();
        if (conversationId == null || conversationId.trim().isEmpty()) {
            conversationId = UUID.randomUUID().toString();
            request.setConversationId(conversationId);
            log.debug("📝 Generated new conversation ID: {}", conversationId);
        }

        String destination = "/topic/chat." + request.getUserId();

        // Stage 1: Processing
        sendProcessingUpdate(destination, request, "Đang xử lý yêu cầu...");

        // Stage 2: Use CoreAgent's structured streaming
        // Use userId from request (from auth context)
        AtomicReference<StructuredChatPayload> finalPayload = new AtomicReference<>();
        
        aiService.processStreamStructured(
                request.getMessage(),
                request.getConversationId(),
                request.getUserId()  // Pass userId for authentication
        )
        .doOnNext(payload -> {
            // Store the latest payload for final response
            finalPayload.set(payload);
            
            // Send streaming chunk to client with progressive message
            ChatMessageResponse streamResponse = ChatMessageResponse.builder()
                    .type(ChatMessageResponse.ResponseType.RESPONSE)
                    .userId(request.getUserId())
                    .conversationId(request.getConversationId())
                    .userMessage(request.getMessage())
                    .aiResponse(payload.getMessage())
                    .status("Streaming...")
                    .timestamp(LocalDateTime.now())
                    .build();
            
            messagingTemplate.convertAndSend(destination, streamResponse);
        })
        .doOnComplete(() -> {
            // Send final completion message with structured results
            long processingTime = System.currentTimeMillis() - startTime;
            
            StructuredChatPayload lastPayload = finalPayload.get();
            if (lastPayload != null) {
                sendFinalResponse(destination, request, lastPayload, processingTime);
                log.info("✅ Streaming completed in {}ms with {} results", 
                        processingTime, 
                        lastPayload.getResults() != null ? lastPayload.getResults().size() : 0);
            } else {
                log.info("✅ Streaming completed in {}ms", processingTime);
            }
        })
        .doOnError(e -> {
            log.error("❌ Streaming failed: {}", e.getMessage(), e);
            sendErrorResponse(destination, request, e.getMessage());
        })
        .subscribe(); // Subscribe to start the stream
    }

    /**
     * Send processing progress update.
     */
    private void sendProcessingUpdate(String destination, ChatMessageRequest request, String status) {
        ChatMessageResponse response = ChatMessageResponse.builder()
                .type(ChatMessageResponse.ResponseType.PROCESSING)
                .userId(request.getUserId())
                .conversationId(request.getConversationId())
                .userMessage(request.getMessage())
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
            ChatMessageRequest request,
            StructuredChatPayload payload,
            long processingTime) {
        
        ChatMessageResponse response = ChatMessageResponse.builder()
                .type(ChatMessageResponse.ResponseType.RESPONSE)
                .userId(request.getUserId())
                .conversationId(request.getConversationId())
                .userMessage(request.getMessage())
                .aiResponse(payload.getMessage())
                .results(payload.getResults())
                .status("Hoàn tất")
                .timestamp(LocalDateTime.now())
                .processingTimeMs(processingTime)
                .build();
        
        messagingTemplate.convertAndSend(destination, response);
        log.info("✅ Sent final response: {} characters, {} results", 
                payload.getMessage().length(),
                payload.getResults() != null ? payload.getResults().size() : 0);
    }

    /**
     * Send error response.
     */
    private void sendErrorResponse(String destination, ChatMessageRequest request, String errorMessage) {
        ChatMessageResponse response = ChatMessageResponse.builder()
                .type(ChatMessageResponse.ResponseType.ERROR)
                .userId(request.getUserId())
                .conversationId(request.getConversationId())
                .userMessage(request.getMessage())
                .error(errorMessage)
                .status("Lỗi: " + errorMessage)
                .timestamp(LocalDateTime.now())
                .build();
        
        messagingTemplate.convertAndSend(destination, response);
        log.error("❌ Sent error response: {}", errorMessage);
    }

    /**
     * Truncate message for logging (max 100 chars).
     */
    private String truncateMessage(String message) {
        if (message == null) {
            return "";
        }
        return message.length() > 100 
                ? message.substring(0, 100) + "..." 
                : message;
    }
}
