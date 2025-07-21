package com.pdh.common.outbox.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

/**
 * Event Deduplication Service for Listen to Yourself Pattern
 * Uses Redis to track processed events and prevent duplicate processing
 */
@RequiredArgsConstructor
@Slf4j
@Service
public class EventDeduplicationService implements EventDeduplicationServiceInterface {
    
    private final RedisTemplate<String, String> redisTemplate;
    
    private static final String EVENT_PROCESSED_PREFIX = "event:processed:";
    private static final String SELF_EVENT_PROCESSED_PREFIX = "self-event:processed:";
    private static final Duration DEFAULT_TTL = Duration.ofHours(24);
    
    /**
     * Check if event has been processed
     */
    public boolean isEventProcessed(String eventId) {
        String key = EVENT_PROCESSED_PREFIX + eventId;
        Boolean exists = redisTemplate.hasKey(key);
        return Boolean.TRUE.equals(exists);
    }
    
    /**
     * Mark event as processed
     */
    public void markEventAsProcessed(String eventId) {
        markEventAsProcessed(eventId, DEFAULT_TTL);
    }
    
    /**
     * Mark event as processed with custom TTL
     */
    public void markEventAsProcessed(String eventId, Duration ttl) {
        String key = EVENT_PROCESSED_PREFIX + eventId;
        redisTemplate.opsForValue().set(key, "processed", ttl);
        log.debug("Marked event {} as processed with TTL {}", eventId, ttl);
    }
    
    /**
     * Check if self-event has been processed (Listen to Yourself Pattern)
     */
    public boolean isSelfEventProcessed(String serviceName, String eventId) {
        String key = SELF_EVENT_PROCESSED_PREFIX + serviceName + ":" + eventId;
        Boolean exists = redisTemplate.hasKey(key);
        return Boolean.TRUE.equals(exists);
    }
    
    /**
     * Mark self-event as processed (Listen to Yourself Pattern)
     */
    public void markSelfEventAsProcessed(String serviceName, String eventId) {
        markSelfEventAsProcessed(serviceName, eventId, DEFAULT_TTL);
    }
    
    /**
     * Mark self-event as processed with custom TTL (Listen to Yourself Pattern)
     */
    public void markSelfEventAsProcessed(String serviceName, String eventId, Duration ttl) {
        String key = SELF_EVENT_PROCESSED_PREFIX + serviceName + ":" + eventId;
        redisTemplate.opsForValue().set(key, "processed", ttl);
        log.debug("Marked self-event {} for service {} as processed with TTL {}", eventId, serviceName, ttl);
    }
    
    /**
     * Remove event from processed cache (for testing or manual reprocessing)
     */
    public void removeEventFromCache(String eventId) {
        String key = EVENT_PROCESSED_PREFIX + eventId;
        redisTemplate.delete(key);
        log.debug("Removed event {} from processed cache", eventId);
    }
    
    /**
     * Remove self-event from processed cache (for testing or manual reprocessing)
     */
    public void removeSelfEventFromCache(String serviceName, String eventId) {
        String key = SELF_EVENT_PROCESSED_PREFIX + serviceName + ":" + eventId;
        redisTemplate.delete(key);
        log.debug("Removed self-event {} for service {} from processed cache", eventId, serviceName);
    }
    
    /**
     * Get processing attempt count for an event
     */
    public int getProcessingAttempts(String eventId) {
        String key = "event:attempts:" + eventId;
        String attempts = redisTemplate.opsForValue().get(key);
        return attempts != null ? Integer.parseInt(attempts) : 0;
    }
    
    /**
     * Increment processing attempt count for an event
     */
    public int incrementProcessingAttempts(String eventId) {
        String key = "event:attempts:" + eventId;
        Long attempts = redisTemplate.opsForValue().increment(key);
        redisTemplate.expire(key, DEFAULT_TTL);
        return attempts != null ? attempts.intValue() : 1;
    }
    
    /**
     * Check if event processing should be attempted based on attempt count
     */
    public boolean shouldAttemptProcessing(String eventId, int maxAttempts) {
        int attempts = getProcessingAttempts(eventId);
        return attempts < maxAttempts;
    }
}
