package com.pdh.notification.controller;

import com.pdh.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Notification Controller
 * Xử lý các API requests liên quan đến thông báo
 */
@RestController
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public Mono<ResponseEntity<Map<String, Object>>> health() {
        log.info("Notification service health check requested");

        return Mono.fromCallable(() -> {
            Map<String, Object> healthStatus = Map.of(
                "status", "UP",
                "service", "notification-service",
                "timestamp", LocalDateTime.now(),
                "message", "Notification Service is running properly"
            );
            return ResponseEntity.ok(healthStatus);
        })
        .subscribeOn(Schedulers.boundedElastic());
    }

    // === BOOKING INTEGRATION ENDPOINTS ===
    
    /**
     * Send notification (called by Booking Service)
     */
    @PostMapping("/send")
    public Mono<ResponseEntity<Map<String, Object>>> sendNotification(@RequestBody Map<String, Object> request) {
        log.info("Notification send request: {}", request);

        return Mono.fromCallable(() -> {
            String recipientId = (String) request.get("recipientId");
            String type = (String) request.get("type");
            String subject = (String) request.get("subject");
            String message = (String) request.get("message");
            String bookingId = (String) request.get("bookingId");

            // Call notification service to send notification
            boolean sent = notificationService.sendNotification(recipientId, type, subject, message, bookingId);

            if (sent) {
                Map<String, Object> response = new HashMap<>();
                response.put("status", "success");
                response.put("message", "Notification sent successfully");
                response.put("recipientId", recipientId);
                response.put("type", type);
                response.put("bookingId", bookingId);
                response.put("sentTime", LocalDateTime.now());

                log.info("Notification send response: {}", response);
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("status", "error");
                response.put("message", "Failed to send notification");

                log.error("Failed to send notification");
                return ResponseEntity.badRequest().body(response);
            }
        })
        .subscribeOn(Schedulers.boundedElastic());
    }
    
    /**
     * Get notification status
     */
    @GetMapping("/notifications/{notificationId}/status")
    public Mono<ResponseEntity<Object>> getNotificationStatus(@PathVariable String notificationId) {
        log.info("Notification status request for: {}", notificationId);

        return Mono.fromCallable(() -> {
            Object status = notificationService.getNotificationStatus(notificationId);
            log.info("Notification status response: {}", status);
            return ResponseEntity.ok(status);
        })
        .subscribeOn(Schedulers.boundedElastic());
    }
    
    /**
     * Send bulk notifications - Reactive implementation
     */
    @PostMapping("/notifications/bulk")
    public Mono<ResponseEntity<Map<String, Object>>> sendBulkNotifications(@RequestBody Map<String, Object> request) {
        log.info("Bulk notification request: {}", request);

        @SuppressWarnings("unchecked")
        java.util.List<String> recipientIds = (java.util.List<String>) request.get("recipientIds");
        String type = (String) request.get("type");
        String subject = (String) request.getOrDefault("subject", "Notification");
        String message = (String) request.getOrDefault("message", "You have a new notification");
        String bookingId = (String) request.get("bookingId");
        String batchId = "BATCH-" + UUID.randomUUID().toString().substring(0, 8);

        // Process notifications reactively using Flux
        return Flux.fromIterable(recipientIds)
            .flatMap(recipientId ->
                Mono.fromCallable(() ->
                    notificationService.sendNotification(recipientId, type, subject, message, bookingId)
                )
                .subscribeOn(Schedulers.boundedElastic())
                .onErrorReturn(false) // Continue processing even if one fails
            )
            .collectList()
            .map(results -> {
                long successCount = results.stream().mapToLong(sent -> sent ? 1 : 0).sum();

                Map<String, Object> response = new HashMap<>();
                response.put("status", "success");
                response.put("message", "Bulk notifications processed");
                response.put("batchId", batchId);
                response.put("recipientCount", recipientIds.size());
                response.put("successCount", successCount);
                response.put("failureCount", recipientIds.size() - successCount);
                response.put("type", type);
                response.put("processedAt", LocalDateTime.now());

                log.info("Bulk notification response: {}", response);
                return ResponseEntity.ok(response);
            });
    }
}
