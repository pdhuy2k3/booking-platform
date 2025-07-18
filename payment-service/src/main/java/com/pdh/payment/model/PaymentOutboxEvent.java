package com.pdh.payment.model;

import com.pdh.common.outbox.ExtendedOutboxEvent;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.ZonedDateTime;
import java.util.UUID;

/**
 * Payment Outbox Event Entity
 * Extends the shared ExtendedOutboxEvent with payment-specific functionality
 * Implements Outbox Pattern for reliable event publishing
 */
@Entity
@Table(name = "payment_outbox_events")
@Data
@EqualsAndHashCode(callSuper = true)
public class PaymentOutboxEvent extends ExtendedOutboxEvent {
    // All basic fields are inherited from ExtendedOutboxEvent
    // Only payment-specific additional fields are defined here

    @Column(name = "last_error", columnDefinition = "TEXT")
    private String lastError;
    
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
     * Mark as processed (delegates to parent class)
     */
    @Override
    public void markAsProcessed() {
        super.markAsProcessed();
    }

    /**
     * Mark as failed and schedule retry (uses parent class method and adds lastError)
     */
    public void markAsFailedAndScheduleRetry(String error) {
        this.lastError = error;
        super.markAsFailed(error);
    }

    /**
     * Check if event can be retried (delegates to parent class)
     */
    public boolean canBeRetried() {
        return super.canRetry() && !hasExpired();
    }

    /**
     * Check if event has expired (delegates to parent class)
     */
    public boolean hasExpired() {
        return super.isExpired();
    }
    
    /**
     * Check if event has exceeded max retries (delegates to parent class)
     */
    public boolean hasExceededMaxRetries() {
        return super.hasReachedMaxRetries();
    }

    /**
     * Get retry delay in minutes
     */
    public long getRetryDelayMinutes() {
        if (getNextRetryAt() == null) return 0;
        return java.time.Duration.between(
            java.time.LocalDateTime.now(),
            getNextRetryAt()
        ).toMinutes();
    }

    /**
     * Create simple payment event for generic outbox service
     */
    public static PaymentOutboxEvent createPaymentEvent(String eventType, String aggregateType, String aggregateId, String payload) {
        PaymentOutboxEvent event = new PaymentOutboxEvent();
        event.setEventType(eventType);
        event.setAggregateType(aggregateType);
        event.setAggregateId(aggregateId);
        event.setPayload(payload);
        return event;
    }
}
