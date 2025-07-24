package com.pdh.common.lock;

import java.time.Duration;
import java.util.List;
import java.util.Optional;

/**
 * Distributed Lock Manager Interface
 * Provides distributed locking capabilities across microservices
 */
public interface DistributedLockManager {
    
    /**
     * Attempts to acquire a lock for a resource
     * 
     * @param resource Resource identifier (e.g., "flight:123")
     * @param resourceType Type of resource being locked
     * @param owner Lock owner identifier (e.g., saga ID)
     * @param timeout Lock timeout duration
     * @param quantity Quantity to lock (for inventory)
     * @return Lock if acquired, empty if failed
     */
    Optional<DistributedLock> acquireLock(String resource, LockResourceType resourceType, 
                                        String owner, Duration timeout, int quantity);
    
    /**
     * Attempts to acquire a lock with default quantity (1)
     */
    default Optional<DistributedLock> acquireLock(String resource, LockResourceType resourceType, 
                                                String owner, Duration timeout) {
        return acquireLock(resource, resourceType, owner, timeout, 1);
    }
    
    /**
     * Releases a lock
     * 
     * @param lockId Lock identifier
     * @param owner Lock owner (for verification)
     * @return true if released successfully
     */
    boolean releaseLock(String lockId, String owner);
    
    /**
     * Extends a lock's expiration time
     * 
     * @param lockId Lock identifier
     * @param owner Lock owner (for verification)
     * @param additionalTime Additional time to extend
     * @return true if extended successfully
     */
    boolean extendLock(String lockId, String owner, Duration additionalTime);
    
    /**
     * Gets information about a specific lock
     * 
     * @param lockId Lock identifier
     * @return Lock information if exists
     */
    Optional<DistributedLock> getLock(String lockId);
    
    /**
     * Gets all locks for a specific resource
     * 
     * @param resource Resource identifier
     * @param resourceType Resource type
     * @return List of active locks for the resource
     */
    List<DistributedLock> getLocksForResource(String resource, LockResourceType resourceType);
    
    /**
     * Gets all locks owned by a specific owner
     * 
     * @param owner Lock owner identifier
     * @return List of locks owned by the owner
     */
    List<DistributedLock> getLocksByOwner(String owner);
    
    /**
     * Checks if a resource is currently locked
     * 
     * @param resource Resource identifier
     * @param resourceType Resource type
     * @param quantity Required quantity (optional)
     * @return true if resource has sufficient locks
     */
    boolean isResourceLocked(String resource, LockResourceType resourceType, int quantity);
    
    /**
     * Checks if a resource is available for locking
     * 
     * @param resource Resource identifier
     * @param resourceType Resource type
     * @param requiredQuantity Required quantity
     * @return true if resource can be locked for the required quantity
     */
    boolean isResourceAvailable(String resource, LockResourceType resourceType, int requiredQuantity);
    
    /**
     * Forces release of expired locks
     * Should be called periodically for cleanup
     * 
     * @return Number of expired locks cleaned up
     */
    int cleanupExpiredLocks();
    
    /**
     * Forces release of all locks owned by a specific owner
     * Used for saga compensation
     * 
     * @param owner Lock owner identifier
     * @return Number of locks released
     */
    int releaseAllLocksByOwner(String owner);
    
    /**
     * Gets lock statistics for monitoring
     * 
     * @return Lock statistics
     */
    LockStatistics getLockStatistics();
    
    /**
     * Lock statistics for monitoring and debugging
     */
    class LockStatistics {
        private final int totalActiveLocks;
        private final int totalExpiredLocks;
        private final int totalLocksByType;
        private final long averageLockDuration;
        
        public LockStatistics(int totalActiveLocks, int totalExpiredLocks, 
                            int totalLocksByType, long averageLockDuration) {
            this.totalActiveLocks = totalActiveLocks;
            this.totalExpiredLocks = totalExpiredLocks;
            this.totalLocksByType = totalLocksByType;
            this.averageLockDuration = averageLockDuration;
        }
        
        // Getters
        public int getTotalActiveLocks() { return totalActiveLocks; }
        public int getTotalExpiredLocks() { return totalExpiredLocks; }
        public int getTotalLocksByType() { return totalLocksByType; }
        public long getAverageLockDuration() { return averageLockDuration; }
    }
}
