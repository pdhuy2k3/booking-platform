package com.pdh.hotel.model;

import com.pdh.common.outbox.SimpleOutboxEvent;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.UUID;

/**
 * Hotel Service Outbox Event Entity
 * Extends SimpleOutboxEvent from common-lib for consistent outbox pattern.
 * Uses simple structure suitable for Debezium CDC.
 */
@Entity
@Table(name = "hotel_outbox_events", indexes = {
    @Index(name = "idx_hotel_outbox_aggregate", columnList = "aggregate_type, aggregate_id"),
    @Index(name = "idx_hotel_outbox_event_type", columnList = "event_type"),
    @Index(name = "idx_hotel_outbox_created_at", columnList = "created_at")
})
@Data
@EqualsAndHashCode(callSuper = true)
public class HotelOutboxEvent extends SimpleOutboxEvent {

    // All fields inherited from SimpleOutboxEvent
    // Hotel-specific fields can be added here if needed

    /**
     * Factory method to create a hotel outbox event
     */
    public static HotelOutboxEvent createHotelEvent(
            String eventType,
            String aggregateType,
            String aggregateId,
            String payload) {
        
        HotelOutboxEvent event = new HotelOutboxEvent();
        event.setEventType(eventType);
        event.setAggregateType(aggregateType);
        event.setAggregateId(aggregateId);
        event.setPayload(payload);
        
        return event;
    }
    
    /**
     * Factory method to create a hotel-specific event
     */
    public static HotelOutboxEvent createHotelEvent(
            String eventType,
            UUID hotelId,
            String payload) {
        
        return createHotelEvent(eventType, "Hotel", hotelId.toString(), payload);
    }
}
