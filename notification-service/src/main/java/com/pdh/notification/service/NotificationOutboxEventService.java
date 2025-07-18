package com.pdh.notification.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.common.outbox.service.OutboxEventService;
import com.pdh.notification.model.NotificationOutboxEvent;
import com.pdh.notification.repository.NotificationOutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Notification-specific implementation of OutboxEventService
 * Publishes events to notification_outbox_events table
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationOutboxEventService implements OutboxEventService {

    private final NotificationOutboxEventRepository notificationOutboxEventRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public void publishEvent(String eventType, String aggregateType, String aggregateId, Object eventPayload) {
        try {
            String payload = objectMapper.writeValueAsString(eventPayload);

            NotificationOutboxEvent event = NotificationOutboxEvent.createNotificationEvent(eventType, aggregateType, aggregateId, payload);
            notificationOutboxEventRepository.save(event);

            log.debug("Published notification event to outbox: eventType={}, aggregateType={}, aggregateId={}",
                     eventType, aggregateType, aggregateId);

        } catch (JsonProcessingException e) {
            log.error("Error serializing event payload for eventType: {}, aggregateId: {}", eventType, aggregateId, e);
            throw new RuntimeException("Failed to serialize event payload", e);
        } catch (Exception e) {
            log.error("Error publishing notification event to outbox: eventType={}, aggregateId={}", eventType, aggregateId, e);
            throw new RuntimeException("Failed to publish event to outbox", e);
        }
    }
}
