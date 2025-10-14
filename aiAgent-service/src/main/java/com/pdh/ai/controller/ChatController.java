package com.pdh.ai.controller;

import com.pdh.ai.model.dto.ChatConversationSummaryDto;
import com.pdh.ai.model.dto.ChatHistoryResponse;
import com.pdh.ai.model.dto.ChatMessageRequest;
import com.pdh.ai.model.dto.StructuredChatPayload;
import com.pdh.ai.rag.service.RagInitializationService;
import com.pdh.ai.service.AiService;
import com.pdh.ai.service.LLMAiService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;


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
    private final RagInitializationService ragInitializationService;
    public ChatController(AiService aiService, LLMAiService llmAiService, RagInitializationService ragInitializationService) {
        this.aiService = aiService;
        this.llmAiService = llmAiService;
        this.ragInitializationService = ragInitializationService;
    }

//    @PostMapping(value = "/message", produces = MediaType.APPLICATION_JSON_VALUE)
//    public Mono<StructuredChatPayload> sendMessage(@RequestBody ChatMessageRequest request, @AuthenticationPrincipal OAuth2User principal) {
//        try {
//            // Extract username from OAuth2 principal
//            String username = principal.getAttribute("preferred_username");
//            logger.info("💬 [CHAT-SYNC] Received message from user: {}, conversation: {}",
//                       username, request.getConversationId());
//
//            // Validate request
//            if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
//                return Mono.just(StructuredChatPayload.builder()
//                    .message("Message cannot be empty")
//                    .results(java.util.List.of())
//                    .build());
//            }
//
//            // Generate conversation ID if not provided
//            String conversationId = request.getConversationId();
//            if (conversationId == null || conversationId.trim().isEmpty()) {
//                conversationId = UUID.randomUUID().toString();
//                logger.debug("📝 Generated new conversation ID: {}", conversationId);
//            }
//
//            // Process with all agentic patterns automatically
//            return llmAiService.processSyncStructured(
//                request.getMessage(),
//                conversationId,
//                username
//            );
//
//        } catch (Exception e) {
//            logger.error("❌ [CHAT-SYNC] Error processing message: {}", e.getMessage(), e);
//            return Mono.just(StructuredChatPayload.builder()
//                .message("Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn.")
//                .results(java.util.List.of())
//                .build());
//        }
//    }
    @GetMapping("init-rag")
    public String getMethodName(@RequestParam String param) {
        ragInitializationService.initializeRagData();
        return new String(param);

    }

    /**
     * Streaming chat endpoint - Returns response chunks as they are generated.
     * Uses Server-Sent Events to stream the AI response in real-time.
     * 
     * <p>Example Request:</p>
     * <pre>
     * POST /chat/stream?conversationId={conversationId}
     * {
     *   "message": "Compare flights from Hanoi to Da Nang, Phu Quoc, and Nha Trang"
     * }
     * </pre>
     * 
     * @param request Chat message request
     * @param conversationId The conversation ID for this chat
     * @param principal The authenticated OAuth2 user
     * @return Flux of StructuredChatPayload chunks
     */
    @PostMapping(path = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<StructuredChatPayload> streamChat(@RequestBody ChatMessageRequest request,
                                                  @RequestParam String conversationId,
                                                  @AuthenticationPrincipal OAuth2User principal) {
        try {
            // Extract username from OAuth2 principal
            String username = principal.getAttribute("preferred_username");
            logger.info("💬 [CHAT-STREAM] Received streaming message from user: {}, conversation: {}", 
                       username, conversationId);

            // Validate request
            if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
                return Flux.just(StructuredChatPayload.builder()
                    .message("Message cannot be empty")
                    .results(java.util.List.of())
                    .build());
            }

            // Process with streaming - each chunk of the response will be emitted as it's available
            return llmAiService.processStreamStructured(
                request.getMessage(),
                conversationId,
                username
            );

        } catch (Exception e) {
            logger.error("❌ [CHAT-STREAM] Error processing message: {}", e.getMessage(), e);
            return Flux.just(StructuredChatPayload.builder()
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
    public ResponseEntity<ChatHistoryResponse> getChatHistory(@PathVariable String conversationId, @AuthenticationPrincipal OAuth2User principal) {
        try {
            // Extract username from OAuth2 principal
            String username = principal.getAttribute("preferred_username");
            ChatHistoryResponse history = aiService.getChatHistory(conversationId, username);
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
    public ResponseEntity<Void> clearChatHistory(@PathVariable String conversationId, @AuthenticationPrincipal OAuth2User principal) {
        try {
            // Extract username from OAuth2 principal
            String username = principal.getAttribute("preferred_username");
            aiService.clearChatHistory(conversationId, username);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/conversations")
    public ResponseEntity<java.util.List<ChatConversationSummaryDto>> getUserConversations(@AuthenticationPrincipal OAuth2User principal) {
        try {
            // Extract username from OAuth2 principal
            String username = principal.getAttribute("preferred_username");
            java.util.List<ChatConversationSummaryDto> conversations = aiService.getUserConversations(username);
            return ResponseEntity.ok(conversations);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.List.<ChatConversationSummaryDto>of());
        }
    }
}
