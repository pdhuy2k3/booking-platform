package com.pdh.booking.repository;

import com.pdh.booking.model.BookingOutboxEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for BookingOutboxEvent
 * Provides CRUD operations and queries for booking outbox events
 */
@Repository
public interface BookingOutboxEventRepository extends JpaRepository<BookingOutboxEvent, Long> {

    /**
     * Find all unprocessed events ordered by creation time
     */
    List<BookingOutboxEvent> findByProcessedFalseOrderByCreatedAtAsc();

    /**
     * Find events ready for retry
     */
    @Query("SELECT e FROM BookingOutboxEvent e WHERE e.processed = false " +
           "AND e.retryCount < e.maxRetries " +
           "AND (e.nextRetryAt IS NULL OR e.nextRetryAt <= :now) " +
           "ORDER BY e.createdAt ASC")
    List<BookingOutboxEvent> findEventsReadyForRetry(@Param("now") LocalDateTime now);

    /**
     * Find events by aggregate type
     */
    List<BookingOutboxEvent> findByAggregateTypeOrderByCreatedAtAsc(String aggregateType);

    /**
     * Find events by event type
     */
    List<BookingOutboxEvent> findByEventTypeOrderByCreatedAtAsc(String eventType);

    /**
     * Count unprocessed events
     */
    long countByProcessedFalse();

    /**
     * Count failed events (reached max retries)
     */
    @Query("SELECT COUNT(e) FROM BookingOutboxEvent e WHERE e.processed = false AND e.retryCount >= e.maxRetries")
    long countFailedEvents();

    /**
     * Delete processed events older than cutoff time
     */
    void deleteByProcessedTrueAndCreatedAtBefore(LocalDateTime cutoffTime);
}
