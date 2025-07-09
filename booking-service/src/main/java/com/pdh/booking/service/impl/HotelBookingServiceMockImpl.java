package com.pdh.booking.service.impl;

import com.pdh.booking.model.Booking;
import com.pdh.booking.service.HotelBookingService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

/**
 * Mock implementation of HotelBookingService for testing Saga Pattern
 * In production, this would integrate with actual hotel reservation system
 */
@Service
@Slf4j
@Profile("docker")
public class HotelBookingServiceMockImpl implements HotelBookingService {

    @Override
    public boolean reserveHotel(Booking booking) {
        log.info("Mock reserving hotel for booking: {}", booking.getBookingReference());
        
        try {
            // Simulate hotel reservation processing time
            Thread.sleep(1200);
            
            // Simulate 93% success rate
            boolean success = Math.random() > 0.07;
            
            if (success) {
                log.info("Hotel reserved successfully for booking: {}", booking.getBookingReference());
                return true;
            } else {
                log.warn("Hotel reservation failed for booking: {}", booking.getBookingReference());
                return false;
            }
            
        } catch (Exception e) {
            log.error("Error reserving hotel for booking: {}", booking.getBookingReference(), e);
            return false;
        }
    }

    @Override
    public boolean cancelHotelReservation(Booking booking) {
        log.info("Mock cancelling hotel reservation for booking: {}", booking.getBookingReference());
        
        try {
            // Simulate cancellation processing time
            Thread.sleep(600);
            
            log.info("Hotel reservation cancelled successfully for booking: {}", booking.getBookingReference());
            return true;
            
        } catch (Exception e) {
            log.error("Error cancelling hotel reservation for booking: {}", booking.getBookingReference(), e);
            return false;
        }
    }

    @Override
    public boolean confirmHotelReservation(Booking booking) {
        log.info("Mock confirming hotel reservation for booking: {}", booking.getBookingReference());
        
        try {
            // Simulate confirmation processing time
            Thread.sleep(400);
            
            log.info("Hotel reservation confirmed successfully for booking: {}", booking.getBookingReference());
            return true;
            
        } catch (Exception e) {
            log.error("Error confirming hotel reservation for booking: {}", booking.getBookingReference(), e);
            return false;
        }
    }
}
