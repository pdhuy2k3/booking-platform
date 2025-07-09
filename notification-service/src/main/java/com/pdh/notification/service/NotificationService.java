package com.pdh.notification.service;

/**
 * Service for handling notifications
 */
public interface NotificationService {

    /**
     * Send a notification
     * 
     * @param recipientId Recipient ID
     * @param type Notification type
     * @param subject Notification subject
     * @param message Notification message
     * @param bookingId Optional booking ID reference
     * @return True if notification sent successfully
     */
    boolean sendNotification(String recipientId, String type, String subject, String message, String bookingId);
    
    /**
     * Get notification status
     * 
     * @param notificationId Notification ID
     * @return Notification status information
     */
    Object getNotificationStatus(String notificationId);
}
