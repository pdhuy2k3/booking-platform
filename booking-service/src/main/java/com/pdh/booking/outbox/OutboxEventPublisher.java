package com.pdh.booking.outbox;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.booking.model.OutboxEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Service for publishing events to the outbox table
 * This ensures that events are stored transactionally with business operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OutboxEventPublisher {
    
    private final OutboxEventRepository outboxEventRepository;
    private final ObjectMapper objectMapper;
    
    /**
     * Publishes an event to the outbox table
     * This method should be called within the same transaction as the business operation
     */
    @Transactional
    public void publishEvent(String eventType, String aggregateType, String aggregateId, Object eventPayload) {
        try {
            String payload = objectMapper.writeValueAsString(eventPayload);
            
            OutboxEvent outboxEvent = new OutboxEvent(
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
            
            outboxEventRepository.save(outboxEvent);
            
            log.debug("Published event to outbox: eventType={}, aggregateType={}, aggregateId={}", 
                     eventType, aggregateType, aggregateId);
                     
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize event payload: eventType={}, aggregateType={}, aggregateId={}", 
                     eventType, aggregateType, aggregateId, e);
            throw new RuntimeException("Failed to serialize event payload", e);
        }
    }
    
    /**
     * Publishes an event with custom retry configuration
     */
    @Transactional
    public void publishEvent(String eventType, String aggregateType, String aggregateId, 
                           Object eventPayload, int maxRetries) {
        try {
            String payload = objectMapper.writeValueAsString(eventPayload);
            
            OutboxEvent outboxEvent = new OutboxEvent(
                null,
                UUID.randomUUID().toString(),
                eventType,
                aggregateId,
                aggregateType,
                payload,
                false,
                null,
                0,
                maxRetries,
                null,
                null
            );
            
            outboxEventRepository.save(outboxEvent);
            
            log.debug("Published event to outbox with custom retry config: eventType={}, aggregateType={}, aggregateId={}, maxRetries={}", 
                     eventType, aggregateType, aggregateId, maxRetries);
                     
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize event payload: eventType={}, aggregateType={}, aggregateId={}", 
                     eventType, aggregateType, aggregateId, e);
            throw new RuntimeException("Failed to serialize event payload", e);
        }
    }
    
    /**
     * Convenient method for publishing events with automatic event type detection
     * Uses the simple class name as event type and "Booking" as aggregate type
     */
    @Transactional
    public void publishEvent(Object event, String aggregateId) {
        String eventType = event.getClass().getSimpleName();
        publishEvent(eventType, "Booking", aggregateId, event);
    }

    /**
     * Convenient method for publishing events with custom aggregate type
     */
    @Transactional  
    public void publishEvent(Object event, String aggregateType, String aggregateId) {
        String eventType = event.getClass().getSimpleName();
        publishEvent(eventType, aggregateType, aggregateId, event);
    }
}
