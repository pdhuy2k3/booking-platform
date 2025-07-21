package com.pdh.common.outbox;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

/**
 * Extended Outbox Event Base Class with additional features for complex scenarios
 * This includes saga support, Kafka routing, priority handling, and expiration.
 *
 * Use this as a @MappedSuperclass for services that need advanced outbox features like:
 * - Saga orchestration
 * - Message routing and partitioning
 * - Priority-based processing
 * - Message expiration
 *
 * Each service should create its own entity extending this class.
 */
@MappedSuperclass
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor

public class ExtendedOutboxEvent extends BaseOutboxEvent {
    
    @Column(name = "saga_id", length = 36)
    private String sagaId;
    
    @Column(name = "booking_id")
    private UUID bookingId;
    
    @Column(name = "user_id")
    private UUID userId;
    
    @Column(name = "headers", columnDefinition = "TEXT")
    private String headers; // JSON format for additional headers
    
    @Column(name = "topic", length = 100)
    private String topic; // Kafka topic for routing
    
    @Column(name = "partition_key", length = 100)
    private String partitionKey; // Kafka partition key
    
    @Column(name = "priority", nullable = false)
    private Integer priority = 5; // 1 = highest, 10 = lowest
    
    @Column(name = "expires_at")
    private ZonedDateTime expiresAt;
    
    /**
     * Check if the event has expired
     */
    public boolean isExpired() {
        return expiresAt != null && ZonedDateTime.now().isAfter(expiresAt);
    }
    
    /**
     * Set expiration time from now
     */
    public void setExpirationFromNow(long hours) {
        this.expiresAt = ZonedDateTime.now().plusHours(hours);
    }
    
    /**
     * Check if this is a high priority event
     */
    public boolean isHighPriority() {
        return priority != null && priority <= 2;
    }
    
    /**
     * Check if this is a saga event
     */
    public boolean isSagaEvent() {
        return sagaId != null && !sagaId.trim().isEmpty();
    }
    
    /**
     * Factory method to create a payment event
     */
    public static ExtendedOutboxEvent createPaymentEvent(
            String eventType,
            UUID paymentId,
            String sagaId,
            UUID bookingId,
            UUID userId,
            String payload) {
        
        ExtendedOutboxEvent event = new ExtendedOutboxEvent();
        event.setEventType(eventType);
        event.setAggregateId(paymentId.toString());
        event.setAggregateType("Payment");
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
        event.setExpirationFromNow(24);
        
        return event;
    }
    
    /**
     * Factory method to create a saga event
     */
    public static ExtendedOutboxEvent createSagaEvent(
            String eventType,
            String sagaId,
            UUID bookingId,
            UUID userId,
            String payload) {
        
        ExtendedOutboxEvent event = new ExtendedOutboxEvent();
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
        event.setExpirationFromNow(24);
        
        return event;
    }
    
    /**
     * Factory method to create a booking event
     */
    public static ExtendedOutboxEvent createBookingEvent(
            String eventType,
            UUID bookingId,
            UUID userId,
            String payload) {
        
        ExtendedOutboxEvent event = new ExtendedOutboxEvent();
        event.setEventType(eventType);
        event.setAggregateId(bookingId.toString());
        event.setAggregateType("Booking");
        event.setBookingId(bookingId);
        event.setUserId(userId);
        event.setPayload(payload);
        event.setTopic("booking-events");
        event.setPartitionKey(bookingId.toString());
        event.setPriority(3); // Normal priority for booking events
        event.setExpirationFromNow(24);
        
        return event;
    }
}
