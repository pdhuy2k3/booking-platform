package com.pdh.common.lock;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

/**
 * Database-based implementation of DistributedLockManager
 * Uses PostgreSQL for distributed locking across microservices
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseDistributedLockManager implements DistributedLockManager {
    
    private final JdbcTemplate jdbcTemplate;
    
    private static final String CREATE_LOCK_SQL = """
        INSERT INTO distributed_locks (lock_id, resource, resource_type, owner, acquired_at, expires_at, 
                                     timeout_seconds, status, metadata, owner_service, quantity, priority)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """;
    
    private static final String UPDATE_LOCK_STATUS_SQL = """
        UPDATE distributed_locks SET status = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE lock_id = ? AND owner = ?
        """;
    
    private static final String EXTEND_LOCK_SQL = """
        UPDATE distributed_locks SET expires_at = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE lock_id = ? AND owner = ? AND status = 'ACQUIRED'
        """;
    
    private static final String GET_LOCK_SQL = """
        SELECT * FROM distributed_locks WHERE lock_id = ?
        """;
    
    private static final String GET_LOCKS_BY_RESOURCE_SQL = """
        SELECT * FROM distributed_locks 
        WHERE resource = ? AND resource_type = ? AND status = 'ACQUIRED' AND expires_at > CURRENT_TIMESTAMP
        """;
    
    private static final String GET_LOCKS_BY_OWNER_SQL = """
        SELECT * FROM distributed_locks 
        WHERE owner = ? AND status = 'ACQUIRED' AND expires_at > CURRENT_TIMESTAMP
        """;
    
    private static final String CHECK_RESOURCE_AVAILABILITY_SQL = """
        SELECT COALESCE(SUM(quantity), 0) as locked_quantity 
        FROM distributed_locks 
        WHERE resource = ? AND resource_type = ? AND status = 'ACQUIRED' AND expires_at > CURRENT_TIMESTAMP
        """;
    
    private static final String CLEANUP_EXPIRED_LOCKS_SQL = """
        UPDATE distributed_locks SET status = 'EXPIRED', updated_at = CURRENT_TIMESTAMP 
        WHERE status = 'ACQUIRED' AND expires_at <= CURRENT_TIMESTAMP
        """;
    
    private static final String RELEASE_LOCKS_BY_OWNER_SQL = """
        UPDATE distributed_locks SET status = 'RELEASED', updated_at = CURRENT_TIMESTAMP 
        WHERE owner = ? AND status = 'ACQUIRED'
        """;
    
    @Override
    @Transactional
    public Optional<DistributedLock> acquireLock(String resource, LockResourceType resourceType, 
                                               String owner, Duration timeout, int quantity) {
        log.debug("Attempting to acquire lock for resource: {}, type: {}, owner: {}, quantity: {}", 
                 resource, resourceType, owner, quantity);
        
        try {
            // Check if resource is available
            if (!isResourceAvailable(resource, resourceType, quantity)) {
                log.debug("Resource {} not available for locking quantity: {}", resource, quantity);
                return Optional.empty();
            }
            
            // Create lock
            DistributedLock lock = DistributedLock.builder()
                .lockId(generateLockId())
                .resource(resource)
                .resourceType(resourceType)
                .owner(owner)
                .acquiredAt(Instant.now())
                .expiresAt(Instant.now().plus(timeout))
                .timeout(timeout)
                .status(LockStatus.ACQUIRED)
                .quantity(quantity)
                .ownerService("booking-service")
                .priority(5)
                .build();
            
            // Insert lock into database
            int rowsAffected = jdbcTemplate.update(CREATE_LOCK_SQL,
                lock.getLockId(),
                lock.getResource(),
                lock.getResourceType().name(),
                lock.getOwner(),
                Timestamp.from(lock.getAcquiredAt()),
                Timestamp.from(lock.getExpiresAt()),
                lock.getTimeout().getSeconds(),
                lock.getStatus().name(),
                lock.getMetadata(),
                lock.getOwnerService(),
                lock.getQuantity(),
                lock.getPriority()
            );
            
            if (rowsAffected > 0) {
                log.info("Successfully acquired lock: {} for resource: {}", lock.getLockId(), resource);
                return Optional.of(lock);
            } else {
                log.warn("Failed to insert lock for resource: {}", resource);
                return Optional.empty();
            }
            
        } catch (DataIntegrityViolationException e) {
            log.debug("Lock acquisition failed due to constraint violation for resource: {}", resource);
            return Optional.empty();
        } catch (Exception e) {
            log.error("Error acquiring lock for resource: {}", resource, e);
            return Optional.empty();
        }
    }
    
    @Override
    @Transactional
    public boolean releaseLock(String lockId, String owner) {
        log.debug("Releasing lock: {} by owner: {}", lockId, owner);
        
        try {
            int rowsAffected = jdbcTemplate.update(UPDATE_LOCK_STATUS_SQL, 
                LockStatus.RELEASED.name(), lockId, owner);
            
            if (rowsAffected > 0) {
                log.info("Successfully released lock: {}", lockId);
                return true;
            } else {
                log.warn("Failed to release lock: {} - not found or not owned by: {}", lockId, owner);
                return false;
            }
        } catch (Exception e) {
            log.error("Error releasing lock: {}", lockId, e);
            return false;
        }
    }
    
    @Override
    @Transactional
    public boolean extendLock(String lockId, String owner, Duration additionalTime) {
        log.debug("Extending lock: {} by owner: {} for: {}", lockId, owner, additionalTime);
        
        try {
            // Get current lock
            Optional<DistributedLock> lockOpt = getLock(lockId);
            if (lockOpt.isEmpty()) {
                log.warn("Lock not found for extension: {}", lockId);
                return false;
            }
            
            DistributedLock lock = lockOpt.get();
            Instant newExpirationTime = lock.getExpiresAt().plus(additionalTime);
            
            int rowsAffected = jdbcTemplate.update(EXTEND_LOCK_SQL, 
                Timestamp.from(newExpirationTime), lockId, owner);
            
            if (rowsAffected > 0) {
                log.info("Successfully extended lock: {} until: {}", lockId, newExpirationTime);
                return true;
            } else {
                log.warn("Failed to extend lock: {} - not found or not owned by: {}", lockId, owner);
                return false;
            }
        } catch (Exception e) {
            log.error("Error extending lock: {}", lockId, e);
            return false;
        }
    }
    
    @Override
    public Optional<DistributedLock> getLock(String lockId) {
        try {
            List<DistributedLock> locks = jdbcTemplate.query(GET_LOCK_SQL, new LockRowMapper(), lockId);
            return locks.isEmpty() ? Optional.empty() : Optional.of(locks.get(0));
        } catch (Exception e) {
            log.error("Error getting lock: {}", lockId, e);
            return Optional.empty();
        }
    }
    
    @Override
    public List<DistributedLock> getLocksForResource(String resource, LockResourceType resourceType) {
        try {
            return jdbcTemplate.query(GET_LOCKS_BY_RESOURCE_SQL, new LockRowMapper(), 
                                    resource, resourceType.name());
        } catch (Exception e) {
            log.error("Error getting locks for resource: {}", resource, e);
            return List.of();
        }
    }
    
    @Override
    public List<DistributedLock> getLocksByOwner(String owner) {
        try {
            return jdbcTemplate.query(GET_LOCKS_BY_OWNER_SQL, new LockRowMapper(), owner);
        } catch (Exception e) {
            log.error("Error getting locks by owner: {}", owner, e);
            return List.of();
        }
    }
    
    @Override
    public boolean isResourceLocked(String resource, LockResourceType resourceType, int quantity) {
        try {
            Integer lockedQuantity = jdbcTemplate.queryForObject(CHECK_RESOURCE_AVAILABILITY_SQL, 
                                                                Integer.class, resource, resourceType.name());
            return lockedQuantity != null && lockedQuantity >= quantity;
        } catch (Exception e) {
            log.error("Error checking if resource is locked: {}", resource, e);
            return false;
        }
    }
    
    @Override
    public boolean isResourceAvailable(String resource, LockResourceType resourceType, int requiredQuantity) {
        // For simplicity, we'll assume resources have unlimited capacity
        // In a real system, you'd check against actual inventory
        try {
            Integer lockedQuantity = jdbcTemplate.queryForObject(CHECK_RESOURCE_AVAILABILITY_SQL, 
                                                                Integer.class, resource, resourceType.name());
            
            // For now, allow up to 100 units to be locked per resource
            int maxCapacity = 100;
            int currentlyLocked = lockedQuantity != null ? lockedQuantity : 0;
            
            boolean available = (currentlyLocked + requiredQuantity) <= maxCapacity;
            log.debug("Resource {} availability check: currently locked: {}, required: {}, available: {}", 
                     resource, currentlyLocked, requiredQuantity, available);
            
            return available;
        } catch (Exception e) {
            log.error("Error checking resource availability: {}", resource, e);
            return false;
        }
    }
    
    @Override
    @Transactional
    public int cleanupExpiredLocks() {
        try {
            int rowsAffected = jdbcTemplate.update(CLEANUP_EXPIRED_LOCKS_SQL);
            if (rowsAffected > 0) {
                log.info("Cleaned up {} expired locks", rowsAffected);
            }
            return rowsAffected;
        } catch (Exception e) {
            log.error("Error cleaning up expired locks", e);
            return 0;
        }
    }
    
    @Override
    @Transactional
    public int releaseAllLocksByOwner(String owner) {
        try {
            int rowsAffected = jdbcTemplate.update(RELEASE_LOCKS_BY_OWNER_SQL, owner);
            if (rowsAffected > 0) {
                log.info("Released {} locks for owner: {}", rowsAffected, owner);
            }
            return rowsAffected;
        } catch (Exception e) {
            log.error("Error releasing locks by owner: {}", owner, e);
            return 0;
        }
    }
    
    @Override
    public LockStatistics getLockStatistics() {
        // Implementation for monitoring - simplified for now
        return new LockStatistics(0, 0, 0, 0);
    }
    
    private String generateLockId() {
        return "lock_" + System.currentTimeMillis() + "_" + 
               Integer.toHexString((int)(Math.random() * 0x10000));
    }
    
    /**
     * Row mapper for DistributedLock
     */
    private static class LockRowMapper implements RowMapper<DistributedLock> {
        @Override
        public DistributedLock mapRow(ResultSet rs, int rowNum) throws SQLException {
            return DistributedLock.builder()
                .lockId(rs.getString("lock_id"))
                .resource(rs.getString("resource"))
                .resourceType(LockResourceType.valueOf(rs.getString("resource_type")))
                .owner(rs.getString("owner"))
                .acquiredAt(rs.getTimestamp("acquired_at").toInstant())
                .expiresAt(rs.getTimestamp("expires_at").toInstant())
                .timeout(Duration.ofSeconds(rs.getLong("timeout_seconds")))
                .status(LockStatus.valueOf(rs.getString("status")))
                .metadata(rs.getString("metadata"))
                .ownerService(rs.getString("owner_service"))
                .quantity(rs.getInt("quantity"))
                .priority(rs.getInt("priority"))
                .build();
        }
    }
}
