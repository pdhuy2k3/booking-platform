package com.pdh.ai.service;

import com.pdh.ai.model.dto.StructuredChatPayload;
import com.pdh.ai.model.dto.VoiceMessageRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.mistralai.MistralAiChatModel;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.util.MimeTypeUtils;

import java.util.Base64;
import java.util.Collections;

/**
 * Service for processing voice messages using Mistral AI multimodal capabilities.
 * 
 * <p>Processing Pipeline:</p>
 * <ol>
 * <li>Decode base64 audio data</li>
 * <li>Send to Mistral AI Pixtral (multimodal model)</li>
 * <li>Extract transcribed text</li>
 * <li>Pass to main chat pipeline (Gemini)</li>
 * <li>Return combined response</li>
 * </ol>
 * 
 * <p>Why Mistral AI:</p>
 * <ul>
 * <li>Excellent multimodal audio support</li>
 * <li>High accuracy for Vietnamese and English</li>
 * <li>Fast transcription speed</li>
 * <li>Cost-effective pricing</li>
 * </ul>
 */
@Service
public class VoiceProcessingService {

    private static final Logger log = LoggerFactory.getLogger(VoiceProcessingService.class);

    private final ChatClient mistralChatClient;
    private final LLMAiService aiService;
    private final MistralAiChatModel mistralAiChatModel;
    /**
     * Constructor with Mistral AI ChatClient for audio processing.
     * 
     * @param aiService Main AI service for chat processing
     */
    public VoiceProcessingService(

            LLMAiService aiService,
            MistralAiChatModel mistralAiChatModel
    ) {
        this.mistralAiChatModel = mistralAiChatModel;
        this.mistralChatClient = ChatClient.create(this.mistralAiChatModel);
        this.aiService = aiService;
    }

    /**
     * Transcribe audio to text using Mistral AI multimodal.
     * @param request Voice message request with base64 audio
     * @return Transcribed text
     */
    public String transcribeAudio(VoiceMessageRequest request) {
        log.info("🎙️ Transcribing audio with Mistral AI: format={}, duration={}ms", 
                request.getAudioFormat(), request.getDurationMs());

        try {
            // Decode base64 audio
            byte[] audioBytes = Base64.getDecoder().decode(request.getAudioData());
            
            // Create media resource
            ByteArrayResource audioResource = new ByteArrayResource(audioBytes);
            
            // Determine MIME type
            String mimeType = request.getAudioFormat() != null 
                    ? request.getAudioFormat() 
                    : "audio/mp3";
            
            // Create prompt with audio media
            String transcriptionPrompt = buildTranscriptionPrompt(request.getLanguage());
            
            // Call Mistral AI multimodal API
            String transcribedText = mistralChatClient.prompt()
                    .user(userSpec -> userSpec
                            .text(transcriptionPrompt)
                            .media(MimeTypeUtils.parseMimeType(mimeType), audioResource))
                    .call()
                    .content();
            
            log.info("✅ Transcription successful: {} characters", transcribedText.length());
            log.debug("📝 Transcribed text: {}", transcribedText);
            
            return transcribedText;

        } catch (Exception e) {
            log.error("❌ Audio transcription failed: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to transcribe audio: " + e.getMessage(), e);
        }
    }



    /**
     * Build transcription prompt based on language.
     * 
     * @param language Language code (vi, en, etc.)
     * @return Transcription prompt
     */
    private String buildTranscriptionPrompt(String language) {
        String lang = language != null ? language : "vi";
        
        return switch (lang) {
            case "vi" -> """
                    Hãy transcribe audio này sang text bằng tiếng Việt.
                    Chỉ trả về text đã transcribe, không thêm bất kỳ giải thích nào khác.
                    Giữ nguyên dấu câu và ngữ điệu tự nhiên.
                    """;
            case "en" -> """
                    Transcribe this audio to text in English.
                    Only return the transcribed text, no other explanations.
                    Keep natural punctuation and intonation.
                    """;
            default -> """
                    Transcribe this audio to text.
                    Only return the transcribed text, no other explanations.
                    Detect the language automatically and transcribe in that language.
                    """;
        };
    }

    /**
     * Process the transcribed text through the main AI service to obtain structured results.
     *
     * @param transcribedText Text obtained from audio transcription
     * @param request         Original voice message request containing context identifiers
     * @return Structured response payload for the client UI
     */
    public StructuredChatPayload processVoiceMessage(String transcribedText, VoiceMessageRequest request) {
        String conversationId = request.getConversationId();
        String userId = request.getUserId();

        log.info("🧠 Processing transcribed voice message: conversationId={}, userId={}", conversationId, userId);

        try {
            return aiService.processSyncStructured(transcribedText, conversationId, userId)
                    .doOnSuccess(payload -> log.info("✅ Voice chat processed successfully: results={}",
                            payload != null && payload.getResults() != null ? payload.getResults().size() : 0))
                    .blockOptional()
                    .orElseGet(this::fallbackPayload);
        } catch (Exception ex) {
            log.error("❌ Failed to process voice message: {}", ex.getMessage(), ex);
            return fallbackPayload();
        }
    }

    private StructuredChatPayload fallbackPayload() {
        return StructuredChatPayload.builder()
                .message("Xin lỗi, tôi gặp vấn đề khi xử lý yêu cầu giọng nói của bạn. Vui lòng thử lại.")
                .results(Collections.emptyList())
                .nextRequestSuggesstions(new String[0])
                .build();
    }
}
