package com.pdh.flight.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.common.outbox.service.OutboxEventService;
import com.pdh.flight.model.FlightOutboxEvent;
import com.pdh.flight.repository.FlightOutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Flight-specific implementation of OutboxEventService
 * Publishes events to flight_outbox_events table
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FlightOutboxEventService implements OutboxEventService {

    private final FlightOutboxEventRepository flightOutboxEventRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public void publishEvent(String eventType, String aggregateType, String aggregateId, Object eventPayload) {
        try {
            String payload = objectMapper.writeValueAsString(eventPayload);

            FlightOutboxEvent event = FlightOutboxEvent.createFlightEvent(eventType, aggregateType, aggregateId, payload);
            flightOutboxEventRepository.save(event);

            log.debug("Published flight event to outbox: eventType={}, aggregateType={}, aggregateId={}",
                     eventType, aggregateType, aggregateId);

        } catch (JsonProcessingException e) {
            log.error("Error serializing event payload for eventType: {}, aggregateId: {}", eventType, aggregateId, e);
            throw new RuntimeException("Failed to serialize event payload", e);
        } catch (Exception e) {
            log.error("Error publishing flight event to outbox: eventType={}, aggregateId={}", eventType, aggregateId, e);
            throw new RuntimeException("Failed to publish event to outbox", e);
        }
    }
}
