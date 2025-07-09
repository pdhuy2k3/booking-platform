package com.pdh.booking.service;

import com.pdh.booking.model.Booking;

/**
 * Service interface for payment operations in Saga Pattern
 */
public interface PaymentService {
    
    /**
     * Process payment for booking
     * This will trigger payment processing in Payment Service
     * @return true if payment successful, false otherwise
     */
    boolean processPayment(Booking booking);
    
    /**
     * Refund payment for compensation
     * @return true if refund successful, false otherwise
     */
    boolean refundPayment(Booking booking);
    
    /**
     * Verify payment status
     * @return true if payment is completed, false otherwise
     */
    boolean verifyPaymentStatus(String paymentId);
}
