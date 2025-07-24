package com.pdh.flight.kafka.consumer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.common.kafka.cdc.BaseCdcConsumer;
import com.pdh.common.kafka.cdc.message.BookingCdcMessage;
import com.pdh.common.kafka.cdc.message.BookingMsgKey;
import com.pdh.flight.dto.FlightBookingDetailsDto;
import com.pdh.flight.service.FlightService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import java.util.UUID;

import static org.springframework.kafka.support.KafkaHeaders.RECEIVED_KEY;
import static org.springframework.kafka.support.KafkaHeaders.RECEIVED_TOPIC;

/**
 * Flight Event Consumer
 * Listens to booking-related events from Kafka
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class FlightEventConsumer extends BaseCdcConsumer<BookingMsgKey, BookingCdcMessage> {

    private final FlightService flightService;
    private final ObjectMapper objectMapper;

    @KafkaListener(
        topics = "booking-db-server.public.booking_outbox_events",
        containerFactory = "flightEventListenerContainerFactory"
    )
    public void processFlightEvent(
        @Payload BookingCdcMessage message,
        @Header(RECEIVED_KEY) BookingMsgKey key,
        @Header(RECEIVED_TOPIC) String topic
    ) {
        log.info("Received flight event from topic {}: {}", topic, message);

        try {
            handleCdcMessage(key, message, message.getOp());
        } catch (Exception e) {
            log.error("Error processing flight event: {}", message, e);
            // Here you could implement dead letter queue or retry logic
        }
    }

    @Override
    protected void handleCreate(BookingMsgKey key, BookingCdcMessage message) {
        log.info("Processing flight booking creation for booking: {}", key.getId());
        flightService.reserveFlight(key.getId());
    }

    @Override
    protected void handleUpdate(BookingMsgKey key, BookingCdcMessage message) {
        log.info("Processing flight booking update for booking: {}", key.getId());
        // For this example, we assume an update means a re-reservation.
        // In a real-world scenario, you would have more specific logic.
        flightService.reserveFlight(key.getId());
    }

    @Override
    protected void handleDelete(BookingMsgKey key, BookingCdcMessage message) {
        log.info("Processing flight booking cancellation for booking: {}", key.getId());
        flightService.cancelFlightReservation(key.getId());
    }

    // ============== NEW SAGA COMMAND LISTENER ==============

    /**
     * Listens to saga commands for enhanced flight operations
     * Works alongside existing CDC listeners for backward compatibility
     */
    @KafkaListener(
        topics = "booking-saga-commands",
        groupId = "flight-service-saga-group",
        containerFactory = "sagaCommandListenerContainerFactory"
    )
    public void handleSagaCommand(@Payload String message, Acknowledgment ack) {
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

            // Acknowledge message after successful processing
            ack.acknowledge();

        } catch (Exception e) {
            log.error("Error processing flight saga command: {}", message, e);
            // Don't acknowledge on error - message will be retried
        }
    }

    /**
     * Handles flight reservation commands with enhanced product details
     */
    private void handleFlightReservationCommand(JsonNode command) {
        try {
            UUID bookingId = UUID.fromString(command.get("bookingId").asText());
            String sagaId = command.get("sagaId").asText();

            log.info("Processing flight reservation command for booking: {}, saga: {}", bookingId, sagaId);

            if (command.has("flightDetails")) {
                // Enhanced flow with flight details
                JsonNode flightDetailsNode = command.get("flightDetails");
                log.debug("Using enhanced flight reservation with product details for booking: {}", bookingId);

                try {
                    // Convert JsonNode to FlightBookingDetailsDto
                    FlightBookingDetailsDto flightDetails = objectMapper.treeToValue(
                        flightDetailsNode, FlightBookingDetailsDto.class);

                    // Use existing enhanced method with proper DTO
                    flightService.reserveFlight(bookingId, sagaId, flightDetails);
                } catch (Exception e) {
                    log.error("Error converting flight details for booking: {}", bookingId, e);
                    // Fallback to legacy method
                    flightService.reserveFlight(bookingId);
                }
            } else {
                // Fallback to existing legacy method
                log.debug("Using legacy flight reservation method for booking: {}", bookingId);
                flightService.reserveFlight(bookingId);
            }

        } catch (Exception e) {
            log.error("Error handling flight reservation command", e);
            throw e; // Re-throw to prevent acknowledgment
        }
    }

    /**
     * Handles flight cancellation commands for compensation
     */
    private void handleFlightCancellationCommand(JsonNode command) {
        try {
            UUID bookingId = UUID.fromString(command.get("bookingId").asText());
            String sagaId = command.get("sagaId").asText();

            log.info("Processing flight cancellation command for booking: {}, saga: {}", bookingId, sagaId);

            // Check if this is a compensation command
            boolean isCompensation = command.has("metadata") &&
                command.get("metadata").has("isCompensation") &&
                "true".equals(command.get("metadata").get("isCompensation").asText());

            if (isCompensation) {
                log.info("Processing compensation flight cancellation for booking: {}", bookingId);
            }

            // Use existing cancellation method
            flightService.cancelFlightReservation(bookingId);

        } catch (Exception e) {
            log.error("Error handling flight cancellation command", e);
            throw e; // Re-throw to prevent acknowledgment
        }
    }
}
