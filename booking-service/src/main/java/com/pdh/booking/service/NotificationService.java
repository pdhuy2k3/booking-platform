package com.pdh.booking.service;

import com.pdh.booking.model.Booking;

/**
 * Service interface for notification operations in Saga Pattern
 */
public interface NotificationService {
    
    /**
     * Send booking confirmation notification
     * @return true if notification sent successfully, false otherwise
     */
    boolean sendBookingConfirmation(Booking booking);
    
    /**
     * Send booking cancellation notification
     * @return true if notification sent successfully, false otherwise
     */
    boolean sendBookingCancellation(Booking booking);
    
    /**
     * Send booking cancellation confirmation notification
     * @return true if notification sent successfully, false otherwise
     */
    boolean sendBookingCancellationConfirmation(Booking booking);
    
    /**
     * Send booking status update notification
     * @return true if notification sent successfully, false otherwise
     */
    boolean sendBookingStatusUpdate(Booking booking, String statusMessage);
    
    /**
     * Send payment failure notification
     * @return true if notification sent successfully, false otherwise
     */
    boolean sendPaymentFailureNotification(Booking booking, String reason);
}
