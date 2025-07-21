package com.pdh.notification.service;

import java.util.UUID;

public interface NotificationService {

    boolean sendNotification(String recipientId, String type, String subject, String message, String bookingId);

    Object getNotificationStatus(String notificationId);

    void sendBookingConfirmation(UUID bookingId);

    // Listen to Yourself Pattern verification methods

    /**
     * Verify that a notification was actually sent
     */
    boolean verifyNotificationSent(UUID notificationId);

    /**
     * Verify that a notification failure is in correct state
     */
    boolean verifyNotificationFailure(UUID notificationId);

    /**
     * Verify that a notification was delivered
     */
    boolean verifyNotificationDelivery(UUID notificationId);

    /**
     * Verify that a notification was read
     */
    boolean verifyNotificationRead(UUID notificationId);
}