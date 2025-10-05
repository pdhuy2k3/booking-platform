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

 */
@Configuration
public class MultiLlmChatClientConfig {

    @Bean
    @Primary
    @Qualifier("geminiChatClient")
    public ChatClient geminiChatClient(OpenAiChatModel openAiChatModel) {
        return ChatClient.builder(openAiChatModel)
                .build();
    }

    @Bean
    @Qualifier("mistralChatClient")
    public ChatClient mistralChatClient(MistralAiChatModel mistralAiChatModel) {
        return ChatClient.builder(mistralAiChatModel)
                .build();
    }


    @Bean
    @Primary
    public ChatClient.Builder geminiChatClientBuilder(OpenAiChatModel openAiChatModel) {
        return ChatClient.builder(openAiChatModel);
    }

    @Bean
    @Qualifier("mistralChatClientBuilder")
    public ChatClient.Builder mistralChatClientBuilder(MistralAiChatModel mistralAiChatModel) {
        return ChatClient.builder(mistralAiChatModel);
    }
}
