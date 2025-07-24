package com.pdh.common.lock;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.Duration;

/**
 * Distributed Lock representation
 * Used for inventory locking across microservices
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DistributedLock {
    
    /**
     * Unique lock identifier
     */
    private String lockId;
    
    /**
     * Resource being locked (e.g., "flight:123", "hotel:456")
     */
    private String resource;
    
    /**
     * Type of resource (FLIGHT, HOTEL, ROOM)
     */
    private LockResourceType resourceType;
    
    /**
     * Owner of the lock (usually saga ID or booking ID)
     */
    private String owner;
    
    /**
     * When the lock was acquired
     */
    private Instant acquiredAt;
    
    /**
     * When the lock expires
     */
    private Instant expiresAt;
    
    /**
     * Lock timeout duration
     */
    private Duration timeout;
    
    /**
     * Current lock status
     */
    private LockStatus status;
    
    /**
     * Additional metadata for the lock
     */
    private String metadata;
    
    /**
     * Service that owns the lock
     */
    private String ownerService;
    
    /**
     * Quantity being locked (for inventory items)
     */
    @Builder.Default
    private Integer quantity = 1;
    
    /**
     * Lock priority (higher = more important)
     */
    @Builder.Default
    private Integer priority = 5;
    
    /**
     * Checks if the lock is expired
     */
    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }
    
    /**
     * Checks if the lock is active
     */
    public boolean isActive() {
        return status == LockStatus.ACQUIRED && !isExpired();
    }
    
    /**
     * Gets remaining time until expiration
     */
    public Duration getRemainingTime() {
        if (isExpired()) {
            return Duration.ZERO;
        }
        return Duration.between(Instant.now(), expiresAt);
    }
    
    /**
     * Extends the lock expiration time
     */
    public void extend(Duration additionalTime) {
        this.expiresAt = this.expiresAt.plus(additionalTime);
    }
    
    /**
     * Creates a lock key for Redis/database storage
     */
    public String getLockKey() {
        return String.format("lock:%s:%s", resourceType.name().toLowerCase(), resource);
    }
    
    /**
     * Creates a lock for flight inventory
     */
    public static DistributedLock forFlight(String flightId, String owner, Duration timeout, int quantity) {
        return DistributedLock.builder()
            .lockId(generateLockId())
            .resource(flightId)
            .resourceType(LockResourceType.FLIGHT)
            .owner(owner)
            .acquiredAt(Instant.now())
            .expiresAt(Instant.now().plus(timeout))
            .timeout(timeout)
            .status(LockStatus.PENDING)
            .quantity(quantity)
            .ownerService("booking-service")
            .build();
    }
    
    /**
     * Creates a lock for hotel inventory
     */
    public static DistributedLock forHotel(String hotelId, String owner, Duration timeout, int quantity) {
        return DistributedLock.builder()
            .lockId(generateLockId())
            .resource(hotelId)
            .resourceType(LockResourceType.HOTEL)
            .owner(owner)
            .acquiredAt(Instant.now())
            .expiresAt(Instant.now().plus(timeout))
            .timeout(timeout)
            .status(LockStatus.PENDING)
            .quantity(quantity)
            .ownerService("booking-service")
            .build();
    }
    
    /**
     * Creates a lock for room inventory
     */
    public static DistributedLock forRoom(String roomId, String owner, Duration timeout, int quantity) {
        return DistributedLock.builder()
            .lockId(generateLockId())
            .resource(roomId)
            .resourceType(LockResourceType.ROOM)
            .owner(owner)
            .acquiredAt(Instant.now())
            .expiresAt(Instant.now().plus(timeout))
            .timeout(timeout)
            .status(LockStatus.PENDING)
            .quantity(quantity)
            .ownerService("booking-service")
            .build();
    }
    
    /**
     * Generates a unique lock ID
     */
    private static String generateLockId() {
        return "lock_" + System.currentTimeMillis() + "_" + 
               Integer.toHexString((int)(Math.random() * 0x10000));
    }
}
