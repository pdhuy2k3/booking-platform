package com.pdh.common.outbox.service;

import java.time.Duration;

/**
 * Interface for Event Deduplication Service
 * Allows for different implementations (Redis-based or In-Memory)
 */

public interface EventDeduplicationServiceInterface {
    
    /**
     * Check if event has been processed
     */
    boolean isEventProcessed(String eventId);
    
    /**
     * Mark event as processed
     */
    void markEventAsProcessed(String eventId);
    
    /**
     * Mark event as processed with custom TTL
     */
    void markEventAsProcessed(String eventId, Duration ttl);
    
    /**
     * Check if self-event has been processed (Listen to Yourself Pattern)
     */
    boolean isSelfEventProcessed(String serviceName, String eventId);
    
    /**
     * Mark self-event as processed (Listen to Yourself Pattern)
     */
    void markSelfEventAsProcessed(String serviceName, String eventId);
    
    /**
     * Mark self-event as processed with custom TTL (Listen to Yourself Pattern)
     */
    void markSelfEventAsProcessed(String serviceName, String eventId, Duration ttl);
    
    /**
     * Remove event from processed cache (for testing or manual reprocessing)
     */
    void removeEventFromCache(String eventId);
    
    /**
     * Remove self-event from processed cache (for testing or manual reprocessing)
     */
    void removeSelfEventFromCache(String serviceName, String eventId);
    
    /**
     * Get processing attempt count for an event
     */
    int getProcessingAttempts(String eventId);
    
    /**
     * Increment processing attempt count for an event
     */
    int incrementProcessingAttempts(String eventId);
    
    /**
     * Check if event processing should be attempted based on attempt count
     */
    boolean shouldAttemptProcessing(String eventId, int maxAttempts);
}
