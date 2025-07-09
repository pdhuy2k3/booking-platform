package com.pdh.notification.event;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Event representing a notification being sent
 */
@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class NotificationSentEvent extends Event {
    private String notificationId;
    private String recipientId;
    private String notificationType;
    private String subject;
    private String message;
    private String bookingId;
    private String sentTime;
    private String status;
    
    public NotificationSentEvent(String id, String timestamp, String notificationId, String recipientId,
                               String notificationType, String subject, String message, String bookingId, 
                               String sentTime, String status) {
        super(id, "NotificationSent", timestamp);
        this.notificationId = notificationId;
        this.recipientId = recipientId;
        this.notificationType = notificationType;
        this.subject = subject;
        this.message = message;
        this.bookingId = bookingId;
        this.sentTime = sentTime;
        this.status = status;
    }
}
