package com.pdh.booking.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.common.outbox.service.OutboxEventService;
import com.pdh.booking.model.BookingOutboxEvent;
import com.pdh.booking.repository.BookingOutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Booking-specific implementation of OutboxEventService
 * Publishes events to booking_outbox_events table
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BookingOutboxEventService implements OutboxEventService {

    private final BookingOutboxEventRepository bookingOutboxEventRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public void publishEvent(String eventType, String aggregateType, String aggregateId, Object eventPayload) {
        try {
            String payload = objectMapper.writeValueAsString(eventPayload);

            BookingOutboxEvent event = BookingOutboxEvent.createBookingEvent(eventType, aggregateType, aggregateId, payload);
            bookingOutboxEventRepository.save(event);

            log.debug("Published booking event to outbox: eventType={}, aggregateType={}, aggregateId={}",
                     eventType, aggregateType, aggregateId);

        } catch (JsonProcessingException e) {
            log.error("Error serializing event payload for eventType: {}, aggregateId: {}", eventType, aggregateId, e);
            throw new RuntimeException("Failed to serialize event payload", e);
        } catch (Exception e) {
            log.error("Error publishing booking event to outbox: eventType={}, aggregateId={}", eventType, aggregateId, e);
            throw new RuntimeException("Failed to publish event to outbox", e);
        }
    }
}
