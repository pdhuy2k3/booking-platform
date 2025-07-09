package com.pdh.booking.service.impl;

import com.pdh.booking.model.Booking;
import com.pdh.booking.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

/**
 * Simple implementation of NotificationService for testing Saga Pattern
 * In production, this would integrate with email/SMS providers
 */
@Service
@Slf4j
@Profile("docker")
public class NotificationServiceMockImpl implements NotificationService {

    @Override
    public boolean sendBookingConfirmation(Booking booking) {
        log.info("Mock sending booking confirmation for: {} to user: {}", 
                booking.getBookingReference(), booking.getUserId());
        
        try {
            // Simulate notification sending time
            Thread.sleep(200);
            
            log.info("Booking confirmation sent successfully for: {}", booking.getBookingReference());
            return true;
            
        } catch (Exception e) {
            log.error("Error sending booking confirmation for: {}", booking.getBookingReference(), e);
            return false;
        }
    }

    @Override
    public boolean sendBookingCancellation(Booking booking) {
        log.info("Mock sending booking cancellation notification for: {} to user: {}", 
                booking.getBookingReference(), booking.getUserId());
        
        try {
            Thread.sleep(200);
            
            log.info("Booking cancellation notification sent successfully for: {}", booking.getBookingReference());
            return true;
            
        } catch (Exception e) {
            log.error("Error sending booking cancellation notification for: {}", booking.getBookingReference(), e);
            return false;
        }
    }

    @Override
    public boolean sendBookingCancellationConfirmation(Booking booking) {
        log.info("Mock sending booking cancellation confirmation for: {} to user: {}", 
                booking.getBookingReference(), booking.getUserId());
        
        try {
            Thread.sleep(200);
            
            log.info("Booking cancellation confirmation sent successfully for: {}", booking.getBookingReference());
            return true;
            
        } catch (Exception e) {
            log.error("Error sending booking cancellation confirmation for: {}", booking.getBookingReference(), e);
            return false;
        }
    }

    @Override
    public boolean sendBookingStatusUpdate(Booking booking, String statusMessage) {
        log.info("Mock sending booking status update for: {} - Status: {}", 
                booking.getBookingReference(), statusMessage);
        
        try {
            Thread.sleep(200);
            
            log.info("Booking status update sent successfully for: {}", booking.getBookingReference());
            return true;
            
        } catch (Exception e) {
            log.error("Error sending booking status update for: {}", booking.getBookingReference(), e);
            return false;
        }
    }

    @Override
    public boolean sendPaymentFailureNotification(Booking booking, String reason) {
        log.info("Mock sending payment failure notification for: {} - Reason: {}", 
                booking.getBookingReference(), reason);
        
        try {
            Thread.sleep(200);
            
            log.info("Payment failure notification sent successfully for: {}", booking.getBookingReference());
            return true;
            
        } catch (Exception e) {
            log.error("Error sending payment failure notification for: {}", booking.getBookingReference(), e);
            return false;
        }
    }
}
