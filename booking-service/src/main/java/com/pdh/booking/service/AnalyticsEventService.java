package com.pdh.booking.service;

import com.pdh.booking.model.Booking;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.ZonedDateTime;
import java.util.Map;

/**
 * Service for publishing analytics events to Kafka
 * Part of Phase 4: Keep Kafka for selective use cases
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class AnalyticsEventService {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    /**
     * Publish booking analytics event to Kafka
     */
    public void publishBookingAnalyticsEvent(Booking booking, String eventType) {
        try {
            Map<String, Object> analyticsEvent = Map.of(
                "eventType", eventType,
                "bookingId", booking.getBookingId().toString(),
                "bookingReference", booking.getBookingReference(),
                "userId", booking.getUserId().toString(),
                "bookingType", booking.getBookingType().toString(),
                "totalAmount", booking.getTotalAmount(),
                "currency", booking.getCurrency(),
                "status", booking.getStatus().toString(),
                "timestamp", ZonedDateTime.now().toString(),
                "source", "booking-service"
            );

            kafkaTemplate.send("booking-analytics", booking.getBookingId().toString(), analyticsEvent);
            log.debug("Analytics event published for booking: {} with type: {}", 
                    booking.getBookingReference(), eventType);
                    
        } catch (Exception e) {
            log.warn("Failed to publish analytics event for booking: {}, error: {}", 
                    booking.getBookingReference(), e.getMessage());
            // Don't fail the main business operation for analytics failure
        }
    }

    /**
     * Publish user behavior analytics event
     */
    public void publishUserBehaviorEvent(String userId, String action, Map<String, Object> metadata) {
        try {
            Map<String, Object> behaviorEvent = Map.of(
                "eventType", "user.behavior",
                "userId", userId,
                "action", action,
                "metadata", metadata,
                "timestamp", ZonedDateTime.now().toString(),
                "source", "booking-service"
            );

            kafkaTemplate.send("user-behavior-analytics", userId, behaviorEvent);
            log.debug("User behavior event published for user: {} with action: {}", userId, action);
            
        } catch (Exception e) {
            log.warn("Failed to publish user behavior event for user: {}, error: {}", userId, e.getMessage());
        }
    }

    /**
     * Publish system performance metrics
     */
    public void publishPerformanceMetrics(String operation, long duration, boolean success) {
        try {
            Map<String, Object> performanceEvent = Map.of(
                "eventType", "system.performance",
                "operation", operation,
                "duration", duration,
                "success", success,
                "timestamp", ZonedDateTime.now().toString(),
                "service", "booking-service"
            );

            kafkaTemplate.send("system-performance", operation, performanceEvent);
            log.debug("Performance metrics published for operation: {} ({}ms)", operation, duration);
            
        } catch (Exception e) {
            log.warn("Failed to publish performance metrics for operation: {}, error: {}", operation, e.getMessage());
        }
    }
}
