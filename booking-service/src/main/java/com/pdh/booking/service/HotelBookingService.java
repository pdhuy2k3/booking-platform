package com.pdh.booking.service;

import com.pdh.booking.model.Booking;

/**
 * Service interface for hotel booking operations in Saga Pattern
 */
public interface HotelBookingService {
    
    /**
     * Reserve hotel for booking
     * This will trigger hotel reservation in Hotel Service
     * @return true if reservation successful, false otherwise
     */
    boolean reserveHotel(Booking booking);
    
    /**
     * Cancel hotel reservation for compensation
     * @return true if cancellation successful, false otherwise
     */
    boolean cancelHotelReservation(Booking booking);
    
    /**
     * Confirm hotel reservation after payment success
     * @return true if confirmation successful, false otherwise
     */
    boolean confirmHotelReservation(Booking booking);
}
