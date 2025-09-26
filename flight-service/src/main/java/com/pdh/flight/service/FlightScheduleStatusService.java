package com.pdh.flight.service;

import com.pdh.flight.model.enums.ScheduleStatus;
import com.pdh.flight.repository.FlightScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;

/**
 * Service for managing flight schedule status updates through scheduled tasks
 * Handles automatic status transitions based on time and flight lifecycle
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FlightScheduleStatusService {
    
    private final FlightScheduleRepository flightScheduleRepository;
    
    /**
     * Update flight schedule status every day at 1:00 AM (Asia/Ho_Chi_Minh timezone)
     * This handles the transition from various states to COMPLETED for flights that have arrived
     */
    @Scheduled(cron = "0 0 1 * * *", zone = "Asia/Ho_Chi_Minh")
    @Transactional
    public void updateCompletedFlightSchedules() {
        log.info("Starting scheduled update of completed flight schedules");
        
        try {
            ZonedDateTime now = ZonedDateTime.now();
            int updatedCount = flightScheduleRepository.updateCompletedSchedules(now);
            
            log.info("Successfully updated {} flight schedules to COMPLETED status", updatedCount);
            
            // Optionally publish event for other services (for future saga integration)
            if (updatedCount > 0) {
                publishFlightScheduleStatusUpdatedEvent("COMPLETED", updatedCount);
            }
            
        } catch (Exception e) {
            log.error("Error updating completed flight schedule status: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Update schedules that should be ACTIVE (departure time is within 1 hour)
     * Run every 30 minutes during operating hours to catch flights becoming active
     */
    @Scheduled(fixedRate = 1800000) // 30 minutes = 1800000 milliseconds
    @Transactional
    public void updateActiveFlightSchedules() {
        try {
            ZonedDateTime now = ZonedDateTime.now();
            ZonedDateTime oneHourFromNow = now.plusHours(1);
            
            int updatedCount = flightScheduleRepository.updateActiveSchedules(now, oneHourFromNow);
            
            if (updatedCount > 0) {
                log.info("Updated {} flight schedules to ACTIVE status", updatedCount);
                publishFlightScheduleStatusUpdatedEvent("ACTIVE", updatedCount);
            }
            
        } catch (Exception e) {
            log.error("Error updating active flight schedule status: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Manual method to update flight schedule status
     * Can be called by admin operations or external events
     */
    @Transactional
    public int updateFlightScheduleStatus(ScheduleStatus fromStatus, ScheduleStatus toStatus, ZonedDateTime timeCondition) {
        log.info("Manual status update from {} to {} for schedules before {}", fromStatus, toStatus, timeCondition);
        
        try {
            ZonedDateTime now = ZonedDateTime.now();
            int updatedCount = flightScheduleRepository.updateScheduleStatus(fromStatus, toStatus, timeCondition, now);
            
            if (updatedCount > 0) {
                log.info("Manually updated {} flight schedules from {} to {}", updatedCount, fromStatus, toStatus);
                publishFlightScheduleStatusUpdatedEvent(toStatus.name(), updatedCount);
            }
            
            return updatedCount;
        } catch (Exception e) {
            log.error("Error in manual flight schedule status update: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    /**
     * Get statistics about flight schedule statuses
     */
    @Transactional(readOnly = true)
    public FlightScheduleStatusStats getStatusStatistics() {
        log.debug("Retrieving flight schedule status statistics");
        
        return FlightScheduleStatusStats.builder()
                .totalSchedules(flightScheduleRepository.countByIsDeletedFalse())
                .scheduledCount(flightScheduleRepository.countByStatusAndIsDeletedFalse(ScheduleStatus.SCHEDULED))
                .activeCount(flightScheduleRepository.countByStatusAndIsDeletedFalse(ScheduleStatus.ACTIVE))
                .delayedCount(flightScheduleRepository.countByStatusAndIsDeletedFalse(ScheduleStatus.DELAYED))
                .cancelledCount(flightScheduleRepository.countByStatusAndIsDeletedFalse(ScheduleStatus.CANCELLED))
                .completedCount(flightScheduleRepository.countByStatusAndIsDeletedFalse(ScheduleStatus.COMPLETED))
                .build();
    }
    
    /**
     * Cleanup old completed schedules (older than specified days)
     * Run weekly on Sunday at 2:00 AM
     */
    @Scheduled(cron = "0 0 2 * * SUN", zone = "Asia/Ho_Chi_Minh")
    @Transactional
    public void cleanupOldCompletedSchedules() {
        log.info("Starting cleanup of old completed flight schedules");
        
        try {
            // Keep completed schedules for 90 days
            ZonedDateTime cutoffDate = ZonedDateTime.now().minusDays(90);
            ZonedDateTime now = ZonedDateTime.now();
            int deletedCount = flightScheduleRepository.softDeleteOldCompletedSchedules(cutoffDate, now);
            
            log.info("Cleaned up {} old completed flight schedules older than {}", deletedCount, cutoffDate.toLocalDate());
            
        } catch (Exception e) {
            log.error("Error during cleanup of old flight schedules: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Publish event for status updates (placeholder for future saga integration)
     */
    private void publishFlightScheduleStatusUpdatedEvent(String status, int count) {
        // TODO: Implement event publishing for saga orchestration
        // This would integrate with your existing outbox pattern
        log.debug("Publishing flight schedule status update event: {} schedules updated to {}", count, status);
    }
    
    /**
     * DTO class for status statistics
     */
    @lombok.Builder
    @lombok.Data
    public static class FlightScheduleStatusStats {
        private Long totalSchedules;
        private Long scheduledCount;
        private Long activeCount;
        private Long delayedCount;
        private Long cancelledCount;
        private Long completedCount;
    }
}