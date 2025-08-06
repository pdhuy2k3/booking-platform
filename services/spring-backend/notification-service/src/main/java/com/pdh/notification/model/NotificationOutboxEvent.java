package com.pdh.notification.model;

import com.pdh.common.outbox.SimpleOutboxEvent;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.UUID;

/**
 * Notification Service Outbox Event Entity
 * Extends SimpleOutboxEvent from common-lib for consistent outbox pattern.
 * Uses simple structure suitable for Debezium CDC.
 */
@Entity
@Table(name = "notification_outbox_events", indexes = {
    @Index(name = "idx_notification_outbox_aggregate", columnList = "aggregate_type, aggregate_id"),
    @Index(name = "idx_notification_outbox_event_type", columnList = "event_type"),
    @Index(name = "idx_notification_outbox_created_at", columnList = "created_at")
})
@Data
@EqualsAndHashCode(callSuper = true)
public class NotificationOutboxEvent extends SimpleOutboxEvent {

    // All fields inherited from SimpleOutboxEvent
    // Notification-specific fields can be added here if needed

    /**
     * Factory method to create a notification outbox event
     */
    public static NotificationOutboxEvent createNotificationEvent(
            String eventType,
            String aggregateType,
            String aggregateId,
            String payload) {
        
        NotificationOutboxEvent event = new NotificationOutboxEvent();
        event.setEventType(eventType);
        event.setAggregateType(aggregateType);
        event.setAggregateId(aggregateId);
        event.setPayload(payload);
        
        return event;
    }
    
    /**
     * Factory method to create a notification-specific event
     */
    public static NotificationOutboxEvent createNotificationEvent(
            String eventType,
            UUID notificationId,
            String payload) {
        
        return createNotificationEvent(eventType, "Notification", notificationId.toString(), payload);
    }
}
