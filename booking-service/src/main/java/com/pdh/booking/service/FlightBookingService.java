package com.pdh.booking.service;

import com.pdh.booking.model.Booking;

/**
 * Service interface for flight booking operations in Saga Pattern
 */
public interface FlightBookingService {
    
    /**
     * Reserve flight for booking
     * This will trigger flight reservation in Flight Service
     * @return true if reservation successful, false otherwise
     */
    boolean reserveFlight(Booking booking);
    
    /**
     * Cancel flight reservation for compensation
     * @return true if cancellation successful, false otherwise
     */
    boolean cancelFlightReservation(Booking booking);
    
    /**
     * Confirm flight reservation after payment success
     * @return true if confirmation successful, false otherwise
     */
    boolean confirmFlightReservation(Booking booking);
}
