package com.pdh.notification.kafka.consumer;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.listener.ContainerProperties.AckMode;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;
import org.springframework.kafka.support.Acknowledgment;
import java.util.HashMap;
import java.util.Map;

import static org.springframework.kafka.support.KafkaHeaders.RECEIVED_TOPIC;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventConsumer {

    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {
    };

    private final NotificationService notificationService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = { "booking.Booking.events",
            "booking.Payment.events" }, groupId = "notification-saga-outbox-listener", containerFactory = "notificationEventListenerContainerFactory")
    public void consumeBookingSagaEvents(
            @Payload JsonNode message,
            @Header(value = "eventType", required = false) String eventTypeHeader,
            @Header(RECEIVED_TOPIC) String topic) {
        try {
            if (message == null || message.isNull()) {
                log.debug("Received null or empty message from topic {}", topic);
                return;
            }

            log.debug("Received notification message from topic {}: {}", topic, message.toString());
            JsonNode root = normalize(message);
            JsonNode payload = root != null ? root.path("payload") : null;
            if (payload == null || payload.isMissingNode() || payload.isNull()) {
                payload = root;
            } else if (payload.isTextual()) {
                payload = normalize(payload);
            }

            String eventType = resolveEventType(eventTypeHeader, root, payload);
            if (StringUtils.isBlank(eventType)) {
                log.debug("Skipping notification message without eventType from topic {}", topic);
                return;
            }
            if (eventType.equals("PaymentProcessed") || eventType.equals("PaymentFailed")) {
                Map<String, Object> payloadMap = convertPayload(payload);
                if (payloadMap == null || payloadMap.isEmpty()) {
                    log.debug("Skipping notification for event {} due to empty payload", eventType);
                    return;
                }

                log.info("Dispatching notification event {} from topic {}", eventType, topic);
                if (notificationService != null) {
                    notificationService.handleBookingEvent(eventType, payloadMap);
                } else {
                    log.error("Notification service is null, cannot process event {} from topic {}", eventType, topic);
                }
            }

        } catch (Exception e) {
            log.error("Error processing notification event from topic {}: {}", topic, e.getMessage(), e);

        }
    }

    private JsonNode normalize(JsonNode node) {
        if (node == null || node.isNull()) {
            return null;
        }
        try {
            if (node.isTextual()) {
                String text = node.asText();
                if (StringUtils.isNotBlank(text)) {
                    return objectMapper.readTree(text);
                }
            }
        } catch (Exception ex) {
            log.warn("Failed to normalize JSON node: {}", node, ex);
        }
        return node;
    }

    private String resolveEventType(String header, JsonNode root, JsonNode payload) {
        if (StringUtils.isNotBlank(header)) {
            return header;
        }
        String eventType = extractText(root, "eventType", "event_type", "type");
        if (StringUtils.isBlank(eventType)) {
            eventType = extractText(payload, "eventType", "event_type", "type");
        }
        if (StringUtils.isBlank(eventType)) {
            JsonNode probe = payload != null && !payload.isNull() ? payload : root;
            if (probe != null && probe.has("flightData")) {
                return "FlightReserved";
            }
        }
        return eventType;
    }

    private String extractText(JsonNode node, String... fields) {
        if (node == null || node.isNull()) {
            return null;
        }
        for (String field : fields) {
            if (field != null) {
                JsonNode value = node.get(field);
                if (value != null && value.isTextual()) {
                    String trimmed = value.asText();
                    if (StringUtils.isNotBlank(trimmed)) {
                        return trimmed;
                    }
                }
            }
        }
        return null;
    }

    private Map<String, Object> convertPayload(JsonNode payload) {
        if (payload == null || payload.isNull()) {
            return new HashMap<>();
        }
        try {
            Map<String, Object> result = objectMapper.convertValue(payload, MAP_TYPE);
            return result != null ? result : new HashMap<>();
        } catch (IllegalArgumentException ex) {
            log.warn("Failed to convert payload for notification: {}", payload, ex);
            return new HashMap<>();
        }
    }
}
