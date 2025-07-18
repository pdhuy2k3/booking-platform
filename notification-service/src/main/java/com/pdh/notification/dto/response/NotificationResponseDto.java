package com.pdh.notification.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * DTO for notification sending response
 * Used for both internal service communication and notification status tracking
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponseDto {
    
    /**
     * Notification identifier
     */
    private String notificationId;
    
    /**
     * Overall status
     */
    private String status; // SENT, PENDING, FAILED, SCHEDULED, DELIVERED, READ
    
    /**
     * Notification details
     */
    private String type;
    private String template;
    private String subject;
    
    /**
     * Delivery information
     */
    private List<DeliveryStatusDto> deliveryStatuses;
    private Integer totalRecipients;
    private Integer successfulDeliveries;
    private Integer failedDeliveries;
    private Integer pendingDeliveries;
    
    /**
     * Timestamps
     */
    private LocalDateTime createdAt;
    private LocalDateTime sentAt;
    private LocalDateTime scheduledAt;
    private LocalDateTime completedAt;
    
    /**
     * Context information
     */
    private String bookingId;
    private String customerId;
    private String sagaId;
    private String source;
    
    /**
     * Error information (if applicable)
     */
    private ErrorInfoDto errorInfo;
    
    /**
     * Additional metadata
     */
    private Map<String, Object> metadata;
    
    /**
     * Nested DTO for individual delivery status
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeliveryStatusDto {
        
        private String recipientId;
        private String recipientEmail;
        private String recipientPhone;
        private String status; // SENT, DELIVERED, FAILED, BOUNCED, OPENED, CLICKED
        private String deliveryChannel; // EMAIL, SMS, PUSH, IN_APP
        private LocalDateTime sentAt;
        private LocalDateTime deliveredAt;
        private LocalDateTime readAt;
        private String errorMessage;
        private Integer retryCount;
        private String externalId; // ID from external service (SendGrid, Twilio, etc.)
    }
    
    /**
     * Nested DTO for error information
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ErrorInfoDto {
        
        private String errorCode;
        private String errorMessage;
        private String errorDescription;
        private Boolean retryable;
        private LocalDateTime nextRetryAt;
    }
}
