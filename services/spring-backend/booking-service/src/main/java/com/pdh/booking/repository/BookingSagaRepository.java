package com.pdh.booking.repository;

import com.pdh.booking.model.BookingSagaInstance;
import com.pdh.common.saga.SagaState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for Booking Saga Instances
 */
@Repository
public interface BookingSagaRepository extends JpaRepository<BookingSagaInstance, String> {
    
    /**
     * Find saga by booking ID
     */
    Optional<BookingSagaInstance> findByBookingId(UUID bookingId);
    
    /**
     * Find sagas that are compensating
     */
    List<BookingSagaInstance> findByIsCompensatingTrue();
    
    /**
     * Find stale incomplete sagas for cleanup
     */
    @Query("SELECT b FROM BookingSagaInstance b WHERE b.completedAt IS NULL AND b.startedAt < :cutoffTime")
    List<BookingSagaInstance> findStaleIncompleteInstances(@Param("cutoffTime") ZonedDateTime cutoffTime);
    
    /**
     * Find sagas by current state
     */
    @Query("SELECT b FROM BookingSagaInstance b WHERE b.currentState = :state")
    List<BookingSagaInstance> findByCurrentState(@Param("state") SagaState state);
    
    /**
     * Find active (incomplete) sagas
     */
    @Query("SELECT s FROM BookingSagaInstance s WHERE s.completedAt IS NULL")
    List<BookingSagaInstance> findActiveSagas();
    
    /**
     * Find sagas that need timeout handling
     */
    @Query("SELECT s FROM BookingSagaInstance s WHERE s.completedAt IS NULL AND s.lastUpdatedAt < :timeoutThreshold")
    List<BookingSagaInstance> findTimedOutSagas(@Param("timeoutThreshold") ZonedDateTime timeoutThreshold);
}
