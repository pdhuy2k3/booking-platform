package com.pdh.ai.config;

import org.springframework.context.annotation.Configuration;

/**
 * Configuration for chat memory - using default Spring AI auto-configuration
 * User segregation is handled through composite conversation IDs (userId:conversationId)
 */
@Configuration
public class ChatMemoryConfig {
    
    // Spring AI will auto-configure JdbcChatMemoryRepository and ChatMemory beans
    // We use the standard implementation with composite conversation IDs
}