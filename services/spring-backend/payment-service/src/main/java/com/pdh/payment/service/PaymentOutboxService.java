package com.pdh.payment.service;

import com.pdh.payment.model.PaymentOutboxEvent;
import com.pdh.payment.repository.PaymentOutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;

/**
 * Payment Outbox Service
 * Handles outbox events for reliable message delivery
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentOutboxService {
    
    private final PaymentOutboxEventRepository outboxEventRepository;
    
    /**
     * Process single outbox event
     */
    @Transactional
    public void processEvent(PaymentOutboxEvent event) {
        try {
            log.debug("Processing outbox event: {} of type: {}", event.getEventId(), event.getEventType());
            
            // In real implementation, this would:
            // 1. Publish to Kafka
            // 2. Send to message queue
            // 3. Call webhook
            // 4. Trigger other services
            
            // For now, just mock the processing
            mockEventProcessing(event);
            
            // Mark as processed
            event.markAsProcessed();
            outboxEventRepository.save(event);
            
            log.info("Successfully processed outbox event: {}", event.getEventId());
            
        } catch (Exception e) {
            log.error("Failed to process outbox event: {}", event.getEventId(), e);
            
            // Mark as failed and schedule retry
            event.markAsFailedAndScheduleRetry(e.getMessage());
            outboxEventRepository.save(event);
            
            throw new OutboxProcessingException("Failed to process outbox event: " + event.getEventId(), e);
        }
    }
    
    /**
     * Process all unprocessed events
     */
    @Transactional
    public void processUnprocessedEvents() {
        List<PaymentOutboxEvent> unprocessedEvents = outboxEventRepository.findByProcessedFalseOrderByPriorityAscCreatedAtAsc();
        
        log.info("Found {} unprocessed outbox events", unprocessedEvents.size());
        
        for (PaymentOutboxEvent event : unprocessedEvents) {
            try {
                processEvent(event);
            } catch (Exception e) {
                log.error("Failed to process event during batch processing: {}", event.getEventId(), e);
                // Continue with next event
            }
        }
    }
    
    /**
     * Process events ready for retry
     */
    @Transactional
    public void processRetryableEvents() {
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        List<PaymentOutboxEvent> retryableEvents = outboxEventRepository.findEventsReadyForRetry(now);

        log.info("Found {} events ready for retry", retryableEvents.size());

        for (PaymentOutboxEvent event : retryableEvents) {
            try {
                processEvent(event);
            } catch (Exception e) {
                log.error("Failed to retry event: {}", event.getEventId(), e);
                // Continue with next event
            }
        }
    }
    
    /**
     * Clean up old processed events (delegates to shared cleanup service)
     */
    @Transactional
    public void cleanupOldEvents() {
        java.time.LocalDateTime cutoffDate = java.time.LocalDateTime.now().minusDays(7);

        try {
            outboxEventRepository.deleteByProcessedTrueAndCreatedAtBefore(cutoffDate);
            log.info("Cleaned up processed events older than {}", cutoffDate);
        } catch (Exception e) {
            log.error("Failed to cleanup old events", e);
        }
    }

    /**
     * Clean up expired events (delegates to shared cleanup service)
     */
    @Transactional
    public void cleanupExpiredEvents() {
        ZonedDateTime now = ZonedDateTime.now();

        try {
            outboxEventRepository.deleteExpiredEventsBefore(now);
            log.info("Cleaned up expired events");
        } catch (Exception e) {
            log.error("Failed to cleanup expired events", e);
        }
    }
    
    /**
     * Get processing statistics (delegates to shared methods)
     */
    @Transactional(readOnly = true)
    public OutboxStatistics getStatistics() {
        long unprocessedCount = outboxEventRepository.countUnprocessedEvents();
        long failedCount = outboxEventRepository.countFailedEvents();

        return new OutboxStatistics(unprocessedCount, failedCount);
    }
    
    /**
     * Mock event processing (replace with real implementation)
     */
    private void mockEventProcessing(PaymentOutboxEvent event) throws InterruptedException {
        log.debug("Mock processing event: {} with payload: {}", event.getEventType(), event.getPayload());
        
        // Simulate processing time
        Thread.sleep(10);
        
        // Simulate occasional failures for testing
        if (event.getEventType().contains("test_failure")) {
            throw new RuntimeException("Mock processing failure for testing");
        }
        
        log.debug("Mock processing completed for event: {}", event.getEventId());
    }
    
    /**
     * Outbox processing statistics
     */
    public static class OutboxStatistics {
        private final long unprocessedCount;
        private final long failedCount;
        
        public OutboxStatistics(long unprocessedCount, long failedCount) {
            this.unprocessedCount = unprocessedCount;
            this.failedCount = failedCount;
        }
        
        public long getUnprocessedCount() {
            return unprocessedCount;
        }
        
        public long getFailedCount() {
            return failedCount;
        }
        
        @Override
        public String toString() {
            return String.format("OutboxStatistics{unprocessed=%d, failed=%d}", unprocessedCount, failedCount);
        }
    }
    
    /**
     * Custom exception for outbox processing failures
     */
    public static class OutboxProcessingException extends RuntimeException {
        public OutboxProcessingException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
