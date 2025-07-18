package com.pdh.flight.model;

import com.pdh.common.outbox.SimpleOutboxEvent;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.UUID;

/**
 * Flight Service Outbox Event Entity
 * Extends SimpleOutboxEvent from common-lib for consistent outbox pattern.
 * Uses simple structure suitable for Debezium CDC.
 */
@Entity
@Table(name = "flight_outbox_events", indexes = {
    @Index(name = "idx_flight_outbox_aggregate", columnList = "aggregate_type, aggregate_id"),
    @Index(name = "idx_flight_outbox_event_type", columnList = "event_type"),
    @Index(name = "idx_flight_outbox_created_at", columnList = "created_at")
})
@Data
@EqualsAndHashCode(callSuper = true)
public class FlightOutboxEvent extends SimpleOutboxEvent {

    // All fields inherited from SimpleOutboxEvent
    // Flight-specific fields can be added here if needed

    /**
     * Factory method to create a flight outbox event
     */
    public static FlightOutboxEvent createFlightEvent(
            String eventType,
            String aggregateType,
            String aggregateId,
            String payload) {

        FlightOutboxEvent event = new FlightOutboxEvent();
        event.setEventType(eventType);
        event.setAggregateType(aggregateType);
        event.setAggregateId(aggregateId);
        event.setPayload(payload);
        
        return event;
    }
    
    /**
     * Factory method to create a flight-specific event
     */
    public static FlightOutboxEvent createFlightEvent(
            String eventType,
            UUID flightId,
            String payload) {
        
        return createFlightEvent(eventType, "Flight", flightId.toString(), payload);
    }
}
