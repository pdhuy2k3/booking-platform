package com.pdh.booking.saga;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.booking.model.Booking;
import com.pdh.booking.model.BookingSagaInstance;
import com.pdh.booking.model.SagaStateLog;
import com.pdh.booking.model.enums.BookingStatus;
import com.pdh.booking.model.enums.BookingType;
import com.pdh.booking.repository.BookingRepository;
import com.pdh.booking.repository.BookingSagaRepository;
import com.pdh.booking.repository.SagaStateLogRepository;
import com.pdh.booking.service.ProductDetailsService;
import com.pdh.common.saga.SagaCommand;
import com.pdh.common.saga.SagaState;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.Optional;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class BookingSagaOrchestrator {

    private static final String BOOKING_SAGA_COMMAND_TOPIC = "booking-saga-commands";
    private static final String PAYMENT_SAGA_COMMAND_TOPIC = "payment-saga-commands";

    private final BookingSagaRepository sagaRepository;
    private final BookingRepository bookingRepository;
    private final SagaStateLogRepository sagaStateLogRepository;
    private final ProductDetailsService productDetailsService;
    private final ObjectMapper objectMapper;
    @Qualifier("sagaCommandKafkaTemplate")
    private final KafkaTemplate<String, String> sagaCommandKafkaTemplate;

    /**
     * Start saga orchestration for a booking.
     */
    @Transactional
    public void startSaga(UUID bookingId) {
        Booking booking = bookingRepository.findByBookingId(bookingId)
            .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + bookingId));

        BookingSagaInstance saga = sagaRepository.findByBookingId(bookingId)
            .orElseGet(() -> sagaRepository.save(BookingSagaInstance.builder()
                .sagaId(booking.getSagaId())
                .bookingId(bookingId)
                .currentState(SagaState.BOOKING_INITIATED)
                .build()));

        updateBookingState(booking, SagaState.BOOKING_INITIATED, BookingStatus.PENDING);
        logStateTransition(saga, null, SagaState.BOOKING_INITIATED, "SagaStarted", null, null);

        if (booking.getBookingType() == BookingType.FLIGHT || booking.getBookingType() == BookingType.COMBO) {
            transitionState(saga, SagaState.FLIGHT_RESERVATION_PENDING, "FlightReservationRequested", null, null);
            publishFlightReservationCommand(booking, saga);
            return;
        }

        if (booking.getBookingType() == BookingType.HOTEL) {
            transitionState(saga, SagaState.HOTEL_RESERVATION_PENDING, "HotelReservationRequested", null, null);
            publishHotelReservationCommand(booking, saga);
            return;
        }

        transitionState(saga, SagaState.PAYMENT_PENDING, "PaymentRequested", null, null);
        publishPaymentCommand(booking, saga);
    }

    // ==== Kafka Listeners ====

    @KafkaListener(
        topics = { "booking.Booking.events", "booking.Payment.events" },
        groupId = "booking-saga-outbox-listener",
        containerFactory = "bookingOutboxListenerContainerFactory"
    )
    @Transactional
    public void handleOutboxEvents(@Payload JsonNode message,
                                   @Header(value = "eventType", required = false) String eventTypeHeader) {
        if (message == null || message.isNull()) {
            return;
        }

        String eventType = resolveEventType(message, eventTypeHeader);

        if (StringUtils.isBlank(eventType)) {
            eventType = extractEventType(message);
        }

        String payloadJson = extractPayloadJson(message.get("payload"));
        if (StringUtils.isBlank(payloadJson)) {
            payloadJson = message.toString();
        }

        JsonNode payloadNode = null;
        try {
            payloadNode = objectMapper.readTree(payloadJson);
        }
        catch (Exception ex) {
            // leave payloadNode null, will operate on raw JSON string
        }

        if (StringUtils.isBlank(eventType) && payloadNode != null) {
            eventType = extractEventType(payloadNode);
        }

        if (StringUtils.isBlank(eventType) && payloadNode != null) {
            JsonNode flightDetails = payloadNode.get("flightDetails");
            JsonNode hotelDetails = payloadNode.get("hotelDetails");
            JsonNode paymentDetails = payloadNode.get("payment");

            if (flightDetails != null && !flightDetails.isNull()) {
                eventType = "FlightReserved";
            }
            else if (hotelDetails != null && !hotelDetails.isNull()) {
                eventType = "HotelReserved";
            }
            else if (paymentDetails != null && !paymentDetails.isNull()) {
                eventType = "PaymentProcessed";
            }
        }

        if (StringUtils.isBlank(eventType)) {
            log.warn("Saga outbox event ignored due to missing event type. message={}", payloadJson);
            return;
        }

        if (StringUtils.isBlank(payloadJson)) {
            log.warn("Saga outbox event ignored due to missing payload. eventType={} message={}", eventType, message.toString());
            return;
        }

        switch (eventType) {
            case "FlightReserved", "FlightReservationFailed", "FlightReservationCancelled" ->
                processSagaCallback(payloadJson, eventType, this::handleFlightEvent);
            case "HotelReserved", "HotelReservationFailed", "HotelReservationCancelled" ->
                processSagaCallback(payloadJson, eventType, this::handleHotelEvent);
            case "PaymentProcessed", "PaymentFailed", "PaymentRefunded", "PaymentCancelled" ->
                processSagaCallback(payloadJson, eventType, this::handlePaymentEvent);
            default ->
                log.debug("Ignoring outbox event type {} for saga orchestration", eventType);
        }
    }

    private interface SagaEventHandler {
        void handle(BookingSagaInstance saga, Booking booking, String eventType, JsonNode payload) throws Exception;
    }

    private void processSagaCallback(String payloadJson, String eventType, SagaEventHandler handler) {
        if (StringUtils.isBlank(payloadJson)) {
            return;
        }

        try {
            JsonNode payload = objectMapper.readTree(payloadJson);
            JsonNode bookingIdNode = payload.get("bookingId");
            if (bookingIdNode == null || bookingIdNode.isNull()) {
                log.warn("Saga callback ignored due to missing bookingId: type={} payload={}", eventType, payloadJson);
                return;
            }

            UUID bookingId = UUID.fromString(bookingIdNode.asText());
            Optional<BookingSagaInstance> sagaOpt = sagaRepository.findByBookingId(bookingId);
            Optional<Booking> bookingOpt = bookingRepository.findByBookingId(bookingId);

            if (sagaOpt.isEmpty() || bookingOpt.isEmpty()) {
                log.warn("Saga callback ignored because saga or booking not found: bookingId={}, type={}", bookingId, eventType);
                return;
            }

            BookingSagaInstance saga = sagaOpt.get();
            if (saga.isCompleted()) {
                log.debug("Ignoring saga callback {} because saga {} already completed", eventType, saga.getSagaId());
                return;
            }

            handler.handle(saga, bookingOpt.get(), eventType, payload);
        } catch (Exception e) {
            log.error("Error processing saga callback eventType={} payload={} ", eventType, payloadJson, e);
        }
    }

    private String resolveEventType(JsonNode message, String eventTypeHeader) {
        if (StringUtils.isNotBlank(eventTypeHeader)) {
            return eventTypeHeader;
        }
        return readFirstTextValue(message, "type", "eventType", "event_type");
    }

    private String readFirstTextValue(JsonNode node, String... fieldNames) {
        if (node == null || node.isNull()) {
            return null;
        }
        for (String fieldName : fieldNames) {
            JsonNode valueNode = node.get(fieldName);
            if (valueNode != null && !valueNode.isNull()) {
                String value = valueNode.asText();
                if (StringUtils.isNotBlank(value) && !"null".equalsIgnoreCase(value)) {
                    return value;
                }
            }
        }
        return null;
    }

    private String extractEventType(JsonNode node) {
        return readFirstTextValue(node, "eventType", "event_type", "type");
    }

    private String extractPayloadJson(JsonNode payloadNode) {
        if (payloadNode == null || payloadNode.isNull()) {
            return null;
        }
        if (payloadNode.isTextual()) {
            return payloadNode.asText();
        }
        try {
            return objectMapper.writeValueAsString(payloadNode);
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize outbox payload node", e);
            return null;
        }
    }

    private void handleFlightEvent(BookingSagaInstance saga, Booking booking, String eventType, JsonNode payload) {
        switch (eventType) {
            case "FlightReserved" -> onFlightReserved(saga, booking, payload);
            case "FlightReservationFailed" -> onFlightReservationFailed(saga, booking, payload);
            case "FlightReservationCancelled" -> onFlightReservationCancelled(saga, booking, payload);
            default -> log.debug("Ignoring flight event {} for saga {}", eventType, saga.getSagaId());
        }
    }

    private void handleHotelEvent(BookingSagaInstance saga, Booking booking, String eventType, JsonNode payload) {
        switch (eventType) {
            case "HotelReserved" -> onHotelReserved(saga, booking, payload);
            case "HotelReservationFailed" -> onHotelReservationFailed(saga, booking, payload);
            case "HotelReservationCancelled" -> onHotelReservationCancelled(saga, booking, payload);
            default -> log.debug("Ignoring hotel event {} for saga {}", eventType, saga.getSagaId());
        }
    }

    private void handlePaymentEvent(BookingSagaInstance saga, Booking booking, String eventType, JsonNode payload) {
        switch (eventType) {
            case "PaymentProcessed" -> onPaymentProcessed(saga, booking, payload);
            case "PaymentFailed" -> onPaymentFailed(saga, booking, payload);
            case "PaymentRefunded" -> onPaymentRefunded(saga, booking, payload);
            case "PaymentCancelled" -> onPaymentCancelled(saga, booking, payload);
            default -> log.debug("Ignoring payment event {} for saga {}", eventType, saga.getSagaId());
        }
    }

    // ==== Flight handlers ====

    @Transactional
    void onFlightReserved(BookingSagaInstance saga, Booking booking, JsonNode payload) {
        log.info("Flight reserved for booking {} saga {}", booking.getBookingId(), saga.getSagaId());
        transitionState(saga, SagaState.FLIGHT_RESERVED, "FlightReserved", payload, null);

        if (booking.getBookingType() == BookingType.COMBO) {
            transitionState(saga, SagaState.HOTEL_RESERVATION_PENDING, "HotelReservationRequested", null, null);
            publishHotelReservationCommand(booking, saga);
        } else {
            transitionState(saga, SagaState.PAYMENT_PENDING, "PaymentRequested", null, null);
            publishPaymentCommand(booking, saga);
        }
    }

    @Transactional
    void onFlightReservationFailed(BookingSagaInstance saga, Booking booking, JsonNode payload) {
        log.warn("Flight reservation failed for booking {} saga {}", booking.getBookingId(), saga.getSagaId());
        cancelSaga(saga, booking, BookingStatus.VALIDATION_FAILED, "FlightReservationFailed", payload, "Flight reservation failed");
    }

    @Transactional
    void onFlightReservationCancelled(BookingSagaInstance saga, Booking booking, JsonNode payload) {
        log.info("Flight reservation cancellation acknowledged for booking {} saga {}", booking.getBookingId(), saga.getSagaId());
    }

    // ==== Hotel handlers ====

    @Transactional
    void onHotelReserved(BookingSagaInstance saga, Booking booking, JsonNode payload) {
        log.info("Hotel reserved for booking {} saga {}", booking.getBookingId(), saga.getSagaId());
        transitionState(saga, SagaState.HOTEL_RESERVED, "HotelReserved", payload, null);
        transitionState(saga, SagaState.PAYMENT_PENDING, "PaymentRequested", null, null);
        publishPaymentCommand(booking, saga);
    }

    @Transactional
    void onHotelReservationFailed(BookingSagaInstance saga, Booking booking, JsonNode payload) {
        log.warn("Hotel reservation failed for booking {} saga {}", booking.getBookingId(), saga.getSagaId());
        if (hasFlight(booking)) {
            requestFlightCancellation(saga, booking, payload, "Hotel reservation failed");
        }
        cancelSaga(saga, booking, BookingStatus.VALIDATION_FAILED, "HotelReservationFailed", payload, "Hotel reservation failed");
    }

    @Transactional
    void onHotelReservationCancelled(BookingSagaInstance saga, Booking booking, JsonNode payload) {
        log.info("Hotel reservation cancellation acknowledged for booking {} saga {}", booking.getBookingId(), saga.getSagaId());
    }

    // ==== Payment handlers ====

    @Transactional
    void onPaymentProcessed(BookingSagaInstance saga, Booking booking, JsonNode payload) {
        log.info("Payment processed for booking {} saga {}", booking.getBookingId(), saga.getSagaId());
        transitionState(saga, SagaState.PAYMENT_COMPLETED, "PaymentProcessed", payload, null);
        completeSaga(saga, booking, payload);
    }

    @Transactional
    void onPaymentFailed(BookingSagaInstance saga, Booking booking, JsonNode payload) {
        log.warn("Payment failed for booking {} saga {}", booking.getBookingId(), saga.getSagaId());
        if (hasHotel(booking)) {
            requestHotelCancellation(saga, booking, payload, "Payment failed");
        }
        if (hasFlight(booking)) {
            requestFlightCancellation(saga, booking, payload, "Payment failed");
        }
        cancelSaga(saga, booking, BookingStatus.PAYMENT_FAILED, "PaymentFailed", payload, "Payment processing failed");
    }

    @Transactional
    void onPaymentRefunded(BookingSagaInstance saga, Booking booking, JsonNode payload) {
        log.info("Payment refunded for booking {} saga {}", booking.getBookingId(), saga.getSagaId());
        transitionState(saga, SagaState.COMPENSATION_PAYMENT_REFUND, "PaymentRefunded", payload, null);
        cancelSaga(saga, booking, BookingStatus.CANCELLED, "PaymentRefunded", payload, "Payment refunded");
    }

    @Transactional
    void onPaymentCancelled(BookingSagaInstance saga, Booking booking, JsonNode payload) {
        log.info("Payment cancellation acknowledged for booking {} saga {}", booking.getBookingId(), saga.getSagaId());
    }

    // ==== Command publishing ====

    private void publishFlightReservationCommand(Booking booking, BookingSagaInstance saga) {
        SagaCommand command = SagaCommand.builder()
            .sagaId(saga.getSagaId())
            .bookingId(booking.getBookingId())
            .customerId(booking.getUserId())
            .bookingType(booking.getBookingType().name())
            .totalAmount(toBigDecimal(booking.getTotalAmount()))
            .action("RESERVE_FLIGHT")
            .flightDetails(productDetailsService.getFlightDetails(booking))
            .build();

        sendCommand(command, BOOKING_SAGA_COMMAND_TOPIC);
    }

    private void publishHotelReservationCommand(Booking booking, BookingSagaInstance saga) {
        SagaCommand command = SagaCommand.builder()
            .sagaId(saga.getSagaId())
            .bookingId(booking.getBookingId())
            .customerId(booking.getUserId())
            .bookingType(booking.getBookingType().name())
            .totalAmount(toBigDecimal(booking.getTotalAmount()))
            .action("RESERVE_HOTEL")
            .hotelDetails(productDetailsService.getHotelDetails(booking))
            .build();

        sendCommand(command, BOOKING_SAGA_COMMAND_TOPIC);
    }

    private void publishPaymentCommand(Booking booking, BookingSagaInstance saga) {
        SagaCommand command = SagaCommand.builder()
            .sagaId(saga.getSagaId())
            .bookingId(booking.getBookingId())
            .customerId(booking.getUserId())
            .bookingType(booking.getBookingType().name())
            .totalAmount(toBigDecimal(booking.getTotalAmount()))
            .action("PROCESS_PAYMENT")
            .build();

        command.addMetadata("currency", booking.getCurrency());
        sendCommand(command, PAYMENT_SAGA_COMMAND_TOPIC);
        updateBookingStatus(booking, BookingStatus.PAYMENT_PENDING);
    }

    private void sendCommand(SagaCommand command, String topic) {
        try {
            String payload = objectMapper.writeValueAsString(command);
            sagaCommandKafkaTemplate.send(topic, command.getSagaId(), payload);
            log.debug("Saga command sent: topic={} action={} sagaId={}", topic, command.getAction(), command.getSagaId());
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize saga command", e);
        }
    }

    private void requestFlightCancellation(BookingSagaInstance saga,
                                           Booking booking,
                                           JsonNode payload,
                                           String reason) {
        transitionState(saga, SagaState.COMPENSATION_FLIGHT_CANCEL, "FlightCancellationRequested", payload, reason);
        publishFlightCancellationCommand(booking, saga, reason);
    }

    private void requestHotelCancellation(BookingSagaInstance saga,
                                          Booking booking,
                                          JsonNode payload,
                                          String reason) {
        transitionState(saga, SagaState.COMPENSATION_HOTEL_CANCEL, "HotelCancellationRequested", payload, reason);
        publishHotelCancellationCommand(booking, saga, reason);
    }

    private void publishFlightCancellationCommand(Booking booking,
                                                  BookingSagaInstance saga,
                                                  String reason) {
        SagaCommand command = SagaCommand.builder()
            .sagaId(saga.getSagaId())
            .bookingId(booking.getBookingId())
            .customerId(booking.getUserId())
            .bookingType(booking.getBookingType().name())
            .totalAmount(toBigDecimal(booking.getTotalAmount()))
            .action("CANCEL_FLIGHT_RESERVATION")
            .flightDetails(productDetailsService.getFlightDetails(booking))
            .build();

        command.addMetadata("isCompensation", "true");
        if (reason != null) {
            command.addMetadata("reason", reason);
        }
        sendCommand(command, BOOKING_SAGA_COMMAND_TOPIC);
    }

    private void publishHotelCancellationCommand(Booking booking,
                                                 BookingSagaInstance saga,
                                                 String reason) {
        SagaCommand command = SagaCommand.builder()
            .sagaId(saga.getSagaId())
            .bookingId(booking.getBookingId())
            .customerId(booking.getUserId())
            .bookingType(booking.getBookingType().name())
            .totalAmount(toBigDecimal(booking.getTotalAmount()))
            .action("CANCEL_HOTEL_RESERVATION")
            .hotelDetails(productDetailsService.getHotelDetails(booking))
            .build();

        command.addMetadata("isCompensation", "true");
        if (reason != null) {
            command.addMetadata("reason", reason);
        }
        sendCommand(command, BOOKING_SAGA_COMMAND_TOPIC);
    }

    private boolean hasFlight(Booking booking) {
        return booking.getBookingType() == BookingType.FLIGHT || booking.getBookingType() == BookingType.COMBO;
    }

    private boolean hasHotel(Booking booking) {
        return booking.getBookingType() == BookingType.HOTEL || booking.getBookingType() == BookingType.COMBO;
    }

    // ==== State helpers ====

    private void transitionState(BookingSagaInstance saga,
                                 SagaState newState,
                                 String eventType,
                                 JsonNode payload,
                                 String errorMessage) {
        SagaState previous = saga.getCurrentState();
        if (previous == newState) {
            return;
        }
        saga.setCurrentState(newState);
        saga.setLastUpdatedAt(ZonedDateTime.now());
        sagaRepository.save(saga);
        bookingRepository.findByBookingId(saga.getBookingId())
            .ifPresent(b -> updateBookingState(b, newState, null));
        logStateTransition(saga, previous, newState, eventType, payload, errorMessage);
    }

    private void logStateTransition(BookingSagaInstance saga,
                                    SagaState from,
                                    SagaState to,
                                    String eventType,
                                    JsonNode payload,
                                    String errorMessage) {
        try {
            SagaStateLog logEntry = new SagaStateLog();
            logEntry.setSagaId(saga.getSagaId());
            logEntry.setBookingId(saga.getBookingId().toString());
            logEntry.setFromState(from);
            logEntry.setToState(to);
            logEntry.setEventType(eventType != null ? eventType : "STATE_TRANSITION");
            if (payload != null) {
                logEntry.setEventPayload(objectMapper.writeValueAsString(payload));
            }
            logEntry.setErrorMessage(errorMessage);
            sagaStateLogRepository.save(logEntry);
        } catch (JsonProcessingException e) {
            log.warn("Failed to serialize saga event payload for saga {}", saga.getSagaId(), e);
        }
    }

    private void cancelSaga(BookingSagaInstance saga,
                            Booking booking,
                            BookingStatus finalStatus,
                            String eventType,
                            JsonNode payload,
                            String reason) {
        saga.setIsCompensating(true);
        saga.setCompensationReason(reason);
        transitionState(saga, SagaState.BOOKING_CANCELLED, eventType, payload, reason);
        saga.setCompletedAt(ZonedDateTime.now());
        sagaRepository.save(saga);

        Booking latestBooking = bookingRepository.findByBookingId(booking.getBookingId())
            .orElse(booking);
        latestBooking.setSagaState(SagaState.BOOKING_CANCELLED);
        latestBooking.setStatus(finalStatus);
        latestBooking.setCancellationReason(reason);
        latestBooking.setCompensationReason(reason);
        latestBooking.setCancelledAt(ZonedDateTime.now());
        bookingRepository.save(latestBooking);
    }

    private void completeSaga(BookingSagaInstance saga, Booking booking, JsonNode payload) {
        transitionState(saga, SagaState.BOOKING_COMPLETED, "BookingCompleted", payload, null);
        saga.setCompletedAt(ZonedDateTime.now());
        sagaRepository.save(saga);

        booking.setStatus(BookingStatus.CONFIRMED);
        if (booking.getConfirmationNumber() == null || booking.getConfirmationNumber().isBlank()) {
            booking.setConfirmationNumber(generateConfirmationNumber());
        }
        booking.setSagaState(SagaState.BOOKING_COMPLETED);
        bookingRepository.save(booking);
    }

    private void updateBookingState(Booking booking, SagaState sagaState, BookingStatus status) {
        booking.setSagaState(sagaState);
        if (status != null) {
            booking.setStatus(status);
        }
        bookingRepository.save(booking);
    }

    private void updateBookingStatus(Booking booking, BookingStatus status) {
        booking.setStatus(status);
        bookingRepository.save(booking);
    }

    private String generateConfirmationNumber() {
        return "CNF-" + System.currentTimeMillis();
    }

    private BigDecimal toBigDecimal(Object amount) {
        if (amount instanceof BigDecimal bigDecimal) {
            return bigDecimal;
        }
        if (amount instanceof Number number) {
            return BigDecimal.valueOf(number.doubleValue());
        }
        return BigDecimal.ZERO;
    }
}
