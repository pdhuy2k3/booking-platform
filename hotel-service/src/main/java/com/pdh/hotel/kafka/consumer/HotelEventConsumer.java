package com.pdh.hotel.kafka.consumer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.common.kafka.cdc.BaseCdcConsumer;
import com.pdh.common.kafka.cdc.message.BookingCdcMessage;
import com.pdh.common.kafka.cdc.message.BookingMsgKey;
import com.pdh.hotel.dto.HotelBookingDetailsDto;
import com.pdh.hotel.service.HotelService;
import com.pdh.common.saga.CompensationHandler;
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
 * Hotel Event Consumer
 * Listens to booking-related events from Kafka
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class HotelEventConsumer extends BaseCdcConsumer<BookingMsgKey, BookingCdcMessage> {

    private final HotelService hotelService;
    private final ObjectMapper objectMapper;

    // Phase 3: Enhanced compensation support
    private final CompensationHandler compensationHandler;

    @KafkaListener(
        topics = "booking-db-server.public.booking_outbox_events",
        containerFactory = "hotelEventListenerContainerFactory"
    )
    public void processHotelEvent(
        @Payload BookingCdcMessage message,
        @Header(RECEIVED_KEY) BookingMsgKey key,
        @Header(RECEIVED_TOPIC) String topic
    ) {
        log.info("Received hotel event from topic {}: {}", topic, message);

        try {
            handleCdcMessage(key, message, message.getOp());
        } catch (Exception e) {
            log.error("Error processing hotel event: {}", message, e);
            // Here you could implement dead letter queue or retry logic
        }
    }

    @Override
    protected void handleCreate(BookingMsgKey key, BookingCdcMessage message) {
        log.info("Processing hotel booking creation for booking: {}", key.getId());
        hotelService.reserveHotel(key.getId());
    }

    @Override
    protected void handleUpdate(BookingMsgKey key, BookingCdcMessage message) {
        log.info("Processing hotel booking update for booking: {}", key.getId());
        // For this example, we assume an update means a re-reservation.
        // In a real-world scenario, you would have more specific logic.
        hotelService.reserveHotel(key.getId());
    }

    @Override
    protected void handleDelete(BookingMsgKey key, BookingCdcMessage message) {
        log.info("Processing hotel booking cancellation for booking: {}", key.getId());
        hotelService.cancelHotelReservation(key.getId());
    }

    // ============== NEW SAGA COMMAND LISTENER ==============

    /**
     * Listens to saga commands for enhanced hotel operations
     * Works alongside existing CDC listeners for backward compatibility
     */
    @KafkaListener(
        topics = "booking-saga-commands",
        groupId = "hotel-service-saga-group",
        containerFactory = "sagaCommandListenerContainerFactory"
    )
    public void handleSagaCommand(@Payload String message, Acknowledgment ack) {
        try {
            log.debug("Received saga command: {}", message);
            JsonNode command = objectMapper.readTree(message);
            String action = command.get("action").asText();

            switch (action) {
                case "RESERVE_HOTEL":
                    handleHotelReservationCommand(command);
                    break;
                case "CANCEL_HOTEL":
                    handleHotelCancellationCommand(command);
                    break;
                default:
                    log.debug("Unhandled hotel saga command: {}", action);
            }

            // Acknowledge message after successful processing
            ack.acknowledge();

        } catch (Exception e) {
            log.error("Error processing hotel saga command: {}", message, e);
            // Don't acknowledge on error - message will be retried
        }
    }

    /**
     * Handles hotel reservation commands with enhanced product details
     */
    private void handleHotelReservationCommand(JsonNode command) {
        try {
            UUID bookingId = UUID.fromString(command.get("bookingId").asText());
            String sagaId = command.get("sagaId").asText();

            log.info("Processing hotel reservation command for booking: {}, saga: {}", bookingId, sagaId);

            if (command.has("hotelDetails")) {
                // Enhanced flow with hotel details
                JsonNode hotelDetailsNode = command.get("hotelDetails");
                log.debug("Using enhanced hotel reservation with product details for booking: {}", bookingId);

                try {
                    // Convert JsonNode to HotelBookingDetailsDto
                    HotelBookingDetailsDto hotelDetails = objectMapper.treeToValue(
                        hotelDetailsNode, HotelBookingDetailsDto.class);

                    // Use existing enhanced method with proper DTO
                    hotelService.reserveHotel(bookingId, sagaId, hotelDetails);
                } catch (Exception e) {
                    log.error("Error converting hotel details for booking: {}", bookingId, e);
                    // Fallback to legacy method
                    hotelService.reserveHotel(bookingId);
                }
            } else {
                // Fallback to existing legacy method
                log.debug("Using legacy hotel reservation method for booking: {}", bookingId);
                hotelService.reserveHotel(bookingId);
            }

        } catch (Exception e) {
            log.error("Error handling hotel reservation command", e);
            throw e; // Re-throw to prevent acknowledgment
        }
    }

    /**
     * Handles hotel cancellation commands for compensation
     */
    private void handleHotelCancellationCommand(JsonNode command) {
        try {
            UUID bookingId = UUID.fromString(command.get("bookingId").asText());
            String sagaId = command.get("sagaId").asText();

            log.info("Processing hotel cancellation command for booking: {}, saga: {}", bookingId, sagaId);

            // Check if this is a compensation command
            boolean isCompensation = command.has("metadata") &&
                command.get("metadata").has("isCompensation") &&
                "true".equals(command.get("metadata").get("isCompensation").asText());

            if (isCompensation) {
                log.info("Processing compensation hotel cancellation for booking: {}", bookingId);

                // For compensation, use best effort cancellation
                try {
                    hotelService.cancelHotelReservation(bookingId);
                    log.info("Compensation hotel cancellation successful for booking: {}", bookingId);
                } catch (Exception e) {
                    log.warn("Compensation hotel cancellation failed for booking: {}, continuing anyway", bookingId, e);
                    // Don't re-throw for compensation - best effort
                    return; // Exit without re-throwing
                }
            } else {
                // Regular cancellation - fail if it doesn't work
                hotelService.cancelHotelReservation(bookingId);
            }

        } catch (Exception e) {
            log.error("Error handling hotel cancellation command", e);
            throw e; // Re-throw to prevent acknowledgment
        }
    }
}
