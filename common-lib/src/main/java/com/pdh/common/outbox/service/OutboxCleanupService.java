package com.pdh.common.outbox.service;

import com.pdh.common.outbox.config.OutboxConfiguration;
import com.pdh.common.outbox.repository.BaseOutboxEventRepository;
import com.pdh.common.outbox.repository.ExtendedOutboxEventRepository;
import com.pdh.common.outbox.repository.SimpleOutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;

/**
 * Outbox Cleanup Service
 * Handles cleanup of old processed events and expired events
 * This service runs periodically to maintain database performance
 */
@Service
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(prefix = "outbox.cleanup", name = "enabled", havingValue = "true", matchIfMissing = true)
public class OutboxCleanupService {
    
    private final OutboxConfiguration.OutboxProperties outboxProperties;
    private final BaseOutboxEventRepository baseOutboxEventRepository;
    private final ExtendedOutboxEventRepository extendedOutboxEventRepository;
    private final SimpleOutboxEventRepository simpleOutboxEventRepository;
    
    /**
     * Cleanup old processed events and expired events
     * Runs based on the configured cron expression (default: daily at 2 AM)
     */
    @Scheduled(cron = "${outbox.cleanup.cron-expression:0 0 2 * * ?}")
    @Transactional
    public void cleanupOutboxEvents() {
        log.info("Starting outbox events cleanup...");
        
        try {
            cleanupProcessedEvents();
            cleanupExpiredEvents();
            cleanupSimpleEvents();
            
            log.info("Outbox events cleanup completed successfully");
            
        } catch (Exception e) {
            log.error("Error during outbox events cleanup", e);
        }
    }
    
    /**
     * Cleanup old processed events from base and extended outbox tables
     */
    private void cleanupProcessedEvents() {
        long retentionHours = outboxProperties.getCleanup().getProcessedEventsRetentionHours();
        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(retentionHours);
        
        try {
            // Cleanup base outbox events
            long baseDeletedCount = cleanupBaseProcessedEvents(cutoffTime);
            log.info("Cleaned up {} processed base outbox events older than {} hours", 
                    baseDeletedCount, retentionHours);
            
            // Cleanup extended outbox events
            long extendedDeletedCount = cleanupExtendedProcessedEvents(cutoffTime);
            log.info("Cleaned up {} processed extended outbox events older than {} hours", 
                    extendedDeletedCount, retentionHours);
            
        } catch (Exception e) {
            log.error("Error cleaning up processed events", e);
        }
    }
    
    /**
     * Cleanup expired events from extended outbox table
     */
    private void cleanupExpiredEvents() {
        long retentionHours = outboxProperties.getCleanup().getExpiredEventsRetentionHours();
        ZonedDateTime cutoffTime = ZonedDateTime.now().minusHours(retentionHours);
        
        try {
            extendedOutboxEventRepository.deleteExpiredEventsBefore(cutoffTime);
            log.info("Cleaned up expired extended outbox events older than {} hours", retentionHours);
            
        } catch (Exception e) {
            log.error("Error cleaning up expired events", e);
        }
    }
    
    /**
     * Cleanup old simple outbox events
     */
    private void cleanupSimpleEvents() {
        long retentionHours = outboxProperties.getCleanup().getProcessedEventsRetentionHours();
        LocalDateTime cutoffTime = LocalDateTime.now().minusHours(retentionHours);
        
        try {
            simpleOutboxEventRepository.deleteEventsBefore(cutoffTime);
            log.info("Cleaned up simple outbox events older than {} hours", retentionHours);
            
        } catch (Exception e) {
            log.error("Error cleaning up simple events", e);
        }
    }
    
    /**
     * Cleanup processed base outbox events
     */
    private long cleanupBaseProcessedEvents(LocalDateTime cutoffTime) {
        try {
            long countBefore = baseOutboxEventRepository.countProcessedEvents();
            baseOutboxEventRepository.deleteProcessedEventsBefore(cutoffTime);
            long countAfter = baseOutboxEventRepository.countProcessedEvents();
            
            return countBefore - countAfter;
            
        } catch (Exception e) {
            log.error("Error cleaning up base processed events", e);
            return 0;
        }
    }
    
    /**
     * Cleanup processed extended outbox events
     */
    private long cleanupExtendedProcessedEvents(LocalDateTime cutoffTime) {
        try {
            long countBefore = extendedOutboxEventRepository.countProcessedEvents();
            extendedOutboxEventRepository.deleteProcessedEventsBefore(cutoffTime);
            long countAfter = extendedOutboxEventRepository.countProcessedEvents();
            
            return countBefore - countAfter;
            
        } catch (Exception e) {
            log.error("Error cleaning up extended processed events", e);
            return 0;
        }
    }
    
    /**
     * Get cleanup statistics
     */
    public OutboxCleanupStatistics getCleanupStatistics() {
        try {
            long baseUnprocessedCount = baseOutboxEventRepository.countUnprocessedEvents();
            long baseProcessedCount = baseOutboxEventRepository.countProcessedEvents();
            long baseFailedCount = baseOutboxEventRepository.countFailedEvents();
            
            long extendedUnprocessedCount = extendedOutboxEventRepository.countUnprocessedEvents();
            long extendedProcessedCount = extendedOutboxEventRepository.countProcessedEvents();
            long extendedFailedCount = extendedOutboxEventRepository.countFailedEvents();
            long extendedExpiredCount = extendedOutboxEventRepository.countExpiredEvents(ZonedDateTime.now());
            
            long simpleEventsCount = simpleOutboxEventRepository.count();
            
            return new OutboxCleanupStatistics(
                baseUnprocessedCount, baseProcessedCount, baseFailedCount,
                extendedUnprocessedCount, extendedProcessedCount, extendedFailedCount, extendedExpiredCount,
                simpleEventsCount
            );
            
        } catch (Exception e) {
            log.error("Error getting cleanup statistics", e);
            return new OutboxCleanupStatistics(0, 0, 0, 0, 0, 0, 0, 0);
        }
    }
    
    /**
     * Statistics data class
     */
    public static class OutboxCleanupStatistics {
        public final long baseUnprocessedCount;
        public final long baseProcessedCount;
        public final long baseFailedCount;
        public final long extendedUnprocessedCount;
        public final long extendedProcessedCount;
        public final long extendedFailedCount;
        public final long extendedExpiredCount;
        public final long simpleEventsCount;
        
        public OutboxCleanupStatistics(
                long baseUnprocessedCount, long baseProcessedCount, long baseFailedCount,
                long extendedUnprocessedCount, long extendedProcessedCount, long extendedFailedCount,
                long extendedExpiredCount, long simpleEventsCount) {
            this.baseUnprocessedCount = baseUnprocessedCount;
            this.baseProcessedCount = baseProcessedCount;
            this.baseFailedCount = baseFailedCount;
            this.extendedUnprocessedCount = extendedUnprocessedCount;
            this.extendedProcessedCount = extendedProcessedCount;
            this.extendedFailedCount = extendedFailedCount;
            this.extendedExpiredCount = extendedExpiredCount;
            this.simpleEventsCount = simpleEventsCount;
        }
    }
}
