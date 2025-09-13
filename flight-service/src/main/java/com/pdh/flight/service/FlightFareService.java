package com.pdh.flight.service;

import com.pdh.flight.dto.response.FlightFareDto;
import com.pdh.flight.model.FlightFare;
import com.pdh.flight.model.enums.FareClass;
import com.pdh.flight.repository.FlightFareRepository;
import com.pdh.flight.service.pricing.PricingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for managing flight fares
 * Handles fare queries and pricing operations for flights
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FlightFareService {
    
    private final FlightFareRepository flightFareRepository;
    private final PricingService pricingService;
    
    /**
     * Get all fares for a specific schedule
     * 
     * @param scheduleId The flight schedule ID
     * @return List of FlightFareDto
     */
    @Transactional(readOnly = true)
    public List<FlightFareDto> getFaresByScheduleId(UUID scheduleId) {
        log.debug("Fetching fares for schedule ID: {}", scheduleId);
        
        List<FlightFare> fares = flightFareRepository.findByScheduleId(scheduleId);
        return fares.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get fares for multiple schedules (optimized for batch operations)
     * 
     * @param scheduleIds List of schedule IDs
     * @return Map of schedule ID to list of fares
     */
    @Transactional(readOnly = true)
    public Map<UUID, List<FlightFareDto>> getFaresByScheduleIds(List<UUID> scheduleIds) {
        log.debug("Fetching fares for {} schedules", scheduleIds.size());
        
        List<FlightFare> fares = flightFareRepository.findByScheduleIdIn(scheduleIds);
        
        return fares.stream()
                .collect(Collectors.groupingBy(
                        FlightFare::getScheduleId,
                        Collectors.mapping(this::toDto, Collectors.toList())
                ));
    }
    
    /**
     * Get fare by schedule ID and fare class
     * 
     * @param scheduleId The schedule ID
     * @param fareClass The fare class (ECONOMY, BUSINESS, FIRST)
     * @return FlightFareDto or null if not found
     */
    @Transactional(readOnly = true)
    public FlightFareDto getFareByScheduleIdAndClass(UUID scheduleId, FareClass fareClass) {
        log.debug("Fetching fare for schedule ID: {} and class: {}", scheduleId, fareClass);
        
        FlightFare fare = flightFareRepository.findByScheduleIdAndFareClass(scheduleId, fareClass);
        return fare != null ? toDto(fare) : null;
    }
    
    /**
     * Get available fares (with seats > 0) for multiple schedules
     * 
     * @param scheduleIds List of schedule IDs
     * @return List of available FlightFareDto
     */
    @Transactional(readOnly = true)
    public List<FlightFareDto> getAvailableFaresByScheduleIds(List<UUID> scheduleIds) {
        log.debug("Fetching available fares for {} schedules", scheduleIds.size());
        
        List<FlightFare> fares = flightFareRepository.findAvailableFaresByScheduleIds(scheduleIds);
        return fares.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Calculate dynamic price for a flight schedule
     * 
     * @param scheduleId The flight schedule ID
     * @param fareClass The fare class
     * @param passengerCount Number of passengers
     * @return Calculated price
     */
    public BigDecimal calculatePrice(UUID scheduleId, FareClass fareClass, int passengerCount) {
        // In a real implementation, you would fetch the actual schedule
        // For now, we'll return the stored price or calculate a new one
        FlightFareDto fare = getFareByScheduleIdAndClass(scheduleId, fareClass);
        if (fare != null && fare.getPrice() != null) {
            return fare.getPrice().multiply(BigDecimal.valueOf(passengerCount));
        }
        
        // If no stored fare, calculate using pricing service
        return pricingService.calculatePrice(null, fareClass, LocalDate.now(), LocalDate.now(), passengerCount);
    }
    
    /**
     * Convert FlightFare entity to DTO
     */
    private FlightFareDto toDto(FlightFare fare) {
        return FlightFareDto.builder()
                .fareId(fare.getFareId())
                .scheduleId(fare.getScheduleId())
                .fareClass(fare.getFareClass() != null ? fare.getFareClass().name() : null)
                .price(fare.getPrice())
                .availableSeats(fare.getAvailableSeats())
                .build();
    }
}
