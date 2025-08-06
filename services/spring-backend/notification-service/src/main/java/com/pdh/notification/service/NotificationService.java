package com.pdh.notification.service;

import java.util.UUID;

public interface NotificationService {

    boolean sendNotification(String recipientId, String type, String subject, String message, String bookingId);

    Object getNotificationStatus(String notificationId);

    void sendBookingConfirmation(UUID bookingId);
}