package com.pdh.notification.kafka.consumer;

import com.pdh.common.kafka.cdc.BaseCdcConsumer;
import com.pdh.common.kafka.cdc.message.BookingCdcMessage;
import com.pdh.common.kafka.cdc.message.BookingMsgKey;
import com.pdh.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import static org.springframework.kafka.support.KafkaHeaders.RECEIVED_KEY;
import static org.springframework.kafka.support.KafkaHeaders.RECEIVED_TOPIC;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventConsumer extends BaseCdcConsumer<BookingMsgKey, BookingCdcMessage> {

    private final NotificationService notificationService;

    @KafkaListener(
        topics = "booking-db-server.public.booking_outbox_events",
        containerFactory = "notificationEventListenerContainerFactory"
    )
    public void processNotificationEvent(
        @Payload BookingCdcMessage message,
        @Header(RECEIVED_KEY) BookingMsgKey key,
        @Header(RECEIVED_TOPIC) String topic
    ) {
        log.info("Received notification event from topic {}: {}", topic, message);

        try {
            handleCdcMessage(key, message, message.getOp());
        } catch (Exception e) {
            log.error("Error processing notification event: {}", message, e);
        }
    }

    @Override
    protected void handleCreate(BookingMsgKey key, BookingCdcMessage message) {
        log.info("Processing notification for booking: {}", key.getId());
        notificationService.sendBookingConfirmation(key.getId());
    }

    @Override
    protected void handleUpdate(BookingMsgKey key, BookingCdcMessage message) {
        log.info("Processing notification update for booking: {}", key.getId());
        notificationService.sendBookingConfirmation(key.getId());
    }

    @Override
    protected void handleDelete(BookingMsgKey key, BookingCdcMessage message) {
        log.info("Ignoring delete event for notification: {}", key.getId());
    }
}