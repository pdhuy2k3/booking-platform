package com.pdh.notification.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * DTO for notification sending requests
 * Used for both internal service communication and direct notification sending
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationRequestDto {
    
    /**
     * Notification type
     */
    @NotBlank(message = "Notification type is required")
    private String type; // EMAIL, SMS, PUSH, IN_APP
    
    /**
     * Notification template
     */
    @NotBlank(message = "Template is required")
    private String template; // BOOKING_CONFIRMATION, PAYMENT_SUCCESS, CANCELLATION, etc.
    
    /**
     * Recipients
     */
    @NotNull(message = "Recipients are required")
    private List<RecipientDto> recipients;
    
    /**
     * Notification content
     */
    private String subject;
    private String message;
    private String htmlContent;
    
    /**
     * Template variables for dynamic content
     */
    private Map<String, Object> templateVariables;
    
    /**
     * Scheduling information
     */
    private LocalDateTime scheduledAt;
    private String timezone;
    
    /**
     * Priority and delivery options
     */
    private String priority; // LOW, NORMAL, HIGH, URGENT
    private Boolean requireDeliveryConfirmation;
    private Integer maxRetries;
    
    /**
     * Context information
     */
    private String bookingId;
    private String customerId;
    private String sagaId;
    private String source; // Which service is sending the notification
    
    /**
     * Additional metadata
     */
    private Map<String, Object> metadata;
    
    /**
     * Nested DTO for recipient information
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecipientDto {
        
        @NotBlank(message = "Recipient ID is required")
        private String recipientId;
        
        private String name;
        private String email;
        private String phone;
        private String pushToken; // For push notifications
        private String preferredLanguage;
        private String timezone;
        
        // Personalization data for this specific recipient
        private Map<String, Object> personalizationData;
    }
}
