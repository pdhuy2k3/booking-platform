package com.pdh.booking.saga;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.common.kafka.cdc.message.FlightOutboxCdcMessage;
import com.pdh.common.kafka.cdc.message.HotelOutboxCdcMessage;
import com.pdh.common.kafka.cdc.message.PaymentOutboxCdcMessage;
import com.pdh.booking.model.Booking;
import com.pdh.booking.model.BookingSagaInstance;
import com.pdh.booking.model.enums.BookingType;
import com.pdh.booking.model.enums.BookingStatus;
import com.pdh.common.outbox.service.OutboxEventService;
import com.pdh.common.outbox.ExtendedOutboxEvent;
import com.pdh.booking.repository.BookingRepository;
import com.pdh.booking.repository.BookingSagaRepository;
import com.pdh.common.saga.SagaState;
import com.pdh.common.saga.SagaCommand;
import com.pdh.common.saga.SagaCommandValidator;
import com.pdh.booking.service.ProductDetailsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/**
 * Modern Event-Driven Saga Orchestrator
 * 
 * Integrates state machine logic with Kafka + Debezium for reliable event publishing.
 * Manages booking saga lifecycle through distributed transactions with compensation.
 * 
 * Features:
 * - Event-driven architecture with Kafka listeners
 * - Outbox pattern for reliable event publishing via Debezium
 * - State machine validation for saga transitions
 * - Automatic compensation on failures
 * - Persistent saga state tracking
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class BookingSagaOrchestrator {

    private final BookingSagaRepository sagaRepository;
    private final BookingRepository bookingRepository;
    private final OutboxEventService eventPublisher;
    private final ObjectMapper objectMapper;

    // NEW: Saga command infrastructure from common-lib
    private final KafkaTemplate<String, String> sagaCommandKafkaTemplate;
    private final SagaCommandValidator sagaCommandValidator;
    private final ProductDetailsService productDetailsService;
    
    // Valid state transitions from the state machine
    private static final Map<SagaState, Set<SagaState>> VALID_TRANSITIONS = Map.ofEntries(
        Map.entry(SagaState.BOOKING_INITIATED, Set.of(
            SagaState.FLIGHT_RESERVATION_PENDING,
            SagaState.HOTEL_RESERVATION_PENDING,
            SagaState.COMPENSATION_BOOKING_CANCEL
        )),
        Map.entry(SagaState.FLIGHT_RESERVATION_PENDING, Set.of(
            SagaState.FLIGHT_RESERVED,
            SagaState.COMPENSATION_BOOKING_CANCEL
        )),
        Map.entry(SagaState.FLIGHT_RESERVED, Set.of(
            SagaState.HOTEL_RESERVATION_PENDING,
            SagaState.PAYMENT_PENDING,
            SagaState.COMPENSATION_FLIGHT_CANCEL
        )),
        Map.entry(SagaState.HOTEL_RESERVATION_PENDING, Set.of(
            SagaState.HOTEL_RESERVED,
            SagaState.COMPENSATION_FLIGHT_CANCEL
        )),
        Map.entry(SagaState.HOTEL_RESERVED, Set.of(
            SagaState.PAYMENT_PENDING,
            SagaState.COMPENSATION_HOTEL_CANCEL
        )),
        Map.entry(SagaState.PAYMENT_PENDING, Set.of(
            SagaState.PAYMENT_COMPLETED,
            SagaState.COMPENSATION_HOTEL_CANCEL
        )),
        Map.entry(SagaState.PAYMENT_COMPLETED, Set.of(
            SagaState.BOOKING_COMPLETED,
            SagaState.COMPENSATION_PAYMENT_REFUND
        )),
        Map.entry(SagaState.BOOKING_COMPLETED, Set.of()),
        // Compensation states
        Map.entry(SagaState.COMPENSATION_BOOKING_CANCEL, Set.of(SagaState.BOOKING_CANCELLED)),
        Map.entry(SagaState.COMPENSATION_FLIGHT_CANCEL, Set.of(SagaState.COMPENSATION_BOOKING_CANCEL)),
        Map.entry(SagaState.COMPENSATION_HOTEL_CANCEL, Set.of(SagaState.COMPENSATION_FLIGHT_CANCEL)),
        Map.entry(SagaState.COMPENSATION_PAYMENT_REFUND, Set.of(SagaState.COMPENSATION_HOTEL_CANCEL)),
        Map.entry(SagaState.BOOKING_CANCELLED, Set.of())
    );
    
    /**
     * Start a new booking saga
     */
    @Transactional
    public void startBookingSaga(UUID bookingId) {
        log.info("Starting booking saga for booking: {}", bookingId);
        
        // Create saga instance
        BookingSagaInstance saga = BookingSagaInstance.builder()
                .bookingId(bookingId)
                .currentState(SagaState.BOOKING_INITIATED)
                .build();
        
        saga = sagaRepository.save(saga);
        
        // Publish first command based on booking type
        Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
        if (bookingOpt.isPresent()) {
            Booking booking = bookingOpt.get();
            if (isComboBooking(booking)) {
                publishFlightReservationCommand(saga);
            } else if (booking.getBookingType() == BookingType.FLIGHT) {
                publishFlightReservationCommand(saga);
            } else if (booking.getBookingType() == BookingType.HOTEL) {
                publishHotelReservationCommand(saga);
            }
        }
    }
    
    // ============== EVENT LISTENERS ==============
    
    /**
     * Listen to flight service events from Debezium CDC
     */
    @KafkaListener(topics = "flight-db-server.public.flight_outbox_events", groupId = "booking-saga-group")
    @Transactional
    public void handleFlightEvent(FlightOutboxCdcMessage message) {
        try {
            if (message.getAfter() == null) {
                log.debug("Ignoring flight event with null after payload");
                return;
            }

            FlightOutboxCdcMessage.FlightOutboxEvent event = message.getAfter();
            String eventType = event.getEvent_type();

            // Parse payload to extract booking information
            JsonNode payload = objectMapper.readTree(event.getPayload());
            String bookingIdStr = payload.get("bookingId").asText();
            UUID bookingId = UUID.fromString(bookingIdStr);

            Optional<BookingSagaInstance> sagaOpt = sagaRepository.findByBookingId(bookingId);
            if (sagaOpt.isEmpty()) {
                log.warn("No saga found for booking: {}", bookingId);
                return;
            }

            BookingSagaInstance saga = sagaOpt.get();

            switch (eventType) {
                case "FlightReserved":
                    handleFlightReserved(saga);
                    break;
                case "FlightReservationFailed":
                    handleFlightReservationFailed(saga, payload);
                    break;
                default:
                    log.debug("Unhandled flight event: {}", eventType);
            }

        } catch (Exception e) {
            log.error("Error processing flight event: {}", message, e);
        }
    }
    
    /**
     * Listen to hotel service events from Debezium CDC
     */
    @KafkaListener(topics = "hotel-db-server.public.hotel_outbox_events", groupId = "booking-saga-group")
    @Transactional
    public void handleHotelEvent(HotelOutboxCdcMessage message) {
        try {
            if (message.getAfter() == null) {
                log.debug("Ignoring hotel event with null after payload");
                return;
            }

            HotelOutboxCdcMessage.HotelOutboxEvent event = message.getAfter();
            String eventType = event.getEvent_type();

            // Parse payload to extract booking information
            JsonNode payload = objectMapper.readTree(event.getPayload());
            String bookingIdStr = payload.get("bookingId").asText();
            UUID bookingId = UUID.fromString(bookingIdStr);

            Optional<BookingSagaInstance> sagaOpt = sagaRepository.findByBookingId(bookingId);
            if (sagaOpt.isEmpty()) {
                log.warn("No saga found for booking: {}", bookingId);
                return;
            }

            BookingSagaInstance saga = sagaOpt.get();

            switch (eventType) {
                case "HotelReserved":
                    handleHotelReserved(saga);
                    break;
                case "HotelReservationFailed":
                    handleHotelReservationFailed(saga, payload);
                    break;
                default:
                    log.debug("Unhandled hotel event: {}", eventType);
            }

        } catch (Exception e) {
            log.error("Error processing hotel event: {}", message, e);
        }
    }
    
    /**
     * Listen to payment service events from Debezium CDC
     */
    @KafkaListener(topics = "payment-db-server.public.payment_outbox_events", groupId = "booking-saga-group")
    @Transactional
    public void handlePaymentEvent(PaymentOutboxCdcMessage message) {
        try {
            if (message.getAfter() == null) {
                log.debug("Ignoring payment event with null after payload");
                return;
            }

            PaymentOutboxCdcMessage.PaymentOutboxEvent event = message.getAfter();
            String eventType = event.getEvent_type();

            // Parse payload to extract booking information
            JsonNode payload = objectMapper.readTree(event.getPayload());
            String bookingIdStr = payload.get("bookingId").asText();
            UUID bookingId = UUID.fromString(bookingIdStr);

            Optional<BookingSagaInstance> sagaOpt = sagaRepository.findByBookingId(bookingId);
            if (sagaOpt.isEmpty()) {
                log.warn("No saga found for booking: {}", bookingId);
                return;
            }

            BookingSagaInstance saga = sagaOpt.get();

            switch (eventType) {
                case "PaymentProcessed":
                    handlePaymentProcessed(saga);
                    break;
                case "PaymentFailed":
                    handlePaymentFailed(saga, payload);
                    break;
                default:
                    log.debug("Unhandled payment event: {}", eventType);
            }

        } catch (Exception e) {
            log.error("Error processing payment event: {}", message, e);
        }
    }
    
    // ============== EVENT HANDLERS ==============
    
    private void handleFlightReserved(BookingSagaInstance saga) {
        log.info("Flight reserved for saga: {}", saga.getSagaId());
        
        saga.setCurrentState(SagaState.FLIGHT_RESERVED);
        sagaRepository.save(saga);
        
        // Check if this is a combo booking (flight + hotel)
        Optional<Booking> bookingOpt = bookingRepository.findById(saga.getBookingId());
        if (bookingOpt.isPresent() && isComboBooking(bookingOpt.get())) {
            publishHotelReservationCommand(saga);
        } else {
            // Flight only - proceed to payment
            publishPaymentCommand(saga);
        }
    }
    
    private void handleFlightReservationFailed(BookingSagaInstance saga, JsonNode payload) {
        log.error("Flight reservation failed for saga: {}", saga.getSagaId());

        String reason = payload.has("errorMessage") ? payload.get("errorMessage").asText() : "Unknown error";
        startCompensation(saga, "Flight reservation failed: " + reason);
    }
    
    private void handleHotelReserved(BookingSagaInstance saga) {
        log.info("Hotel reserved for saga: {}", saga.getSagaId());
        
        saga.setCurrentState(SagaState.HOTEL_RESERVED);
        sagaRepository.save(saga);
        
        // Proceed to payment
        publishPaymentCommand(saga);
    }
    
    private void handleHotelReservationFailed(BookingSagaInstance saga, JsonNode payload) {
        log.error("Hotel reservation failed for saga: {}", saga.getSagaId());

        String reason = payload.has("errorMessage") ? payload.get("errorMessage").asText() : "Unknown error";
        saga.startCompensation("Hotel reservation failed: " + reason);
        saga.setCurrentState(SagaState.COMPENSATION_FLIGHT_CANCEL);
        sagaRepository.save(saga);

        publishFlightCancellationCommand(saga);
    }
    
    private void handlePaymentProcessed(BookingSagaInstance saga) {
        log.info("Payment processed for saga: {}", saga.getSagaId());
        
        saga.setCurrentState(SagaState.PAYMENT_COMPLETED);
        saga.complete();
        sagaRepository.save(saga);
        
        // Publish booking confirmed event
        publishBookingConfirmedEvent(saga);
        
        // Update booking entity to confirmed
        completeBookingEntity(saga);
    }
    
    private void handlePaymentFailed(BookingSagaInstance saga, JsonNode payload) {
        log.error("Payment failed for saga: {}", saga.getSagaId());

        String reason = payload.has("errorMessage") ? payload.get("errorMessage").asText() : "Unknown error";
        saga.startCompensation("Payment failed: " + reason);
        saga.setCurrentState(SagaState.COMPENSATION_HOTEL_CANCEL);
        sagaRepository.save(saga);

        publishHotelCancellationCommand(saga);
    }
    
    // ============== COMMAND PUBLISHERS ==============
    
    private void publishFlightReservationCommand(BookingSagaInstance saga) {
        log.info("Publishing flight reservation command for saga: {}", saga.getSagaId());

        saga.setCurrentState(SagaState.FLIGHT_RESERVATION_PENDING);
        sagaRepository.save(saga);

        try {
            // 1. Use existing outbox event publishing for backward compatibility
            eventPublisher.publishEvent(
                "FlightReservationCommand",
                "BookingSaga",
                saga.getSagaId(),
                createCommandPayload(saga, "RESERVE_FLIGHT")
            );

            // 2. NEW: Also send direct saga command for enhanced flow
            SagaCommand command = createTypedSagaCommand(saga, "RESERVE_FLIGHT");
            sagaCommandValidator.validateCommand(command);

            String commandPayload = objectMapper.writeValueAsString(command);
            sagaCommandKafkaTemplate.send("booking-saga-commands", saga.getSagaId(), commandPayload);

            log.debug("Flight reservation command sent via both outbox and direct command for saga: {}", saga.getSagaId());

        } catch (Exception e) {
            log.error("Failed to send flight reservation command for saga: {}", saga.getSagaId(), e);
            handleCommandPublishingFailure(saga, "RESERVE_FLIGHT", e);
        }
    }
    
    private void publishHotelReservationCommand(BookingSagaInstance saga) {
        log.info("Publishing hotel reservation command for saga: {}", saga.getSagaId());

        saga.setCurrentState(SagaState.HOTEL_RESERVATION_PENDING);
        sagaRepository.save(saga);

        try {
            // 1. Use existing outbox event publishing for backward compatibility
            eventPublisher.publishEvent(
                "HotelReservationCommand",
                "BookingSaga",
                saga.getSagaId(),
                createCommandPayload(saga, "RESERVE_HOTEL")
            );

            // 2. NEW: Also send direct saga command for enhanced flow
            SagaCommand command = createTypedSagaCommand(saga, "RESERVE_HOTEL");
            sagaCommandValidator.validateCommand(command);

            String commandPayload = objectMapper.writeValueAsString(command);
            sagaCommandKafkaTemplate.send("booking-saga-commands", saga.getSagaId(), commandPayload);

            log.debug("Hotel reservation command sent via both outbox and direct command for saga: {}", saga.getSagaId());

        } catch (Exception e) {
            log.error("Failed to send hotel reservation command for saga: {}", saga.getSagaId(), e);
            handleCommandPublishingFailure(saga, "RESERVE_HOTEL", e);
        }
    }
    
    private void publishPaymentCommand(BookingSagaInstance saga) {
        log.info("Publishing payment command for saga: {}", saga.getSagaId());

        saga.setCurrentState(SagaState.PAYMENT_PENDING);
        sagaRepository.save(saga);

        try {
            // 1. Use existing outbox event publishing for backward compatibility
            eventPublisher.publishEvent(
                "PaymentCommand",
                "BookingSaga",
                saga.getSagaId(),
                createCommandPayload(saga, "PROCESS_PAYMENT")
            );

            // 2. NEW: Also send direct saga command for enhanced flow
            SagaCommand command = createTypedSagaCommand(saga, "PROCESS_PAYMENT");
            sagaCommandValidator.validateCommand(command);

            String commandPayload = objectMapper.writeValueAsString(command);
            sagaCommandKafkaTemplate.send("payment-saga-commands", saga.getSagaId(), commandPayload);

            log.debug("Payment command sent via both outbox and direct command for saga: {}", saga.getSagaId());

        } catch (Exception e) {
            log.error("Failed to send payment command for saga: {}", saga.getSagaId(), e);
            handleCommandPublishingFailure(saga, "PROCESS_PAYMENT", e);
        }
    }
    
    // ============== COMPENSATION COMMANDS ==============
    
    private void publishFlightCancellationCommand(BookingSagaInstance saga) {
        log.info("Publishing flight cancellation command for saga: {}", saga.getSagaId());
        
        eventPublisher.publishEvent(
            "FlightCancellationCommand",
            "BookingSaga",
            saga.getSagaId(),
            createCommandPayload(saga, "CANCEL_FLIGHT")
        );
    }
    
    private void publishHotelCancellationCommand(BookingSagaInstance saga) {
        log.info("Publishing hotel cancellation command for saga: {}", saga.getSagaId());
        
        eventPublisher.publishEvent(
            "HotelCancellationCommand", 
            "BookingSaga",
            saga.getSagaId(),
            createCommandPayload(saga, "CANCEL_HOTEL")
        );
    }
    
    private void publishBookingConfirmedEvent(BookingSagaInstance saga) {
        log.info("Publishing booking confirmed event for saga: {}", saga.getSagaId());
        
        eventPublisher.publishEvent(
            "BookingConfirmed",
            "BookingSaga",
            saga.getSagaId(),
            createCommandPayload(saga, "BOOKING_CONFIRMED")
        );
    }
    
    // ============== STATE VALIDATION ==============
    
    /**
     * Validate if state transition is allowed
     */
    private boolean isValidTransition(SagaState fromState, SagaState toState) {
        Set<SagaState> allowedTransitions = VALID_TRANSITIONS.get(fromState);
        return allowedTransitions != null && allowedTransitions.contains(toState);
    }
    
    /**
     * Safely transition saga state with validation
     */
    private void transitionSagaState(BookingSagaInstance saga, SagaState newState) {
        if (isValidTransition(saga.getCurrentState(), newState)) {
            saga.setCurrentState(newState);
            sagaRepository.save(saga);
            log.debug("Saga {} transitioned from {} to {}", 
                     saga.getSagaId(), saga.getCurrentState(), newState);
        } else {
            log.warn("Invalid state transition attempted for saga {} from {} to {}", 
                    saga.getSagaId(), saga.getCurrentState(), newState);
        }
    }

    // ============== HELPER METHODS ==============
    
    private void startCompensation(BookingSagaInstance saga, String reason) {
        saga.startCompensation(reason);
        saga.setCurrentState(SagaState.COMPENSATION_BOOKING_CANCEL);
        sagaRepository.save(saga);
        
        // Update booking entity to cancelled
        cancelBookingEntity(saga);
        
        publishBookingCancellationEvent(saga);
    }
    
    private void publishBookingCancellationEvent(BookingSagaInstance saga) {
        eventPublisher.publishEvent(
            "BookingCancelled",
            "BookingSaga", 
            saga.getSagaId(),
            createCommandPayload(saga, "BOOKING_CANCELLED")
        );
    }
    
    private boolean isComboBooking(Booking booking) {
        // Check if booking includes both flight and hotel
        return booking.getBookingType() == BookingType.COMBO;
    }
    
    private String createCommandPayload(BookingSagaInstance saga, String action) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("sagaId", saga.getSagaId());
            payload.put("bookingId", saga.getBookingId());
            payload.put("action", action);
            payload.put("timestamp", System.currentTimeMillis());

            // Include detailed product information from booking
            Optional<Booking> bookingOpt = bookingRepository.findById(saga.getBookingId());
            if (bookingOpt.isPresent()) {
                Booking booking = bookingOpt.get();
                payload.put("customerId", booking.getUserId());
                payload.put("bookingType", booking.getBookingType());
                payload.put("totalAmount", booking.getTotalAmount());

                // Include product details JSON for enhanced processing
                if (booking.getProductDetailsJson() != null && !booking.getProductDetailsJson().isEmpty()) {
                    try {
                        JsonNode productDetails = objectMapper.readTree(booking.getProductDetailsJson());

                        // Add specific details based on action
                        if (action.equals("RESERVE_FLIGHT")) {
                            payload.put("flightDetails", productDetails);
                        } else if (action.equals("RESERVE_HOTEL")) {
                            payload.put("hotelDetails", productDetails);
                        }
                    } catch (Exception e) {
                        log.warn("Failed to parse product details for saga: {}", saga.getSagaId(), e);
                    }
                }
            }

            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            log.error("Error creating command payload", e);
            return "{}";
        }
    }
    
    /**
     * Complete booking and update booking entity
     */
    private void completeBookingEntity(BookingSagaInstance saga) {
        try {
            Optional<Booking> bookingOpt = bookingRepository.findById(saga.getBookingId());
            if (bookingOpt.isPresent()) {
                Booking booking = bookingOpt.get();
                booking.setStatus(BookingStatus.CONFIRMED);
                booking.setConfirmationNumber("BS-" + System.currentTimeMillis());
                booking.setSagaState(SagaState.BOOKING_COMPLETED);
                bookingRepository.save(booking);
                
                log.info("Booking entity updated to CONFIRMED: {}", booking.getBookingId());
            }
        } catch (Exception e) {
            log.error("Failed to update booking entity for saga: {}", saga.getSagaId(), e);
        }
    }
    
    /**
     * Cancel booking and update booking entity
     */
    private void cancelBookingEntity(BookingSagaInstance saga) {
        try {
            Optional<Booking> bookingOpt = bookingRepository.findById(saga.getBookingId());
            if (bookingOpt.isPresent()) {
                Booking booking = bookingOpt.get();
                booking.setStatus(BookingStatus.CANCELLED);
                booking.setCancellationReason(saga.getCompensationReason());
                booking.setSagaState(SagaState.BOOKING_CANCELLED);
                bookingRepository.save(booking);
                
                log.info("Booking entity updated to CANCELLED: {}", booking.getBookingId());
            }
        } catch (Exception e) {
            log.error("Failed to update booking entity for saga: {}", saga.getSagaId(), e);
        }
    }

    // ============== NEW SAGA COMMAND HELPER METHODS ==============

    /**
     * Creates a typed SagaCommand with product details
     */
    private SagaCommand createTypedSagaCommand(BookingSagaInstance saga, String action) {
        try {
            SagaCommand command = SagaCommand.builder()
                .sagaId(saga.getSagaId())
                .bookingId(saga.getBookingId())
                .action(action)
                .build();

            Optional<Booking> bookingOpt = bookingRepository.findById(saga.getBookingId());
            if (bookingOpt.isPresent()) {
                Booking booking = bookingOpt.get();
                command.setCustomerId(booking.getUserId());
                command.setBookingType(booking.getBookingType().name());
                command.setTotalAmount(booking.getTotalAmount());

                // Add product details based on action and booking type
                addProductDetailsToCommand(command, booking, action);
            }

            return command;
        } catch (Exception e) {
            log.error("Error creating typed saga command for saga: {}", saga.getSagaId(), e);
            throw new RuntimeException("Failed to create saga command", e);
        }
    }

    /**
     * Adds product details to saga command based on action and booking type
     */
    private void addProductDetailsToCommand(SagaCommand command, Booking booking, String action) {
        if (booking.getProductDetailsJson() == null || booking.getProductDetailsJson().isEmpty()) {
            return;
        }

        try {
            // Use existing ProductDetailsService to get typed details
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

    private void addFlightDetailsToCommand(SagaCommand command, BookingType bookingType, Object productDetails) {
        if (bookingType == BookingType.FLIGHT) {
            command.setFlightDetails(productDetails);
        } else if (bookingType == BookingType.COMBO) {
            // For combo bookings, extract flight details from the combo object
            try {
                JsonNode comboNode = objectMapper.valueToTree(productDetails);
                if (comboNode.has("flightDetails")) {
                    command.setFlightDetails(objectMapper.treeToValue(comboNode.get("flightDetails"), Object.class));
                }
            } catch (Exception e) {
                log.warn("Failed to extract flight details from combo booking", e);
            }
        }
    }

    private void addHotelDetailsToCommand(SagaCommand command, BookingType bookingType, Object productDetails) {
        if (bookingType == BookingType.HOTEL) {
            command.setHotelDetails(productDetails);
        } else if (bookingType == BookingType.COMBO) {
            // For combo bookings, extract hotel details from the combo object
            try {
                JsonNode comboNode = objectMapper.valueToTree(productDetails);
                if (comboNode.has("hotelDetails")) {
                    command.setHotelDetails(objectMapper.treeToValue(comboNode.get("hotelDetails"), Object.class));
                }
            } catch (Exception e) {
                log.warn("Failed to extract hotel details from combo booking", e);
            }
        }
    }

    private void addPaymentDetailsToCommand(SagaCommand command, BookingType bookingType, Object productDetails) {
        // Create payment details from command information
        Map<String, Object> paymentDetails = new HashMap<>();
        paymentDetails.put("bookingId", command.getBookingId());
        paymentDetails.put("customerId", command.getCustomerId());
        paymentDetails.put("totalAmount", command.getTotalAmount());
        paymentDetails.put("currency", "VND");

        // Add booking-type specific description
        if (bookingType == BookingType.FLIGHT) {
            paymentDetails.put("description", "Flight booking payment");
        } else if (bookingType == BookingType.HOTEL) {
            paymentDetails.put("description", "Hotel booking payment");
        } else if (bookingType == BookingType.COMBO) {
            paymentDetails.put("description", "Combo booking payment: Flight + Hotel");
        }

        command.setPaymentDetails(paymentDetails);
    }

    /**
     * Gets user ID from saga instance
     */
    private UUID getUserId(BookingSagaInstance saga) {
        try {
            Optional<Booking> bookingOpt = bookingRepository.findById(saga.getBookingId());
            return bookingOpt.map(Booking::getUserId).orElse(null);
        } catch (Exception e) {
            log.warn("Failed to get user ID for saga: {}", saga.getSagaId(), e);
            return null;
        }
    }

    /**
     * Handles command publishing failures
     */
    private void handleCommandPublishingFailure(BookingSagaInstance saga, String action, Exception e) {
        log.error("Command publishing failed for saga: {}, action: {}", saga.getSagaId(), action, e);

        // Use existing compensation logic
        startCompensation(saga, "Command publishing failed: " + e.getMessage());
    }
}
