package com.pdh.ai.controller;

import com.pdh.ai.model.dto.ChatConversationSummaryDto;
import com.pdh.ai.model.dto.ChatHistoryResponse;
import com.pdh.ai.model.dto.ChatMessageRequest;
import com.pdh.ai.model.dto.StructuredChatPayload;
import com.pdh.ai.service.AiService;
import com.pdh.ai.service.LLMAiService;
import com.pdh.common.utils.AuthenticationUtils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * REST Controller for AI Chat using Spring MVC.
 * Provides both synchronous and streaming chat endpoints.
 * 
 * <p>This controller uses AgenticWorkflowService which automatically:
 * <ul>
 * <li>Routes queries to specialized handlers (flight, hotel, destination, etc.)</li>
 * <li>Applies parallelization for multi-item queries</li>
 * <li>Optimizes responses through evaluation cycles</li>
 * </ul>
 */
@RestController
@RequestMapping("/chat")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class ChatController {
    
    private static final Logger logger = LoggerFactory.getLogger(ChatController.class);
    
    private final AiService aiService;
    private final LLMAiService llmAiService;

    public ChatController(AiService aiService, LLMAiService llmAiService) {
        this.aiService = aiService;
        this.llmAiService = llmAiService;
    }

    /**
     * Synchronous chat endpoint - Returns complete response immediately.
     * Uses all agentic patterns automatically (Routing, Parallelization, Evaluation).
     * 
     * <p>Example Request:</p>
     * <pre>
     * POST /chat/message
     * {
     *   "userId": "user123",
     *   "conversationId": "conv-456",
     *   "message": "Compare flights from Hanoi to Da Nang, Phu Quoc, and Nha Trang"
     * }
     * </pre>
     * 
     * <p>Example Response:</p>
     * <pre>
     * {
     *   "message": "Here are the flight comparisons...",
     *   "results": []
     * }
     * </pre>
     * 
     * @param request Chat message request
     * @return StructuredChatPayload with AI response
     */
    @PostMapping(value = "/message", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<StructuredChatPayload> sendMessage(@RequestBody ChatMessageRequest request) {
        try {
            // Extract userId from JWT token (authentication required)
            String userId = AuthenticationUtils.extractUserId();
            logger.info("💬 [CHAT-SYNC] Received message from user: {}, conversation: {}", 
                       userId, request.getConversationId());

            // Validate request
            if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
                return Mono.just(StructuredChatPayload.builder()
                    .message("Message cannot be empty")
                    .results(java.util.List.of())
                    .build());
            }

            // Generate conversation ID if not provided
            String conversationId = request.getConversationId();
            if (conversationId == null || conversationId.trim().isEmpty()) {
                conversationId = UUID.randomUUID().toString();
                logger.debug("📝 Generated new conversation ID: {}", conversationId);
            }

            // Process with all agentic patterns automatically
            return llmAiService.processSyncStructured(
                request.getMessage(),
                conversationId,
                userId
            );

        } catch (Exception e) {
            logger.error("❌ [CHAT-SYNC] Error processing message: {}", e.getMessage(), e);
            return Mono.just(StructuredChatPayload.builder()
                .message("Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn.")
                .results(java.util.List.of())
                .build());
        }
    }

    /**
     * Health check endpoint.
     * 
     * @return Health status
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Chat service is running with Agentic Workflow Orchestration (Sync Only)");
    }



    @GetMapping("/history/{conversationId}")
    public ResponseEntity<ChatHistoryResponse> getChatHistory(@PathVariable String conversationId) {
        try {
            // Extract userId from JWT token
            String userId = AuthenticationUtils.extractUserId();
            ChatHistoryResponse history = aiService.getChatHistory(conversationId, userId);
            return ResponseEntity.ok(history);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).body(
                ChatHistoryResponse.builder()
                    .conversationId(conversationId)
                    .messages(java.util.List.of())
                    .createdAt(LocalDateTime.now())
                    .lastUpdated(LocalDateTime.now())
                    .build()
            );
        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                ChatHistoryResponse.builder()
                    .conversationId(conversationId)
                    .messages(java.util.List.of())
                    .createdAt(LocalDateTime.now())
                    .lastUpdated(LocalDateTime.now())
                    .build()
            );
        }
    }

    @DeleteMapping("/history/{conversationId}")
    public ResponseEntity<Void> clearChatHistory(@PathVariable String conversationId) {
        try {
            // Extract userId from JWT token
            String userId = AuthenticationUtils.extractUserId();
            aiService.clearChatHistory(conversationId, userId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/conversations")
    public ResponseEntity<java.util.List<ChatConversationSummaryDto>> getUserConversations() {
        try {
            // Extract userId from JWT token
            String userId = AuthenticationUtils.extractUserId();
            java.util.List<ChatConversationSummaryDto> conversations = aiService.getUserConversations(userId);
            return ResponseEntity.ok(conversations);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.List.<ChatConversationSummaryDto>of());
        }
    }
}
