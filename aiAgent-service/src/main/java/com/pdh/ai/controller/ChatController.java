package com.pdh.ai.controller;

import com.pdh.ai.model.dto.ChatRequest;
import com.pdh.ai.model.dto.ChatResponse;
import com.pdh.ai.model.dto.ChatHistoryResponse;
import com.pdh.ai.service.AiService;
import com.pdh.ai.service.AudioTranscriptionService;
import com.pdh.common.utils.AuthenticationUtils;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/chat")
public class ChatController {
    private final AiService aiService;
    private final AudioTranscriptionService audioTranscriptionService;

    public ChatController(AiService aiService, AudioTranscriptionService audioTranscriptionService) {
        this.aiService = aiService;
        this.audioTranscriptionService = audioTranscriptionService;
    }

    @PostMapping("/message")
    public Mono<ResponseEntity<ChatResponse>> sendMessage(@RequestBody ChatRequest chatRequest) {
        return Mono.fromCallable(() -> {
            String conversationId = chatRequest.getConversationId();
            if (conversationId == null || conversationId.trim().isEmpty()) {
                conversationId = UUID.randomUUID().toString();
            }
            return conversationId;
        })
        .flatMap(conversationId -> {
            String userId = getUserIdFromRequestOrToken(chatRequest.getUserId());
            
            return aiService.completeWithConversationAsync(
                chatRequest.getMessage(), 
                conversationId,
                userId
            )
            .map(completion -> {
                ChatResponse chatResponse = ChatResponse.builder()
                        .userMessage(chatRequest.getMessage())
                        .aiResponse(completion.getMessage())
                        .conversationId(conversationId)
                        .userId(userId)
                        .timestamp(LocalDateTime.now())
                        .results(completion.getResults() != null ? completion.getResults() : java.util.List.of())
                        .build();
                
                return ResponseEntity.ok(chatResponse);
            });
        })
        .doOnSubscribe(s -> System.out.println("🚀 Processing async chat request"))
        .doOnSuccess(result -> System.out.println("✅ Async chat request completed"))
        .onErrorReturn(ResponseEntity.status(500).body(
            ChatResponse.builder()
                    .userMessage(chatRequest.getMessage())
                    .aiResponse("Xin lỗi, đã xảy ra lỗi khi xử lý tin nhắn của bạn.")
                    .conversationId(chatRequest.getConversationId())
                    .userId(getUserIdFromRequestOrToken(chatRequest.getUserId()))
                    .timestamp(LocalDateTime.now())
                    .error("Internal server error")
                    .results(java.util.List.of())
                    .build()
        ));
    }

    @PostMapping(value = "/message/stream", produces = MediaType.TEXT_PLAIN_VALUE)
    public Flux<String> sendMessageStream(@RequestBody ChatRequest chatRequest) {
        return Mono.fromCallable(() -> {
            String conversationId = chatRequest.getConversationId();
            if (conversationId == null || conversationId.trim().isEmpty()) {
                conversationId = UUID.randomUUID().toString();
            }
            return conversationId;
        })
        .flatMapMany(conversationId -> {
            String userId = getUserIdFromRequestOrToken(chatRequest.getUserId());
            
            return aiService.completeWithConversationStream(
                chatRequest.getMessage(), 
                conversationId,
                userId
            );
        })
        .doOnSubscribe(s -> System.out.println("🌊 Starting streaming chat request"))
        .doOnNext(chunk -> System.out.print("📡"))
        .doOnComplete(() -> System.out.println("\n🎯 Streaming chat request completed"))
        .onErrorReturn("Error occurred during streaming. Please try again.");
    }

    @GetMapping("/history/{conversationId}")
    public ResponseEntity<ChatHistoryResponse> getChatHistory(
            @PathVariable String conversationId,
            @RequestParam(required = false) String userId) {
        try {
            String actualUserId = getUserIdFromRequestOrToken(userId);
            ChatHistoryResponse history = aiService.getChatHistory(conversationId, actualUserId);
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
    public ResponseEntity<Void> clearChatHistory(
            @PathVariable String conversationId,
            @RequestParam(required = false) String userId) {
        try {
            String actualUserId = getUserIdFromRequestOrToken(userId);
            aiService.clearChatHistory(conversationId, actualUserId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(404).build();
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
     * Send voice message (multimodal input).
     * 
     * <p>Process Flow:</p>
     * <ol>
     * <li>Receive audio file from user</li>
     * <li>Transcribe audio to text using Whisper</li>
     * <li>Process text through existing chat pipeline</li>
     * <li>Return text response (no voice synthesis yet)</li>
     * </ol>
     * 
     * @param audioFile Audio file from user (mp3, wav, m4a, etc.)
     * @param userId Optional user ID (extracted from JWT if not provided)
     * @param conversationId Optional conversation ID (generated if not provided)
     * @param language Optional language code (default: "vi")
     * @return Text response from AI
     */
    @PostMapping(value = "/voice", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Mono<ResponseEntity<ChatResponse>> sendVoiceMessage(
            @RequestParam("audio") MultipartFile audioFile,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String conversationId,
            @RequestParam(required = false, defaultValue = "vi") String language) {
        
        return Mono.fromCallable(() -> {
            // Step 1: Transcribe audio to text
            String transcribedText = audioTranscriptionService.transcribe(audioFile, language);
            return transcribedText;
        })
        .flatMap(transcribedText -> {
            // Step 2: Generate conversation ID if needed
            final String actualConversationId = (conversationId == null || conversationId.trim().isEmpty()) 
                    ? UUID.randomUUID().toString() 
                    : conversationId;
            
            final String actualUserId = getUserIdFromRequestOrToken(userId);
            
            // Step 3: Process text through normal chat pipeline
            return aiService.completeWithConversationAsync(
                transcribedText,
                actualConversationId,
                actualUserId
            )
            .map(completion -> {
                // Step 4: Return text response
                ChatResponse chatResponse = ChatResponse.builder()
                        .userMessage(transcribedText)  // Show transcribed text
                        .aiResponse(completion.getMessage())
                        .conversationId(actualConversationId)
                        .userId(actualUserId)
                        .timestamp(LocalDateTime.now())
                        .results(completion.getResults() != null ? completion.getResults() : java.util.List.of())
                        .build();
                
                return ResponseEntity.ok(chatResponse);
            });
        })
        .doOnSubscribe(s -> System.out.println("🎙️ Processing voice message"))
        .doOnSuccess(result -> System.out.println("✅ Voice message transcribed and processed"))
        .onErrorResume(e -> {
            System.err.println("❌ Voice message processing failed: " + e.getMessage());
            return Mono.just(ResponseEntity.status(500).body(
                ChatResponse.builder()
                        .userMessage("[Voice message - transcription failed]")
                        .aiResponse("Xin lỗi, không thể xử lý tin nhắn thoại của bạn. Lỗi: " + e.getMessage())
                        .conversationId(conversationId)
                        .userId(getUserIdFromRequestOrToken(userId))
                        .timestamp(LocalDateTime.now())
                        .error(e.getMessage())
                        .results(java.util.List.of())
                        .build()
            ));
        });
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
