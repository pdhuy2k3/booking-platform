package com.pdh.booking.service.impl;

import com.pdh.booking.model.Booking;
import com.pdh.booking.service.PaymentService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

/**
 * Simple implementation of PaymentService for testing Saga Pattern
 * In production, this would integrate with actual payment gateway
 */
@Service
@Slf4j
@Profile("docker")
public class PaymentServiceMockImpl implements PaymentService {

    @Override
    public boolean processPayment(Booking booking) {
        log.info("Mock processing payment for booking: {} with amount: {}", 
                booking.getBookingReference(), booking.getTotalAmount());
        
        try {
            // Simulate payment processing time
            Thread.sleep(1000);
            
            // Simulate 90% success rate
            boolean success = Math.random() > 0.1;
            
            if (success) {
                log.info("Payment processed successfully for booking: {}", booking.getBookingReference());
                return true;
            } else {
                log.warn("Payment processing failed for booking: {}", booking.getBookingReference());
                return false;
            }
            
        } catch (Exception e) {
            log.error("Error processing payment for booking: {}", booking.getBookingReference(), e);
            return false;
        }
    }

    @Override
    public boolean refundPayment(Booking booking) {
        log.info("Mock refunding payment for booking: {} with amount: {}", 
                booking.getBookingReference(), booking.getTotalAmount());
        
        try {
            // Simulate refund processing time
            Thread.sleep(500);
            
            log.info("Payment refunded successfully for booking: {}", booking.getBookingReference());
            return true;
            
        } catch (Exception e) {
            log.error("Error refunding payment for booking: {}", booking.getBookingReference(), e);
            return false;
        }
    }

    @Override
    public boolean verifyPaymentStatus(String paymentId) {
        log.info("Mock verifying payment status for payment: {}", paymentId);
        
        // Mock verification - assume payment is completed
        return true;
    }
}
