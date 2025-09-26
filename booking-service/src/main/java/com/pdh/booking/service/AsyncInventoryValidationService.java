package com.pdh.booking.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.booking.model.Booking;
import com.pdh.booking.model.enums.BookingStatus;
import com.pdh.booking.model.enums.BookingType;
import com.pdh.booking.repository.BookingRepository;
import com.pdh.booking.model.dto.request.FlightBookingDetailsDto;
import com.pdh.booking.model.dto.request.HotelBookingDetailsDto;
import com.pdh.booking.model.dto.request.ComboBookingDetailsDto;
// Using direct service validation instead of HTTP clients for "Listen to Yourself" pattern
import com.pdh.booking.client.FlightServiceClient;
import com.pdh.booking.client.HotelServiceClient;
import com.pdh.common.validation.ValidationResult;
import com.pdh.common.exceptions.InventoryServiceException;
import com.pdh.common.outbox.service.OutboxEventService;
import com.pdh.common.saga.CompensationHandler;
import com.pdh.common.saga.CompensationStrategy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
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

    // REST Clients for actual inventory validation
    private final FlightServiceClient flightServiceClient;
    private final HotelServiceClient hotelServiceClient;

    // Phase 3: Enhanced compensation support
    private final CompensationHandler compensationHandler;

    // Phase 4: Inventory locking support
    private final InventoryLockService inventoryLockService;

    @Value("${booking.validation.bypass:true}")
    private boolean bypassValidation;

    /**
     * Listens to own outbox events for validation commands (Listen to Yourself ✅)
     */
    @KafkaListener(
        topics = {
            "booking-db-server.public.booking_outbox_events",
            "booking.Booking.events"
        },
        groupId = "booking-validation-group",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleValidationCommand(
        @Payload String message,
        @Header(name = "eventType", required = false) String eventTypeHeader,
        Acknowledgment ack
    ) {
        try {
            log.debug("Received validation command candidate: {}", message);
            OutboxEventPayload eventPayload = extractOutboxEvent(message, eventTypeHeader);

            if (eventPayload == null) {
                log.debug("Unable to parse outbox event payload, skipping message");
                ack.acknowledge();
                return;
            }

            if (!"ValidateInventoryCommand".equals(eventPayload.getEventType())) {
                log.trace("Ignoring non-validation event type: {}", eventPayload.getEventType());
                ack.acknowledge();
                return;
            }

            processValidationCommand(eventPayload.getPayload());

            // Acknowledge message after successful processing
            ack.acknowledge();

        } catch (Exception e) {
            log.error("Error processing validation command: {}", message, e);
            // Don't acknowledge on error - message will be retried
        }
    }

    /**
     * Extracts the outbox event payload regardless of whether we are reading
     * the raw Debezium topic or the routed EventRouter topic.
     */
    private OutboxEventPayload extractOutboxEvent(String message, String eventTypeHeader)
        throws JsonProcessingException {

        if (message == null || message.isBlank()) {
            return null;
        }

        JsonNode rootNode = objectMapper.readTree(message);

        // Debezium CDC format (raw table topic)
        if (rootNode.has("after")) {
            JsonNode after = rootNode.get("after");
            if (after != null && !after.isNull()) {
                String eventType = after.path("event_type").asText(null);
                JsonNode payloadNode = extractPayloadNode(after);
                if (eventType != null && payloadNode != null) {
                    return new OutboxEventPayload(eventType, payloadNode);
                }
            }
        }

        // Routed EventRouter format – payload only with optional headers
        if (rootNode.isTextual()) {
            JsonNode payloadNode = objectMapper.readTree(rootNode.asText());
            String eventType = resolveEventType(eventTypeHeader, payloadNode);
            return eventType != null ? new OutboxEventPayload(eventType, payloadNode) : null;
        }

        // Direct JSON object with embedded event type/payload
        if (rootNode.has("eventType")) {
            String eventType = rootNode.path("eventType").asText(null);
            JsonNode payloadNode = rootNode;
            if (rootNode.has("payload")) {
                JsonNode extracted = extractPayloadNode(rootNode);
                if (extracted != null) {
                    payloadNode = extracted;
                }
            }
            if (eventType != null && payloadNode != null) {
                return new OutboxEventPayload(eventType, payloadNode);
            }
        }

        // Fallback - use header + current node as payload
        if (eventTypeHeader != null && !eventTypeHeader.isBlank()) {
            JsonNode payloadNode = rootNode;
            if (rootNode.has("payload")) {
                JsonNode extracted = extractPayloadNode(rootNode);
                if (extracted != null) {
                    payloadNode = extracted;
                }
            }
            return new OutboxEventPayload(eventTypeHeader, payloadNode);
        }

        return null;
    }

    private JsonNode extractPayloadNode(JsonNode node) throws JsonProcessingException {
        if (node == null || node.isNull()) {
            return null;
        }

        JsonNode payloadNode = node.get("payload");
        if (payloadNode == null || payloadNode.isNull()) {
            return null;
        }

        if (payloadNode.isTextual()) {
            String payloadText = payloadNode.asText();
            if (payloadText == null || payloadText.isBlank()) {
                return null;
            }
            return objectMapper.readTree(payloadText);
        }

        return payloadNode;
    }

    private String resolveEventType(String eventTypeHeader, JsonNode payloadNode) {
        if (eventTypeHeader != null && !eventTypeHeader.isBlank()) {
            return eventTypeHeader;
        }

        if (payloadNode != null && payloadNode.has("eventType")) {
            return payloadNode.get("eventType").asText(null);
        }

        return null;
    }

    private static class OutboxEventPayload {
        private final String eventType;
        private final JsonNode payload;

        OutboxEventPayload(String eventType, JsonNode payload) {
            this.eventType = eventType;
            this.payload = payload;
        }

        public String getEventType() {
            return eventType;
        }

        public JsonNode getPayload() {
            return payload;
        }
    }

    /**
     * Processes the validation command asynchronously
     */
    @Transactional
    void processValidationCommand(JsonNode commandPayload) throws JsonProcessingException {
        String sagaIdForCleanup = null;
        try {
            JsonNode bookingIdNode = commandPayload.get("bookingId");
            JsonNode bookingTypeNode = commandPayload.get("bookingType");

            if (bookingIdNode == null || bookingIdNode.isNull() || bookingIdNode.asText().isBlank()) {
                log.error("Received validation command without bookingId: {}", commandPayload);
                return;
            }

            if (bookingTypeNode == null || bookingTypeNode.isNull() || bookingTypeNode.asText().isBlank()) {
                log.error("Received validation command without bookingType for bookingId: {}", bookingIdNode.asText());
                return;
            }

            UUID bookingId = UUID.fromString(bookingIdNode.asText());
            BookingType bookingType = BookingType.valueOf(bookingTypeNode.asText());

            log.info("Processing async validation for booking: {}, type: {}", bookingId, bookingType);
            
            // Get booking from database
            Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
            if (bookingOpt.isEmpty()) {
                log.error("Booking not found for validation: {}", bookingId);
                return;
            }

            Booking booking = bookingOpt.get();
            sagaIdForCleanup = booking.getSagaId();

            // Only process if booking is still in VALIDATION_PENDING status
            if (booking.getStatus() != BookingStatus.VALIDATION_PENDING) {
                log.warn("Booking {} is not in VALIDATION_PENDING status, skipping validation", bookingId);
                return;
            }

            if (bypassValidation) {
                // MVP shortcut: skip detailed validation and move booking forward immediately
                log.info("Skipping inventory validation for booking {} (MVP mode)", bookingId);
                booking.setStatus(BookingStatus.PENDING);
                bookingRepository.save(booking);

                bookingSagaService.continueBookingSaga(booking);
                publishValidationResult(booking, true, "Inventory validation bypassed for MVP demo");
                return;
            }

            JsonNode productDetailsNode = commandPayload.get("productDetails");
            String productDetailsJson = null;

            if (productDetailsNode != null && !productDetailsNode.isNull()) {
                productDetailsJson = productDetailsNode.toString();
            } else if (booking.getProductDetailsJson() != null && !booking.getProductDetailsJson().isBlank()) {
                productDetailsJson = booking.getProductDetailsJson();
                productDetailsNode = objectMapper.readTree(productDetailsJson);
            }

            if (productDetailsJson == null) {
                log.error("Product details missing for booking: {}", bookingId);
                booking.setStatus(BookingStatus.VALIDATION_FAILED);
                bookingRepository.save(booking);
                publishValidationResult(booking, false, "Missing product details for validation");
                return;
            }

            Object typedProductDetails = productDetailsService.convertFromJson(bookingType, productDetailsJson);

            // Phase 4: Acquire inventory locks before validation
            InventoryLockService.InventoryLockResult lockResult = inventoryLockService.acquireInventoryLocks(
                booking.getSagaId(), bookingType, typedProductDetails);

            if (!lockResult.isSuccess()) {
                // Lock acquisition failed - mark as validation failed
                log.warn("Inventory lock acquisition failed for booking: {}, error: {}",
                    bookingId, lockResult.getErrorMessage());
                booking.setStatus(BookingStatus.VALIDATION_FAILED);
                bookingRepository.save(booking);

                publishValidationResult(booking, false, lockResult.getErrorMessage());
            } else {
                // Locks acquired successfully - proceed with basic validation
                JsonNode validationNode = productDetailsNode != null
                        ? productDetailsNode
                        : objectMapper.readTree(productDetailsJson);
                ValidationResult validation = validateInventoryAsync(bookingType, validationNode);

                if (validation.isValid()) {
                    // Validation passed - update status and start saga
                    log.info("Inventory validation and locking successful for booking: {}", bookingId);
                    booking.setStatus(BookingStatus.PENDING);
                    bookingRepository.save(booking);

                    // Continue the booking saga (locks will be managed by saga)
                    bookingSagaService.continueBookingSaga(booking);

                    // Publish validation success event
                    publishValidationResult(booking, true, "Inventory validation and locking successful");
                } else {
                    // Validation failed - release locks and mark as failed
                    log.warn("Inventory validation failed for booking: {}, releasing locks", bookingId);
                    inventoryLockService.releaseAllLocksBySaga(booking.getSagaId());

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
            if (sagaIdForCleanup != null) {
                inventoryLockService.releaseAllLocksBySaga(sagaIdForCleanup);
            }
            throw e; // Re-throw to prevent acknowledgment
        }
    }

    /**
     * Validates inventory asynchronously with retry logic
     * Now performs actual inventory checks with external services instead of just basic validation
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
        } catch (RuntimeException e) {
            log.error("Runtime error validating inventory for booking type: {}", bookingType, e);
            // Check if it's a service unavailable error from circuit breaker
            if (e.getMessage().contains("unavailable")) {
                return ValidationResult.serviceUnavailable("Service temporarily unavailable: " + e.getMessage());
            }
            return ValidationResult.invalid("Inventory validation failed: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error validating inventory for booking type: {}", bookingType, e);
            return ValidationResult.invalid("Inventory validation failed: " + e.getMessage());
        }
    }

    /**
     * Validates flight inventory by actually checking with the flight service
     * This replaces the basic structure validation with real inventory checks
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

            // Actually check flight inventory availability using REST client
            log.info("Checking actual flight inventory availability for flight: {}", flightDetails.getFlightId());
            ValidationResult availabilityResult = flightServiceClient.checkFlightAvailability(
                flightDetails.getFlightId(),
                flightDetails.getSeatClass(),
                flightDetails.getPassengerCount(),
                flightDetails.getDepartureDateTime()
            );

            if (!availabilityResult.isValid()) {
                log.warn("Flight inventory not available for flight: {}, reason: {}", 
                        flightDetails.getFlightId(), availabilityResult.getErrorMessage());
                return availabilityResult;
            }

            // Validate flight details structure with flight service
            ValidationResult structureResult = flightServiceClient.validateFlightDetails(productDetails);
            if (!structureResult.isValid()) {
                log.warn("Flight details validation failed for flight: {}, reason: {}", 
                        flightDetails.getFlightId(), structureResult.getErrorMessage());
                return structureResult;
            }

            log.info("Flight inventory validation passed for flight: {}", flightDetails.getFlightNumber());
            return ValidationResult.valid();

        } catch (Exception e) {
            log.error("Error validating flight inventory async", e);
            return ValidationResult.invalid("Flight details validation failed: " + e.getMessage());
        }
    }

    /**
     * Validates hotel inventory by actually checking with the hotel service
     * This replaces the basic structure validation with real inventory checks
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

            // Actually check hotel inventory availability using REST client
            log.info("Checking actual hotel inventory availability for hotel: {}", hotelDetails.getHotelId());
            ValidationResult availabilityResult = hotelServiceClient.checkHotelAvailability(
                hotelDetails.getHotelId(),
                hotelDetails.getRoomTypeId(),
                hotelDetails.getCheckInDate(),
                hotelDetails.getCheckOutDate(),
                hotelDetails.getNumberOfRooms()
            );

            if (!availabilityResult.isValid()) {
                log.warn("Hotel inventory not available for hotel: {}, reason: {}", 
                        hotelDetails.getHotelId(), availabilityResult.getErrorMessage());
                return availabilityResult;
            }

            // Validate hotel details structure with hotel service
            ValidationResult structureResult = hotelServiceClient.validateHotelDetails(productDetails);
            if (!structureResult.isValid()) {
                log.warn("Hotel details validation failed for hotel: {}, reason: {}", 
                        hotelDetails.getHotelId(), structureResult.getErrorMessage());
                return structureResult;
            }

            log.info("Hotel inventory validation passed for hotel: {}", hotelDetails.getHotelName());
            return ValidationResult.valid();

        } catch (Exception e) {
            log.error("Error validating hotel inventory async", e);
            return ValidationResult.invalid("Hotel details validation failed: " + e.getMessage());
        }
    }

    /**
     * Validates combo booking inventory (both flight and hotel) by checking with respective services
     */
    private ValidationResult validateComboInventoryAsync(JsonNode productDetails) {
        try {
            // Convert to combo details DTO
            ComboBookingDetailsDto comboDetails =
                objectMapper.treeToValue(productDetails, ComboBookingDetailsDto.class);

            // Validate flight component with actual inventory check
            ValidationResult flightResult = validateFlightInventoryAsync(
                objectMapper.valueToTree(comboDetails.getFlightDetails()));
            if (!flightResult.isValid()) {
                return flightResult;
            }

            // Validate hotel component with actual inventory check
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
            Map<String, Object> payload = new HashMap<>();
            payload.put("eventType", eventType);
            payload.put("bookingId", booking.getBookingId().toString());
            payload.put("bookingReference", booking.getBookingReference());
            payload.put("status", booking.getStatus().name());
            payload.put("message", message);
            payload.put("timestamp", java.time.Instant.now().toString());
            
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
