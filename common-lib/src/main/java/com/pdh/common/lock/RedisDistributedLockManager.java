package com.pdh.common.lock;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

/**
 * Redis-based implementation of DistributedLockManager
 * Uses Redis for high-performance distributed locking across microservices
 * 
 * Key Benefits:
 * - In-memory performance (microsecond latency)
 * - Native TTL support with automatic expiration
 * - Atomic operations with Lua scripts
 * - Lightweight and efficient
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RedisDistributedLockManager implements DistributedLockManager {
    
    private final RedisTemplate<String, Object> redisTemplate;
    
    // Redis key prefixes
    private static final String LOCK_KEY_PREFIX = "distributed_lock:";
    private static final String OWNER_KEY_PREFIX = "lock_owner:";
    private static final String RESOURCE_KEY_PREFIX = "lock_resource:";
    
    // Lua script for atomic lock acquisition
    private static final String ACQUIRE_LOCK_SCRIPT = """
        local lockKey = KEYS[1]
        local ownerKey = KEYS[2]
        local resourceKey = KEYS[3]
        local lockData = ARGV[1]
        local ttlSeconds = tonumber(ARGV[2])
        local quantity = tonumber(ARGV[3])
        local maxCapacity = tonumber(ARGV[4])
        
        -- Check current resource usage
        local currentUsage = redis.call('GET', resourceKey) or 0
        currentUsage = tonumber(currentUsage)
        
        -- Check if resource is available
        if (currentUsage + quantity) > maxCapacity then
            return nil  -- Resource not available
        end
        
        -- Acquire lock atomically
        local result = redis.call('SET', lockKey, lockData, 'EX', ttlSeconds, 'NX')
        if result then
            -- Update resource usage
            redis.call('INCRBY', resourceKey, quantity)
            redis.call('EXPIRE', resourceKey, ttlSeconds)
            
            -- Add to owner's lock set
            redis.call('SADD', ownerKey, lockKey)
            redis.call('EXPIRE', ownerKey, ttlSeconds)
            
            return lockData
        end
        
        return nil
        """;
    
    // Lua script for atomic lock release
    private static final String RELEASE_LOCK_SCRIPT = """
        local lockKey = KEYS[1]
        local ownerKey = KEYS[2]
        local resourceKey = KEYS[3]
        local expectedOwner = ARGV[1]
        local quantity = tonumber(ARGV[2])
        
        -- Check if lock exists and owner matches
        local currentOwner = redis.call('GET', lockKey)
        if currentOwner and string.find(currentOwner, expectedOwner) then
            -- Release lock
            redis.call('DEL', lockKey)
            
            -- Update resource usage
            redis.call('DECRBY', resourceKey, quantity)
            
            -- Remove from owner's lock set
            redis.call('SREM', ownerKey, lockKey)
            
            return 1
        end
        
        return 0
        """;
    
    @Override
    public Optional<DistributedLock> acquireLock(String resource, LockResourceType resourceType, 
                                               String owner, Duration timeout, int quantity) {
        log.debug("Attempting to acquire Redis lock for resource: {}, type: {}, owner: {}, quantity: {}", 
                 resource, resourceType, owner, quantity);
        
        try {
            // Create lock
            DistributedLock lock = DistributedLock.builder()
                .lockId(generateLockId())
                .resource(resource)
                .resourceType(resourceType)
                .owner(owner)
                .acquiredAt(Instant.now())
                .expiresAt(Instant.now().plus(timeout))
                .timeout(timeout)
                .status(LockStatus.PENDING)
                .quantity(quantity)
                .build();
            
            // Redis keys
            String lockKey = LOCK_KEY_PREFIX + lock.getLockKey();
            String ownerKey = OWNER_KEY_PREFIX + owner;
            String resourceKey = RESOURCE_KEY_PREFIX + resourceType.name().toLowerCase() + ":" + resource;
            
            // Lock data (JSON-like string)
            String lockData = String.format("{\"lockId\":\"%s\",\"owner\":\"%s\",\"resource\":\"%s\",\"quantity\":%d,\"acquiredAt\":\"%s\"}", 
                lock.getLockId(), owner, resource, quantity, lock.getAcquiredAt().toString());
            
            // Execute atomic lock acquisition
            DefaultRedisScript<String> script = new DefaultRedisScript<>(ACQUIRE_LOCK_SCRIPT, String.class);
            String result = redisTemplate.execute(script, 
                List.of(lockKey, ownerKey, resourceKey),
                lockData, timeout.getSeconds(), quantity, getMaxCapacity(resourceType));
            
            if (result != null) {
                lock.setStatus(LockStatus.ACQUIRED);
                log.info("Successfully acquired Redis lock: {} for resource: {}", lock.getLockId(), resource);
                return Optional.of(lock);
            } else {
                log.debug("Failed to acquire Redis lock for resource: {} - not available", resource);
                return Optional.empty();
            }
            
        } catch (Exception e) {
            log.error("Error acquiring Redis lock for resource: {}", resource, e);
            return Optional.empty();
        }
    }
    
    @Override
    public boolean releaseLock(String lockId, String owner) {
        log.debug("Releasing Redis lock: {} by owner: {}", lockId, owner);
        
        try {
            // Find the lock to get resource info
            Optional<DistributedLock> lockOpt = getLock(lockId);
            if (lockOpt.isEmpty()) {
                log.warn("Lock not found for release: {}", lockId);
                return false;
            }
            
            DistributedLock lock = lockOpt.get();
            
            // Redis keys
            String lockKey = LOCK_KEY_PREFIX + lock.getLockKey();
            String ownerKey = OWNER_KEY_PREFIX + owner;
            String resourceKey = RESOURCE_KEY_PREFIX + lock.getResourceType().name().toLowerCase() + ":" + lock.getResource();
            
            // Execute atomic lock release
            DefaultRedisScript<Long> script = new DefaultRedisScript<>(RELEASE_LOCK_SCRIPT, Long.class);
            Long result = redisTemplate.execute(script,
                List.of(lockKey, ownerKey, resourceKey),
                owner, lock.getQuantity());
            
            if (result != null && result > 0) {
                log.info("Successfully released Redis lock: {}", lockId);
                return true;
            } else {
                log.warn("Failed to release Redis lock: {} - not found or not owned by: {}", lockId, owner);
                return false;
            }
            
        } catch (Exception e) {
            log.error("Error releasing Redis lock: {}", lockId, e);
            return false;
        }
    }
    
    @Override
    public boolean extendLock(String lockId, String owner, Duration additionalTime) {
        log.debug("Extending Redis lock: {} by owner: {} for: {}", lockId, owner, additionalTime);
        
        try {
            // Find the lock
            Optional<DistributedLock> lockOpt = getLock(lockId);
            if (lockOpt.isEmpty()) {
                log.warn("Lock not found for extension: {}", lockId);
                return false;
            }
            
            DistributedLock lock = lockOpt.get();
            String lockKey = LOCK_KEY_PREFIX + lock.getLockKey();
            
            // Extend TTL
            Boolean result = redisTemplate.expire(lockKey, additionalTime);
            
            if (Boolean.TRUE.equals(result)) {
                log.info("Successfully extended Redis lock: {} for: {}", lockId, additionalTime);
                return true;
            } else {
                log.warn("Failed to extend Redis lock: {}", lockId);
                return false;
            }
            
        } catch (Exception e) {
            log.error("Error extending Redis lock: {}", lockId, e);
            return false;
        }
    }
    
    @Override
    public Optional<DistributedLock> getLock(String lockId) {
        try {
            // For simplicity, we'll search through owner keys to find the lock
            // In a production system, you might want to maintain a separate index
            Set<String> ownerKeys = redisTemplate.keys(OWNER_KEY_PREFIX + "*");
            
            for (String ownerKey : ownerKeys) {
                Set<Object> lockKeys = redisTemplate.opsForSet().members(ownerKey);
                for (Object lockKeyObj : lockKeys) {
                    String lockKey = (String) lockKeyObj;
                    String lockData = (String) redisTemplate.opsForValue().get(lockKey);
                    
                    if (lockData != null && lockData.contains(lockId)) {
                        // Parse lock data and return DistributedLock
                        // This is simplified - in production, use proper JSON parsing
                        return Optional.of(parseLockData(lockData, lockKey));
                    }
                }
            }
            
            return Optional.empty();
        } catch (Exception e) {
            log.error("Error getting Redis lock: {}", lockId, e);
            return Optional.empty();
        }
    }
    
    @Override
    public List<DistributedLock> getLocksForResource(String resource, LockResourceType resourceType) {
        try {
            String pattern = LOCK_KEY_PREFIX + "lock:" + resourceType.name().toLowerCase() + ":" + resource + "*";
            Set<String> lockKeys = redisTemplate.keys(pattern);
            
            return lockKeys.stream()
                .map(lockKey -> {
                    String lockData = (String) redisTemplate.opsForValue().get(lockKey);
                    return lockData != null ? parseLockData(lockData, lockKey) : null;
                })
                .filter(lock -> lock != null)
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            log.error("Error getting locks for resource: {}", resource, e);
            return List.of();
        }
    }
    
    @Override
    public List<DistributedLock> getLocksByOwner(String owner) {
        try {
            String ownerKey = OWNER_KEY_PREFIX + owner;
            Set<Object> lockKeys = redisTemplate.opsForSet().members(ownerKey);
            
            return lockKeys.stream()
                .map(lockKeyObj -> {
                    String lockKey = (String) lockKeyObj;
                    String lockData = (String) redisTemplate.opsForValue().get(lockKey);
                    return lockData != null ? parseLockData(lockData, lockKey) : null;
                })
                .filter(lock -> lock != null)
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            log.error("Error getting locks by owner: {}", owner, e);
            return List.of();
        }
    }
    
    @Override
    public boolean isResourceLocked(String resource, LockResourceType resourceType, int quantity) {
        try {
            String resourceKey = RESOURCE_KEY_PREFIX + resourceType.name().toLowerCase() + ":" + resource;
            String currentUsage = (String) redisTemplate.opsForValue().get(resourceKey);
            
            int usage = currentUsage != null ? Integer.parseInt(currentUsage) : 0;
            return usage >= quantity;
        } catch (Exception e) {
            log.error("Error checking if resource is locked: {}", resource, e);
            return false;
        }
    }
    
    @Override
    public boolean isResourceAvailable(String resource, LockResourceType resourceType, int requiredQuantity) {
        try {
            String resourceKey = RESOURCE_KEY_PREFIX + resourceType.name().toLowerCase() + ":" + resource;
            String currentUsage = (String) redisTemplate.opsForValue().get(resourceKey);
            
            int usage = currentUsage != null ? Integer.parseInt(currentUsage) : 0;
            int maxCapacity = getMaxCapacity(resourceType);
            
            boolean available = (usage + requiredQuantity) <= maxCapacity;
            log.debug("Redis resource {} availability check: usage: {}, required: {}, max: {}, available: {}", 
                     resource, usage, requiredQuantity, maxCapacity, available);
            
            return available;
        } catch (Exception e) {
            log.error("Error checking resource availability: {}", resource, e);
            return false;
        }
    }
    
    @Override
    public int cleanupExpiredLocks() {
        // Redis TTL automatically handles lock expiration - no manual cleanup needed
        log.debug("Redis TTL automatically handles lock expiration");
        return 0; // Always 0 since Redis handles cleanup automatically
    }
    
    @Override
    public int releaseAllLocksByOwner(String owner) {
        try {
            String ownerKey = OWNER_KEY_PREFIX + owner;
            Set<Object> lockKeys = redisTemplate.opsForSet().members(ownerKey);
            
            int releasedCount = 0;
            for (Object lockKeyObj : lockKeys) {
                String lockKey = (String) lockKeyObj;
                String lockData = (String) redisTemplate.opsForValue().get(lockKey);
                
                if (lockData != null) {
                    DistributedLock lock = parseLockData(lockData, lockKey);
                    if (releaseLock(lock.getLockId(), owner)) {
                        releasedCount++;
                    }
                }
            }
            
            if (releasedCount > 0) {
                log.info("Released {} Redis locks for owner: {}", releasedCount, owner);
            }
            return releasedCount;
            
        } catch (Exception e) {
            log.error("Error releasing locks by owner: {}", owner, e);
            return 0;
        }
    }
    
    @Override
    public LockStatistics getLockStatistics() {
        try {
            Set<String> allLockKeys = redisTemplate.keys(LOCK_KEY_PREFIX + "*");
            int activeLocks = allLockKeys.size();
            
            // Redis automatically cleans expired locks, so expired count is always 0
            return new LockStatistics(activeLocks, 0, activeLocks, 0);
        } catch (Exception e) {
            log.error("Error getting lock statistics", e);
            return new LockStatistics(0, 0, 0, 0);
        }
    }
    
    /**
     * Gets maximum capacity for a resource type
     */
    private int getMaxCapacity(LockResourceType resourceType) {
        return switch (resourceType) {
            case FLIGHT -> 300;  // Max passengers per flight
            case HOTEL -> 100;   // Max rooms per hotel
            case ROOM -> 50;     // Max rooms of same type
            case SEAT -> 300;    // Max seats per class
            default -> 100;      // Default capacity
        };
    }
    
    /**
     * Generates a unique lock ID
     */
    private String generateLockId() {
        return "redis_lock_" + System.currentTimeMillis() + "_" + 
               Integer.toHexString((int)(Math.random() * 0x10000));
    }
    
    /**
     * Parses lock data from Redis (simplified implementation)
     */
    private DistributedLock parseLockData(String lockData, String lockKey) {
        try {
            // This is a simplified parser - in production, use proper JSON parsing
            // Extract values using string manipulation (for demo purposes)
            String lockId = extractValue(lockData, "lockId");
            String owner = extractValue(lockData, "owner");
            String resource = extractValue(lockData, "resource");
            int quantity = Integer.parseInt(extractValue(lockData, "quantity"));
            
            return DistributedLock.builder()
                .lockId(lockId)
                .owner(owner)
                .resource(resource)
                .quantity(quantity)
                .status(LockStatus.ACQUIRED)
                .acquiredAt(Instant.now()) // Simplified
                .expiresAt(Instant.now().plusSeconds(600)) // Simplified
                .build();
                
        } catch (Exception e) {
            log.error("Error parsing lock data: {}", lockData, e);
            return null;
        }
    }
    
    /**
     * Simple value extraction from JSON-like string
     */
    private String extractValue(String data, String key) {
        String pattern = "\"" + key + "\":\"";
        int start = data.indexOf(pattern) + pattern.length();
        int end = data.indexOf("\"", start);
        return data.substring(start, end);
    }
}
