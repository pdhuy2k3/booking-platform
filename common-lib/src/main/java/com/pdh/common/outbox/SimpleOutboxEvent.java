package com.pdh.common.outbox;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Simple Outbox Event Base Class for basic outbox pattern implementation
 * This is a lightweight version without audit fields, suitable for services
 * that need simple event publishing without complex retry mechanisms.
 *
 * Use this as a @MappedSuperclass for services that:
 * - Need basic outbox pattern
 * - Don't require audit trails
 * - Use external retry mechanisms (like Debezium)
 * - Want minimal database footprint
 *
 * Each service should create its own entity extending this class.
 */
@MappedSuperclass
@Data

public class SimpleOutboxEvent {
    
    @Id
    private UUID id = UUID.randomUUID();
    
    @Column(name = "aggregate_type", nullable = false, length = 50)
    private String aggregateType;
    
    @Column(name = "aggregate_id", nullable = false, length = 100)
    private String aggregateId;
    
    @Column(name = "event_type", nullable = false, length = 100)
    private String eventType;
    
    @Column(name = "payload", columnDefinition = "TEXT")
    private String payload;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    /**
     * Factory method to create a simple outbox event
     */
    public static SimpleOutboxEvent create(
            String eventType,
            String aggregateType,
            String aggregateId,
            String payload) {
        
        SimpleOutboxEvent event = new SimpleOutboxEvent();
        event.setEventType(eventType);
        event.setAggregateType(aggregateType);
        event.setAggregateId(aggregateId);
        event.setPayload(payload);
        
        return event;
    }
    
    /**
     * Factory method to create a flight event
     */
    public static SimpleOutboxEvent createFlightEvent(
            String eventType,
            UUID flightId,
            String payload) {
        
        return create(eventType, "Flight", flightId.toString(), payload);
    }
    
    /**
     * Factory method to create a hotel event
     */
    public static SimpleOutboxEvent createHotelEvent(
            String eventType,
            UUID hotelId,
            String payload) {
        
        return create(eventType, "Hotel", hotelId.toString(), payload);
    }
    
    /**
     * Factory method to create a notification event
     */
    public static SimpleOutboxEvent createNotificationEvent(
            String eventType,
            UUID notificationId,
            String payload) {
        
        return create(eventType, "Notification", notificationId.toString(), payload);
    }
}
