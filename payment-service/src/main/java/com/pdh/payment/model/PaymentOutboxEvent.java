package com.pdh.payment.model;

import com.pdh.common.model.AbstractAuditEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

/**
 * Payment Outbox Event Entity
 * Implements Outbox Pattern for reliable event publishing
 */
@Entity
@Table(name = "payment_outbox_events")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
public class PaymentOutboxEvent extends AbstractAuditEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "event_id", nullable = false, unique = true)
    private String eventId = UUID.randomUUID().toString();
    
    @Column(name = "event_type", nullable = false, length = 100)
    private String eventType;
    
    @Column(name = "aggregate_id", nullable = false)
    private String aggregateId; // Payment ID
    
    @Column(name = "aggregate_type", nullable = false, length = 50)
    private String aggregateType = "Payment";
    
    @Column(name = "saga_id")
    private String sagaId;
    
    @Column(name = "booking_id")
    private UUID bookingId;
    
    @Column(name = "user_id")
    private UUID userId;
    
    @Column(name = "payload", columnDefinition = "TEXT", nullable = false)
    private String payload; // JSON format
    
    @Column(name = "headers", columnDefinition = "TEXT")
    private String headers; // JSON format for additional headers
    
    @Column(name = "processed", nullable = false)
    private Boolean processed = false;
    
    @Column(name = "processed_at")
    private ZonedDateTime processedAt;
    
    @Column(name = "retry_count", nullable = false)
    private Integer retryCount = 0;
    
    @Column(name = "max_retries", nullable = false)
    private Integer maxRetries = 3;
    
    @Column(name = "next_retry_at")
    private ZonedDateTime nextRetryAt;
    
    @Column(name = "last_error", columnDefinition = "TEXT")
    private String lastError;
    
    @Column(name = "topic", length = 100)
    private String topic; // Kafka topic
    
    @Column(name = "partition_key", length = 100)
    private String partitionKey;
    
    @Column(name = "priority", nullable = false)
    private Integer priority = 5; // 1-10, 1 is highest priority
    
    @Column(name = "expires_at")
    private ZonedDateTime expiresAt;
    
    /**
     * Common payment event types
     */
    public static class EventTypes {
        public static final String PAYMENT_INITIATED = "payment.initiated";
        public static final String PAYMENT_PROCESSING = "payment.processing";
        public static final String PAYMENT_COMPLETED = "payment.completed";
        public static final String PAYMENT_FAILED = "payment.failed";
        public static final String PAYMENT_CANCELLED = "payment.cancelled";
        public static final String PAYMENT_REFUNDED = "payment.refunded";
        public static final String PAYMENT_PARTIALLY_REFUNDED = "payment.partially_refunded";
        
        // Saga events
        public static final String PAYMENT_SAGA_STARTED = "payment.saga.started";
        public static final String PAYMENT_SAGA_COMPLETED = "payment.saga.completed";
        public static final String PAYMENT_SAGA_FAILED = "payment.saga.failed";
        public static final String PAYMENT_SAGA_COMPENSATED = "payment.saga.compensated";
        
        // Transaction events
        public static final String TRANSACTION_CREATED = "transaction.created";
        public static final String TRANSACTION_COMPLETED = "transaction.completed";
        public static final String TRANSACTION_FAILED = "transaction.failed";
    }
    
    /**
     * Create payment event
     */
    public static PaymentOutboxEvent createPaymentEvent(
            String eventType,
            UUID paymentId,
            String sagaId,
            UUID bookingId,
            UUID userId,
            String payload) {
        
        PaymentOutboxEvent event = new PaymentOutboxEvent();
        event.setEventType(eventType);
        event.setAggregateId(paymentId.toString());
        event.setSagaId(sagaId);
        event.setBookingId(bookingId);
        event.setUserId(userId);
        event.setPayload(payload);
        event.setTopic("payment-events");
        event.setPartitionKey(paymentId.toString());
        
        // Set priority based on event type
        if (eventType.contains("failed") || eventType.contains("cancelled")) {
            event.setPriority(1); // High priority for failures
        } else if (eventType.contains("completed")) {
            event.setPriority(2); // High priority for completions
        } else {
            event.setPriority(5); // Normal priority
        }
        
        // Set expiration (events expire after 24 hours)
        event.setExpiresAt(ZonedDateTime.now().plusHours(24));
        
        return event;
    }
    
    /**
     * Create saga event
     */
    public static PaymentOutboxEvent createSagaEvent(
            String eventType,
            String sagaId,
            UUID bookingId,
            UUID userId,
            String payload) {
        
        PaymentOutboxEvent event = new PaymentOutboxEvent();
        event.setEventType(eventType);
        event.setAggregateId(sagaId);
        event.setAggregateType("Saga");
        event.setSagaId(sagaId);
        event.setBookingId(bookingId);
        event.setUserId(userId);
        event.setPayload(payload);
        event.setTopic("saga-events");
        event.setPartitionKey(sagaId);
        event.setPriority(1); // Saga events are high priority
        event.setExpiresAt(ZonedDateTime.now().plusHours(24));
        
        return event;
    }
    
    /**
     * Mark as processed
     */
    public void markAsProcessed() {
        this.processed = true;
        this.processedAt = ZonedDateTime.now();
    }
    
    /**
     * Mark as failed and schedule retry
     */
    public void markAsFailedAndScheduleRetry(String error) {
        this.lastError = error;
        this.retryCount++;
        
        if (this.retryCount <= this.maxRetries) {
            // Exponential backoff: 1, 2, 4, 8 minutes
            long delayMinutes = (long) Math.pow(2, this.retryCount - 1);
            this.nextRetryAt = ZonedDateTime.now().plusMinutes(delayMinutes);
        }
    }
    
    /**
     * Check if event can be retried
     */
    public boolean canBeRetried() {
        return !processed && 
               retryCount < maxRetries && 
               (nextRetryAt == null || ZonedDateTime.now().isAfter(nextRetryAt)) &&
               (expiresAt == null || ZonedDateTime.now().isBefore(expiresAt));
    }
    
    /**
     * Check if event has expired
     */
    public boolean hasExpired() {
        return expiresAt != null && ZonedDateTime.now().isAfter(expiresAt);
    }
    
    /**
     * Check if event has exceeded max retries
     */
    public boolean hasExceededMaxRetries() {
        return retryCount >= maxRetries;
    }
    
    /**
     * Get retry delay in minutes
     */
    public long getRetryDelayMinutes() {
        if (nextRetryAt == null) return 0;
        return java.time.Duration.between(ZonedDateTime.now(), nextRetryAt).toMinutes();
    }
}
