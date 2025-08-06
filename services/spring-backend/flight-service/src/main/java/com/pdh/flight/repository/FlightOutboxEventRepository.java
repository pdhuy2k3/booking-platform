package com.pdh.flight.repository;

import com.pdh.flight.model.FlightOutboxEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Repository for FlightOutboxEvent
 * Provides basic CRUD operations for flight outbox events
 */
@Repository
public interface FlightOutboxEventRepository extends JpaRepository<FlightOutboxEvent, UUID> {

    /**
     * Find all events ordered by creation time
     */
    List<FlightOutboxEvent> findAllByOrderByCreatedAtAsc();

    /**
     * Find events by aggregate type
     */
    List<FlightOutboxEvent> findByAggregateTypeOrderByCreatedAtAsc(String aggregateType);

    /**
     * Find events by event type
     */
    List<FlightOutboxEvent> findByEventTypeOrderByCreatedAtAsc(String eventType);

    /**
     * Find events created after a specific time
     */
    List<FlightOutboxEvent> findByCreatedAtAfterOrderByCreatedAtAsc(LocalDateTime createdAt);

    /**
     * Delete events created before a specific time (for cleanup)
     */
    void deleteByCreatedAtBefore(LocalDateTime cutoffTime);

    /**
     * Count total events
     */
    long count();
}
