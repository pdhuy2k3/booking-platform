package com.pdh.notification.controller;

import com.pdh.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    @GetMapping("/backoffice/notification/health")
    public ResponseEntity<Map<String, Object>> health() {
        log.info("Notification service health check requested");
        
        Map<String, Object> healthStatus = Map.of(
            "status", "UP",
            "service", "notification-service",
            "timestamp", LocalDateTime.now(),
            "message", "Notification Service is running properly"
        );
        
        return ResponseEntity.ok(healthStatus);
    }

    // === BOOKING INTEGRATION ENDPOINTS ===
    
    /**
     * Send notification (called by Booking Service)
     */
    @PostMapping("/notifications/send")
    public ResponseEntity<Map<String, Object>> sendNotification(@RequestBody Map<String, Object> request) {
        log.info("Notification send request: {}", request);
        
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
    }
    
    /**
     * Get notification status
     */
    @GetMapping("/notifications/{notificationId}/status")
    public ResponseEntity<Object> getNotificationStatus(@PathVariable String notificationId) {
        log.info("Notification status request for: {}", notificationId);
        
        Object status = notificationService.getNotificationStatus(notificationId);
        log.info("Notification status response: {}", status);
        return ResponseEntity.ok(status);
    }
    
    /**
     * Send bulk notifications
     */
    @PostMapping("/notifications/bulk")
    public ResponseEntity<Map<String, Object>> sendBulkNotifications(@RequestBody Map<String, Object> request) {
        log.info("Bulk notification request: {}", request);
        
        @SuppressWarnings("unchecked")
        java.util.List<String> recipientIds = (java.util.List<String>) request.get("recipientIds");
        String type = (String) request.get("type");
        String subject = (String) request.getOrDefault("subject", "Notification");
        String message = (String) request.getOrDefault("message", "You have a new notification");
        String bookingId = (String) request.get("bookingId");
        
        // Process each recipient
        int successCount = 0;
        for (String recipientId : recipientIds) {
            boolean sent = notificationService.sendNotification(
                recipientId, type, subject, message, bookingId);
            
            if (sent) {
                successCount++;
            }
        }
        
        // Generate a batch ID for tracking
        String batchId = "BATCH-" + UUID.randomUUID().toString().substring(0, 8);
        
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
    }
}
