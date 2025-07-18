package com.pdh.common.outbox.repository;

import com.pdh.common.outbox.SimpleOutboxEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Repository interface for simple outbox events
 * Provides basic CRUD operations and simple queries for lightweight outbox pattern
 * Generic interface to work with service-specific SimpleOutboxEvent implementations
 */
@Repository
public interface SimpleOutboxEventRepository<T extends SimpleOutboxEvent> extends JpaRepository<T, UUID> {
    
    /**
     * Find events by aggregate type and aggregate id
     */
    List<SimpleOutboxEvent> findByAggregateTypeAndAggregateIdOrderByCreatedAtAsc(String aggregateType, String aggregateId);
    
    /**
     * Find events by event type
     */
    List<SimpleOutboxEvent> findByEventTypeOrderByCreatedAtAsc(String eventType);
    
    /**
     * Find events by aggregate type
     */
    List<SimpleOutboxEvent> findByAggregateTypeOrderByCreatedAtAsc(String aggregateType);
    
    /**
     * Find events created after a specific time
     */
    List<SimpleOutboxEvent> findByCreatedAtAfterOrderByCreatedAtAsc(LocalDateTime after);
    
    /**
     * Find events created between two times
     */
    List<SimpleOutboxEvent> findByCreatedAtBetweenOrderByCreatedAtAsc(LocalDateTime start, LocalDateTime end);
    
    /**
     * Find all events ordered by creation time
     */
    List<SimpleOutboxEvent> findAllByOrderByCreatedAtAsc();
    
    /**
     * Count events by aggregate type
     */
    @Query("SELECT COUNT(o) FROM SimpleOutboxEvent o WHERE o.aggregateType = :aggregateType")
    long countByAggregateType(@Param("aggregateType") String aggregateType);
    
    /**
     * Count events by event type
     */
    @Query("SELECT COUNT(o) FROM SimpleOutboxEvent o WHERE o.eventType = :eventType")
    long countByEventType(@Param("eventType") String eventType);
    
    /**
     * Delete events older than specified time
     * Use this for cleanup of old events
     */
    @Query("DELETE FROM SimpleOutboxEvent o WHERE o.createdAt < :before")
    void deleteEventsBefore(@Param("before") LocalDateTime before);
    
    /**
     * Find recent events (created within last N hours)
     */
    @Query("SELECT o FROM SimpleOutboxEvent o WHERE o.createdAt >= :since ORDER BY o.createdAt ASC")
    List<SimpleOutboxEvent> findRecentEvents(@Param("since") LocalDateTime since);
    
    /**
     * Find flight events
     */
    @Query("SELECT o FROM SimpleOutboxEvent o WHERE o.aggregateType = 'Flight' ORDER BY o.createdAt ASC")
    List<SimpleOutboxEvent> findFlightEvents();
    
    /**
     * Find hotel events
     */
    @Query("SELECT o FROM SimpleOutboxEvent o WHERE o.aggregateType = 'Hotel' ORDER BY o.createdAt ASC")
    List<SimpleOutboxEvent> findHotelEvents();
    
    /**
     * Find notification events
     */
    @Query("SELECT o FROM SimpleOutboxEvent o WHERE o.aggregateType = 'Notification' ORDER BY o.createdAt ASC")
    List<SimpleOutboxEvent> findNotificationEvents();
}
