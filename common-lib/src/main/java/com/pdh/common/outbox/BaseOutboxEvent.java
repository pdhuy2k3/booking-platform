package com.pdh.common.outbox;

import com.pdh.common.model.AbstractAuditEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Base Outbox Event Base Class for implementing the Outbox Pattern
 * This provides the standard structure for reliable event publishing
 * across all microservices using Debezium CDC.
 *
 * Use this as a @MappedSuperclass for services that need:
 * - Standard outbox pattern with retry logic
 * - Processing status tracking
 * - Audit trail capabilities
 * - Error handling and recovery
 *
 * Each service should create its own entity extending this class.
 */
@MappedSuperclass
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
public class BaseOutboxEvent extends AbstractAuditEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "event_id", nullable = false, unique = true, length = 36)
    private String eventId = UUID.randomUUID().toString();
    
    @Column(name = "event_type", nullable = false, length = 100)
    private String eventType;
    
    @Column(name = "aggregate_id", nullable = false, length = 100)
    private String aggregateId;
    
    @Column(name = "aggregate_type", nullable = false, length = 50)
    private String aggregateType;
    
    @Column(name = "payload", columnDefinition = "JSONB", nullable = false)
    private String payload;
    
    @Column(name = "processed", nullable = false)
    private Boolean processed = false;
    
    @Column(name = "processed_at")
    private LocalDateTime processedAt;
    
    @Column(name = "retry_count", nullable = false)
    private Integer retryCount = 0;
    
    @Column(name = "max_retries", nullable = false)
    private Integer maxRetries = 3;
    
    @Column(name = "next_retry_at")
    private LocalDateTime nextRetryAt;
    
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
    
    /**
     * Mark the event as processed
     */
    public void markAsProcessed() {
        this.processed = true;
        this.processedAt = LocalDateTime.now();
        this.errorMessage = null;
    }
    
    /**
     * Mark the event as failed and increment retry count
     */
    public void markAsFailed(String errorMessage) {
        this.processed = false;
        this.retryCount++;
        this.errorMessage = errorMessage;
        
        // Calculate next retry time with exponential backoff
        if (this.retryCount < this.maxRetries) {
            long delayMinutes = (long) Math.pow(2, this.retryCount); // 2, 4, 8 minutes
            this.nextRetryAt = LocalDateTime.now().plusMinutes(delayMinutes);
        }
    }
    
    /**
     * Check if the event can be retried
     */
    public boolean canRetry() {
        return !processed && retryCount < maxRetries && 
               (nextRetryAt == null || nextRetryAt.isBefore(LocalDateTime.now()));
    }
    
    /**
     * Check if the event has reached maximum retries
     */
    public boolean hasReachedMaxRetries() {
        return retryCount >= maxRetries;
    }
    
    /**
     * Reset retry information for manual reprocessing
     */
    public void resetRetry() {
        this.retryCount = 0;
        this.nextRetryAt = null;
        this.errorMessage = null;
        this.processed = false;
        this.processedAt = null;
    }
}
