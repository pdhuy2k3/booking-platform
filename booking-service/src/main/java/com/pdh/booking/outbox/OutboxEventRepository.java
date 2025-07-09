package com.pdh.booking.outbox;

import com.pdh.booking.model.OutboxEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for OutboxEvent entity
 */

public interface OutboxEventRepository extends JpaRepository<OutboxEvent, Long> {
    
    /**
     * Find all unprocessed events
     */
    @Query("SELECT o FROM OutboxEvent o WHERE o.processed = false")
    List<OutboxEvent> findUnprocessedEvents();
    
    /**
     * Find unprocessed events ordered by creation time
     */
    @Query("SELECT o FROM OutboxEvent o WHERE o.processed = false ORDER BY o.createdAt ASC")
    List<OutboxEvent> findUnprocessedEventsOrderByCreatedAt();
    
    /**
     * Find failed events that are ready for retry
     */
    @Query("SELECT o FROM OutboxEvent o WHERE o.processed = false " +
           "AND o.retryCount < o.maxRetries " +
           "AND (o.nextRetryAt IS NULL OR o.nextRetryAt <= :now)")
    List<OutboxEvent> findEventsReadyForRetry(@Param("now") LocalDateTime now);
    
    /**
     * Find events by aggregate type and aggregate id
     */
    List<OutboxEvent> findByAggregateTypeAndAggregateIdOrderByCreatedAtAsc(String aggregateType, String aggregateId);
    
    /**
     * Find events by event type
     */
    List<OutboxEvent> findByEventTypeOrderByCreatedAtAsc(String eventType);
    
    /**
     * Count unprocessed events
     */
    @Query("SELECT COUNT(o) FROM OutboxEvent o WHERE o.processed = false")
    long countUnprocessedEvents();
    
    /**
     * Count failed events (reached max retries)
     */
    @Query("SELECT COUNT(o) FROM OutboxEvent o WHERE o.processed = false AND o.retryCount >= o.maxRetries")
    long countFailedEvents();
}
