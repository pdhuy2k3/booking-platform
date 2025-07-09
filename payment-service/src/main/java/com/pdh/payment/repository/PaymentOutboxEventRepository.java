package com.pdh.payment.repository;

import com.pdh.payment.model.PaymentOutboxEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Payment Outbox Event Repository
 */
@Repository
public interface PaymentOutboxEventRepository extends JpaRepository<PaymentOutboxEvent, Long> {
    
    /**
     * Find unprocessed events
     */
    List<PaymentOutboxEvent> findByProcessedFalseOrderByPriorityAscCreatedAtAsc();
    
    /**
     * Find events ready for retry
     */
    @Query("SELECT e FROM PaymentOutboxEvent e WHERE e.processed = false " +
           "AND e.retryCount < e.maxRetries " +
           "AND (e.nextRetryAt IS NULL OR e.nextRetryAt <= :now) " +
           "AND (e.expiresAt IS NULL OR e.expiresAt > :now) " +
           "ORDER BY e.priority ASC, e.createdAt ASC")
    List<PaymentOutboxEvent> findEventsReadyForRetry(@Param("now") ZonedDateTime now);
    
    /**
     * Find event by event ID
     */
    Optional<PaymentOutboxEvent> findByEventId(String eventId);
    
    /**
     * Find events by aggregate ID
     */
    List<PaymentOutboxEvent> findByAggregateIdOrderByCreatedAtDesc(String aggregateId);
    
    /**
     * Find events by saga ID
     */
    List<PaymentOutboxEvent> findBySagaIdOrderByCreatedAtDesc(String sagaId);
    
    /**
     * Find events by booking ID
     */
    List<PaymentOutboxEvent> findByBookingIdOrderByCreatedAtDesc(UUID bookingId);
    
    /**
     * Find events by user ID
     */
    List<PaymentOutboxEvent> findByUserIdOrderByCreatedAtDesc(UUID userId);
    
    /**
     * Find events by event type
     */
    List<PaymentOutboxEvent> findByEventTypeOrderByCreatedAtDesc(String eventType);
    
    /**
     * Find events by topic
     */
    List<PaymentOutboxEvent> findByTopicOrderByCreatedAtDesc(String topic);
    
    /**
     * Find expired events
     */
    @Query("SELECT e FROM PaymentOutboxEvent e WHERE e.expiresAt < :now")
    List<PaymentOutboxEvent> findExpiredEvents(@Param("now") ZonedDateTime now);
    
    /**
     * Find events that exceeded max retries
     */
    @Query("SELECT e FROM PaymentOutboxEvent e WHERE e.processed = false AND e.retryCount >= e.maxRetries")
    List<PaymentOutboxEvent> findEventsExceededMaxRetries();
    
    /**
     * Find processed events
     */
    List<PaymentOutboxEvent> findByProcessedTrueOrderByProcessedAtDesc();
    
    /**
     * Find events by priority
     */
    List<PaymentOutboxEvent> findByPriorityOrderByCreatedAtAsc(Integer priority);
    
    /**
     * Find high priority unprocessed events
     */
    @Query("SELECT e FROM PaymentOutboxEvent e WHERE e.processed = false AND e.priority <= :maxPriority " +
           "ORDER BY e.priority ASC, e.createdAt ASC")
    List<PaymentOutboxEvent> findHighPriorityUnprocessedEvents(@Param("maxPriority") Integer maxPriority);
    
    /**
     * Find events by date range
     */
    @Query("SELECT e FROM PaymentOutboxEvent e WHERE e.createdAt BETWEEN :startDate AND :endDate ORDER BY e.createdAt DESC")
    List<PaymentOutboxEvent> findByDateRange(@Param("startDate") ZonedDateTime startDate, @Param("endDate") ZonedDateTime endDate);
    
    /**
     * Find recent unprocessed events (last hour)
     */
    @Query("SELECT e FROM PaymentOutboxEvent e WHERE e.processed = false AND e.createdAt >= :oneHourAgo ORDER BY e.priority ASC, e.createdAt ASC")
    List<PaymentOutboxEvent> findRecentUnprocessedEvents(@Param("oneHourAgo") ZonedDateTime oneHourAgo);
    
    /**
     * Count unprocessed events
     */
    long countByProcessedFalse();
    
    /**
     * Count events by event type
     */
    long countByEventType(String eventType);
    
    /**
     * Count failed events (exceeded max retries)
     */
    @Query("SELECT COUNT(e) FROM PaymentOutboxEvent e WHERE e.processed = false AND e.retryCount >= e.maxRetries")
    long countFailedEvents();
    
    /**
     * Find events with errors
     */
    @Query("SELECT e FROM PaymentOutboxEvent e WHERE e.lastError IS NOT NULL ORDER BY e.createdAt DESC")
    List<PaymentOutboxEvent> findEventsWithErrors();
    
    /**
     * Find events by partition key
     */
    List<PaymentOutboxEvent> findByPartitionKeyOrderByCreatedAtDesc(String partitionKey);
    
    /**
     * Find oldest unprocessed event
     */
    @Query("SELECT e FROM PaymentOutboxEvent e WHERE e.processed = false ORDER BY e.createdAt ASC LIMIT 1")
    Optional<PaymentOutboxEvent> findOldestUnprocessedEvent();
    
    /**
     * Check if event ID exists
     */
    boolean existsByEventId(String eventId);
    
    /**
     * Delete processed events older than specified date
     */
    @Query("DELETE FROM PaymentOutboxEvent e WHERE e.processed = true AND e.processedAt < :cutoffDate")
    void deleteProcessedEventsOlderThan(@Param("cutoffDate") ZonedDateTime cutoffDate);
    
    /**
     * Delete expired events
     */
    @Query("DELETE FROM PaymentOutboxEvent e WHERE e.expiresAt < :now")
    void deleteExpiredEvents(@Param("now") ZonedDateTime now);
    
    /**
     * Find events by aggregate type
     */
    List<PaymentOutboxEvent> findByAggregateTypeOrderByCreatedAtDesc(String aggregateType);
    
    /**
     * Find events requiring immediate processing (high priority and recent)
     */
    @Query("SELECT e FROM PaymentOutboxEvent e WHERE e.processed = false " +
           "AND e.priority <= 2 " +
           "AND e.createdAt >= :thirtyMinutesAgo " +
           "AND (e.expiresAt IS NULL OR e.expiresAt > :now) " +
           "ORDER BY e.priority ASC, e.createdAt ASC")
    List<PaymentOutboxEvent> findEventsRequiringImmediateProcessing(@Param("thirtyMinutesAgo") ZonedDateTime thirtyMinutesAgo, 
                                                                    @Param("now") ZonedDateTime now);
}
