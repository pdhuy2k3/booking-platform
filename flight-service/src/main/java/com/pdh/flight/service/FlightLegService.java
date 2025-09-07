package com.pdh.flight.service;

import com.pdh.flight.dto.response.FlightLegDto;
import com.pdh.flight.model.FlightLeg;
import com.pdh.flight.repository.FlightLegRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for managing flight legs
 * Handles flight leg queries and operations for multi-leg flights
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FlightLegService {
    
    private final FlightLegRepository flightLegRepository;
    
    /**
     * Get all legs for a specific flight
     * 
     * @param flightId The flight ID
     * @return List of FlightLegDto
     */
    @Transactional(readOnly = true)
    public List<FlightLegDto> getLegsByFlightId(Long flightId) {
        log.debug("Fetching legs for flight ID: {}", flightId);
        
        List<FlightLeg> legs = flightLegRepository.findByFlightId(flightId);
        return legs.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get legs for multiple flights (optimized for batch operations)
     * 
     * @param flightIds List of flight IDs
     * @return Map of flight ID to list of legs
     */
    @Transactional(readOnly = true)
    public Map<Long, List<FlightLegDto>> getLegsByFlightIds(List<Long> flightIds) {
        log.debug("Fetching legs for {} flights", flightIds.size());
        
        List<FlightLeg> legs = flightLegRepository.findByFlightIds(flightIds);
        
        return legs.stream()
                .collect(Collectors.groupingBy(
                        leg -> leg.getFlight().getFlightId(),
                        Collectors.mapping(this::toDto, Collectors.toList())
                ));
    }
    
    /**
     * Get legs for a flight on a specific date
     * 
     * @param flightId The flight ID
     * @param departureDate The departure date
     * @return List of FlightLegDto
     */
    @Transactional(readOnly = true)
    public List<FlightLegDto> getLegsByFlightIdAndDate(Long flightId, LocalDate departureDate) {
        log.debug("Fetching legs for flight ID: {} on date: {}", flightId, departureDate);
        
        List<FlightLeg> legs = flightLegRepository.findByFlightIdAndDepartureDate(flightId, departureDate);
        return legs.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get first leg of a flight (main departure)
     * 
     * @param flightId The flight ID
     * @param departureDate The departure date
     * @return FlightLegDto or null if not found
     */
    @Transactional(readOnly = true)
    public FlightLegDto getFirstLegByFlightIdAndDate(Long flightId, LocalDate departureDate) {
        log.debug("Fetching first leg for flight ID: {} on date: {}", flightId, departureDate);
        
        return flightLegRepository.findFirstLegByFlightIdAndDate(flightId, departureDate)
                .map(this::toDto)
                .orElse(null);
    }
    
    /**
     * Convert FlightLeg entity to DTO
     */
    private FlightLegDto toDto(FlightLeg leg) {
        FlightLegDto.FlightLegDtoBuilder builder = FlightLegDto.builder()
                .legId(leg.getLegId())
                .flightId(leg.getFlight().getFlightId())
                .legNumber(leg.getLegNumber())
                .departureTime(leg.getDepartureTime())
                .arrivalTime(leg.getArrivalTime());
        
        // Add departure airport information
        if (leg.getDepartureAirport() != null) {
            builder.departureAirportId(leg.getDepartureAirport().getAirportId())
                   .departureAirportName(leg.getDepartureAirport().getName())
                   .departureAirportIataCode(leg.getDepartureAirport().getIataCode())
                   .departureAirportCity(leg.getDepartureAirport().getCity())
                   .departureAirportCountry(leg.getDepartureAirport().getCountry());
        }
        
        // Add arrival airport information
        if (leg.getArrivalAirport() != null) {
            builder.arrivalAirportId(leg.getArrivalAirport().getAirportId())
                   .arrivalAirportName(leg.getArrivalAirport().getName())
                   .arrivalAirportIataCode(leg.getArrivalAirport().getIataCode())
                   .arrivalAirportCity(leg.getArrivalAirport().getCity())
                   .arrivalAirportCountry(leg.getArrivalAirport().getCountry());
        }
        
        return builder.build();
    }
}
