package com.pdh.booking.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.booking.model.Booking;
import com.pdh.booking.model.enums.BookingStatus;
import com.pdh.booking.model.enums.BookingType;
import com.pdh.booking.repository.BookingRepository;
import com.pdh.booking.dto.request.FlightBookingDetailsDto;
import com.pdh.booking.dto.request.HotelBookingDetailsDto;
import com.pdh.booking.dto.request.ComboBookingDetailsDto;
// Note: Using direct service validation instead of HTTP clients for "Listen to Yourself" pattern
import com.pdh.common.validation.ValidationResult;
import com.pdh.common.exceptions.InventoryServiceException;
import com.pdh.common.outbox.service.OutboxEventService;
import com.pdh.common.saga.CompensationHandler;
import com.pdh.common.saga.CompensationStrategy;
import com.pdh.booking.service.InventoryLockService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Async Inventory Validation Service following "Listen to Yourself" pattern
 * Processes validation commands asynchronously and updates booking status
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AsyncInventoryValidationService {

    private final BookingRepository bookingRepository;
    private final BookingSagaService bookingSagaService;
    private final OutboxEventService eventPublisher;
    private final ObjectMapper objectMapper;
    private final ProductDetailsService productDetailsService;

    // Phase 3: Enhanced compensation support
    private final CompensationHandler compensationHandler;

    // Phase 4: Inventory locking support
    private final InventoryLockService inventoryLockService;

    /**
     * Listens to own outbox events for validation commands (Listen to Yourself ✅)
     */
    @KafkaListener(
        topics = "booking.outbox",
        groupId = "booking-validation-group",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleValidationCommand(@Payload String message, Acknowledgment ack) {
        try {
            log.debug("Received validation command: {}", message);
            JsonNode cdcMessage = objectMapper.readTree(message);
            
            // Check if this is a validation command
            if (isValidationCommand(cdcMessage)) {
                processValidationCommand(cdcMessage);
            }
            
            // Acknowledge message after successful processing
            ack.acknowledge();
            
        } catch (Exception e) {
            log.error("Error processing validation command: {}", message, e);
            // Don't acknowledge on error - message will be retried
        }
    }

    /**
     * Checks if the CDC message is a validation command
     */
    private boolean isValidationCommand(JsonNode cdcMessage) {
        try {
            JsonNode after = cdcMessage.get("after");
            if (after != null && after.has("event_type")) {
                String eventType = after.get("event_type").asText();
                return "ValidateInventoryCommand".equals(eventType);
            }
            return false;
        } catch (Exception e) {
            log.debug("Error checking if message is validation command", e);
            return false;
        }
    }

    /**
     * Processes the validation command asynchronously
     */
    @Transactional
    void processValidationCommand(JsonNode cdcMessage) throws JsonProcessingException {
        try {
            JsonNode after = cdcMessage.get("after");
            String payloadStr = after.get("payload").asText();
            JsonNode payload = objectMapper.readTree(payloadStr);
            
            UUID bookingId = UUID.fromString(payload.get("bookingId").asText());
            BookingType bookingType = BookingType.valueOf(payload.get("bookingType").asText());
            JsonNode productDetails = payload.get("productDetails");
            
            log.info("Processing async validation for booking: {}, type: {}", bookingId, bookingType);
            
            // Get booking from database
            Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
            if (bookingOpt.isEmpty()) {
                log.error("Booking not found for validation: {}", bookingId);
                return;
            }
            
            Booking booking = bookingOpt.get();
            
            // Only process if booking is still in VALIDATION_PENDING status
            if (booking.getStatus() != BookingStatus.VALIDATION_PENDING) {
                log.warn("Booking {} is not in VALIDATION_PENDING status, skipping validation", bookingId);
                return;
            }
            
            // Phase 4: Acquire inventory locks before validation
            String sagaId = "saga_" + bookingId.toString();
            InventoryLockService.InventoryLockResult lockResult = inventoryLockService.acquireInventoryLocks(
                sagaId, bookingType, productDetails);

            if (!lockResult.isSuccess()) {
                // Lock acquisition failed - mark as validation failed
                log.warn("Inventory lock acquisition failed for booking: {}, error: {}",
                    bookingId, lockResult.getErrorMessage());
                booking.setStatus(BookingStatus.VALIDATION_FAILED);
                bookingRepository.save(booking);

                publishValidationResult(booking, false, lockResult.getErrorMessage());
            } else {
                // Locks acquired successfully - proceed with basic validation
                ValidationResult validation = validateInventoryAsync(bookingType, productDetails);

                if (validation.isValid()) {
                    // Validation passed - update status and start saga
                    log.info("Inventory validation and locking successful for booking: {}", bookingId);
                    booking.setStatus(BookingStatus.PENDING);
                    bookingRepository.save(booking);

                    // Start the booking saga (locks will be managed by saga)
                    bookingSagaService.startBookingSaga(booking);

                    // Publish validation success event
                    publishValidationResult(booking, true, "Inventory validation and locking successful");
                } else {
                    // Validation failed - release locks and mark as failed
                    log.warn("Inventory validation failed for booking: {}, releasing locks", bookingId);
                    inventoryLockService.releaseAllLocksBySaga(sagaId);

                    // Determine if retry is appropriate
                    CompensationStrategy strategy = compensationHandler.determineStrategy(
                        "VALIDATE_INVENTORY", validation.getErrorCode(), 0);

                    if (strategy == CompensationStrategy.RETRY_THEN_COMPENSATE &&
                        "INVENTORY_SERVICE_UNAVAILABLE".equals(validation.getErrorCode())) {

                        log.info("Inventory service unavailable, will retry validation for booking: {}", bookingId);
                        // Keep status as VALIDATION_PENDING and retry later
                        publishValidationResult(booking, false, "Validation will be retried: " + validation.getErrorMessage());
                    } else {
                        // Mark booking as failed
                        booking.setStatus(BookingStatus.VALIDATION_FAILED);
                        bookingRepository.save(booking);

                        // Publish validation failure event
                        publishValidationResult(booking, false, validation.getErrorMessage());
                    }
                }
            }
            
        } catch (Exception e) {
            log.error("Error processing validation command", e);
            throw e; // Re-throw to prevent acknowledgment
        }
    }

    /**
     * Validates inventory asynchronously with retry logic
     */
    private ValidationResult validateInventoryAsync(BookingType bookingType, JsonNode productDetails) {
        try {
            switch (bookingType) {
                case FLIGHT:
                    return validateFlightInventoryAsync(productDetails);
                case HOTEL:
                    return validateHotelInventoryAsync(productDetails);
                case COMBO:
                    return validateComboInventoryAsync(productDetails);
                default:
                    log.warn("Unknown booking type: {}, skipping validation", bookingType);
                    return ValidationResult.valid();
            }
        } catch (InventoryServiceException e) {
            log.error("Inventory service error for booking type: {}", bookingType, e);
            return ValidationResult.serviceUnavailable("Unable to verify inventory availability: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error validating inventory for booking type: {}", bookingType, e);
            return ValidationResult.invalid("Inventory validation failed: " + e.getMessage());
        }
    }

    /**
     * Validates flight inventory asynchronously
     * For now, we'll assume validation passes and let the saga handle actual inventory checks
     * This follows the "Listen to Yourself" pattern - we validate basic structure here
     */
    private ValidationResult validateFlightInventoryAsync(JsonNode productDetails) {
        try {
            // Convert to flight details DTO to validate structure
            FlightBookingDetailsDto flightDetails =
                objectMapper.treeToValue(productDetails, FlightBookingDetailsDto.class);

            // Basic validation - check required fields
            if (flightDetails.getFlightId() == null || flightDetails.getFlightId().isEmpty()) {
                return ValidationResult.invalid("Flight ID is required");
            }

            if (flightDetails.getPassengerCount() == null || flightDetails.getPassengerCount() <= 0) {
                return ValidationResult.invalid("Valid passenger count is required");
            }

            if (flightDetails.getDepartureDateTime() == null) {
                return ValidationResult.invalid("Departure date is required");
            }

            // For Phase 2, we'll do basic validation and let saga handle detailed inventory
            // In Phase 4, we can add actual inventory locking here
            log.info("Flight inventory validation passed for flight: {}", flightDetails.getFlightNumber());
            return ValidationResult.valid();

        } catch (Exception e) {
            log.error("Error validating flight inventory async", e);
            return ValidationResult.invalid("Flight details validation failed: " + e.getMessage());
        }
    }

    /**
     * Validates hotel inventory asynchronously
     * For now, we'll assume validation passes and let the saga handle actual inventory checks
     * This follows the "Listen to Yourself" pattern - we validate basic structure here
     */
    private ValidationResult validateHotelInventoryAsync(JsonNode productDetails) {
        try {
            // Convert to hotel details DTO to validate structure
            HotelBookingDetailsDto hotelDetails =
                objectMapper.treeToValue(productDetails, HotelBookingDetailsDto.class);

            // Basic validation - check required fields
            if (hotelDetails.getHotelId() == null || hotelDetails.getHotelId().isEmpty()) {
                return ValidationResult.invalid("Hotel ID is required");
            }

            if (hotelDetails.getNumberOfRooms() == null || hotelDetails.getNumberOfRooms() <= 0) {
                return ValidationResult.invalid("Valid room count is required");
            }

            if (hotelDetails.getCheckInDate() == null || hotelDetails.getCheckOutDate() == null) {
                return ValidationResult.invalid("Check-in and check-out dates are required");
            }

            // For Phase 2, we'll do basic validation and let saga handle detailed inventory
            // In Phase 4, we can add actual inventory locking here
            log.info("Hotel inventory validation passed for hotel: {}", hotelDetails.getHotelName());
            return ValidationResult.valid();

        } catch (Exception e) {
            log.error("Error validating hotel inventory async", e);
            return ValidationResult.invalid("Hotel details validation failed: " + e.getMessage());
        }
    }

    /**
     * Validates combo booking inventory (both flight and hotel)
     */
    private ValidationResult validateComboInventoryAsync(JsonNode productDetails) {
        try {
            // Convert to combo details DTO
            ComboBookingDetailsDto comboDetails =
                objectMapper.treeToValue(productDetails, ComboBookingDetailsDto.class);

            // Validate flight component
            ValidationResult flightResult = validateFlightInventoryAsync(
                objectMapper.valueToTree(comboDetails.getFlightDetails()));
            if (!flightResult.isValid()) {
                return flightResult;
            }

            // Validate hotel component
            ValidationResult hotelResult = validateHotelInventoryAsync(
                objectMapper.valueToTree(comboDetails.getHotelDetails()));
            if (!hotelResult.isValid()) {
                return hotelResult;
            }

            return ValidationResult.valid();
            
        } catch (Exception e) {
            log.error("Error validating combo inventory async", e);
            return ValidationResult.invalid("Combo availability check failed: " + e.getMessage());
        }
    }

    /**
     * Publishes validation result event for frontend notification
     */
    private void publishValidationResult(Booking booking, boolean success, String message) {
        try {
            String eventType = success ? "InventoryValidationSucceeded" : "InventoryValidationFailed";
            String payload = objectMapper.writeValueAsString(Map.of(
                "bookingId", booking.getBookingId().toString(),
                "bookingReference", booking.getBookingReference(),
                "status", booking.getStatus().name(),
                "message", message,
                "timestamp", java.time.Instant.now().toString()
            ));
            
            eventPublisher.publishEvent(
                eventType,
                "Booking",
                booking.getBookingId().toString(),
                payload
            );
            
            log.info("Published validation result event: {} for booking: {}", eventType, booking.getBookingId());
            
        } catch (Exception e) {
            log.error("Error publishing validation result for booking: {}", booking.getBookingId(), e);
        }
    }
}
