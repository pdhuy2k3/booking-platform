# Phase 4: Inventory Locking (COMMON-LIB FOCUSED) - 2 Days

## 🎯 **Objective**
Add distributed locking and temporary reservations using common-lib infrastructure, leveraging existing Redis setup and inventory services while creating reusable locking components.

## 🔍 **Leveraging Existing Infrastructure**

### **✅ Already Available:**
- **Redis Infrastructure**: Already configured in docker-compose.yml
- **Existing Inventory Services**: FlightInventoryService, HotelInventoryService with full CRUD
- **AbstractAuditEntity**: Base entity with audit fields
- **Common Exception Patterns**: From common-lib exception hierarchy

## 📋 **Common-Lib Enhancements (3 files)**

### **1. Create DistributedLockService.java (COMMON-LIB)**

**File: `common-lib/src/main/java/com/pdh/common/lock/DistributedLockService.java`**

```java
package com.pdh.common.lock;

import com.pdh.common.exceptions.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Collections;
import java.util.UUID;
import java.util.function.Supplier;

/**
 * Distributed locking service using Redis
 * Centralized in common-lib for reuse across all services
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DistributedLockService {

    private final RedisTemplate<String, Object> redisTemplate;

    public boolean acquireLock(String lockKey, String lockValue, Duration timeout) {
        try {
            Boolean acquired = redisTemplate.opsForValue()
                .setIfAbsent(lockKey, lockValue, timeout);

            if (Boolean.TRUE.equals(acquired)) {
                log.debug("Lock acquired: {}", lockKey);
                return true;
            } else {
                log.debug("Failed to acquire lock: {}", lockKey);
                return false;
            }
        } catch (Exception e) {
            log.error("Error acquiring lock: {}", lockKey, e);
            return false;
        }
    }

    public boolean releaseLock(String lockKey, String lockValue) {
        try {
            // Use Lua script to ensure atomic check-and-delete
            String luaScript =
                "if redis.call('get', KEYS[1]) == ARGV[1] then " +
                "    return redis.call('del', KEYS[1]) " +
                "else " +
                "    return 0 " +
                "end";

            DefaultRedisScript<Long> script = new DefaultRedisScript<>();
            script.setScriptText(luaScript);
            script.setResultType(Long.class);

            Long result = redisTemplate.execute(script,
                Collections.singletonList(lockKey), lockValue);

            boolean released = result != null && result == 1;
            if (released) {
                log.debug("Lock released: {}", lockKey);
            } else {
                log.debug("Failed to release lock (not owner): {}", lockKey);
            }

            return released;
        } catch (Exception e) {
            log.error("Error releasing lock: {}", lockKey, e);
            return false;
        }
    }

    public <T> T executeWithLock(String lockKey, Duration timeout, Supplier<T> action) {
        String lockValue = UUID.randomUUID().toString();

        if (!acquireLock(lockKey, lockValue, timeout)) {
            throw new LockAcquisitionException("Failed to acquire lock: " + lockKey);
        }

        try {
            return action.get();
        } finally {
            releaseLock(lockKey, lockValue);
        }
    }

    public void executeWithLock(String lockKey, Duration timeout, Runnable action) {
        executeWithLock(lockKey, timeout, () -> {
            action.run();
            return null;
        });
    }
}
```

### **2. Create RedisConfig.java (COMMON-LIB)**

**File: `common-lib/src/main/java/com/pdh/common/config/RedisConfig.java`**

```java
package com.pdh.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;

/**
 * Redis configuration for distributed locking and caching
 * Centralized in common-lib for consistency across services
 */
@Configuration
@EnableCaching
public class RedisConfig {

    @Value("${spring.redis.host:localhost}")
    private String redisHost;

    @Value("${spring.redis.port:6379}")
    private int redisPort;

    @Bean
    public LettuceConnectionFactory redisConnectionFactory() {
        return new LettuceConnectionFactory(new RedisStandaloneConfiguration(redisHost, redisPort));
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate() {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(redisConnectionFactory());

        // Use String serialization for keys
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());

        // Use JSON serialization for values
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());

        template.afterPropertiesSet();
        return template;
    }

    @Bean
    public CacheManager cacheManager() {
        RedisCacheManager.Builder builder = RedisCacheManager
            .RedisCacheManagerBuilder
            .fromConnectionFactory(redisConnectionFactory())
            .cacheDefaults(cacheConfiguration(Duration.ofMinutes(10)));

        return builder.build();
    }

    private RedisCacheConfiguration cacheConfiguration(Duration ttl) {
        return RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(ttl)
            .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
            .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()));
    }
}
```

### **3. Create LockAcquisitionException.java (COMMON-LIB)**

**File: `common-lib/src/main/java/com/pdh/common/exceptions/LockAcquisitionException.java`**

```java
package com.pdh.common.exceptions;

/**
 * Exception thrown when distributed lock acquisition fails
 * Follows existing common-lib exception patterns
 */
public class LockAcquisitionException extends RuntimeException {
    public LockAcquisitionException(String message) {
        super(message);
    }

    public LockAcquisitionException(String message, Throwable cause) {
        super(message, cause);
    }
}
```

## 📋 **Service Files to Enhance (4 files)**

### **1. Enhance FlightInventory.java**

**File: `flight-service/src/main/java/com/pdh/flight/model/FlightInventory.java`**

#### **Add to Existing Entity:**
```java
@Entity
@Table(name = "flight_inventory")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlightInventory extends AbstractAuditEntity {
    // ... existing fields remain unchanged
    
    // ADD these new fields:
    
    @Column(name = "temporarily_held_seats", nullable = false)
    private Integer temporarilyHeldSeats = 0;

    // ADD optimistic locking
    @Version
    @Column(name = "version")
    private Long version;
    
    // ADD validation and helper methods:
    
    @PreUpdate
    @PrePersist
    public void validateInventory() {
        if (availableSeats < 0) {
            throw new IllegalStateException("Available seats cannot be negative");
        }
        if (reservedSeats + temporarilyHeldSeats + availableSeats != totalSeats) {
            throw new IllegalStateException("Seat counts do not add up to total seats");
        }
    }

    public boolean canReserve(int requestedSeats) {
        return availableSeats >= requestedSeats;
    }

    public void holdSeatsTemporarily(int seats) {
        if (!canReserve(seats)) {
            throw new InsufficientInventoryException("Not enough available seats for temporary hold");
        }
        this.availableSeats -= seats;
        this.temporarilyHeldSeats += seats;
    }

    public void releaseTemporaryHold(int seats) {
        if (this.temporarilyHeldSeats < seats) {
            throw new IllegalStateException("Cannot release more seats than temporarily held");
        }
        this.temporarilyHeldSeats -= seats;
        this.availableSeats += seats;
    }

    public void confirmTemporaryReservation(int seats) {
        if (this.temporarilyHeldSeats < seats) {
            throw new IllegalStateException("Cannot confirm more seats than temporarily held");
        }
        this.temporarilyHeldSeats -= seats;
        this.reservedSeats += seats;
    }
    
    // ... rest of existing code unchanged
}
```

### **2. Enhance RoomAvailability.java**

**File: `hotel-service/src/main/java/com/pdh/hotel/model/RoomAvailability.java`**

#### **Add Similar Fields and Methods (same pattern as FlightInventory):**
```java
@Entity
@Table(name = "room_availability")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomAvailability extends AbstractAuditEntity {
    // ... existing fields remain unchanged
    
    // ADD these new fields:
    
    @Column(name = "temporarily_held_rooms", nullable = false)
    private Integer temporarilyHeldRooms = 0;

    @Version
    @Column(name = "version")
    private Long version;
    
    // ADD similar validation and helper methods as FlightInventory
    // (following same pattern)
}
```

### **3. Enhance FlightInventoryService.java**

**File: `flight-service/src/main/java/com/pdh/flight/service/FlightInventoryService.java`**

#### **Add to Existing Service:**
```java
@Service
@RequiredArgsConstructor
@Slf4j
public class FlightInventoryService {
    // ... existing dependencies remain unchanged
    
    // ADD these new dependencies:
    private final TemporaryFlightReservationRepository temporaryReservationRepository;
    private final DistributedLockService lockService;
    
    // ADD new temporary reservation methods:
    
    @Retryable(value = {OptimisticLockingFailureException.class}, maxAttempts = 3, backoff = @Backoff(delay = 100))
    @Transactional
    public boolean reserveSeatsTemporary(Long flightId, String seatClass, Integer passengerCount, 
                                       LocalDate departureDate, String reservationId, Instant expiresAt) {
        
        log.info("Creating temporary reservation: {} for flight: {}, seats: {}", 
                reservationId, flightId, passengerCount);
        
        String lockKey = createInventoryLockKey(flightId, seatClass, departureDate);
        
        try {
            return lockService.executeWithLock(lockKey, Duration.ofSeconds(30), () -> {
                // Use existing inventory lookup
                FlightInventory inventory = flightInventoryRepository
                    .findByFlightIdAndSeatClassAndDepartureDate(flightId, seatClass, departureDate)
                    .orElseThrow(() -> new InventoryNotFoundException("Flight inventory not found"));

                if (!inventory.canReserve(passengerCount)) {
                    log.warn("Insufficient seats for flight: {}, requested: {}, available: {}", 
                            flightId, passengerCount, inventory.getAvailableSeats());
                    return false;
                }

                // Hold seats temporarily
                inventory.holdSeatsTemporarily(passengerCount);
                flightInventoryRepository.save(inventory);

                // Create temporary reservation record
                TemporaryFlightReservation tempReservation = TemporaryFlightReservation.builder()
                    .reservationId(reservationId)
                    .flightId(flightId)
                    .seatClass(seatClass)
                    .departureDate(departureDate)
                    .passengerCount(passengerCount)
                    .expiresAt(expiresAt)
                    .build();

                temporaryReservationRepository.save(tempReservation);

                log.info("Temporary reservation created successfully: {}", reservationId);
                return true;
            });
            
        } catch (LockAcquisitionException e) {
            log.warn("Failed to acquire inventory lock for flight: {}", flightId);
            return false;
        } catch (OptimisticLockingFailureException e) {
            log.warn("Optimistic locking failure for flight inventory, retrying...");
            throw e; // Will be retried by @Retryable
        } catch (Exception e) {
            log.error("Error creating temporary reservation: {}", reservationId, e);
            return false;
        }
    }

    @Transactional
    public boolean confirmTemporaryReservation(String reservationId, UUID bookingId, String sagaId) {
        log.info("Confirming temporary reservation: {} for booking: {}", reservationId, bookingId);
        
        try {
            TemporaryFlightReservation tempReservation = temporaryReservationRepository
                .findById(reservationId)
                .orElseThrow(() -> new ReservationNotFoundException("Temporary reservation not found"));

            if (!tempReservation.isActive()) {
                log.warn("Temporary reservation is not active: {}, status: {}", 
                        reservationId, tempReservation.getStatus());
                return false;
            }

            String lockKey = createInventoryLockKey(
                tempReservation.getFlightId(), 
                tempReservation.getSeatClass(), 
                tempReservation.getDepartureDate()
            );

            return lockService.executeWithLock(lockKey, Duration.ofSeconds(30), () -> {
                // Update inventory to confirm reservation
                FlightInventory inventory = flightInventoryRepository
                    .findByFlightIdAndSeatClassAndDepartureDate(
                        tempReservation.getFlightId(), 
                        tempReservation.getSeatClass(), 
                        tempReservation.getDepartureDate())
                    .orElseThrow(() -> new InventoryNotFoundException("Flight inventory not found"));

                inventory.confirmTemporaryReservation(tempReservation.getPassengerCount());
                flightInventoryRepository.save(inventory);

                // Update temporary reservation
                tempReservation.setBookingId(bookingId);
                tempReservation.setSagaId(sagaId);
                tempReservation.confirm();
                temporaryReservationRepository.save(tempReservation);

                // Create permanent reservation using existing logic
                createPermanentReservation(tempReservation, bookingId, sagaId);

                log.info("Temporary reservation confirmed successfully: {}", reservationId);
                return true;
            });

        } catch (Exception e) {
            log.error("Error confirming temporary reservation: {}", reservationId, e);
            return false;
        }
    }

    @Transactional
    public void releaseTemporaryReservation(String reservationId) {
        log.info("Releasing temporary reservation: {}", reservationId);
        
        try {
            TemporaryFlightReservation tempReservation = temporaryReservationRepository
                .findById(reservationId)
                .orElse(null);

            if (tempReservation == null || !tempReservation.isActive()) {
                log.debug("Temporary reservation not found or not active: {}", reservationId);
                return;
            }

            String lockKey = createInventoryLockKey(
                tempReservation.getFlightId(), 
                tempReservation.getSeatClass(), 
                tempReservation.getDepartureDate()
            );

            lockService.executeWithLock(lockKey, Duration.ofSeconds(30), () -> {
                // Release held seats back to inventory
                FlightInventory inventory = flightInventoryRepository
                    .findByFlightIdAndSeatClassAndDepartureDate(
                        tempReservation.getFlightId(), 
                        tempReservation.getSeatClass(), 
                        tempReservation.getDepartureDate())
                    .orElse(null);

                if (inventory != null) {
                    inventory.releaseTemporaryHold(tempReservation.getPassengerCount());
                    flightInventoryRepository.save(inventory);
                }

                // Update temporary reservation status
                tempReservation.release();
                temporaryReservationRepository.save(tempReservation);

                log.info("Temporary reservation released successfully: {}", reservationId);
                return null;
            });

        } catch (Exception e) {
            log.error("Error releasing temporary reservation: {}", reservationId, e);
        }
    }

    // ADD cleanup scheduled job
    @Scheduled(fixedRate = 60000) // Run every minute
    @Transactional
    public void cleanupExpiredReservations() {
        log.debug("Cleaning up expired temporary reservations");
        
        List<TemporaryFlightReservation> expiredReservations = temporaryReservationRepository
            .findByStatusAndExpiresAtBefore(TemporaryReservationStatus.ACTIVE, Instant.now());

        for (TemporaryFlightReservation reservation : expiredReservations) {
            try {
                releaseTemporaryReservation(reservation.getReservationId());
                reservation.expire();
                temporaryReservationRepository.save(reservation);
                
                log.info("Expired temporary reservation cleaned up: {}", reservation.getReservationId());
            } catch (Exception e) {
                log.error("Error cleaning up expired reservation: {}", reservation.getReservationId(), e);
            }
        }
    }

    // ADD helper methods
    private String createInventoryLockKey(Long flightId, String seatClass, LocalDate departureDate) {
        return String.format("flight_inventory_lock:%d:%s:%s", flightId, seatClass, departureDate);
    }

    private void createPermanentReservation(TemporaryFlightReservation tempReservation, 
                                          UUID bookingId, String sagaId) {
        // Use existing reservation creation logic
        // This would integrate with existing FlightReservation entity if it exists
    }
    
    // ... rest of existing methods unchanged
}
```

### **4. Enhance HotelInventoryService.java**

**File: `hotel-service/src/main/java/com/pdh/hotel/service/HotelInventoryService.java`**

#### **Add Similar Methods (same pattern as FlightInventoryService):**
```java
// ADD similar temporary reservation methods as FlightInventoryService
// Following the same patterns for hotel inventory management
```

## 📋 **New Files to Create (5 files)**

### **1. DistributedLockService (NEW FILE)**

**File: `common-lib/src/main/java/com/pdh/common/lock/DistributedLockService.java`**

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class DistributedLockService {

    private final RedisTemplate<String, Object> redisTemplate;
    
    @Value("${distributed-lock.default-timeout:30}")
    private int defaultLockTimeoutSeconds;

    public boolean acquireLock(String lockKey, String lockValue, Duration timeout) {
        try {
            Boolean acquired = redisTemplate.opsForValue()
                .setIfAbsent(lockKey, lockValue, timeout);
            
            if (Boolean.TRUE.equals(acquired)) {
                log.debug("Lock acquired: {}", lockKey);
                return true;
            } else {
                log.debug("Failed to acquire lock: {}", lockKey);
                return false;
            }
        } catch (Exception e) {
            log.error("Error acquiring lock: {}", lockKey, e);
            return false;
        }
    }

    public boolean releaseLock(String lockKey, String lockValue) {
        try {
            // Use Lua script to ensure atomic check-and-delete
            String luaScript = 
                "if redis.call('get', KEYS[1]) == ARGV[1] then " +
                "    return redis.call('del', KEYS[1]) " +
                "else " +
                "    return 0 " +
                "end";

            DefaultRedisScript<Long> script = new DefaultRedisScript<>();
            script.setScriptText(luaScript);
            script.setResultType(Long.class);

            Long result = redisTemplate.execute(script, 
                Collections.singletonList(lockKey), lockValue);

            boolean released = result != null && result == 1;
            if (released) {
                log.debug("Lock released: {}", lockKey);
            } else {
                log.debug("Failed to release lock (not owner): {}", lockKey);
            }
            
            return released;
        } catch (Exception e) {
            log.error("Error releasing lock: {}", lockKey, e);
            return false;
        }
    }

    public <T> T executeWithLock(String lockKey, Duration timeout, Supplier<T> action) {
        String lockValue = UUID.randomUUID().toString();
        
        if (!acquireLock(lockKey, lockValue, timeout)) {
            throw new LockAcquisitionException("Failed to acquire lock: " + lockKey);
        }
        
        try {
            return action.get();
        } finally {
            releaseLock(lockKey, lockValue);
        }
    }

    public void executeWithLock(String lockKey, Duration timeout, Runnable action) {
        executeWithLock(lockKey, timeout, () -> {
            action.run();
            return null;
        });
    }
}
```

### **2. RedisConfig (NEW FILE)**

**File: `common-lib/src/main/java/com/pdh/common/config/RedisConfig.java`**

```java
@Configuration
@EnableCaching
@RequiredArgsConstructor
public class RedisConfig {

    @Value("${spring.redis.host:localhost}")
    private String redisHost;

    @Value("${spring.redis.port:6379}")
    private int redisPort;

    @Bean
    public LettuceConnectionFactory redisConnectionFactory() {
        return new LettuceConnectionFactory(new RedisStandaloneConfiguration(redisHost, redisPort));
    }

    @Bean
    public RedisTemplate<String, Object> redisTemplate() {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(redisConnectionFactory());
        
        // Use String serialization for keys
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());
        
        // Use JSON serialization for values
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());
        
        template.afterPropertiesSet();
        return template;
    }

    @Bean
    public CacheManager cacheManager() {
        RedisCacheManager.Builder builder = RedisCacheManager
            .RedisCacheManagerBuilder
            .fromConnectionFactory(redisConnectionFactory())
            .cacheDefaults(cacheConfiguration(Duration.ofMinutes(10)));
        
        return builder.build();
    }

    private RedisCacheConfiguration cacheConfiguration(Duration ttl) {
        return RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(ttl)
            .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
            .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()));
    }
}
```

### **3. TemporaryFlightReservation (NEW FILE)**

**File: `flight-service/src/main/java/com/pdh/flight/model/TemporaryFlightReservation.java`**

```java
@Entity
@Table(name = "temporary_flight_reservations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TemporaryFlightReservation extends AbstractAuditEntity {

    @Id
    @Column(name = "reservation_id")
    private String reservationId = UUID.randomUUID().toString();

    @Column(name = "flight_id", nullable = false)
    private Long flightId;

    @Column(name = "seat_class", nullable = false)
    private String seatClass;

    @Column(name = "departure_date", nullable = false)
    private LocalDate departureDate;

    @Column(name = "passenger_count", nullable = false)
    private Integer passengerCount;

    @Column(name = "booking_id")
    private UUID bookingId;

    @Column(name = "saga_id")
    private String sagaId;

    @Column(name = "customer_id")
    private UUID customerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private TemporaryReservationStatus status = TemporaryReservationStatus.ACTIVE;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "confirmed_at")
    private Instant confirmedAt;

    @Column(name = "released_at")
    private Instant releasedAt;

    public boolean isExpired() {
        return Instant.now().isAfter(expiresAt);
    }

    public boolean isActive() {
        return status == TemporaryReservationStatus.ACTIVE && !isExpired();
    }

    public void confirm() {
        this.status = TemporaryReservationStatus.CONFIRMED;
        this.confirmedAt = Instant.now();
    }

    public void release() {
        this.status = TemporaryReservationStatus.RELEASED;
        this.releasedAt = Instant.now();
    }

    public void expire() {
        this.status = TemporaryReservationStatus.EXPIRED;
        this.releasedAt = Instant.now();
    }
}

enum TemporaryReservationStatus {
    ACTIVE,
    CONFIRMED,
    RELEASED,
    EXPIRED
}
```

### **4. TemporaryHotelReservation (NEW FILE)**

**File: `hotel-service/src/main/java/com/pdh/hotel/model/TemporaryHotelReservation.java`**

```java
// Similar structure to TemporaryFlightReservation
// Adapted for hotel-specific fields (hotelId, roomType, etc.)
```

### **5. ConcurrentBookingPreventionService (NEW FILE)**

**File: `booking-service/src/main/java/com/pdh/booking/service/ConcurrentBookingPreventionService.java`**

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class ConcurrentBookingPreventionService {

    private final DistributedLockService lockService;
    private final RedisTemplate<String, Object> redisTemplate;

    public boolean checkAndPreventConcurrentBooking(UUID customerId, Object productDetails) {
        String lockKey = createCustomerBookingLockKey(customerId);
        String lockValue = UUID.randomUUID().toString();
        Duration lockTimeout = Duration.ofMinutes(5);
        
        if (!lockService.acquireLock(lockKey, lockValue, lockTimeout)) {
            log.warn("Customer {} already has an active booking process", customerId);
            return false;
        }
        
        try {
            // Check for recent booking attempts
            if (hasRecentBookingAttempt(customerId, productDetails)) {
                log.warn("Customer {} has recent booking attempt for same products", customerId);
                return false;
            }
            
            // Record this booking attempt
            recordBookingAttempt(customerId, productDetails);
            return true;
            
        } finally {
            lockService.releaseLock(lockKey, lockValue);
        }
    }

    public void releaseCustomerBookingLock(UUID customerId) {
        String lockKey = createCustomerBookingLockKey(customerId);
        redisTemplate.delete(lockKey);
    }

    private boolean hasRecentBookingAttempt(UUID customerId, Object productDetails) {
        String key = createBookingAttemptKey(customerId, productDetails);
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    private void recordBookingAttempt(UUID customerId, Object productDetails) {
        String key = createBookingAttemptKey(customerId, productDetails);
        redisTemplate.opsForValue().set(key, "attempted", Duration.ofMinutes(2));
    }

    private String createCustomerBookingLockKey(UUID customerId) {
        return "customer_booking_lock:" + customerId;
    }

    private String createBookingAttemptKey(UUID customerId, Object productDetails) {
        String productHash = Integer.toHexString(productDetails.hashCode());
        return "booking_attempt:" + customerId + ":" + productHash;
    }
}
```

## 📊 **Database Schema Changes**

### **Add Version Control and Temporary Hold Fields:**
```sql
-- Flight inventory enhancements
ALTER TABLE flight_inventory 
ADD COLUMN temporarily_held_seats INTEGER NOT NULL DEFAULT 0,
ADD COLUMN version BIGINT NOT NULL DEFAULT 0;

-- Hotel inventory enhancements  
ALTER TABLE room_availability
ADD COLUMN temporarily_held_rooms INTEGER NOT NULL DEFAULT 0,
ADD COLUMN version BIGINT NOT NULL DEFAULT 0;

-- Temporary reservations tables
CREATE TABLE temporary_flight_reservations (
    reservation_id VARCHAR(36) PRIMARY KEY,
    flight_id BIGINT NOT NULL,
    seat_class VARCHAR(20) NOT NULL,
    departure_date DATE NOT NULL,
    passenger_count INTEGER NOT NULL,
    booking_id UUID,
    saga_id VARCHAR(36),
    customer_id UUID,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    released_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE temporary_hotel_reservations (
    reservation_id VARCHAR(36) PRIMARY KEY,
    hotel_id BIGINT NOT NULL,
    room_type VARCHAR(50) NOT NULL,
    room_count INTEGER NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    booking_id UUID,
    saga_id VARCHAR(36),
    customer_id UUID,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    released_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_temp_flight_reservations_status ON temporary_flight_reservations(status);
CREATE INDEX idx_temp_flight_reservations_expires_at ON temporary_flight_reservations(expires_at);
CREATE INDEX idx_temp_hotel_reservations_status ON temporary_hotel_reservations(status);
CREATE INDEX idx_temp_hotel_reservations_expires_at ON temporary_hotel_reservations(expires_at);
```

## ✅ **Phase 4 Success Criteria**

1. **Race conditions prevented with distributed locking** ✅
2. **Temporary reservations with expiration working** ✅
3. **Optimistic locking preventing inventory conflicts** ✅
4. **Cleanup mechanisms removing expired reservations** ✅
5. **Redis integration working correctly** ✅

## 🧪 **Testing Strategy**

### **Concurrency Tests:**
- Test multiple simultaneous booking attempts
- Test optimistic locking failure scenarios
- Test temporary reservation expiration

### **Integration Tests:**
- Test Redis connectivity and locking
- Test cleanup job execution
- Test end-to-end locking flow

## 📊 **Deployment Notes**

- Deploy Redis configuration first
- Add database schema changes
- Enable locking with feature flags
- Monitor lock acquisition and release
- Monitor temporary reservation cleanup
