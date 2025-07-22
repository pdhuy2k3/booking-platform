package com.pdh.hotel.kafka.consumer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.common.kafka.consumer.BaseSelfEventConsumer;
import com.pdh.common.outbox.service.EventDeduplicationService;
import com.pdh.common.outbox.service.EventDeduplicationServiceInterface;
import com.pdh.hotel.model.HotelOutboxEvent;
import com.pdh.hotel.repository.HotelOutboxEventRepository;
import com.pdh.hotel.service.HotelService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

import static org.springframework.kafka.support.KafkaHeaders.RECEIVED_KEY;
import static org.springframework.kafka.support.KafkaHeaders.RECEIVED_TOPIC;

/**
 * Hotel Self-Event Consumer for Listen to Yourself Pattern
 * Processes events that the hotel service itself has published
 */
@Component
@Slf4j
public class HotelSelfEventConsumer extends BaseSelfEventConsumer<String> {
    
    private final HotelService hotelService;
    private final HotelOutboxEventRepository outboxEventRepository;
    private static final String SERVICE_NAME = "hotel-service";
    
    public HotelSelfEventConsumer(
            EventDeduplicationServiceInterface deduplicationService,
            ObjectMapper objectMapper,
            HotelService hotelService,
            HotelOutboxEventRepository outboxEventRepository) {
        super(deduplicationService, objectMapper);
        this.hotelService = hotelService;
        this.outboxEventRepository = outboxEventRepository;
    }
    
    /**
     * Listen to hotel service's own events
     */
    @KafkaListener(
        topics = "booking.Hotel.events",
        groupId = "hotel-service-self-group",
        containerFactory = "hotelEventListenerContainerFactory"
    )
    public void handleHotelSelfEvent(
        @Payload String message,
        @Header(RECEIVED_KEY) String key,
        @Header(RECEIVED_TOPIC) String topic
    ) {
        log.info("Received hotel self-event from topic {}: key={}, message={}", topic, key, message);
        processSelfEvent(message, SERVICE_NAME);
    }
    
    @Override
    protected String extractEventId(String message) {
        try {
            JsonNode jsonNode = objectMapper.readTree(message);
            return jsonNode.has("eventId") ? jsonNode.get("eventId").asText() : 
                   jsonNode.has("id") ? jsonNode.get("id").asText() : null;
        } catch (Exception e) {
            log.error("Failed to extract event ID from message: {}", message, e);
            return null;
        }
    }
    
    @Override
    protected String extractEventType(String message) {
        try {
            JsonNode jsonNode = objectMapper.readTree(message);
            return jsonNode.has("eventType") ? jsonNode.get("eventType").asText() : 
                   jsonNode.has("event_type") ? jsonNode.get("event_type").asText() : null;
        } catch (Exception e) {
            log.error("Failed to extract event type from message: {}", message, e);
            return null;
        }
    }
    
    @Override
    protected String extractAggregateId(String message) {
        try {
            JsonNode jsonNode = objectMapper.readTree(message);
            return jsonNode.has("aggregateId") ? jsonNode.get("aggregateId").asText() : 
                   jsonNode.has("aggregate_id") ? jsonNode.get("aggregate_id").asText() : null;
        } catch (Exception e) {
            log.error("Failed to extract aggregate ID from message: {}", message, e);
            return null;
        }
    }
    
    @Override
    protected boolean handleSelfEvent(String eventId, String eventType, String aggregateId, String message) {
        try {
            log.info("Processing hotel self-event: eventId={}, eventType={}, aggregateId={}", 
                    eventId, eventType, aggregateId);
            
            switch (eventType) {
                case "HotelReserved":
                    return handleHotelReservedSelfEvent(eventId, aggregateId, message);
                case "HotelReservationFailed":
                    return handleHotelReservationFailedSelfEvent(eventId, aggregateId, message);
                case "HotelCancelled":
                    return handleHotelCancelledSelfEvent(eventId, aggregateId, message);
                default:
                    log.warn("Unknown hotel self-event type: {}", eventType);
                    return true; // Consider unknown events as processed to avoid infinite loops
            }
        } catch (Exception e) {
            log.error("Error handling hotel self-event: eventId={}, eventType={}", eventId, eventType, e);
            return false;
        }
    }
    
    private boolean handleHotelReservedSelfEvent(String eventId, String aggregateId, String message) {
        try {
            JsonNode payload = parsePayload(message);
            if (payload == null) return false;
            
            String hotelId = payload.has("hotelId") ? payload.get("hotelId").asText() : aggregateId;
            String bookingId = payload.has("bookingId") ? payload.get("bookingId").asText() : null;
            
            log.info("Verifying hotel reservation: hotelId={}, bookingId={}", hotelId, bookingId);
            
            // Verify that the hotel reservation actually exists and is in correct state
            boolean reservationExists = hotelService.verifyHotelReservation(UUID.fromString(hotelId), bookingId);
            
            if (!reservationExists) {
                log.error("Hotel reservation verification failed: hotelId={}, bookingId={}", hotelId, bookingId);
                // Could trigger compensation or alert
                return false;
            }
            
            log.info("Hotel reservation verified successfully: hotelId={}, bookingId={}", hotelId, bookingId);
            return true;
            
        } catch (Exception e) {
            log.error("Error handling HotelReserved self-event: eventId={}", eventId, e);
            return false;
        }
    }
    
    private boolean handleHotelReservationFailedSelfEvent(String eventId, String aggregateId, String message) {
        try {
            JsonNode payload = parsePayload(message);
            if (payload == null) return false;
            
            String hotelId = payload.has("hotelId") ? payload.get("hotelId").asText() : aggregateId;
            String reason = payload.has("reason") ? payload.get("reason").asText() : "Unknown";
            
            log.info("Verifying hotel reservation failure: hotelId={}, reason={}", hotelId, reason);
            
            // Verify that the hotel reservation is indeed in failed state
            boolean failureVerified = hotelService.verifyHotelReservationFailure(UUID.fromString(hotelId));
            
            if (!failureVerified) {
                log.warn("Hotel reservation failure verification failed: hotelId={}", hotelId);
            }
            
            return true; // Always consider failure events as processed
            
        } catch (Exception e) {
            log.error("Error handling HotelReservationFailed self-event: eventId={}", eventId, e);
            return false;
        }
    }
    
    private boolean handleHotelCancelledSelfEvent(String eventId, String aggregateId, String message) {
        try {
            JsonNode payload = parsePayload(message);
            if (payload == null) return false;
            
            String hotelId = payload.has("hotelId") ? payload.get("hotelId").asText() : aggregateId;
            
            log.info("Verifying hotel cancellation: hotelId={}", hotelId);
            
            // Verify that the hotel is indeed cancelled
            boolean cancellationVerified = hotelService.verifyHotelCancellation(UUID.fromString(hotelId));
            
            if (!cancellationVerified) {
                log.warn("Hotel cancellation verification failed: hotelId={}", hotelId);
            }
            
            return true;
            
        } catch (Exception e) {
            log.error("Error handling HotelCancelled self-event: eventId={}", eventId, e);
            return false;
        }
    }
    
    @Override
    protected void updateSelfProcessedStatus(String eventId, boolean processed) {
        try {
            Optional<HotelOutboxEvent> eventOpt = outboxEventRepository.findByEventId(eventId);
            if (eventOpt.isPresent()) {
                HotelOutboxEvent event = eventOpt.get();
                if (processed) {
                    event.markAsSelfProcessed();
                } else {
                    event.incrementProcessingAttempts();
                }
                outboxEventRepository.save(event);
                log.debug("Updated self-processed status for hotel event {}: {}", eventId, processed);
            } else {
                log.warn("Hotel outbox event not found for eventId: {}", eventId);
            }
        } catch (Exception e) {
            log.error("Error updating self-processed status for hotel event {}", eventId, e);
        }
    }
}
