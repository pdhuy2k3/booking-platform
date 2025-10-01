package com.pdh.ai.controller;

import com.pdh.ai.ChatRequest;
import com.pdh.ai.ChatResponse;
import com.pdh.ai.ChatHistoryResponse;
import com.pdh.ai.service.AiService;
import com.pdh.common.utils.AuthenticationUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/chat")
public class ChatController {
    private final AiService aiService;

    public ChatController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/message")
    public ResponseEntity<ChatResponse> sendMessage(@RequestBody ChatRequest chatRequest) {
        try {
            String conversationId = chatRequest.getConversationId();
            if (conversationId == null || conversationId.trim().isEmpty()) {
                conversationId = UUID.randomUUID().toString();
            }
            
            // Use userId from request, or extract from JWT token if not provided
            String userId = getUserIdFromRequestOrToken(chatRequest.getUserId());
            
            String response = aiService.completeWithConversation(
                chatRequest.getMessage(), 
                conversationId,
                userId
            );
            
            ChatResponse chatResponse = ChatResponse.builder()
                    .userMessage(chatRequest.getMessage())
                    .aiResponse(response)
                    .conversationId(conversationId)
                    .userId(userId)
                    .timestamp(LocalDateTime.now())
                    .build();
                    
            return ResponseEntity.ok(chatResponse);
        } catch (Exception e) {
            String fallbackConversationId = chatRequest.getConversationId();
            if (fallbackConversationId == null || fallbackConversationId.trim().isEmpty()) {
                fallbackConversationId = UUID.randomUUID().toString();
            }
            
            ChatResponse errorResponse = ChatResponse.builder()
                    .userMessage(chatRequest.getMessage())
                    .aiResponse("Xin lỗi, đã xảy ra lỗi khi xử lý tin nhắn của bạn.")
                    .conversationId(fallbackConversationId)
                    .userId(getUserIdFromRequestOrToken(chatRequest.getUserId()))
                    .timestamp(LocalDateTime.now())
                    .error(e.getMessage())
                    .build();
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @GetMapping("/history/{conversationId}")
    public ResponseEntity<ChatHistoryResponse> getChatHistory(
            @PathVariable String conversationId,
            @RequestParam(required = false) String userId) {
        try {
            String actualUserId = getUserIdFromRequestOrToken(userId);
            ChatHistoryResponse history = aiService.getChatHistory(conversationId, actualUserId);
            return ResponseEntity.ok(history);
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
    public ResponseEntity<Void> clearChatHistory(
            @PathVariable String conversationId,
            @RequestParam(required = false) String userId) {
        try {
            String actualUserId = getUserIdFromRequestOrToken(userId);
            aiService.clearChatHistory(conversationId, actualUserId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/conversations")
    public ResponseEntity<java.util.List<String>> getUserConversations(
            @RequestParam(required = false) String userId) {
        try {
            String actualUserId = getUserIdFromRequestOrToken(userId);
            java.util.List<String> conversations = aiService.getUserConversations(actualUserId);
            return ResponseEntity.ok(conversations);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.List.of());
        }
    }

    /**
     * Get userId from request parameter or extract from JWT token
     */
    private String getUserIdFromRequestOrToken(String requestUserId) {
        if (requestUserId != null && !requestUserId.trim().isEmpty()) {
            return requestUserId;
        }
        
        try {
            return AuthenticationUtils.extractUserId();
        } catch (Exception e) {
            // If unable to extract userId (e.g., no authentication), return anonymous user
            return "anonymous-" + UUID.randomUUID().toString().substring(0, 8);
        }
    }
}
