package com.pdh.notification.repository;

import com.pdh.notification.model.NotificationOutboxEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for NotificationOutboxEvent
 * Provides basic CRUD operations for notification outbox events
 */
@Repository
public interface NotificationOutboxEventRepository extends JpaRepository<NotificationOutboxEvent, UUID> {

    /**
     * Find all events ordered by creation time
     */
    List<NotificationOutboxEvent> findAllByOrderByCreatedAtAsc();

    /**
     * Find events by aggregate type
     */
    List<NotificationOutboxEvent> findByAggregateTypeOrderByCreatedAtAsc(String aggregateType);

    /**
     * Find events by event type
     */
    List<NotificationOutboxEvent> findByEventTypeOrderByCreatedAtAsc(String eventType);

    /**
     * Find events created after a specific time
     */
    List<NotificationOutboxEvent> findByCreatedAtAfterOrderByCreatedAtAsc(LocalDateTime createdAt);

    /**
     * Delete events created before a specific time (for cleanup)
     */
    void deleteByCreatedAtBefore(LocalDateTime cutoffTime);

    /**
     * Count total events
     */
    long count();

    /**
     * Find event by event ID (for Listen to Yourself Pattern)
     */
    Optional<NotificationOutboxEvent> findByEventId(String eventId);
}
