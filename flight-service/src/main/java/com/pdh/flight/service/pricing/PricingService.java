package com.pdh.flight.service.pricing;

import com.pdh.flight.dto.response.FlightFareDto;
import com.pdh.flight.model.Flight;
import com.pdh.flight.model.FlightSchedule;
import com.pdh.flight.model.enums.FareClass;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Service interface for flight pricing calculations
 */
public interface PricingService {
    
    /**
     * Calculate the final price for a flight schedule based on various factors
     * 
     * @param schedule The flight schedule
     * @param fareClass The fare class (ECONOMY, BUSINESS, FIRST)
     * @param bookingDate The date when the booking is made
     * @param departureDate The departure date of the flight
     * @param passengerCount Number of passengers
     * @return The calculated price
     */
    BigDecimal calculatePrice(FlightSchedule schedule, FareClass fareClass, 
                             LocalDate bookingDate, LocalDate departureDate, 
                             int passengerCount);
    
    /**
     * Get the best available fare for a schedule and fare class
     * 
     * @param scheduleId The flight schedule ID
     * @param fareClass The fare class
     * @return FlightFareDto with the best price or null if not available
     */
    FlightFareDto getBestFare(UUID scheduleId, FareClass fareClass);
    
    /**
     * Get all available fares for a schedule
     * 
     * @param scheduleId The flight schedule ID
     * @return List of available FlightFareDto
     */
    List<FlightFareDto> getAvailableFares(UUID scheduleId);
    
    /**
     * Get fares for multiple schedules
     * 
     * @param scheduleIds List of schedule IDs
     * @return Map of schedule ID to list of FlightFareDto
     */
    Map<UUID, List<FlightFareDto>> getFaresForSchedules(List<UUID> scheduleIds);
    
    /**
     * Calculate dynamic pricing multiplier based on demand and other factors
     * 
     * @param flight The flight entity
     * @param departureDate The departure date
     * @param availableSeats Number of available seats
     * @param totalSeats Total number of seats
     * @return Pricing multiplier (1.0 = base price, > 1.0 = higher price, < 1.0 = lower price)
     */
    double calculateDynamicPricingMultiplier(Flight flight, LocalDate departureDate, 
                                          int availableSeats, int totalSeats);
}