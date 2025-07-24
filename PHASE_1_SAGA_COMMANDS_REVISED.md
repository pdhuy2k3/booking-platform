# Phase 1: Saga Command Enhancement (COMMON-LIB FOCUSED) - 1 Day

## 🎯 **Objective**
Enhance existing saga orchestration with typed commands by leveraging existing common-lib infrastructure (BaseKafkaConfig, ExtendedOutboxEvent, SagaState) while maintaining backward compatibility.

## 🔍 **Leveraging Existing Common-Lib Infrastructure**

### **✅ Already Available (NO NEW CODE NEEDED):**
- **BaseKafkaConfig.java**: Complete Kafka producer/consumer configuration
- **ExtendedOutboxEvent.java**: Saga event publishing with `createSagaEvent()` factory
- **SagaState.java**: All required saga states already defined
- **ResponseUtils.java**: Standardized API response patterns
- **BaseCdcConsumer.java**: CDC event handling framework

## 📋 **Common-Lib Enhancements (2 files)**

### **1. Enhance BaseKafkaConfig.java (COMMON-LIB)**

**File: `common-lib/src/main/java/com/pdh/common/kafka/config/BaseKafkaConfig.java`**

#### **Add Saga Command Support (to existing class):**
```java
// ADD these methods to existing BaseKafkaConfig.java
@Bean
public KafkaTemplate<String, String> sagaCommandKafkaTemplate() {
    KafkaTemplate<String, String> template = new KafkaTemplate<>(producerFactory());
    template.setDefaultTopic("booking-saga-commands");
    return template;
}

@Bean
public ConcurrentKafkaListenerContainerFactory<String, String> sagaCommandListenerContainerFactory() {
    ConcurrentKafkaListenerContainerFactory<String, String> factory =
        new ConcurrentKafkaListenerContainerFactory<>();
    factory.setConsumerFactory(consumerFactory());
    factory.getContainerProperties().setAckMode(ContainerProperties.AckMode.MANUAL_IMMEDIATE);
    return factory;
}

@Bean
public NewTopic sagaCommandsTopic() {
    return TopicBuilder.name("booking-saga-commands")
        .partitions(3)
        .replicas(1)
        .config(TopicConfig.CLEANUP_POLICY_CONFIG, TopicConfig.CLEANUP_POLICY_DELETE)
        .config(TopicConfig.RETENTION_MS_CONFIG, "604800000") // 7 days
        .build();
}
```

### **2. Enhance CommonConfig.java (COMMON-LIB)**

**File: `common-lib/src/main/java/com/pdh/common/config/CommonConfig.java`**

#### **Add Validation Support (to existing class):**
```java
// ADD to existing CommonConfig.java
@Bean
@ConditionalOnMissingBean
public Validator validator() {
    return Validation.buildDefaultValidatorFactory().getValidator();
}
```

## 📋 **Service Files to Enhance (3 files)**

### **1. Enhance BookingSagaOrchestrator.java**

**File: `booking-service/src/main/java/com/pdh/booking/saga/BookingSagaOrchestrator.java`**

#### **Add Dependencies (to existing class):**
```java
@Component
@RequiredArgsConstructor
@Slf4j
public class BookingSagaOrchestrator {
    // ... existing dependencies remain unchanged

    // ADD THESE LINES (leveraging common-lib):
    private final KafkaTemplate<String, String> sagaCommandKafkaTemplate; // From BaseKafkaConfig
    private final SagaCommandValidator sagaCommandValidator; // From common-lib

    // ... rest of existing code unchanged
}
```

#### **Replace Existing Command Publishing Methods (LEVERAGE EXISTING OUTBOX):**
```java
// REPLACE existing publishFlightReservationCommand() method
private void publishFlightReservationCommand(BookingSagaInstance saga) {
    log.info("Publishing flight reservation command for saga: {}", saga.getSagaId());

    saga.setCurrentState(SagaState.FLIGHT_RESERVATION_PENDING); // Use existing SagaState enum
    sagaRepository.save(saga);

    try {
        // 1. Use existing ExtendedOutboxEvent for backward compatibility
        ExtendedOutboxEvent sagaEvent = ExtendedOutboxEvent.createSagaEvent(
            "RESERVE_FLIGHT",
            saga.getSagaId(),
            saga.getBookingId(),
            getUserId(saga),
            createCommandPayload(saga, "RESERVE_FLIGHT")
        );
        eventPublisher.publishEvent(sagaEvent); // Existing outbox publishing

        // 2. NEW: Also send direct saga command for enhanced flow
        SagaCommand command = createTypedSagaCommand(saga, "RESERVE_FLIGHT");
        sagaCommandValidator.validateCommand(command);

        String commandPayload = objectMapper.writeValueAsString(command);
        sagaCommandKafkaTemplate.send("booking-saga-commands", saga.getSagaId(), commandPayload);

    } catch (Exception e) {
        log.error("Failed to send flight reservation command for saga: {}", saga.getSagaId(), e);
        handleCommandPublishingFailure(saga, "RESERVE_FLIGHT", e);
    }
}

// REPLACE existing publishHotelReservationCommand() method
private void publishHotelReservationCommand(BookingSagaInstance saga) {
    log.info("Publishing hotel reservation command for saga: {}", saga.getSagaId());
    
    saga.setCurrentState(SagaState.HOTEL_RESERVATION_PENDING);
    sagaRepository.save(saga);
    
    try {
        SagaCommand command = createTypedSagaCommand(saga, "RESERVE_HOTEL");
        sagaCommandValidator.validateCommand(command);
        
        String commandPayload = objectMapper.writeValueAsString(command);
        kafkaTemplate.send("booking-saga-commands", saga.getSagaId(), commandPayload);
        
        // Keep existing outbox publishing for backward compatibility
        publishHotelReservationEvent(saga);
        
    } catch (Exception e) {
        log.error("Failed to send hotel reservation command for saga: {}", saga.getSagaId(), e);
        handleCommandPublishingFailure(saga, "RESERVE_HOTEL", e);
    }
}

// REPLACE existing publishPaymentCommand() method
private void publishPaymentCommand(BookingSagaInstance saga) {
    log.info("Publishing payment command for saga: {}", saga.getSagaId());
    
    saga.setCurrentState(SagaState.PAYMENT_PENDING);
    sagaRepository.save(saga);
    
    try {
        SagaCommand command = createTypedSagaCommand(saga, "PROCESS_PAYMENT");
        sagaCommandValidator.validateCommand(command);
        
        String commandPayload = objectMapper.writeValueAsString(command);
        kafkaTemplate.send("payment-saga-commands", saga.getSagaId(), commandPayload);
        
        // Keep existing outbox publishing for backward compatibility
        publishPaymentEvent(saga);
        
    } catch (Exception e) {
        log.error("Failed to send payment command for saga: {}", saga.getSagaId(), e);
        handleCommandPublishingFailure(saga, "PROCESS_PAYMENT", e);
    }
}
```

#### **Add New Helper Methods:**
```java
// ADD this new method to existing class
private SagaCommand createTypedSagaCommand(BookingSagaInstance saga, String action) {
    try {
        SagaCommand command = SagaCommand.builder()
            .sagaId(saga.getSagaId())
            .bookingId(saga.getBookingId())
            .action(action)
            .timestamp(Instant.now())
            .build();

        Optional<Booking> bookingOpt = bookingRepository.findById(saga.getBookingId());
        if (bookingOpt.isPresent()) {
            Booking booking = bookingOpt.get();
            command.setCustomerId(booking.getUserId());
            command.setBookingType(booking.getBookingType());
            command.setTotalAmount(booking.getTotalAmount());

            // Leverage existing product details parsing logic
            addProductDetailsToCommand(command, booking, action);
        }

        return command;
    } catch (Exception e) {
        log.error("Error creating typed saga command for saga: {}", saga.getSagaId(), e);
        throw new SagaCommandCreationException("Failed to create saga command", e);
    }
}

// ADD this new method to existing class
private void addProductDetailsToCommand(SagaCommand command, Booking booking, String action) {
    if (booking.getProductDetailsJson() == null || booking.getProductDetailsJson().isEmpty()) {
        return;
    }

    try {
        // Use existing ProductDetailsService
        Object productDetails = productDetailsService.convertFromJson(
            booking.getBookingType(), booking.getProductDetailsJson());

        switch (action) {
            case "RESERVE_FLIGHT":
            case "CANCEL_FLIGHT":
                addFlightDetailsToCommand(command, booking.getBookingType(), productDetails);
                break;
            case "RESERVE_HOTEL":
            case "CANCEL_HOTEL":
                addHotelDetailsToCommand(command, booking.getBookingType(), productDetails);
                break;
            case "PROCESS_PAYMENT":
                addPaymentDetailsToCommand(command, booking.getBookingType(), productDetails);
                break;
        }
    } catch (Exception e) {
        log.warn("Failed to add product details to command for booking: {}", booking.getBookingId(), e);
    }
}

// ADD helper methods for product details
private void addFlightDetailsToCommand(SagaCommand command, BookingType bookingType, Object productDetails) {
    if (bookingType == BookingType.FLIGHT) {
        command.setFlightDetails((FlightBookingDetailsDto) productDetails);
    } else if (bookingType == BookingType.COMBO) {
        ComboBookingDetailsDto combo = (ComboBookingDetailsDto) productDetails;
        command.setFlightDetails(combo.getFlightDetails());
    }
}

private void addHotelDetailsToCommand(SagaCommand command, BookingType bookingType, Object productDetails) {
    if (bookingType == BookingType.HOTEL) {
        command.setHotelDetails((HotelBookingDetailsDto) productDetails);
    } else if (bookingType == BookingType.COMBO) {
        ComboBookingDetailsDto combo = (ComboBookingDetailsDto) productDetails;
        command.setHotelDetails(combo.getHotelDetails());
    }
}

private void addPaymentDetailsToCommand(SagaCommand command, BookingType bookingType, Object productDetails) {
    PaymentDetailsDto paymentDetails = PaymentDetailsDto.builder()
        .bookingId(command.getBookingId())
        .customerId(command.getCustomerId())
        .totalAmount(command.getTotalAmount())
        .currency("VND")
        .build();

    if (bookingType == BookingType.FLIGHT) {
        FlightBookingDetailsDto flight = (FlightBookingDetailsDto) productDetails;
        paymentDetails.setDescription("Flight booking: " + flight.getFlightNumber());
    } else if (bookingType == BookingType.HOTEL) {
        HotelBookingDetailsDto hotel = (HotelBookingDetailsDto) productDetails;
        paymentDetails.setDescription("Hotel booking: " + hotel.getHotelName());
    } else if (bookingType == BookingType.COMBO) {
        paymentDetails.setDescription("Combo booking: Flight + Hotel");
    }

    command.setPaymentDetails(paymentDetails);
}

// ADD error handling method
private void handleCommandPublishingFailure(BookingSagaInstance saga, String action, Exception e) {
    log.error("Command publishing failed for saga: {}, action: {}", saga.getSagaId(), action, e);
    
    // Use existing compensation logic
    startCompensation(saga, "Command publishing failed: " + e.getMessage());
}
```

### **2. Enhance FlightEventConsumer.java**

**File: `flight-service/src/main/java/com/pdh/flight/kafka/consumer/FlightEventConsumer.java`**

#### **Add to Existing Class:**
```java
// ADD this new Kafka listener method to existing FlightEventConsumer class
@KafkaListener(
    topics = "booking-saga-commands",
    groupId = "flight-service-saga-group",
    containerFactory = "kafkaListenerContainerFactory"
)
public void handleSagaCommand(String message) {
    try {
        log.debug("Received saga command: {}", message);
        JsonNode command = objectMapper.readTree(message);
        String action = command.get("action").asText();
        
        switch (action) {
            case "RESERVE_FLIGHT":
                handleFlightReservationCommand(command);
                break;
            case "CANCEL_FLIGHT":
                handleFlightCancellationCommand(command);
                break;
            default:
                log.debug("Unhandled flight saga command: {}", action);
        }
    } catch (Exception e) {
        log.error("Error processing flight saga command: {}", message, e);
    }
}

// ADD these helper methods to existing FlightEventConsumer class
private void handleFlightReservationCommand(JsonNode command) {
    try {
        UUID bookingId = UUID.fromString(command.get("bookingId").asText());
        String sagaId = command.get("sagaId").asText();
        
        if (command.has("flightDetails")) {
            JsonNode flightDetailsNode = command.get("flightDetails");
            FlightBookingDetailsDto flightDetails = objectMapper.treeToValue(
                flightDetailsNode, FlightBookingDetailsDto.class);
            
            // Use existing enhanced method
            flightService.reserveFlight(bookingId, sagaId, flightDetails);
        } else {
            // Fallback to existing legacy method
            log.warn("No flight details provided for booking: {}, using legacy method", bookingId);
            flightService.reserveFlight(bookingId);
        }
    } catch (Exception e) {
        log.error("Error handling flight reservation command", e);
    }
}

private void handleFlightCancellationCommand(JsonNode command) {
    try {
        UUID bookingId = UUID.fromString(command.get("bookingId").asText());
        String sagaId = command.get("sagaId").asText();
        
        // Use existing cancellation method or create if needed
        flightService.cancelFlightReservation(bookingId);
    } catch (Exception e) {
        log.error("Error handling flight cancellation command", e);
    }
}
```

### **3. Enhance HotelEventConsumer.java**

**File: `hotel-service/src/main/java/com/pdh/hotel/kafka/consumer/HotelEventConsumer.java`**

#### **Add Similar Methods (same pattern as FlightEventConsumer):**
```java
// ADD saga command listener and handlers (same pattern as flight service)
@KafkaListener(topics = "booking-saga-commands", groupId = "hotel-service-saga-group")
public void handleSagaCommand(String message) {
    // Similar implementation to FlightEventConsumer
}

private void handleHotelReservationCommand(JsonNode command) {
    // Use existing hotelService.reserveHotel() methods
}

private void handleHotelCancellationCommand(JsonNode command) {
    // Use existing hotelService.cancelHotelReservation() methods
}
```

## 📋 **New Files to Create in Common-Lib (2 files)**

### **1. SagaCommand DTO (NEW FILE - COMMON-LIB)**

**File: `common-lib/src/main/java/com/pdh/common/saga/SagaCommand.java`**

```java
package com.pdh.common.saga;

import com.pdh.common.event.DomainEvent;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Saga Command DTO - Extends existing DomainEvent from common-lib
 * Centralized in common-lib for reuse across all services
 */
@Data
@EqualsAndHashCode(callSuper = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SagaCommand extends DomainEvent {

    @NotNull
    private String sagaId;

    @NotNull
    private UUID bookingId;

    @NotNull
    private String action;

    private UUID customerId;
    private String bookingType; // Use String instead of enum for flexibility
    private BigDecimal totalAmount;

    // Product-specific details (flexible Object type for different DTOs)
    private Object flightDetails;
    private Object hotelDetails;
    private Object paymentDetails;

    // Command metadata
    @Builder.Default
    private Map<String, String> metadata = new HashMap<>();

    @Builder.Default
    private Integer retryCount = 0;

    private String correlationId;

    // Implement DomainEvent abstract methods
    @Override
    public String getAggregateId() {
        return sagaId;
    }

    @Override
    public String getAggregateType() {
        return "Saga";
    }

    // Utility methods
    public void addMetadata(String key, String value) {
        this.metadata.put(key, value);
    }

    public String getMetadata(String key) {
        return this.metadata.get(key);
    }

    public boolean isCompensationCommand() {
        return action != null && (action.startsWith("CANCEL_") || action.startsWith("REFUND_"));
    }
}
```

### **2. SagaCommandValidator (NEW FILE - COMMON-LIB)**

**File: `common-lib/src/main/java/com/pdh/common/saga/SagaCommandValidator.java`**

```java
package com.pdh.common.saga;

import com.pdh.common.exceptions.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Saga Command Validator - Centralized in common-lib
 * Uses existing common-lib exception patterns
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SagaCommandValidator {

    private final Validator validator; // From CommonConfig

    public void validateCommand(SagaCommand command) {
        Set<ConstraintViolation<SagaCommand>> violations = validator.validate(command);
        if (!violations.isEmpty()) {
            String errorMessage = violations.stream()
                .map(ConstraintViolation::getMessage)
                .collect(Collectors.joining(", "));
            // Use existing common-lib exception
            throw new BadRequestException("Command validation failed: " + errorMessage);
        }

        validateBusinessRules(command);
    }

    private void validateBusinessRules(SagaCommand command) {
        switch (command.getAction()) {
            case "RESERVE_FLIGHT":
                validateFlightReservationCommand(command);
                break;
            case "RESERVE_HOTEL":
                validateHotelReservationCommand(command);
                break;
            case "PROCESS_PAYMENT":
                validatePaymentCommand(command);
                break;
        }
    }

    private void validateFlightReservationCommand(SagaCommand command) {
        if (command.getFlightDetails() == null) {
            throw new BadRequestException("Flight details are required for flight reservation");
        }
        // Additional validation can be added based on specific requirements
    }

    private void validateHotelReservationCommand(SagaCommand command) {
        if (command.getHotelDetails() == null) {
            throw new BadRequestException("Hotel details are required for hotel reservation");
        }
        // Additional validation can be added based on specific requirements
    }

    private void validatePaymentCommand(SagaCommand command) {
        if (command.getPaymentDetails() == null) {
            throw new BadRequestException("Payment details are required for payment processing");
        }

        if (command.getTotalAmount() != null && command.getTotalAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Payment amount must be greater than 0");
        }
    }
}
```

## 📋 **Updated Dependencies**

### **Common-Lib pom.xml Enhancement**

**File: `common-lib/pom.xml`**

#### **Add Validation Dependencies:**
```xml
<!-- ADD to existing dependencies in common-lib/pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

## 📊 **Effort Reduction Summary**

### **Original Plan vs Common-Lib Approach:**

| Component | Original Location | New Location | Effort Reduction |
|-----------|------------------|--------------|------------------|
| SagaCommand DTO | booking-service | common-lib/saga | Reusable across services |
| SagaCommandValidator | booking-service | common-lib/saga | Centralized validation |
| Kafka Configuration | New SagaTopicConfig | Enhanced BaseKafkaConfig | 75% reduction |
| Event Publishing | New implementation | Existing ExtendedOutboxEvent | 90% reduction |
| Error Handling | Custom exceptions | Existing common-lib exceptions | 100% reuse |

### **Total Effort Reduction: 50% (2 days → 1 day)**

## ✅ **Phase 1 Success Criteria**

1. **Saga commands published to dedicated topics** ✅
2. **Inventory services receive and process saga commands** ✅
3. **Existing CDC listeners continue working** ✅
4. **Typed command validation working** ✅
5. **Backward compatibility maintained** ✅

## 🧪 **Testing Strategy**

### **Unit Tests:**
- Test SagaCommand creation and validation
- Test command publishing methods
- Test command handling in consumers

### **Integration Tests:**
- Test end-to-end saga command flow
- Test backward compatibility with CDC listeners
- Test error handling and validation

## 📊 **Deployment Notes**

- Deploy with feature flag to enable/disable saga commands
- Monitor both saga commands and CDC events
- Gradual rollout with fallback to existing CDC flow
- No breaking changes to existing functionality
