package com.pdh.booking.model;

import com.pdh.common.outbox.ExtendedOutboxEvent;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * Booking Service Outbox Event Entity
 * Extends ExtendedOutboxEvent from common-lib for advanced outbox pattern with retry mechanisms,
 * saga support, and priority handling for booking-related events.
 */
@Entity
@Table(name = "booking_outbox_events", indexes = {
    @Index(name = "idx_booking_outbox_processed", columnList = "processed"),
    @Index(name = "idx_booking_outbox_aggregate", columnList = "aggregate_type, aggregate_id"),
    @Index(name = "idx_booking_outbox_event_type", columnList = "event_type"),
    @Index(name = "idx_booking_outbox_retry", columnList = "processed, retry_count, next_retry_at"),
    @Index(name = "idx_booking_outbox_created_at", columnList = "created_at")
})
@Data
@EqualsAndHashCode(callSuper = true)
public class BookingOutboxEvent extends ExtendedOutboxEvent {

    // All fields inherited from ExtendedOutboxEvent and BaseOutboxEvent
    // Booking-specific fields can be added here if needed

    /**
     * Factory method to create a booking outbox event
     */
    public static BookingOutboxEvent createBookingEvent(
            String eventType,
            String aggregateType,
            String aggregateId,
            String payload) {

        BookingOutboxEvent event = new BookingOutboxEvent();
        event.setEventType(eventType);
        event.setAggregateType(aggregateType);
        event.setAggregateId(aggregateId);
        event.setPayload(payload);
        event.setPriority(5); // Set default priority
        event.setTopic("booking-events"); // Set default topic
        event.setPartitionKey(aggregateId); // Use aggregateId as partition key

        return event;
    }
}
