package com.pdh.ai.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.Arrays;

/**
 * Service for transcribing audio files to text using OpenAI Whisper model.
 * 
 * <p>Implementation Details:</p>
 * <ul>
 * <li>Direct OpenAI API integration (compatible with Spring AI 1.0.2)</li>
 * <li>Supports multiple audio formats (mp3, mp4, mpeg, mpga, m4a, wav, webm)</li>
 * <li>File size validation (max 25MB as per OpenAI API limit)</li>
 * <li>Configurable language and temperature settings</li>
 * <li>Robust error handling with detailed logging</li>
 * </ul>
 * 
 * <p>Why Direct API Integration:</p>
 * Spring AI 1.0.2 doesn't have built-in audio transcription APIs yet.
 * This service uses direct HTTP calls to OpenAI's /v1/audio/transcriptions endpoint.
 * 
 * @author PDH
 * @since 2025-01-05
 */
@Service
public class AudioTranscriptionService {

    private static final Logger log = LoggerFactory.getLogger(AudioTranscriptionService.class);

    // Gemini API configuration (via OpenAI compatibility endpoint)
    private static final String GEMINI_CHAT_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
    private static final String GEMINI_MODEL = "gemini-2.5-flash-native-audio-preview-09-2025";
    
    // Supported audio formats
    private static final String[] SUPPORTED_FORMATS = {
        "audio/mpeg", "audio/mp3", "audio/mp4", "audio/mpga", 
        "audio/m4a", "audio/wav", "audio/webm"
    };
    
    // Maximum file size: 25MB (Gemini limit)
    private static final long MAX_FILE_SIZE = 25 * 1024 * 1024;

    // Use Gemini API key for audio understanding
    @Value("${spring.ai.openai.api-key}")
    private String geminiApiKey;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    /**
     * Constructor with RestTemplate for OpenAI API calls.
     * 
     * @param restTemplate HTTP client for API calls
     * @param objectMapper JSON parser for response handling
     */
    public AudioTranscriptionService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Transcribes audio file to text using OpenAI Whisper.
     * 
     * <p>Process Flow:</p>
     * <ol>
     * <li>Validate audio file format and size</li>
     * <li>Create multipart request with audio data</li>
     * <li>Send POST request to OpenAI API</li>
     * <li>Parse and return transcription text</li>
     * </ol>
     * 
     * @param audioFile The audio file to transcribe (MultipartFile from HTTP request)
     * @return Transcribed text
     * @throws IllegalArgumentException if audio file is invalid (format/size)
     * @throws IOException if file reading fails
     * @throws RestClientException if OpenAI API call fails
     */
    public String transcribe(MultipartFile audioFile) throws IOException {
        log.info("🎙️ Transcribing audio file using Gemini: {} (size: {} bytes)", 
                audioFile.getOriginalFilename(), audioFile.getSize());

        // Validate audio file
        validateAudioFile(audioFile);

        try {
            // Convert audio to base64
            String base64Audio = java.util.Base64.getEncoder()
                    .encodeToString(audioFile.getBytes());
            
            // Prepare request body for Gemini audio understanding
            String requestBody = String.format("""
                {
                  "model": "%s",
                  "messages": [
                    {
                      "role": "user",
                      "content": [
                        {
                          "type": "text",
                          "text": "Transcribe this audio file. Only return the transcription text, no other commentary."
                        },
                        {
                          "type": "input_audio",
                          "input_audio": {
                            "data": "%s",
                            "format": "wav"
                          }
                        }
                      ]
                    }
                  ]
                }
                """, GEMINI_MODEL, base64Audio);

            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(geminiApiKey);

            // Create HTTP entity
            HttpEntity<String> requestEntity = new HttpEntity<>(requestBody, headers);

            // Call Gemini API
            log.debug("📡 Calling Gemini audio understanding API...");
            ResponseEntity<String> response = restTemplate.exchange(
                GEMINI_CHAT_URL,
                HttpMethod.POST,
                requestEntity,
                String.class
            );

            // Extract transcription text from response
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String transcribedText = extractTranscriptionFromResponse(response.getBody());
                log.info("✅ Transcription successful: {} characters", transcribedText.length());
                log.debug("📝 Transcribed text: {}", transcribedText);
                return transcribedText;
            } else {
                throw new RuntimeException("Gemini API returned empty response");
            }

        } catch (RestClientException e) {
            log.error("❌ Gemini API call failed: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to transcribe audio: " + e.getMessage(), e);
        }
    }

    /**
     * Transcribes audio with custom language hint.
     * 
     * @param audioFile The audio file to transcribe
     * @param language Language code (e.g., "en", "vi", "fr")
     * @return Transcribed text
     * @throws IllegalArgumentException if audio file is invalid
     * @throws IOException if file reading fails
     */
    public String transcribe(MultipartFile audioFile, String language) throws IOException {
        log.info("🎙️ Transcribing audio file with language hint: {}", language);
        
        // Gemini auto-detects language, so just use default transcribe method
        // Language parameter is kept for API compatibility but not used
        return transcribe(audioFile);
    }
    
    /**
     * Extracts transcription text from Gemini API response.
     * 
     * @param responseBody JSON response from Gemini API
     * @return Transcribed text
     */
    private String extractTranscriptionFromResponse(String responseBody) {
        try {
            // Parse JSON response
            var jsonNode = objectMapper.readTree(responseBody);
            
            // Extract text from: choices[0].message.content
            if (jsonNode.has("choices") && jsonNode.get("choices").isArray() 
                    && jsonNode.get("choices").size() > 0) {
                var firstChoice = jsonNode.get("choices").get(0);
                if (firstChoice.has("message") && firstChoice.get("message").has("content")) {
                    return firstChoice.get("message").get("content").asText();
                }
            }
            
            throw new RuntimeException("Could not extract transcription from response");
        } catch (Exception e) {
            log.error("❌ Failed to parse Gemini response: {}", e.getMessage());
            throw new RuntimeException("Failed to parse transcription response: " + e.getMessage(), e);
        }
    }

    /**
     * Validates audio file format and size.
     * 
     * @param audioFile The audio file to validate
     * @throws IllegalArgumentException if validation fails
     */
    private void validateAudioFile(MultipartFile audioFile) {
        if (audioFile == null || audioFile.isEmpty()) {
            throw new IllegalArgumentException("Audio file is empty or null");
        }

        // Check file size
        if (audioFile.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                String.format("Audio file too large: %.2f MB (max: 25 MB)", 
                    audioFile.getSize() / (1024.0 * 1024.0))
            );
        }

        // Check content type
        String contentType = audioFile.getContentType();
        if (contentType == null || !isSupportedFormat(contentType)) {
            throw new IllegalArgumentException(
                String.format("Unsupported audio format: %s. Supported: %s", 
                    contentType, Arrays.toString(SUPPORTED_FORMATS))
            );
        }

        log.debug("✅ Audio file validation passed: {} ({})", 
                audioFile.getOriginalFilename(), contentType);
    }

    /**
     * Checks if audio format is supported.
     * 
     * @param contentType MIME type of the audio file
     * @return true if format is supported
     */
    private boolean isSupportedFormat(String contentType) {
        return Arrays.stream(SUPPORTED_FORMATS)
                .anyMatch(format -> contentType.toLowerCase().contains(format.replace("audio/", "")));
    }


}
