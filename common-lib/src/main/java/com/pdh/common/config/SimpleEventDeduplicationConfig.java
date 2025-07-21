package com.pdh.common.config;

import com.pdh.common.outbox.service.EventDeduplicationService;
import com.pdh.common.outbox.service.EventDeduplicationServiceInterface;
import com.pdh.common.outbox.service.InMemoryEventDeduplicationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.RedisTemplate;

/**
 * Simple Event Deduplication Configuration
 * Always provides a bean, fallback to in-memory if Redis not available
 */
@Configuration
@Slf4j
public class SimpleEventDeduplicationConfig {

    /**
     * Event Deduplication Service
     * Uses Redis if available, otherwise in-memory
     */
    @Bean
    @ConditionalOnMissingBean(EventDeduplicationServiceInterface.class)
    public EventDeduplicationServiceInterface eventDeduplicationService(
            RedisTemplate<String, String> redisTemplate) {
        
        if (redisTemplate != null) {
            log.info("Creating Redis-based Event Deduplication Service");
            return new EventDeduplicationService(redisTemplate);
        } else {
            log.warn("Redis not available, creating In-Memory Event Deduplication Service");
            return new InMemoryEventDeduplicationService();
        }
    }
    
    /**
     * Fallback bean when RedisTemplate is not available
     */
    @Bean
    @ConditionalOnMissingBean({RedisTemplate.class, EventDeduplicationServiceInterface.class})
    public EventDeduplicationServiceInterface fallbackEventDeduplicationService() {
        log.warn("Creating fallback In-Memory Event Deduplication Service - Not suitable for production!");
        return new InMemoryEventDeduplicationService();
    }
}
