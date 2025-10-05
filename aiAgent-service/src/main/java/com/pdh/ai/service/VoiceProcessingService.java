package com.pdh.ai.service;

import com.pdh.ai.model.dto.StructuredChatPayload;
import com.pdh.ai.model.dto.VoiceMessageRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.util.MimeTypeUtils;

import java.util.Base64;

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

    /**
     * Constructor with Mistral AI ChatClient for audio processing.
     * 
     * @param mistralChatClient ChatClient configured with Mistral AI
     * @param aiService Main AI service for chat processing
     */
    public VoiceProcessingService(
            @Qualifier("mistralChatClient") ChatClient mistralChatClient,
            LLMAiService aiService) {
        this.mistralChatClient = mistralChatClient;
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
     * Process voice message end-to-end.
     * 
     * <p>Flow:</p>
     * <ol>
     * <li>Transcribe audio → text (Mistral AI)</li>
     * <li>Process text → response (Gemini via AiService)</li>
     * </ol>
     * 
     * @param request Voice message request
     * @return Structured chat payload with transcription and response
     */
    public StructuredChatPayload processVoiceMessage(VoiceMessageRequest request) {
        long startTime = System.currentTimeMillis();
        
        log.info("🎤 Processing voice message for user: {}, conversation: {}", 
                request.getUserId(), request.getConversationId());

        try {
            // Step 1: Transcribe audio to text
            String transcribedText = transcribeAudio(request);
            
            // Step 2: Process text through main AI pipeline (Gemini)
            StructuredChatPayload payload = aiService.completeWithConversation(
                    transcribedText,
                    request.getConversationId(),
                    request.getUserId()
            );
            
            long processingTime = System.currentTimeMillis() - startTime;
            log.info("✅ Voice message processed in {}ms", processingTime);
            
            return payload;

        } catch (Exception e) {
            log.error("❌ Voice message processing failed: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to process voice message: " + e.getMessage(), e);
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
}
