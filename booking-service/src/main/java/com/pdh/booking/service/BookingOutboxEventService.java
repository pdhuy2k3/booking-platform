package com.pdh.booking.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.common.outbox.service.OutboxEventService;
import com.pdh.booking.model.BookingOutboxEvent;
import com.pdh.booking.repository.BookingOutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.Map;
import java.util.UUID;

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
            String payload;

            if (eventPayload instanceof String) {
                payload = (String) eventPayload;
            } else {
                payload = objectMapper.writeValueAsString(eventPayload);
            }

            BookingOutboxEvent event;
            
            // Use the proper factory method for booking events
            if ("Booking".equals(aggregateType) && eventPayload instanceof Map) {
                // Try to extract bookingId and userId from the payload
                @SuppressWarnings("unchecked")
                Map<String, Object> payloadMap = (Map<String, Object>) eventPayload;
                UUID bookingId = null;
                UUID userId = null;
                String sagaId = null;
                
                if (payloadMap.containsKey("bookingId")) {
                    try {
                        bookingId = UUID.fromString(payloadMap.get("bookingId").toString());
                    } catch (Exception e) {
                        log.warn("Failed to parse bookingId from payload: {}", payloadMap.get("bookingId"));
                    }
                }
                
                if (payloadMap.containsKey("customerId")) {
                    try {
                        userId = UUID.fromString(payloadMap.get("customerId").toString());
                    } catch (Exception e) {
                        log.warn("Failed to parse customerId from payload: {}", payloadMap.get("customerId"));
                    }
                }
                
                if (payloadMap.containsKey("sagaId")) {
                    sagaId = payloadMap.get("sagaId").toString();
                }
                
                if (bookingId != null && userId != null) {
                    // Use the ExtendedOutboxEvent approach but with our entity
                    event = new BookingOutboxEvent();
                    event.setEventType(eventType);
                    event.setAggregateId(bookingId.toString());
                    event.setAggregateType("Booking");
                    event.setBookingId(bookingId);
                    event.setUserId(userId);
                    if (sagaId != null) {
                        event.setSagaId(sagaId);
                    }
                    event.setPayload(payload);
                    event.setTopic("booking-events");
                    event.setPartitionKey(bookingId.toString());
                    event.setPriority(3); // Normal priority for booking events
                } else {
                    // Fallback to the existing method
                    event = BookingOutboxEvent.createBookingEvent(eventType, aggregateType, aggregateId, payload);
                }
            } else {
                // For other event types, use the existing method
                event = BookingOutboxEvent.createBookingEvent(eventType, aggregateType, aggregateId, payload);
            }
            
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
