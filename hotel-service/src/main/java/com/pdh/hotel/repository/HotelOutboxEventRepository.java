package com.pdh.hotel.repository;

import com.pdh.hotel.model.HotelOutboxEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for HotelOutboxEvent
 * Provides basic CRUD operations for hotel outbox events
 */
@Repository
public interface HotelOutboxEventRepository extends JpaRepository<HotelOutboxEvent, UUID> {

    /**
     * Find all events ordered by creation time
     */
    List<HotelOutboxEvent> findAllByOrderByCreatedAtAsc();

    /**
     * Find events by aggregate type
     */
    List<HotelOutboxEvent> findByAggregateTypeOrderByCreatedAtAsc(String aggregateType);

    /**
     * Find events by event type
     */
    List<HotelOutboxEvent> findByEventTypeOrderByCreatedAtAsc(String eventType);

    /**
     * Find events created after a specific time
     */
    List<HotelOutboxEvent> findByCreatedAtAfterOrderByCreatedAtAsc(LocalDateTime createdAt);

    /**
     * Find event by event ID (for Listen to Yourself Pattern)
     */
    Optional<HotelOutboxEvent> findByEventId(String eventId);

    /**
     * Delete events created before a specific time (for cleanup)
     */
    void deleteByCreatedAtBefore(LocalDateTime cutoffTime);

    /**
     * Count total events
     */
    long count();
}
