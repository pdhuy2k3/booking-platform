package com.pdh.common.outbox.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.common.outbox.BaseOutboxEvent;
import com.pdh.common.outbox.ExtendedOutboxEvent;
import com.pdh.common.outbox.SimpleOutboxEvent;
import com.pdh.common.outbox.repository.BaseOutboxEventRepository;
import com.pdh.common.outbox.repository.ExtendedOutboxEventRepository;
import com.pdh.common.outbox.repository.SimpleOutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Shared Outbox Event Publisher Service
 * Provides methods to publish events to different types of outbox tables
 * This service should be called within the same transaction as the business operation
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OutboxEventPublisher {
    
    private final ObjectMapper objectMapper;
    private final BaseOutboxEventRepository<BaseOutboxEvent> baseOutboxEventRepository;
    private final ExtendedOutboxEventRepository extendedOutboxEventRepository;
    private final SimpleOutboxEventRepository simpleOutboxEventRepository;
    
    /**
     * Publish event using BaseOutboxEvent (standard outbox with retry mechanism)
     */
    @Transactional
    public void publishEvent(String eventType, String aggregateType, String aggregateId, Object eventPayload) {
        try {
            String payload = objectMapper.writeValueAsString(eventPayload);
            
            BaseOutboxEvent outboxEvent = new BaseOutboxEvent(
                null, // id will be auto-generated
                UUID.randomUUID().toString(), // eventId
                eventType,
                aggregateId,
                aggregateType,
                payload,
                false, // not processed yet
                null, // processedAt
                0, // retryCount
                3, // maxRetries
                null, // nextRetryAt
                null  // errorMessage
            );
            
            baseOutboxEventRepository.save(outboxEvent);
            
            log.debug("Published event to base outbox: eventType={}, aggregateType={}, aggregateId={}",
                     eventType, aggregateType, aggregateId);
                     
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize event payload for eventType={}, aggregateType={}, aggregateId={}",
                     eventType, aggregateType, aggregateId, e);
            throw new RuntimeException("Failed to serialize event payload", e);
        }
    }
    
    /**
     * Publish event using BaseOutboxEvent with custom retry settings
     */
    @Transactional
    public void publishEvent(String eventType, String aggregateType, String aggregateId, 
                           Object eventPayload, int maxRetries) {
        try {
            String payload = objectMapper.writeValueAsString(eventPayload);
            
            BaseOutboxEvent outboxEvent = new BaseOutboxEvent(
                null, // id will be auto-generated
                UUID.randomUUID().toString(), // eventId
                eventType,
                aggregateId,
                aggregateType,
                payload,
                false, // not processed yet
                null, // processedAt
                0, // retryCount
                maxRetries,
                null, // nextRetryAt
                null  // errorMessage
            );
            
            baseOutboxEventRepository.save(outboxEvent);
            
            log.debug("Published event to base outbox with maxRetries={}: eventType={}, aggregateType={}, aggregateId={}",
                     maxRetries, eventType, aggregateType, aggregateId);
                     
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize event payload for eventType={}, aggregateType={}, aggregateId={}",
                     eventType, aggregateType, aggregateId, e);
            throw new RuntimeException("Failed to serialize event payload", e);
        }
    }
    
    /**
     * Publish extended outbox event with saga support
     */
    @Transactional
    public void publishExtendedEvent(ExtendedOutboxEvent event) {
        extendedOutboxEventRepository.save(event);
        
        log.debug("Published extended outbox event: eventType={}, aggregateType={}, aggregateId={}, sagaId={}",
                 event.getEventType(), event.getAggregateType(), event.getAggregateId(), event.getSagaId());
    }
    
    /**
     * Publish payment event using ExtendedOutboxEvent
     */
    @Transactional
    public void publishPaymentEvent(String eventType, UUID paymentId, String sagaId, 
                                  UUID bookingId, UUID userId, Object eventPayload) {
        try {
            String payload = objectMapper.writeValueAsString(eventPayload);
            
            ExtendedOutboxEvent event = ExtendedOutboxEvent.createPaymentEvent(
                eventType, paymentId, sagaId, bookingId, userId, payload);
            
            publishExtendedEvent(event);
            
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize payment event payload for paymentId={}", paymentId, e);
            throw new RuntimeException("Failed to serialize payment event payload", e);
        }
    }
    
    /**
     * Publish saga event using ExtendedOutboxEvent
     */
    @Transactional
    public void publishSagaEvent(String eventType, String sagaId, UUID bookingId, 
                               UUID userId, Object eventPayload) {
        try {
            String payload = objectMapper.writeValueAsString(eventPayload);
            
            ExtendedOutboxEvent event = ExtendedOutboxEvent.createSagaEvent(
                eventType, sagaId, bookingId, userId, payload);
            
            publishExtendedEvent(event);
            
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize saga event payload for sagaId={}", sagaId, e);
            throw new RuntimeException("Failed to serialize saga event payload", e);
        }
    }
    
    /**
     * Publish booking event using ExtendedOutboxEvent
     */
    @Transactional
    public void publishBookingEvent(String eventType, UUID bookingId, UUID userId, Object eventPayload) {
        try {
            String payload = objectMapper.writeValueAsString(eventPayload);
            
            ExtendedOutboxEvent event = ExtendedOutboxEvent.createBookingEvent(
                eventType, bookingId, userId, payload);
            
            publishExtendedEvent(event);
            
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize booking event payload for bookingId={}", bookingId, e);
            throw new RuntimeException("Failed to serialize booking event payload", e);
        }
    }
    
    /**
     * Publish simple outbox event (lightweight, no retry mechanism)
     */
    @Transactional
    public void publishSimpleEvent(String eventType, String aggregateType, String aggregateId, Object eventPayload) {
        try {
            String payload = objectMapper.writeValueAsString(eventPayload);
            
            SimpleOutboxEvent event = SimpleOutboxEvent.create(eventType, aggregateType, aggregateId, payload);
            
            simpleOutboxEventRepository.save(event);
            
            log.debug("Published simple outbox event: eventType={}, aggregateType={}, aggregateId={}",
                     eventType, aggregateType, aggregateId);
                     
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize simple event payload for eventType={}, aggregateType={}, aggregateId={}",
                     eventType, aggregateType, aggregateId, e);
            throw new RuntimeException("Failed to serialize simple event payload", e);
        }
    }
    
    /**
     * Publish flight event using SimpleOutboxEvent
     */
    @Transactional
    public void publishFlightEvent(String eventType, UUID flightId, Object eventPayload) {
        try {
            String payload = objectMapper.writeValueAsString(eventPayload);
            
            SimpleOutboxEvent event = SimpleOutboxEvent.createFlightEvent(eventType, flightId, payload);
            
            simpleOutboxEventRepository.save(event);
            
            log.debug("Published flight event: eventType={}, flightId={}", eventType, flightId);
            
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize flight event payload for flightId={}", flightId, e);
            throw new RuntimeException("Failed to serialize flight event payload", e);
        }
    }
    
    /**
     * Publish hotel event using SimpleOutboxEvent
     */
    @Transactional
    public void publishHotelEvent(String eventType, UUID hotelId, Object eventPayload) {
        try {
            String payload = objectMapper.writeValueAsString(eventPayload);
            
            SimpleOutboxEvent event = SimpleOutboxEvent.createHotelEvent(eventType, hotelId, payload);
            
            simpleOutboxEventRepository.save(event);
            
            log.debug("Published hotel event: eventType={}, hotelId={}", eventType, hotelId);
            
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize hotel event payload for hotelId={}", hotelId, e);
            throw new RuntimeException("Failed to serialize hotel event payload", e);
        }
    }
    
    /**
     * Publish notification event using SimpleOutboxEvent
     */
    @Transactional
    public void publishNotificationEvent(String eventType, UUID notificationId, Object eventPayload) {
        try {
            String payload = objectMapper.writeValueAsString(eventPayload);
            
            SimpleOutboxEvent event = SimpleOutboxEvent.createNotificationEvent(eventType, notificationId, payload);
            
            simpleOutboxEventRepository.save(event);
            
            log.debug("Published notification event: eventType={}, notificationId={}", eventType, notificationId);
            
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize notification event payload for notificationId={}", notificationId, e);
            throw new RuntimeException("Failed to serialize notification event payload", e);
        }
    }
}
