package com.pdh.common.outbox.repository;

import com.pdh.common.outbox.BaseOutboxEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Base repository interface for outbox events
 * Services can extend this interface for their specific outbox event repositories
 */
@Repository
public interface BaseOutboxEventRepository<T extends BaseOutboxEvent> extends JpaRepository<T, Long> {
    
    /**
     * Find all unprocessed events
     */
    @Query("SELECT o FROM #{#entityName} o WHERE o.processed = false")
    List<T> findUnprocessedEvents();
    
    /**
     * Find unprocessed events ordered by creation time
     */
    @Query("SELECT o FROM #{#entityName} o WHERE o.processed = false ORDER BY o.createdAt ASC")
    List<T> findUnprocessedEventsOrderByCreatedAt();
    
    /**
     * Find failed events that are ready for retry
     */
    @Query("SELECT o FROM #{#entityName} o WHERE o.processed = false " +
           "AND o.retryCount < o.maxRetries " +
           "AND (o.nextRetryAt IS NULL OR o.nextRetryAt <= :now)")
    List<T> findEventsReadyForRetry(@Param("now") LocalDateTime now);
    
    /**
     * Find events by aggregate type and aggregate id
     */
    List<T> findByAggregateTypeAndAggregateIdOrderByCreatedAtAsc(String aggregateType, String aggregateId);
    
    /**
     * Find events by event type
     */
    List<T> findByEventTypeOrderByCreatedAtAsc(String eventType);
    
    /**
     * Find event by event ID
     */
    Optional<T> findByEventId(String eventId);
    
    /**
     * Count unprocessed events
     */
    @Query("SELECT COUNT(o) FROM #{#entityName} o WHERE o.processed = false")
    long countUnprocessedEvents();
    
    /**
     * Count failed events (reached max retries)
     */
    @Query("SELECT COUNT(o) FROM #{#entityName} o WHERE o.processed = false AND o.retryCount >= o.maxRetries")
    long countFailedEvents();
    
    /**
     * Count processed events
     */
    @Query("SELECT COUNT(o) FROM #{#entityName} o WHERE o.processed = true")
    long countProcessedEvents();
    
    /**
     * Find events by aggregate type
     */
    List<T> findByAggregateTypeOrderByCreatedAtAsc(String aggregateType);
    
    /**
     * Find events created after a specific time
     */
    List<T> findByCreatedAtAfterOrderByCreatedAtAsc(LocalDateTime after);
    
    /**
     * Find events created between two times
     */
    List<T> findByCreatedAtBetweenOrderByCreatedAtAsc(LocalDateTime start, LocalDateTime end);
    
    /**
     * Delete processed events older than specified time
     * Use this for cleanup of old processed events
     */
    @Query("DELETE FROM #{#entityName} o WHERE o.processed = true AND o.processedAt < :before")
    void deleteProcessedEventsBefore(@Param("before") LocalDateTime before);
    
    /**
     * Find events that have reached maximum retries
     */
    @Query("SELECT o FROM #{#entityName} o WHERE o.processed = false AND o.retryCount >= o.maxRetries")
    List<T> findFailedEvents();
}
