package com.pdh.hotel.kafka.consumer;

import com.pdh.common.kafka.cdc.BaseCdcConsumer;
import com.pdh.common.kafka.cdc.message.BookingCdcMessage;
import com.pdh.common.kafka.cdc.message.BookingMsgKey;
import com.pdh.hotel.service.HotelService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

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
}
