package com.pdh.common.outbox.repository;

import com.pdh.common.outbox.ExtendedOutboxEvent;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Repository interface for extended outbox events with additional query methods
 * for saga, priority, and expiration handling
 */
@Repository
public interface ExtendedOutboxEventRepository extends BaseOutboxEventRepository<ExtendedOutboxEvent> {
    
    /**
     * Find events by saga ID
     */
    List<ExtendedOutboxEvent> findBySagaIdOrderByCreatedAtAsc(String sagaId);
    
    /**
     * Find events by booking ID
     */
    List<ExtendedOutboxEvent> findByBookingIdOrderByCreatedAtAsc(UUID bookingId);
    
    /**
     * Find events by user ID
     */
    List<ExtendedOutboxEvent> findByUserIdOrderByCreatedAtAsc(UUID userId);
    
    /**
     * Find unprocessed events by priority (highest priority first)
     */
    @Query("SELECT o FROM ExtendedOutboxEvent o WHERE o.processed = false " +
           "ORDER BY o.priority ASC, o.createdAt ASC")
    List<ExtendedOutboxEvent> findUnprocessedEventsByPriority();
    
    /**
     * Find high priority unprocessed events (priority <= 2)
     */
    @Query("SELECT o FROM ExtendedOutboxEvent o WHERE o.processed = false " +
           "AND o.priority <= 2 ORDER BY o.priority ASC, o.createdAt ASC")
    List<ExtendedOutboxEvent> findHighPriorityUnprocessedEvents();
    
    /**
     * Find expired events that haven't been processed
     */
    @Query("SELECT o FROM ExtendedOutboxEvent o WHERE o.processed = false " +
           "AND o.expiresAt IS NOT NULL AND o.expiresAt < :now")
    List<ExtendedOutboxEvent> findExpiredEvents(@Param("now") ZonedDateTime now);
    
    /**
     * Find events by topic
     */
    List<ExtendedOutboxEvent> findByTopicOrderByCreatedAtAsc(String topic);
    
    /**
     * Find saga events for a specific booking
     */
    @Query("SELECT o FROM ExtendedOutboxEvent o WHERE o.bookingId = :bookingId " +
           "AND o.sagaId IS NOT NULL ORDER BY o.createdAt ASC")
    List<ExtendedOutboxEvent> findSagaEventsByBookingId(@Param("bookingId") UUID bookingId);
    
    /**
     * Find payment events for a specific booking
     */
    @Query("SELECT o FROM ExtendedOutboxEvent o WHERE o.bookingId = :bookingId " +
           "AND o.aggregateType = 'Payment' ORDER BY o.createdAt ASC")
    List<ExtendedOutboxEvent> findPaymentEventsByBookingId(@Param("bookingId") UUID bookingId);
    
    /**
     * Count events by priority
     */
    @Query("SELECT COUNT(o) FROM ExtendedOutboxEvent o WHERE o.processed = false " +
           "AND o.priority = :priority")
    long countUnprocessedEventsByPriority(@Param("priority") Integer priority);
    
    /**
     * Count saga events
     */
    @Query("SELECT COUNT(o) FROM ExtendedOutboxEvent o WHERE o.sagaId IS NOT NULL")
    long countSagaEvents();
    
    /**
     * Count expired events
     */
    @Query("SELECT COUNT(o) FROM ExtendedOutboxEvent o WHERE o.processed = false " +
           "AND o.expiresAt IS NOT NULL AND o.expiresAt < :now")
    long countExpiredEvents(@Param("now") ZonedDateTime now);
    
    /**
     * Delete expired events
     */
    @Query("DELETE FROM ExtendedOutboxEvent o WHERE o.processed = false " +
           "AND o.expiresAt IS NOT NULL AND o.expiresAt < :before")
    void deleteExpiredEventsBefore(@Param("before") ZonedDateTime before);
    
    /**
     * Find events ready for retry with priority ordering
     */
    @Query("SELECT o FROM ExtendedOutboxEvent o WHERE o.processed = false " +
           "AND o.retryCount < o.maxRetries " +
           "AND (o.nextRetryAt IS NULL OR o.nextRetryAt <= :now) " +
           "ORDER BY o.priority ASC, o.createdAt ASC")
    List<ExtendedOutboxEvent> findEventsReadyForRetryByPriority(@Param("now") java.time.LocalDateTime now);
}
