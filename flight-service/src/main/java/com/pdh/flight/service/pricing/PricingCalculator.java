package com.pdh.flight.service.pricing;

import com.pdh.flight.model.Flight;
import com.pdh.flight.model.FlightSchedule;
import com.pdh.flight.model.Aircraft;
import com.pdh.flight.model.Airport;
import com.pdh.flight.model.enums.FareClass;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Component for detailed pricing calculations
 */
@Component
public class PricingCalculator {
    
    /**
     * Calculate base fare based on route distance
     */
    public BigDecimal calculateBaseFare(Flight flight, FareClass fareClass) {
        if (flight == null) {
            return BigDecimal.valueOf(1000000); // Default base fare
        }
        
        // Calculate distance-based fare
        double distance = calculateDistance(
            flight.getDepartureAirport(), 
            flight.getArrivalAirport()
        );
        
        // Base rate per kilometer
        double baseRatePerKm = 500.0; // VND per km
        
        // Apply fare class multiplier
        double fareClassMultiplier = getFareClassMultiplier(fareClass);
        
        // Calculate base fare
        double baseFare = distance * baseRatePerKm * fareClassMultiplier;
        
        return BigDecimal.valueOf(baseFare).setScale(0, RoundingMode.HALF_UP);
    }
    
    /**
     * Calculate distance between two airports using Haversine formula
     */
    public double calculateDistance(Airport origin, Airport destination) {
        if (origin == null || destination == null) {
            return 1000.0; // Default distance
        }
        
        // Simplified distance calculation - in a real implementation,
        // you would use the actual coordinates
        return 1000.0; // Default distance in kilometers
    }
    
    /**
     * Apply demand-based pricing
     */
    public BigDecimal applyDemandPricing(BigDecimal baseFare, int availableSeats, int totalSeats) {
        if (totalSeats <= 0) {
            return baseFare;
        }
        
        double occupancyRate = (double) (totalSeats - availableSeats) / totalSeats;
        
        // Apply demand multiplier
        double demandMultiplier = 1.0;
        if (occupancyRate > 0.9) {
            demandMultiplier = 1.5; // High demand
        } else if (occupancyRate > 0.75) {
            demandMultiplier = 1.2; // Medium demand
        } else if (occupancyRate < 0.3) {
            demandMultiplier = 0.8; // Low demand
        }
        
        return baseFare.multiply(BigDecimal.valueOf(demandMultiplier))
                      .setScale(0, RoundingMode.HALF_UP);
    }
    
    /**
     * Apply time-based pricing adjustments
     */
    public BigDecimal applyTimeBasedPricing(BigDecimal fare, LocalDateTime departureTime, 
                                          LocalDate bookingDate) {
        LocalDate departureDate = departureTime.toLocalDate();
        long daysUntilDeparture = java.time.temporal.ChronoUnit.DAYS.between(bookingDate, departureDate);
        
        // Advance booking discount
        double advanceBookingMultiplier = calculateAdvanceBookingMultiplier(daysUntilDeparture);
        
        // Departure time premium
        double timeOfDayMultiplier = calculateTimeOfDayMultiplier(departureTime);
        
        // Apply multipliers
        double finalMultiplier = advanceBookingMultiplier * timeOfDayMultiplier;
        
        return fare.multiply(BigDecimal.valueOf(finalMultiplier))
                  .setScale(0, RoundingMode.HALF_UP);
    }
    
    /**
     * Calculate advance booking multiplier
     */
    private double calculateAdvanceBookingMultiplier(long daysUntilDeparture) {
        if (daysUntilDeparture >= 90) {
            return 0.8; // 20% discount
        } else if (daysUntilDeparture >= 30) {
            return 0.9; // 10% discount
        } else if (daysUntilDeparture <= 3) {
            return 1.3; // 30% surcharge for last-minute
        }
        return 1.0; // No adjustment
    }
    
    /**
     * Calculate time of day multiplier
     */
    private double calculateTimeOfDayMultiplier(LocalDateTime departureTime) {
        int hour = departureTime.getHour();
        
        // Premium for business hours (7-9 AM, 5-8 PM)
        if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 20)) {
            return 1.15;
        }
        
        // Discount for night flights (10 PM - 5 AM)
        if (hour >= 22 || hour <= 5) {
            return 0.85;
        }
        
        return 1.0; // Standard pricing
    }
    
    /**
     * Apply aircraft-based pricing adjustments
     */
    public BigDecimal applyAircraftPricing(BigDecimal fare, Aircraft aircraft) {
        if (aircraft == null) {
            return fare;
        }
        
        // Apply multiplier based on aircraft type/size
        double aircraftMultiplier = 1.0;
        
        if (aircraft.getModel() != null) {
            String model = aircraft.getModel().toUpperCase();
            
            // Premium for larger aircraft
            if (model.contains("A380") || model.contains("747")) {
                aircraftMultiplier = 1.2;
            } 
            // Premium for business aircraft
            else if (model.contains("A350") || model.contains("787") || model.contains("777")) {
                aircraftMultiplier = 1.1;
            }
            // Discount for smaller aircraft
            else if (model.contains("ATR") || model.contains("DH8")) {
                aircraftMultiplier = 0.9;
            }
        }
        
        return fare.multiply(BigDecimal.valueOf(aircraftMultiplier))
                  .setScale(0, RoundingMode.HALF_UP);
    }
    
    /**
     * Get fare class multiplier
     */
    private double getFareClassMultiplier(FareClass fareClass) {
        switch (fareClass) {
            case ECONOMY:
                return 1.0;
            case PREMIUM_ECONOMY:
                return 1.6;
            case BUSINESS:
                return 2.8;
            case FIRST:
                return 4.5;
            default:
                return 1.0;
        }
    }
    
    /**
     * Apply seasonal pricing adjustments
     */
    public BigDecimal applySeasonalPricing(BigDecimal fare, LocalDate departureDate) {
        int month = departureDate.getMonthValue();
        
        // Peak season pricing
        if (month == 12 || month == 1 || (month >= 6 && month <= 8)) {
            // Holiday and summer peak
            return fare.multiply(BigDecimal.valueOf(1.25))
                      .setScale(0, RoundingMode.HALF_UP);
        } 
        // Shoulder season
        else if (month >= 2 && month <= 4) {
            return fare.multiply(BigDecimal.valueOf(0.95))
                      .setScale(0, RoundingMode.HALF_UP);
        }
        
        return fare; // Standard pricing
    }
}