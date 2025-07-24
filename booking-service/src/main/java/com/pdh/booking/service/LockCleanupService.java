package com.pdh.booking.service;

import com.pdh.common.lock.DistributedLockManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/**
 * Lock Cleanup Service
 * Periodically cleans up expired locks to prevent resource leaks
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LockCleanupService {
    
    private final DistributedLockManager lockManager;
    
    /**
     * Cleans up expired locks every 5 minutes
     */
    @Scheduled(fixedRate = 300000) // 5 minutes
    public void cleanupExpiredLocks() {
        try {
            log.debug("Starting expired lock cleanup");
            
            int cleanedUp = lockManager.cleanupExpiredLocks();
            
            if (cleanedUp > 0) {
                log.info("Cleaned up {} expired locks", cleanedUp);
            } else {
                log.debug("No expired locks found during cleanup");
            }
            
        } catch (Exception e) {
            log.error("Error during lock cleanup", e);
        }
    }
    
    /**
     * Gets lock statistics for monitoring (every 10 minutes)
     */
    @Scheduled(fixedRate = 600000) // 10 minutes
    public void logLockStatistics() {
        try {
            DistributedLockManager.LockStatistics stats = lockManager.getLockStatistics();
            
            log.info("Lock Statistics - Active: {}, Expired: {}, Average Duration: {}ms", 
                stats.getTotalActiveLocks(), 
                stats.getTotalExpiredLocks(), 
                stats.getAverageLockDuration());
                
        } catch (Exception e) {
            log.error("Error getting lock statistics", e);
        }
    }
}
