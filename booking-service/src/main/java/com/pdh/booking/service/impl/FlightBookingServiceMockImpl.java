package com.pdh.booking.service.impl;

import com.pdh.booking.model.Booking;
import com.pdh.booking.service.FlightBookingService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

/**
 * Mock implementation of FlightBookingService for testing Saga Pattern
 * In production, this would integrate with actual flight reservation system
 */
@Service
@Slf4j
@Profile("docker")  // Active only when mock profile is active
public class FlightBookingServiceMockImpl implements FlightBookingService {

    @Override
    public boolean reserveFlight(Booking booking) {
        log.info("Mock reserving flight for booking: {}", booking.getBookingReference());
        
        try {
            // Simulate flight reservation processing time
            Thread.sleep(1500);
            
            // Simulate 95% success rate
            boolean success = Math.random() > 0.05;
            
            if (success) {
                log.info("Flight reserved successfully for booking: {}", booking.getBookingReference());
                return true;
            } else {
                log.warn("Flight reservation failed for booking: {}", booking.getBookingReference());
                return false;
            }
            
        } catch (Exception e) {
            log.error("Error reserving flight for booking: {}", booking.getBookingReference(), e);
            return false;
        }
    }

    @Override
    public boolean cancelFlightReservation(Booking booking) {
        log.info("Mock cancelling flight reservation for booking: {}", booking.getBookingReference());
        
        try {
            // Simulate cancellation processing time
            Thread.sleep(800);
            
            log.info("Flight reservation cancelled successfully for booking: {}", booking.getBookingReference());
            return true;
            
        } catch (Exception e) {
            log.error("Error cancelling flight reservation for booking: {}", booking.getBookingReference(), e);
            return false;
        }
    }

    @Override
    public boolean confirmFlightReservation(Booking booking) {
        log.info("Mock confirming flight reservation for booking: {}", booking.getBookingReference());
        
        try {
            // Simulate confirmation processing time
            Thread.sleep(500);
            
            log.info("Flight reservation confirmed successfully for booking: {}", booking.getBookingReference());
            return true;
            
        } catch (Exception e) {
            log.error("Error confirming flight reservation for booking: {}", booking.getBookingReference(), e);
            return false;
        }
    }
}
