package com.pdh.flight.service.pricing;

import com.pdh.flight.dto.response.FlightFareDto;
import com.pdh.flight.model.Flight;
import com.pdh.flight.model.FlightSchedule;
import com.pdh.flight.model.enums.FareClass;
import com.pdh.flight.service.FlightFareService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * Implementation of the pricing service for flight fare calculations
 */
@Service
@Slf4j
public class PricingServiceImpl implements PricingService {
    
    private final FlightFareService flightFareService;
    private final FareClassMultiplierConfigService fareClassMultiplierConfigService;
    
    public PricingServiceImpl(@Lazy FlightFareService flightFareService, 
                            FareClassMultiplierConfigService fareClassMultiplierConfigService) {
        this.flightFareService = flightFareService;
        this.fareClassMultiplierConfigService = fareClassMultiplierConfigService;
    }
    
    // Configuration constants
    private static final double BASE_PRICE_FACTOR = 1.0;
    private static final double DEMAND_FACTOR = 0.5;
    private static final double TIME_FACTOR = 0.3;
    private static final double SEASONALITY_FACTOR = 0.2;
    
    @Override
    public BigDecimal calculatePrice(FlightSchedule schedule, FareClass fareClass, 
                                   LocalDate bookingDate, LocalDate departureDate, 
                                   int passengerCount) {
        log.debug("Calculating price for schedule: {}, fare class: {}, departure: {}, booking: {}", 
                 schedule.getScheduleId(), fareClass, departureDate, bookingDate);
        
        try {
            // Get the base price from the flight
            Flight flight = schedule.getFlight();
            BigDecimal basePrice = flight != null && flight.getBasePrice() != null 
                ? flight.getBasePrice() 
                : BigDecimal.valueOf(1000000); // Default base price
            
            // Apply fare class multiplier
            double fareClassMultiplier = getFareClassMultiplier(fareClass);
            
            // Calculate dynamic pricing factors
            double dynamicMultiplier = calculateDynamicPricingMultiplier(
                flight, departureDate, 100, 200); // Default seat values
            
            // Calculate time-based factors
            double advanceBookingDiscount = calculateAdvanceBookingDiscount(bookingDate, departureDate);
            double departureTimeMultiplier = calculateDepartureTimeMultiplier(schedule);
            double dayOfWeekMultiplier = calculateDayOfWeekMultiplier(departureDate);
            
            // Combine all factors
            double totalMultiplier = fareClassMultiplier * 
                                   dynamicMultiplier * 
                                   advanceBookingDiscount * 
                                   departureTimeMultiplier * 
                                   dayOfWeekMultiplier;
            
            // Calculate final price
            BigDecimal finalPrice = basePrice
                .multiply(BigDecimal.valueOf(totalMultiplier))
                .multiply(BigDecimal.valueOf(passengerCount))
                .setScale(0, RoundingMode.HALF_UP);
            
            log.debug("Price calculation: base={}, multiplier={}, passengers={}, final={}", 
                     basePrice, totalMultiplier, passengerCount, finalPrice);
            
            return finalPrice;
        } catch (Exception e) {
            log.error("Error calculating price for schedule: {}", schedule.getScheduleId(), e);
            // Return a default price in case of error
            return BigDecimal.valueOf(2000000 * passengerCount);
        }
    }
    
    @Override
    public FlightFareDto getBestFare(UUID scheduleId, FareClass fareClass) {
        return flightFareService.getFareByScheduleIdAndClass(scheduleId, fareClass);
    }
    
    @Override
    public List<FlightFareDto> getAvailableFares(UUID scheduleId) {
        // Get all fares and filter for available ones
        List<FlightFareDto> fares = flightFareService.getFaresByScheduleId(scheduleId);
        return fares.stream()
            .filter(fare -> fare.getAvailableSeats() > 0)
            .toList();
    }
    
    @Override
    public Map<UUID, List<FlightFareDto>> getFaresForSchedules(List<UUID> scheduleIds) {
        return flightFareService.getFaresByScheduleIds(scheduleIds);
    }
    
    @Override
    public double calculateDynamicPricingMultiplier(Flight flight, LocalDate departureDate, 
                                                  int availableSeats, int totalSeats) {
        // Calculate demand factor based on seat availability
        double seatAvailabilityRatio = (double) availableSeats / totalSeats;
        double demandFactor = 1.0 + (DEMAND_FACTOR * (1.0 - seatAvailabilityRatio));
        
        // Calculate time factor based on days until departure
        LocalDate today = LocalDate.now();
        long daysUntilDeparture = ChronoUnit.DAYS.between(today, departureDate);
        double timeFactor = 1.0 + (TIME_FACTOR * Math.max(0, Math.min(1, 1.0 - (daysUntilDeparture / 30.0))));
        
        // Calculate seasonality factor
        double seasonalityFactor = calculateSeasonalityMultiplier(departureDate);
        
        // Combine factors
        double multiplier = BASE_PRICE_FACTOR * demandFactor * timeFactor * seasonalityFactor;
        
        // Ensure multiplier is within reasonable bounds
        return Math.max(0.5, Math.min(3.0, multiplier));
    }
    
    /**
     * Get fare class multiplier
     */
    private double getFareClassMultiplier(FareClass fareClass) {
        if (fareClassMultiplierConfigService != null) {
            BigDecimal multiplier = fareClassMultiplierConfigService.getMultiplier(fareClass.name());
            return multiplier != null ? multiplier.doubleValue() : 1.0;
        }
        
        // Fallback to default multipliers
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
     * Calculate advance booking discount
     */
    private double calculateAdvanceBookingDiscount(LocalDate bookingDate, LocalDate departureDate) {
        long daysInAdvance = ChronoUnit.DAYS.between(bookingDate, departureDate);
        
        if (daysInAdvance >= 90) {
            return 0.8; // 20% discount for bookings 90+ days in advance
        } else if (daysInAdvance >= 30) {
            return 0.9; // 10% discount for bookings 30-89 days in advance
        } else if (daysInAdvance >= 7) {
            return 0.95; // 5% discount for bookings 7-29 days in advance
        } else if (daysInAdvance <= 2) {
            return 1.2; // 20% surcharge for last-minute bookings
        }
        
        return 1.0; // No discount or surcharge
    }
    
    /**
     * Calculate departure time multiplier
     */
    private double calculateDepartureTimeMultiplier(FlightSchedule schedule) {
        // This would extract the hour from the departure time
        // For now, we'll use a simplified approach
        int departureHour = schedule.getDepartureTime().getHour();
        
        // Premium for business hours (7-9 AM, 5-8 PM)
        if ((departureHour >= 7 && departureHour <= 9) || (departureHour >= 17 && departureHour <= 20)) {
            return 1.1;
        }
        
        // Discount for off-peak hours (10 PM - 5 AM)
        if (departureHour >= 22 || departureHour <= 5) {
            return 0.9;
        }
        
        return 1.0; // Standard pricing for other hours
    }
    
    /**
     * Calculate day of week multiplier
     */
    private double calculateDayOfWeekMultiplier(LocalDate departureDate) {
        DayOfWeek dayOfWeek = departureDate.getDayOfWeek();
        
        // Premium for Fridays and Sundays (high demand)
        if (dayOfWeek == DayOfWeek.FRIDAY || dayOfWeek == DayOfWeek.SUNDAY) {
            return 1.15;
        }
        
        // Slight premium for Saturdays
        if (dayOfWeek == DayOfWeek.SATURDAY) {
            return 1.05;
        }
        
        // Discount for Tuesdays and Wednesdays (low demand)
        if (dayOfWeek == DayOfWeek.TUESDAY || dayOfWeek == DayOfWeek.WEDNESDAY) {
            return 0.95;
        }
        
        return 1.0; // Standard pricing for other days
    }
    
    /**
     * Calculate seasonality multiplier
     */
    private double calculateSeasonalityMultiplier(LocalDate departureDate) {
        int month = departureDate.getMonthValue();
        
        // Peak season (June-August, December-January)
        if (month >= 6 && month <= 8) {
            return 1.2; // Summer peak
        } else if (month == 12 || month == 1) {
            return 1.3; // Holiday peak
        }
        
        // Off-season (February-April)
        if (month >= 2 && month <= 4) {
            return 0.9; // Shoulder season
        }
        
        return 1.0; // Standard pricing for other months
    }
}