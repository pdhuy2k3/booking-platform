package com.pdh.flight.kafka.consumer;

import com.pdh.common.kafka.cdc.BaseCdcConsumer;
import com.pdh.common.kafka.cdc.message.BookingCdcMessage;
import com.pdh.common.kafka.cdc.message.BookingMsgKey;
import com.pdh.flight.service.FlightService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

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
}
