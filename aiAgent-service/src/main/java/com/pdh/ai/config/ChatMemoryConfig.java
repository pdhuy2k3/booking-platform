package com.pdh.ai.config;

import org.springframework.context.annotation.Configuration;

/**
 * Chat memory configuration. The {@link com.pdh.ai.service.JpaChatMemory} bean is
 * marked as {@code @Primary}, so it transparently replaces the default JDBC
 * implementation provided by Spring AI.
 */
@Configuration
public class ChatMemoryConfig {
}
