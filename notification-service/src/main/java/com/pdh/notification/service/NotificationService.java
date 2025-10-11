package com.pdh.notification.service;

import java.util.Map;

public interface NotificationService {

    boolean sendNotification(String recipientId, String type, String subject, String message, String bookingId);

    Object getNotificationStatus(String notificationId);

    void handleBookingEvent(String eventType, Map<String, Object> payload);
}
