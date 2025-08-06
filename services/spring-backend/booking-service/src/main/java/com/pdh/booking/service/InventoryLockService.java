package com.pdh.booking.service;

import com.pdh.booking.dto.request.FlightBookingDetailsDto;
import com.pdh.booking.dto.request.HotelBookingDetailsDto;
import com.pdh.booking.dto.request.ComboBookingDetailsDto;
import com.pdh.booking.model.enums.BookingType;
import com.pdh.common.lock.DistributedLock;
import com.pdh.common.lock.DistributedLockManager;
import com.pdh.common.lock.LockResourceType;
import com.pdh.common.validation.ValidationResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Inventory Lock Service - Phase 4
 * Manages distributed locks for inventory items during booking process
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryLockService {
    
    private final DistributedLockManager lockManager;
    
    // Lock timeout configurations
    private static final Duration DEFAULT_LOCK_TIMEOUT = Duration.ofMinutes(10);
    private static final Duration SAGA_LOCK_TIMEOUT = Duration.ofMinutes(15);
    private static final Duration PAYMENT_LOCK_TIMEOUT = Duration.ofMinutes(5);
    
    /**
     * Acquires locks for booking inventory based on booking type
     */
    public InventoryLockResult acquireInventoryLocks(String sagaId, BookingType bookingType, Object productDetails) {
        log.info("Acquiring inventory locks for saga: {}, type: {}", sagaId, bookingType);
        
        List<DistributedLock> acquiredLocks = new ArrayList<>();
        
        try {
            switch (bookingType) {
                case FLIGHT:
                    return acquireFlightLocks(sagaId, (FlightBookingDetailsDto) productDetails);
                case HOTEL:
                    return acquireHotelLocks(sagaId, (HotelBookingDetailsDto) productDetails);
                case COMBO:
                    return acquireComboLocks(sagaId, (ComboBookingDetailsDto) productDetails);
                default:
                    log.warn("Unknown booking type for locking: {}", bookingType);
                    return InventoryLockResult.failure("Unknown booking type: " + bookingType);
            }
        } catch (Exception e) {
            log.error("Error acquiring inventory locks for saga: {}", sagaId, e);
            // Release any locks that were acquired
            releaseAllLocks(acquiredLocks);
            return InventoryLockResult.failure("Failed to acquire locks: " + e.getMessage());
        }
    }
    
    /**
     * Acquires locks for flight booking
     */
    private InventoryLockResult acquireFlightLocks(String sagaId, FlightBookingDetailsDto flightDetails) {
        List<DistributedLock> locks = new ArrayList<>();
        
        try {
            // Lock flight inventory
            String flightResource = "flight:" + flightDetails.getFlightId();
            Optional<DistributedLock> flightLock = lockManager.acquireLock(
                flightResource, 
                LockResourceType.FLIGHT, 
                sagaId, 
                SAGA_LOCK_TIMEOUT, 
                flightDetails.getPassengerCount()
            );
            
            if (flightLock.isEmpty()) {
                log.warn("Failed to acquire flight lock for: {}", flightResource);
                return InventoryLockResult.failure("Flight not available for booking");
            }
            
            locks.add(flightLock.get());
            
            // Lock specific seats if seat class is specified
            if (flightDetails.getSeatClass() != null) {
                String seatResource = String.format("flight:%s:seats:%s", 
                    flightDetails.getFlightId(), flightDetails.getSeatClass());
                
                Optional<DistributedLock> seatLock = lockManager.acquireLock(
                    seatResource, 
                    LockResourceType.SEAT, 
                    sagaId, 
                    SAGA_LOCK_TIMEOUT, 
                    flightDetails.getPassengerCount()
                );
                
                if (seatLock.isEmpty()) {
                    log.warn("Failed to acquire seat lock for: {}", seatResource);
                    releaseAllLocks(locks);
                    return InventoryLockResult.failure("Seats not available in " + flightDetails.getSeatClass());
                }
                
                locks.add(seatLock.get());
            }
            
            log.info("Successfully acquired {} flight locks for saga: {}", locks.size(), sagaId);
            return InventoryLockResult.success(locks);
            
        } catch (Exception e) {
            log.error("Error acquiring flight locks for saga: {}", sagaId, e);
            releaseAllLocks(locks);
            return InventoryLockResult.failure("Failed to acquire flight locks: " + e.getMessage());
        }
    }
    
    /**
     * Acquires locks for hotel booking
     */
    private InventoryLockResult acquireHotelLocks(String sagaId, HotelBookingDetailsDto hotelDetails) {
        List<DistributedLock> locks = new ArrayList<>();
        
        try {
            // Lock hotel inventory
            String hotelResource = "hotel:" + hotelDetails.getHotelId();
            Optional<DistributedLock> hotelLock = lockManager.acquireLock(
                hotelResource, 
                LockResourceType.HOTEL, 
                sagaId, 
                SAGA_LOCK_TIMEOUT, 
                hotelDetails.getNumberOfRooms()
            );
            
            if (hotelLock.isEmpty()) {
                log.warn("Failed to acquire hotel lock for: {}", hotelResource);
                return InventoryLockResult.failure("Hotel not available for booking");
            }
            
            locks.add(hotelLock.get());
            
            // Lock specific room type if specified
            if (hotelDetails.getRoomType() != null) {
                String roomResource = String.format("hotel:%s:rooms:%s", 
                    hotelDetails.getHotelId(), hotelDetails.getRoomType());
                
                Optional<DistributedLock> roomLock = lockManager.acquireLock(
                    roomResource, 
                    LockResourceType.ROOM, 
                    sagaId, 
                    SAGA_LOCK_TIMEOUT, 
                    hotelDetails.getNumberOfRooms()
                );
                
                if (roomLock.isEmpty()) {
                    log.warn("Failed to acquire room lock for: {}", roomResource);
                    releaseAllLocks(locks);
                    return InventoryLockResult.failure("Rooms not available: " + hotelDetails.getRoomType());
                }
                
                locks.add(roomLock.get());
            }
            
            log.info("Successfully acquired {} hotel locks for saga: {}", locks.size(), sagaId);
            return InventoryLockResult.success(locks);
            
        } catch (Exception e) {
            log.error("Error acquiring hotel locks for saga: {}", sagaId, e);
            releaseAllLocks(locks);
            return InventoryLockResult.failure("Failed to acquire hotel locks: " + e.getMessage());
        }
    }
    
    /**
     * Acquires locks for combo booking (flight + hotel)
     */
    private InventoryLockResult acquireComboLocks(String sagaId, ComboBookingDetailsDto comboDetails) {
        List<DistributedLock> allLocks = new ArrayList<>();
        
        try {
            // Acquire flight locks
            InventoryLockResult flightResult = acquireFlightLocks(sagaId, comboDetails.getFlightDetails());
            if (!flightResult.isSuccess()) {
                return flightResult;
            }
            allLocks.addAll(flightResult.getLocks());
            
            // Acquire hotel locks
            InventoryLockResult hotelResult = acquireHotelLocks(sagaId, comboDetails.getHotelDetails());
            if (!hotelResult.isSuccess()) {
                // Release flight locks if hotel locks fail
                releaseAllLocks(allLocks);
                return hotelResult;
            }
            allLocks.addAll(hotelResult.getLocks());
            
            log.info("Successfully acquired {} combo locks for saga: {}", allLocks.size(), sagaId);
            return InventoryLockResult.success(allLocks);
            
        } catch (Exception e) {
            log.error("Error acquiring combo locks for saga: {}", sagaId, e);
            releaseAllLocks(allLocks);
            return InventoryLockResult.failure("Failed to acquire combo locks: " + e.getMessage());
        }
    }
    
    /**
     * Releases all locks owned by a saga (for compensation)
     */
    public boolean releaseAllLocksBySaga(String sagaId) {
        log.info("Releasing all locks for saga: {}", sagaId);
        
        try {
            int releasedCount = lockManager.releaseAllLocksByOwner(sagaId);
            log.info("Released {} locks for saga: {}", releasedCount, sagaId);
            return releasedCount > 0;
        } catch (Exception e) {
            log.error("Error releasing locks for saga: {}", sagaId, e);
            return false;
        }
    }
    
    /**
     * Extends locks for a saga (when processing takes longer)
     */
    public boolean extendLocksBySaga(String sagaId, Duration additionalTime) {
        log.info("Extending locks for saga: {} by: {}", sagaId, additionalTime);
        
        try {
            List<DistributedLock> locks = lockManager.getLocksByOwner(sagaId);
            boolean allExtended = true;
            
            for (DistributedLock lock : locks) {
                boolean extended = lockManager.extendLock(lock.getLockId(), sagaId, additionalTime);
                if (!extended) {
                    log.warn("Failed to extend lock: {} for saga: {}", lock.getLockId(), sagaId);
                    allExtended = false;
                }
            }
            
            log.info("Extended {}/{} locks for saga: {}", 
                locks.stream().mapToInt(l -> 1).sum(), locks.size(), sagaId);
            return allExtended;
        } catch (Exception e) {
            log.error("Error extending locks for saga: {}", sagaId, e);
            return false;
        }
    }
    
    /**
     * Validates that required locks are still active
     */
    public ValidationResult validateLocksActive(String sagaId) {
        try {
            List<DistributedLock> locks = lockManager.getLocksByOwner(sagaId);
            
            if (locks.isEmpty()) {
                return ValidationResult.invalid("No active locks found for saga: " + sagaId);
            }
            
            for (DistributedLock lock : locks) {
                if (!lock.isActive()) {
                    return ValidationResult.invalid("Lock expired or inactive: " + lock.getLockId());
                }
            }
            
            return ValidationResult.valid();
        } catch (Exception e) {
            log.error("Error validating locks for saga: {}", sagaId, e);
            return ValidationResult.invalid("Failed to validate locks: " + e.getMessage());
        }
    }
    
    /**
     * Helper method to release a list of locks
     */
    private void releaseAllLocks(List<DistributedLock> locks) {
        for (DistributedLock lock : locks) {
            try {
                lockManager.releaseLock(lock.getLockId(), lock.getOwner());
            } catch (Exception e) {
                log.error("Error releasing lock: {}", lock.getLockId(), e);
            }
        }
    }
    
    /**
     * Result of inventory lock operation
     */
    public static class InventoryLockResult {
        private final boolean success;
        private final String errorMessage;
        private final List<DistributedLock> locks;
        
        private InventoryLockResult(boolean success, String errorMessage, List<DistributedLock> locks) {
            this.success = success;
            this.errorMessage = errorMessage;
            this.locks = locks != null ? locks : new ArrayList<>();
        }
        
        public static InventoryLockResult success(List<DistributedLock> locks) {
            return new InventoryLockResult(true, null, locks);
        }
        
        public static InventoryLockResult failure(String errorMessage) {
            return new InventoryLockResult(false, errorMessage, null);
        }
        
        // Getters
        public boolean isSuccess() { return success; }
        public String getErrorMessage() { return errorMessage; }
        public List<DistributedLock> getLocks() { return locks; }
    }
}
