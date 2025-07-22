package com.pdh.common.kafka.consumer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.common.outbox.service.EventDeduplicationServiceInterface;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;

/**
 * Base Self-Event Consumer for Listen to Yourself Pattern
 * Provides common functionality for services to process their own events
 * 
 * @param <T> The event message type
 */
@RequiredArgsConstructor
@Slf4j
public abstract class BaseSelfEventConsumer<T> {
    
    protected final EventDeduplicationServiceInterface deduplicationService;
    protected final ObjectMapper objectMapper;
    
    /**
     * Process self-event with deduplication
     */
    @Transactional
    public void processSelfEvent(T message, String serviceName) {
        try {
            // Extract event information
            String eventId = extractEventId(message);
            String eventType = extractEventType(message);
            String aggregateId = extractAggregateId(message);
            
            log.info("Processing self-event: eventId={}, eventType={}, aggregateId={}, service={}", 
                    eventId, eventType, aggregateId, serviceName);
            
            // Check for deduplication
            if (deduplicationService.isSelfEventProcessed(serviceName, eventId)) {
                log.debug("Self-event {} already processed for service {}, skipping", eventId, serviceName);
                return;
            }
            
            // Check processing attempts
            if (!deduplicationService.shouldAttemptProcessing(eventId, getMaxProcessingAttempts())) {
                log.warn("Self-event {} has exceeded max processing attempts for service {}", eventId, serviceName);
                handleMaxAttemptsExceeded(eventId, eventType, aggregateId, message);
                return;
            }
            
            // Increment processing attempts
            int attempts = deduplicationService.incrementProcessingAttempts(eventId);
            log.debug("Processing self-event {} (attempt {}) for service {}", eventId, attempts, serviceName);
            
            // Process the event
            boolean processed = handleSelfEvent(eventId, eventType, aggregateId, message);
            
            if (processed) {
                // Mark as processed to prevent reprocessing
                deduplicationService.markSelfEventAsProcessed(serviceName, eventId);
                log.info("Successfully processed self-event {} for service {}", eventId, serviceName);
                
                // Update database record if needed
                updateSelfProcessedStatus(eventId, true);
                
            } else {
                log.warn("Failed to process self-event {} for service {}", eventId, serviceName);
                handleProcessingFailure(eventId, eventType, aggregateId, message);
            }
            
        } catch (Exception e) {
            log.error("Error processing self-event for service {}: {}", serviceName, message, e);
            handleProcessingError(message, e);
        }
    }
    
    /**
     * Extract event ID from message - must be implemented by subclasses
     */
    protected abstract String extractEventId(T message);
    
    /**
     * Extract event type from message - must be implemented by subclasses
     */
    protected abstract String extractEventType(T message);
    
    /**
     * Extract aggregate ID from message - must be implemented by subclasses
     */
    protected abstract String extractAggregateId(T message);
    
    /**
     * Handle the self-event - must be implemented by subclasses
     * @return true if processed successfully, false otherwise
     */
    protected abstract boolean handleSelfEvent(String eventId, String eventType, String aggregateId, T message);
    
    /**
     * Update self-processed status in database - can be overridden by subclasses
     */
    protected void updateSelfProcessedStatus(String eventId, boolean processed) {
        // Default implementation - subclasses can override
        log.debug("Updating self-processed status for event {} to {}", eventId, processed);
    }
    
    /**
     * Handle processing failure - can be overridden by subclasses
     */
    protected void handleProcessingFailure(String eventId, String eventType, String aggregateId, T message) {
        log.warn("Processing failed for self-event: eventId={}, eventType={}, aggregateId={}", 
                eventId, eventType, aggregateId);
    }
    
    /**
     * Handle max attempts exceeded - can be overridden by subclasses
     */
    protected void handleMaxAttemptsExceeded(String eventId, String eventType, String aggregateId, T message) {
        log.error("Max processing attempts exceeded for self-event: eventId={}, eventType={}, aggregateId={}", 
                eventId, eventType, aggregateId);
        // Could send to dead letter queue or alert monitoring system
    }
    
    /**
     * Handle processing error - can be overridden by subclasses
     */
    protected void handleProcessingError(T message, Exception error) {
        log.error("Processing error for self-event: {}", message, error);
    }
    
    /**
     * Get maximum processing attempts - can be overridden by subclasses
     */
    protected int getMaxProcessingAttempts() {
        return 3;
    }
    
    /**
     * Parse JSON payload from message
     */
    protected JsonNode parsePayload(String payload) {
        try {
            return objectMapper.readTree(payload);
        } catch (Exception e) {
            log.error("Failed to parse payload: {}", payload, e);
            return null;
        }
    }
}
