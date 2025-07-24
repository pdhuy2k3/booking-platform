package com.pdh.payment.repository;

import com.pdh.payment.model.PaymentOutboxEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.List;

/**
 * Payment Outbox Event Repository
 * Standalone repository for payment outbox events with advanced features
 */
@Repository
public interface PaymentOutboxEventRepository extends JpaRepository<PaymentOutboxEvent, Long> {

    /**
     * Find all unprocessed events ordered by priority and creation time
     */
    List<PaymentOutboxEvent> findByProcessedFalseOrderByPriorityAscCreatedAtAsc();

    /**
     * Find events ready for retry with priority ordering
     */
    @Query("SELECT e FROM PaymentOutboxEvent e WHERE e.processed = false " +
           "AND e.retryCount < e.maxRetries " +
           "AND (e.nextRetryAt IS NULL OR e.nextRetryAt <= :now) " +
           "ORDER BY e.priority ASC, e.createdAt ASC")
    List<PaymentOutboxEvent> findEventsReadyForRetry(@Param("now") LocalDateTime now);

    /**
     * Find events with lastError field (payment-specific)
     */
    @Query("SELECT e FROM PaymentOutboxEvent e WHERE e.lastError IS NOT NULL ORDER BY e.createdAt DESC")
    List<PaymentOutboxEvent> findEventsWithLastError();

    /**
     * Find events by saga ID
     */
    List<PaymentOutboxEvent> findBySagaIdOrderByCreatedAtAsc(String sagaId);

    /**
     * Find events by booking ID
     */
    List<PaymentOutboxEvent> findByBookingIdOrderByCreatedAtAsc(java.util.UUID bookingId);

    /**
     * Find events by user ID
     */
    List<PaymentOutboxEvent> findByUserIdOrderByCreatedAtAsc(java.util.UUID userId);

    /**
     * Find events by priority
     */
    List<PaymentOutboxEvent> findByPriorityOrderByCreatedAtAsc(Integer priority);

    /**
     * Find expired events
     */
    @Query("SELECT e FROM PaymentOutboxEvent e WHERE e.expiresAt IS NOT NULL AND e.expiresAt <= :now")
    List<PaymentOutboxEvent> findExpiredEvents(@Param("now") ZonedDateTime now);

    /**
     * Count unprocessed events
     */
    long countByProcessedFalse();

    /**
     * Count failed events (reached max retries)
     */
    @Query("SELECT COUNT(e) FROM PaymentOutboxEvent e WHERE e.processed = false AND e.retryCount >= e.maxRetries")
    long countFailedEvents();

    /**
     * Delete processed events older than cutoff time
     */
    @Modifying
    void deleteByProcessedTrueAndCreatedAtBefore(LocalDateTime cutoffTime);

    @Query("SELECT COUNT(e) FROM PaymentOutboxEvent e WHERE e.processed = false")
    Long countUnprocessedEvents();

    /**
     * Delete expired events
     */
    @Query("DELETE FROM PaymentOutboxEvent e WHERE e.expiresAt IS NOT NULL AND e.expiresAt <= :now")
    @Modifying
    void deleteExpiredEventsBefore(@Param("now") ZonedDateTime now);
}
