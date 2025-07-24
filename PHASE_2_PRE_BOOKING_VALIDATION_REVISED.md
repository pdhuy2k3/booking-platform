# Phase 2: Pre-booking Validation (COMMON-LIB FOCUSED) - 2 Days

## 🎯 **Objective**
Add inventory validation before saga start using common-lib infrastructure patterns, leveraging existing ResponseUtils, exception handling, and inventory services.

## 🔍 **Leveraging Existing Common-Lib Infrastructure**

### **✅ Already Available (NO NEW CODE NEEDED):**
- **ResponseUtils.java**: Standardized API response patterns
- **Exception Classes**: BadRequestException, NotFoundException, etc.
- **CommonConfig.java**: ObjectMapper and base configuration
- **AbstractAuditEntity.java**: Base entity patterns

## 📋 **Common-Lib Enhancements (3 files)**

### **1. Create ValidationResult.java (COMMON-LIB)**

**File: `common-lib/src/main/java/com/pdh/common/validation/ValidationResult.java`**

```java
package com.pdh.common.validation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.Map;

/**
 * Standardized validation result for all services
 * Centralized in common-lib for consistency
 */
@Data
@Builder
@AllArgsConstructor
public class ValidationResult {

    private final boolean valid;
    private final String errorMessage;
    private final String errorCode;
    private final Map<String, Object> details;

    public static ValidationResult valid() {
        return ValidationResult.builder()
            .valid(true)
            .build();
    }

    public static ValidationResult invalid(String errorMessage) {
        return ValidationResult.builder()
            .valid(false)
            .errorMessage(errorMessage)
            .errorCode("VALIDATION_FAILED")
            .build();
    }

    public static ValidationResult invalid(String errorMessage, String errorCode) {
        return ValidationResult.builder()
            .valid(false)
            .errorMessage(errorMessage)
            .errorCode(errorCode)
            .build();
    }

    public static ValidationResult invalid(String errorMessage, String errorCode, Map<String, Object> details) {
        return ValidationResult.builder()
            .valid(false)
            .errorMessage(errorMessage)
            .errorCode(errorCode)
            .details(details)
            .build();
    }
}
```

### **2. Create BaseInventoryClient.java (COMMON-LIB)**

**File: `common-lib/src/main/java/com/pdh/common/client/BaseInventoryClient.java`**

```java
package com.pdh.common.client;

import com.pdh.common.exceptions.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;

/**
 * Base class for inventory clients
 * Provides common error handling and timeout patterns
 */
@RequiredArgsConstructor
@Slf4j
public abstract class BaseInventoryClient {

    protected final WebClient webClient;
    protected final Duration defaultTimeout = Duration.ofSeconds(10);

    protected <T> T executeRequest(String uri, Object request, Class<T> responseType, String operation) {
        try {
            return webClient
                .post()
                .uri(uri)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(responseType)
                .timeout(defaultTimeout)
                .block();

        } catch (WebClientResponseException e) {
            log.error("{} failed with status: {}, body: {}", operation, e.getStatusCode(), e.getResponseBodyAsString());
            throw new BadRequestException(operation + " failed: " + e.getMessage());
        } catch (Exception e) {
            log.error("Error during {}", operation, e);
            throw new BadRequestException(operation + " service unavailable");
        }
    }
}
```

### **3. Create InventoryServiceException.java (COMMON-LIB)**

**File: `common-lib/src/main/java/com/pdh/common/exceptions/InventoryServiceException.java`**

```java
package com.pdh.common.exceptions;

/**
 * Inventory service exception - follows existing common-lib exception pattern
 */
public class InventoryServiceException extends RuntimeException {
    public InventoryServiceException(String message) {
        super(message);
    }

    public InventoryServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}
```

## 📋 **Service Files to Enhance (1 file)**

### **1. Enhance BookingController.java (USE RESPONSEUTILS)**

**File: `booking-service/src/main/java/com/pdh/booking/controller/BookingController.java`**

#### **Add Dependency (to existing class):**
```java
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Slf4j
public class BookingController {
    // ... existing dependencies remain unchanged

    // ADD THIS LINE:
    private final InventoryValidationService inventoryValidationService;

    // ... rest of existing code unchanged
}
```

#### **Replace Existing createStorefrontBooking Method (USE RESPONSEUTILS):**
```java
// REPLACE existing createStorefrontBooking() method
@PostMapping("/storefront")
public ResponseEntity<ApiResponse<StorefrontBookingResponseDto>> createStorefrontBooking(
        @Valid @RequestBody StorefrontCreateBookingRequestDto request) {
    try {
        log.info("Creating storefront booking with type: {}", request.getBookingType());

        // NEW: Validate inventory before starting saga
        ValidationResult validation = inventoryValidationService.validateInventory(
            request.getBookingType(),
            request.getProductDetails()
        );

        if (!validation.isValid()) {
            log.warn("Inventory validation failed for booking type: {}, error: {}",
                request.getBookingType(), validation.getErrorMessage());

            // Use existing ResponseUtils from common-lib
            return ResponseUtils.badRequest(validation.getErrorMessage(), validation.getErrorCode());
        }

        // EXISTING: Convert DTO to entity (unchanged)
        Booking booking = bookingDtoMapper.toEntity(request);
        booking.setBookingReference(generateBookingReference());

        // EXISTING: Start saga (unchanged)
        Booking createdBooking = bookingSagaService.startBookingSaga(booking);

        // EXISTING: Return response using ResponseUtils
        StorefrontBookingResponseDto response = bookingDtoMapper.toStorefrontResponseDto(createdBooking);
        return ResponseUtils.created(response, "Booking created successfully");

    } catch (InventoryServiceException e) {
        log.error("Inventory service error: {}", e.getMessage(), e);
        return ResponseUtils.serviceUnavailable("Unable to verify product availability. Please try again.");
    } catch (BadRequestException e) {
        log.warn("Bad request: {}", e.getMessage());
        return ResponseUtils.badRequest(e.getMessage());
    } catch (Exception e) {
        log.error("Error creating storefront booking", e);
        return ResponseUtils.internalError("An unexpected error occurred");
    }
}
```

## 📋 **Service Files to Create (7 files)**

### **1. InventoryValidationService (NEW FILE - USES COMMON-LIB)**

**File: `booking-service/src/main/java/com/pdh/booking/service/InventoryValidationService.java`**

```java
package com.pdh.booking.service;

import com.pdh.common.validation.ValidationResult;
import com.pdh.booking.client.FlightInventoryClient;
import com.pdh.booking.client.HotelInventoryClient;
import com.pdh.booking.service.ProductDetailsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Inventory validation service using common-lib ValidationResult
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryValidationService {

    private final FlightInventoryClient flightInventoryClient;
    private final HotelInventoryClient hotelInventoryClient;
    private final ProductDetailsService productDetailsService;

    public ValidationResult validateInventory(BookingType bookingType, Object productDetails) {
        log.info("Validating inventory for booking type: {}", bookingType);
        
        try {
            switch (bookingType) {
                case FLIGHT:
                    return validateFlightInventory((FlightBookingDetailsDto) productDetails);
                case HOTEL:
                    return validateHotelInventory((HotelBookingDetailsDto) productDetails);
                case COMBO:
                    return validateComboInventory((ComboBookingDetailsDto) productDetails);
                default:
                    return ValidationResult.valid();
            }
        } catch (Exception e) {
            log.error("Error validating inventory for booking type: {}", bookingType, e);
            return ValidationResult.invalid("Inventory validation failed: " + e.getMessage());
        }
    }

    private ValidationResult validateFlightInventory(FlightBookingDetailsDto flightDetails) {
        log.debug("Validating flight inventory for flight: {}", flightDetails.getFlightId());
        
        try {
            FlightAvailabilityRequest request = FlightAvailabilityRequest.builder()
                .flightId(Long.parseLong(flightDetails.getFlightId()))
                .seatClass(flightDetails.getSeatClass())
                .passengerCount(flightDetails.getPassengerCount())
                .departureDate(flightDetails.getDepartureDateTime().toLocalDate())
                .build();

            FlightAvailabilityResponse response = flightInventoryClient.checkAvailability(request);
            
            if (!response.isAvailable()) {
                return ValidationResult.invalid(
                    String.format("Flight %s is not available. Required: %d seats, Available: %d seats",
                        flightDetails.getFlightNumber(),
                        flightDetails.getPassengerCount(),
                        response.getAvailableSeats()),
                    "FLIGHT_NOT_AVAILABLE"
                );
            }

            return ValidationResult.valid();
            
        } catch (Exception e) {
            log.error("Error validating flight inventory", e);
            return InventoryValidationResult.invalid("Flight availability check failed");
        }
    }

    private InventoryValidationResult validateHotelInventory(HotelBookingDetailsDto hotelDetails) {
        log.debug("Validating hotel inventory for hotel: {}", hotelDetails.getHotelId());
        
        try {
            HotelAvailabilityRequest request = HotelAvailabilityRequest.builder()
                .hotelId(Long.parseLong(hotelDetails.getHotelId()))
                .roomType(hotelDetails.getRoomType())
                .roomCount(hotelDetails.getNumberOfRooms())
                .checkInDate(hotelDetails.getCheckInDate())
                .checkOutDate(hotelDetails.getCheckOutDate())
                .build();

            HotelAvailabilityResponse response = hotelInventoryClient.checkAvailability(request);
            
            if (!response.isAvailable()) {
                return InventoryValidationResult.invalid(
                    String.format("Hotel %s is not available. Required: %d rooms, Available: %d rooms",
                        hotelDetails.getHotelName(),
                        hotelDetails.getNumberOfRooms(),
                        response.getAvailableRooms()),
                    "HOTEL_NOT_AVAILABLE"
                );
            }

            return InventoryValidationResult.valid();
            
        } catch (Exception e) {
            log.error("Error validating hotel inventory", e);
            return InventoryValidationResult.invalid("Hotel availability check failed");
        }
    }

    private InventoryValidationResult validateComboInventory(ComboBookingDetailsDto comboDetails) {
        log.debug("Validating combo inventory");
        
        // Validate flight component
        InventoryValidationResult flightResult = validateFlightInventory(comboDetails.getFlightDetails());
        if (!flightResult.isValid()) {
            return flightResult;
        }

        // Validate hotel component
        InventoryValidationResult hotelResult = validateHotelInventory(comboDetails.getHotelDetails());
        if (!hotelResult.isValid()) {
            return hotelResult;
        }

        return InventoryValidationResult.valid();
    }
}
```

### **2. FlightInventoryClient (NEW FILE)**

**File: `booking-service/src/main/java/com/pdh/booking/client/FlightInventoryClient.java`**

```java
@Component
@RequiredArgsConstructor
@Slf4j
public class FlightInventoryClient {

    private final WebClient webClient;
    private final ServiceUrlConfig serviceUrlConfig;

    @Value("${services.flight-service.timeout:10s}")
    private Duration timeout;

    public FlightAvailabilityResponse checkAvailability(FlightAvailabilityRequest request) {
        log.debug("Checking flight availability for flight: {}", request.getFlightId());
        
        try {
            return webClient
                .post()
                .uri(serviceUrlConfig.getFlightServiceUrl() + "/internal/availability/check")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(FlightAvailabilityResponse.class)
                .timeout(timeout)
                .block();
                
        } catch (WebClientResponseException e) {
            log.error("Flight availability check failed with status: {}, body: {}", 
                e.getStatusCode(), e.getResponseBodyAsString());
            throw new InventoryServiceException("Flight availability check failed", e);
        } catch (Exception e) {
            log.error("Error checking flight availability", e);
            throw new InventoryServiceException("Flight service unavailable", e);
        }
    }
}
```

### **3. HotelInventoryClient (NEW FILE)**

**File: `booking-service/src/main/java/com/pdh/booking/client/HotelInventoryClient.java`**

```java
@Component
@RequiredArgsConstructor
@Slf4j
public class HotelInventoryClient {

    private final WebClient webClient;
    private final ServiceUrlConfig serviceUrlConfig;

    @Value("${services.hotel-service.timeout:10s}")
    private Duration timeout;

    public HotelAvailabilityResponse checkAvailability(HotelAvailabilityRequest request) {
        log.debug("Checking hotel availability for hotel: {}", request.getHotelId());
        
        try {
            return webClient
                .post()
                .uri(serviceUrlConfig.getHotelServiceUrl() + "/internal/availability/check")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(HotelAvailabilityResponse.class)
                .timeout(timeout)
                .block();
                
        } catch (WebClientResponseException e) {
            log.error("Hotel availability check failed with status: {}, body: {}", 
                e.getStatusCode(), e.getResponseBodyAsString());
            throw new InventoryServiceException("Hotel availability check failed", e);
        } catch (Exception e) {
            log.error("Error checking hotel availability", e);
            throw new InventoryServiceException("Hotel service unavailable", e);
        }
    }
}
```

### **4. InventoryValidationResult (NEW FILE)**

**File: `booking-service/src/main/java/com/pdh/booking/dto/validation/InventoryValidationResult.java`**

```java
@Data
@Builder
@AllArgsConstructor
public class InventoryValidationResult {
    
    private final boolean valid;
    private final String errorMessage;
    private final String errorCode;
    private final Map<String, Object> details;

    public static InventoryValidationResult valid() {
        return InventoryValidationResult.builder()
            .valid(true)
            .build();
    }

    public static InventoryValidationResult invalid(String errorMessage) {
        return InventoryValidationResult.builder()
            .valid(false)
            .errorMessage(errorMessage)
            .errorCode("INVENTORY_NOT_AVAILABLE")
            .build();
    }

    public static InventoryValidationResult invalid(String errorMessage, String errorCode) {
        return InventoryValidationResult.builder()
            .valid(false)
            .errorMessage(errorMessage)
            .errorCode(errorCode)
            .build();
    }
}
```

### **5-8. Availability Request/Response DTOs (NEW FILES)**

**File: `booking-service/src/main/java/com/pdh/booking/dto/validation/FlightAvailabilityRequest.java`**
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlightAvailabilityRequest {
    @NotNull
    private Long flightId;
    @NotNull
    private String seatClass;
    @NotNull
    private Integer passengerCount;
    @NotNull
    private LocalDate departureDate;
}
```

**File: `booking-service/src/main/java/com/pdh/booking/dto/validation/FlightAvailabilityResponse.java`**
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlightAvailabilityResponse {
    private Long flightId;
    private boolean available;
    private Integer availableSeats;
    private String seatClass;
    private LocalDate departureDate;
    private Instant checkedAt;
}
```

**File: `booking-service/src/main/java/com/pdh/booking/dto/validation/HotelAvailabilityRequest.java`**
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelAvailabilityRequest {
    @NotNull
    private Long hotelId;
    @NotNull
    private String roomType;
    @NotNull
    private Integer roomCount;
    @NotNull
    private LocalDate checkInDate;
    @NotNull
    private LocalDate checkOutDate;
}
```

**File: `booking-service/src/main/java/com/pdh/booking/dto/validation/HotelAvailabilityResponse.java`**
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelAvailabilityResponse {
    private Long hotelId;
    private boolean available;
    private Integer availableRooms;
    private String roomType;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Instant checkedAt;
}
```

### **9. InternalFlightController (NEW FILE)**

**File: `flight-service/src/main/java/com/pdh/flight/controller/InternalFlightController.java`**

```java
@RestController
@RequestMapping("/internal")
@RequiredArgsConstructor
@Slf4j
public class InternalFlightController {

    private final FlightInventoryService flightInventoryService;

    @PostMapping("/availability/check")
    public ResponseEntity<FlightAvailabilityResponse> checkAvailability(
            @Valid @RequestBody FlightAvailabilityRequest request) {

        log.debug("Checking availability for flight: {}", request.getFlightId());

        try {
            // Use existing FlightInventoryService.checkAvailability() method
            boolean available = flightInventoryService.checkAvailability(
                request.getFlightId(),
                request.getSeatClass(),
                request.getPassengerCount(),
                request.getDepartureDate()
            );

            int availableSeats = available ?
                flightInventoryService.getAvailableSeats(
                    request.getFlightId(),
                    request.getSeatClass(),
                    request.getDepartureDate()) : 0;

            FlightAvailabilityResponse response = FlightAvailabilityResponse.builder()
                .flightId(request.getFlightId())
                .available(available)
                .availableSeats(availableSeats)
                .seatClass(request.getSeatClass())
                .departureDate(request.getDepartureDate())
                .checkedAt(Instant.now())
                .build();

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error checking flight availability", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
```

### **10. InternalHotelController (NEW FILE)**

**File: `hotel-service/src/main/java/com/pdh/hotel/controller/InternalHotelController.java`**

```java
@RestController
@RequestMapping("/internal")
@RequiredArgsConstructor
@Slf4j
public class InternalHotelController {

    private final HotelInventoryService hotelInventoryService;

    @PostMapping("/availability/check")
    public ResponseEntity<HotelAvailabilityResponse> checkAvailability(
            @Valid @RequestBody HotelAvailabilityRequest request) {

        log.debug("Checking availability for hotel: {}", request.getHotelId());

        try {
            // Use existing HotelInventoryService.checkAvailability() method
            boolean available = hotelInventoryService.checkAvailability(
                request.getHotelId(),
                request.getRoomType(),
                request.getRoomCount(),
                request.getCheckInDate(),
                request.getCheckOutDate()
            );

            int availableRooms = available ?
                hotelInventoryService.getAvailableRooms(
                    request.getHotelId(),
                    request.getRoomType(),
                    request.getCheckInDate()) : 0;

            HotelAvailabilityResponse response = HotelAvailabilityResponse.builder()
                .hotelId(request.getHotelId())
                .available(available)
                .availableRooms(availableRooms)
                .roomType(request.getRoomType())
                .checkInDate(request.getCheckInDate())
                .checkOutDate(request.getCheckOutDate())
                .checkedAt(Instant.now())
                .build();

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error checking hotel availability", e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
```

## ✅ **Phase 2 Success Criteria**

1. **Pre-booking validation prevents failed bookings** ✅
2. **Inventory availability checked before saga start** ✅
3. **Proper error responses for unavailable inventory** ✅
4. **Internal endpoints responding correctly** ✅
5. **Leverages existing inventory services** ✅

## 🧪 **Testing Strategy**

### **Unit Tests:**
- Test InventoryValidationService for all booking types
- Test client services with mocked responses
- Test controller validation logic

### **Integration Tests:**
- Test end-to-end validation flow
- Test internal endpoints with real inventory data
- Test error handling for service failures

## 📊 **Deployment Notes**

- Deploy internal endpoints first
- Test availability checking independently
- Enable validation with feature flag
- Monitor validation performance and accuracy
```
