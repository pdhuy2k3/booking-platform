package com.pdh.ai.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.mistralai.MistralAiChatModel;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * Configuration for multiple LLM providers in BookingSmart AI Agent.
 * 
 * <p>Provider Strategy:</p>
 * <ul>
 * <li><b>Gemini (via OpenAI compatibility)</b>: Primary chat LLM for text interactions</li>
 * <li><b>Mistral AI</b>: Multimodal processing for audio-to-text transcription</li>
 * </ul>
 * 
 * <p>Why Multiple Providers:</p>
 * <ul>
 * <li>Gemini 2.5 Flash: Fast and cheap for text chat ($0.15/1M tokens)</li>
 * <li>Mistral Pixtral: Excellent multimodal audio support</li>
 * <li>Provider redundancy: Fallback if one fails</li>
 * <li>Best-of-breed: Use each provider's strengths</li>
 * </ul>
 * 
 * <p><b>Workers Flexibility:</b></p>
 * <p>This config provides both ChatClient instances and Builder beans to enable
 * workers to choose their preferred model:</p>
 * <ul>
 * <li><b>geminiChatClientBuilder</b>: Default for all workers (text, tool calling)</li>
 * <li><b>mistralChatClientBuilder</b>: For audio/multimodal workers (future)</li>
 * </ul>
 * 
 * @author PDH
 * @since 2025-01-05
 */
@Configuration
public class MultiLlmChatClientConfig {

    // ========== ChatClient Instances (for direct usage) ==========

    /**
     * Primary ChatClient using Gemini for text chat.
     * 
     * <p>Used for:</p>
     * <ul>
     * <li>Regular text chat interactions</li>
     * <li>Tool calling (flights, hotels, bookings)</li>
     * <li>Conversation memory management</li>
     * <li>Workflow orchestration (routing, parallel)</li>
     * </ul>
     * 
     * <p><b>Note:</b> Injects auto-configured OpenAiChatModel (Gemini via OpenAI compatibility)
     * from Spring Boot's OpenAiAutoConfiguration.</p>
     * 
     * @param openAiChatModel Auto-configured ChatModel (actually Gemini 2.0 Flash)
     * @return ChatClient for Gemini
     */
    @Bean
    @Primary
    @Qualifier("geminiChatClient")
    public ChatClient geminiChatClient(OpenAiChatModel openAiChatModel) {
        return ChatClient.builder(openAiChatModel)
                .build();
    }

    /**
     * Secondary ChatClient using Mistral AI for multimodal audio processing.
     * 
     * <p>Used for:</p>
     * <ul>
     * <li>Audio-to-text transcription</li>
     * <li>Voice message understanding</li>
     * <li>Multimodal content analysis</li>
     * <li>Real-time WebSocket audio streaming</li>
     * </ul>
     * 
     * <p>Model: pixtral-12b-2409 (multimodal support)</p>
     * 
     * <p><b>Note:</b> Injects auto-configured MistralAiChatModel
     * from Spring Boot's MistralAiAutoConfiguration.</p>
     * 
     * @param mistralAiChatModel Auto-configured Mistral AI ChatModel
     * @return ChatClient for Mistral AI
     */
    @Bean
    @Qualifier("mistralChatClient")
    public ChatClient mistralChatClient(MistralAiChatModel mistralAiChatModel) {
        return ChatClient.builder(mistralAiChatModel)
                .build();
    }

    // ========== ChatClient.Builder Beans (for Workers) ==========

    /**
     * Primary ChatClient.Builder for Gemini (default for all workers).
     * 
     * <p>Workers inject this builder and customize it with:</p>
     * <ul>
     * <li>Worker-specific system prompts</li>
     * <li>Tool callbacks</li>
     * <li>Custom ChatOptions (temperature, maxTokens, etc.)</li>
     * </ul>
     * 
     * <p>Usage in Workers:</p>
     * <pre>{@code
     * public FlightSearchWorker(ChatClient.Builder builder, ...) {
     *     this.chatClient = builder
     *         .defaultSystem(SYSTEM_PROMPT)
     *         .defaultToolCallbacks(toolCallbackProvider)
     *         .defaultOptions(flightSearchOptions)
     *         .build();
     * }
     * }</pre>
     * 
     * <p><b>@Primary:</b> This is the default builder injected into all workers.
     * Spring auto-injects this when workers request ChatClient.Builder without @Qualifier.</p>
     * 
     * @param openAiChatModel Auto-configured OpenAiChatModel (Gemini 2.0 Flash)
     * @return Builder for Gemini-based workers
     */
    @Bean
    @Primary
    public ChatClient.Builder geminiChatClientBuilder(OpenAiChatModel openAiChatModel) {
        return ChatClient.builder(openAiChatModel);
    }

    /**
     * Secondary ChatClient.Builder for Mistral AI (for future audio/multimodal workers).
     * 
     * <p>Future workers can inject this for audio/multimodal tasks:</p>
     * <pre>{@code
     * public AudioTranscriptionWorker(
     *     @Qualifier("mistralChatClientBuilder") ChatClient.Builder builder) {
     *     this.chatClient = builder
     *         .defaultSystem(AUDIO_SYSTEM_PROMPT)
     *         .build();
     * }
     * }</pre>
     * 
     * <p><b>@Qualifier:</b> Workers must explicitly request this builder
     * using @Qualifier("mistralChatClientBuilder") to use Mistral instead of Gemini.</p>
     * 
     * @param mistralAiChatModel Auto-configured MistralAiChatModel (Pixtral 12B)
     * @return Builder for Mistral-based workers
     */
    @Bean
    @Qualifier("mistralChatClientBuilder")
    public ChatClient.Builder mistralChatClientBuilder(MistralAiChatModel mistralAiChatModel) {
        return ChatClient.builder(mistralAiChatModel);
    }
}
