package com.pdh.common.outbox.service;

import lombok.extern.slf4j.Slf4j;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-Memory Event Deduplication Service
 * Fallback implementation when Redis is not available
 * WARNING: This is not suitable for production use in distributed environments
 */
@Slf4j
public class InMemoryEventDeduplicationService implements EventDeduplicationServiceInterface {
    
    private final Map<String, LocalDateTime> processedEvents = new ConcurrentHashMap<>();
    private final Map<String, LocalDateTime> selfProcessedEvents = new ConcurrentHashMap<>();
    private final Map<String, Integer> processingAttempts = new ConcurrentHashMap<>();
    
    private static final Duration DEFAULT_TTL = Duration.ofHours(24);
    
    public InMemoryEventDeduplicationService() {
        log.warn("Using In-Memory Event Deduplication Service. This is not suitable for production use!");
        
        // Start cleanup task
        startCleanupTask();
    }
    
    /**
     * Check if event has been processed
     */
    public boolean isEventProcessed(String eventId) {
        String key = "event:processed:" + eventId;
        LocalDateTime processedAt = processedEvents.get(key);
        
        if (processedAt != null && processedAt.plus(DEFAULT_TTL).isAfter(LocalDateTime.now())) {
            return true;
        } else if (processedAt != null) {
            // Expired, remove it
            processedEvents.remove(key);
        }
        
        return false;
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
        String key = "event:processed:" + eventId;
        processedEvents.put(key, LocalDateTime.now());
        log.debug("Marked event {} as processed with TTL {}", eventId, ttl);
    }
    
    /**
     * Check if self-event has been processed (Listen to Yourself Pattern)
     */
    public boolean isSelfEventProcessed(String serviceName, String eventId) {
        String key = "self-event:processed:" + serviceName + ":" + eventId;
        LocalDateTime processedAt = selfProcessedEvents.get(key);
        
        if (processedAt != null && processedAt.plus(DEFAULT_TTL).isAfter(LocalDateTime.now())) {
            return true;
        } else if (processedAt != null) {
            // Expired, remove it
            selfProcessedEvents.remove(key);
        }
        
        return false;
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
        String key = "self-event:processed:" + serviceName + ":" + eventId;
        selfProcessedEvents.put(key, LocalDateTime.now());
        log.debug("Marked self-event {} for service {} as processed with TTL {}", eventId, serviceName, ttl);
    }
    
    /**
     * Remove event from processed cache (for testing or manual reprocessing)
     */
    public void removeEventFromCache(String eventId) {
        String key = "event:processed:" + eventId;
        processedEvents.remove(key);
        log.debug("Removed event {} from processed cache", eventId);
    }
    
    /**
     * Remove self-event from processed cache (for testing or manual reprocessing)
     */
    public void removeSelfEventFromCache(String serviceName, String eventId) {
        String key = "self-event:processed:" + serviceName + ":" + eventId;
        selfProcessedEvents.remove(key);
        log.debug("Removed self-event {} for service {} from processed cache", eventId, serviceName);
    }
    
    /**
     * Get processing attempt count for an event
     */
    public int getProcessingAttempts(String eventId) {
        String key = "event:attempts:" + eventId;
        return processingAttempts.getOrDefault(key, 0);
    }
    
    /**
     * Increment processing attempt count for an event
     */
    public int incrementProcessingAttempts(String eventId) {
        String key = "event:attempts:" + eventId;
        int attempts = processingAttempts.getOrDefault(key, 0) + 1;
        processingAttempts.put(key, attempts);
        return attempts;
    }
    
    /**
     * Check if event processing should be attempted based on attempt count
     */
    public boolean shouldAttemptProcessing(String eventId, int maxAttempts) {
        int attempts = getProcessingAttempts(eventId);
        return attempts < maxAttempts;
    }
    
    /**
     * Start cleanup task to remove expired entries
     */
    private void startCleanupTask() {
        Thread cleanupThread = new Thread(() -> {
            while (!Thread.currentThread().isInterrupted()) {
                try {
                    Thread.sleep(Duration.ofHours(1).toMillis()); // Cleanup every hour
                    cleanupExpiredEntries();
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        });
        cleanupThread.setDaemon(true);
        cleanupThread.setName("EventDeduplication-Cleanup");
        cleanupThread.start();
    }
    
    /**
     * Remove expired entries from memory
     */
    private void cleanupExpiredEntries() {
        LocalDateTime now = LocalDateTime.now();
        
        processedEvents.entrySet().removeIf(entry -> 
            entry.getValue().plus(DEFAULT_TTL).isBefore(now));
        
        selfProcessedEvents.entrySet().removeIf(entry -> 
            entry.getValue().plus(DEFAULT_TTL).isBefore(now));
        
        log.debug("Cleaned up expired event deduplication entries");
    }
}
