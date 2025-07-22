package com.pdh.common.outbox.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.common.outbox.BaseOutboxEvent;
import com.pdh.common.outbox.ExtendedOutboxEvent;
import com.pdh.common.outbox.SimpleOutboxEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

/**
 * Shared Outbox Event Publisher Service
 * Provides factory methods to create different types of outbox events
 * Services should save the events using their own repositories
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OutboxEventPublisher {
    
    private final ObjectMapper objectMapper;
    
    /**
     * Create BaseOutboxEvent (standard outbox with retry mechanism)
     */
    public BaseOutboxEvent createBaseEvent(String eventType, String aggregateType, String aggregateId, Object eventPayload) {
        try {
            String payload = objectMapper.writeValueAsString(eventPayload);

            BaseOutboxEvent outboxEvent = BaseOutboxEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .eventType(eventType)
                .aggregateId(aggregateId)
                .aggregateType(aggregateType)
                .payload(payload)
                .processed(false)
                .retryCount(0)
                .maxRetries(3)
                .build();

            log.debug("Created base outbox event: eventType={}, aggregateType={}, aggregateId={}",
                     eventType, aggregateType, aggregateId);

            return outboxEvent;

        } catch (JsonProcessingException e) {
            log.error("Failed to serialize event payload for eventType={}, aggregateType={}, aggregateId={}",
                     eventType, aggregateType, aggregateId, e);
            throw new RuntimeException("Failed to serialize event payload", e);
        }
    }
    
    /**
     * Create BaseOutboxEvent with custom retry settings
     */
    public BaseOutboxEvent createBaseEvent(String eventType, String aggregateType, String aggregateId,
                           Object eventPayload, int maxRetries) {
        try {
            String payload = objectMapper.writeValueAsString(eventPayload);

            BaseOutboxEvent outboxEvent = BaseOutboxEvent.builder()
                .eventId(UUID.randomUUID().toString())
                .eventType(eventType)
                .aggregateId(aggregateId)
                .aggregateType(aggregateType)
                .payload(payload)
                .processed(false)
                .retryCount(0)
                .maxRetries(maxRetries)
                .build();

            log.debug("Created base outbox event with maxRetries={}: eventType={}, aggregateType={}, aggregateId={}",
                     maxRetries, eventType, aggregateType, aggregateId);

            return outboxEvent;

        } catch (JsonProcessingException e) {
            log.error("Failed to serialize event payload for eventType={}, aggregateType={}, aggregateId={}",
                     eventType, aggregateType, aggregateId, e);
            throw new RuntimeException("Failed to serialize event payload", e);
        }
    }
    
    /**
     * Create payment event using ExtendedOutboxEvent
     */
    public ExtendedOutboxEvent createPaymentEvent(String eventType, UUID paymentId, String sagaId, 
                                  UUID bookingId, UUID userId, Object eventPayload) {
        try {
            String payload = objectMapper.writeValueAsString(eventPayload);
            
            ExtendedOutboxEvent event = ExtendedOutboxEvent.createPaymentEvent(
                eventType, paymentId, sagaId, bookingId, userId, payload);
            
            log.debug("Created payment event: eventType={}, paymentId={}, sagaId={}", eventType, paymentId, sagaId);
            
            return event;
            
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize payment event payload for paymentId={}", paymentId, e);
            throw new RuntimeException("Failed to serialize payment event payload", e);
        }
    }
    
    /**
     * Create saga event using ExtendedOutboxEvent
     */
    public ExtendedOutboxEvent createSagaEvent(String eventType, String sagaId, UUID bookingId, 
                               UUID userId, Object eventPayload) {
        try {
            String payload = objectMapper.writeValueAsString(eventPayload);
            
            ExtendedOutboxEvent event = ExtendedOutboxEvent.createSagaEvent(
                eventType, sagaId, bookingId, userId, payload);
            
            log.debug("Created saga event: eventType={}, sagaId={}", eventType, sagaId);
            
            return event;
            
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize saga event payload for sagaId={}", sagaId, e);
            throw new RuntimeException("Failed to serialize saga event payload", e);
        }
    }
    
    /**
     * Create booking event using ExtendedOutboxEvent
     */
    public ExtendedOutboxEvent createBookingEvent(String eventType, UUID bookingId, UUID userId, Object eventPayload) {
        try {
            String payload = objectMapper.writeValueAsString(eventPayload);
            
            ExtendedOutboxEvent event = ExtendedOutboxEvent.createBookingEvent(
                eventType, bookingId, userId, payload);
            
            log.debug("Created booking event: eventType={}, bookingId={}", eventType, bookingId);
            
            return event;
            
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize booking event payload for bookingId={}", bookingId, e);
            throw new RuntimeException("Failed to serialize booking event payload", e);
        }
    }
    
    /**
     * Create simple outbox event (lightweight, no retry mechanism)
     */
    public SimpleOutboxEvent createSimpleEvent(String eventType, String aggregateType, String aggregateId, Object eventPayload) {
        try {
            String payload = objectMapper.writeValueAsString(eventPayload);
            
            SimpleOutboxEvent event = SimpleOutboxEvent.create(eventType, aggregateType, aggregateId, payload);
            
            log.debug("Created simple outbox event: eventType={}, aggregateType={}, aggregateId={}",
                     eventType, aggregateType, aggregateId);
            
            return event;
                     
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize simple event payload for eventType={}, aggregateType={}, aggregateId={}",
                     eventType, aggregateType, aggregateId, e);
            throw new RuntimeException("Failed to serialize simple event payload", e);
        }
    }
    
    /**
     * Create flight event using SimpleOutboxEvent
     */
    public SimpleOutboxEvent createFlightEvent(String eventType, UUID flightId, Object eventPayload) {
        try {
            String payload = objectMapper.writeValueAsString(eventPayload);
            
            SimpleOutboxEvent event = SimpleOutboxEvent.createFlightEvent(eventType, flightId, payload);
            
            log.debug("Created flight event: eventType={}, flightId={}", eventType, flightId);
            
            return event;
            
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize flight event payload for flightId={}", flightId, e);
            throw new RuntimeException("Failed to serialize flight event payload", e);
        }
    }
    
    /**
     * Create hotel event using SimpleOutboxEvent
     */
    public SimpleOutboxEvent createHotelEvent(String eventType, UUID hotelId, Object eventPayload) {
        try {
            String payload = objectMapper.writeValueAsString(eventPayload);
            
            SimpleOutboxEvent event = SimpleOutboxEvent.createHotelEvent(eventType, hotelId, payload);
            
            log.debug("Created hotel event: eventType={}, hotelId={}", eventType, hotelId);
            
            return event;
            
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize hotel event payload for hotelId={}", hotelId, e);
            throw new RuntimeException("Failed to serialize hotel event payload", e);
        }
    }
    
    /**
     * Create notification event using SimpleOutboxEvent
     */
    public SimpleOutboxEvent createNotificationEvent(String eventType, UUID notificationId, Object eventPayload) {
        try {
            String payload = objectMapper.writeValueAsString(eventPayload);
            
            SimpleOutboxEvent event = SimpleOutboxEvent.createNotificationEvent(eventType, notificationId, payload);
            
            log.debug("Created notification event: eventType={}, notificationId={}", eventType, notificationId);
            
            return event;
            
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize notification event payload for notificationId={}", notificationId, e);
            throw new RuntimeException("Failed to serialize notification event payload", e);
        }
    }
}
