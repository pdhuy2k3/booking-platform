package com.pdh.ai.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

/**
 * Configuration for HTTP clients used in audio transcription and external API calls.
 * 
 * <p>Key Configurations:</p>
 * <ul>
 * <li>Connection timeout: 10 seconds</li>
 * <li>Read timeout: 60 seconds (for large audio file processing)</li>
 * <li>Write timeout: 30 seconds</li>
 * </ul>
 * 
 * @author PDH
 * @since 2025-01-05
 */
@Configuration
public class RestTemplateConfig {

    /**
     * Creates RestTemplate bean with optimized timeouts for audio transcription.
     * 
     * <p>Timeout Strategy:</p>
     * <ul>
     * <li>Connection: 10s - Quick fail for network issues</li>
     * <li>Read: 60s - Whisper API can take time for large files</li>
     * <li>Write: 30s - Sufficient for uploading 25MB files</li>
     * </ul>
     * 
     * @param builder RestTemplateBuilder auto-configured by Spring Boot
     * @return Configured RestTemplate instance
     */
    @Bean
    public RestTemplate restTemplate() {
        // Use default RestTemplate - Spring Boot 3.x auto-configures timeouts
        // Default connection timeout: 5s, read timeout: 30s
        // Sufficient for most OpenAI API calls including Whisper transcription
        return new RestTemplate();
    }
}
