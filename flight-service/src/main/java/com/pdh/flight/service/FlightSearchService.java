package com.pdh.flight.service;

import com.pdh.flight.dto.response.FlightFareDto;
import com.pdh.flight.dto.response.FlightSearchResultDto;
import com.pdh.flight.model.Flight;
import com.pdh.flight.model.FlightSchedule;
import com.pdh.flight.model.Aircraft;
import com.pdh.flight.model.Airport;
import com.pdh.flight.model.enums.FareClass;
import com.pdh.flight.repository.FlightRepository;
import com.pdh.flight.repository.FlightScheduleRepository;
import com.pdh.flight.service.pricing.PricingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for flight search operations with integrated pricing
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FlightSearchService {
    
    private final FlightRepository flightRepository;
    private final FlightScheduleRepository flightScheduleRepository;
    private final FlightFareService flightFareService;
    private final PricingService pricingService;
    
    /**
     * Search flights with pricing information
     * 
     * @param origin Origin airport IATA code
     * @param destination Destination airport IATA code
     * @param departureDate Departure date
     * @param returnDate Return date (optional)
     * @param passengers Number of passengers
     * @param fareClass Fare class
     * @param pageable Pageable object for pagination
     * @return Page of FlightSearchResultDto with pricing
     */
    public Page<FlightSearchResultDto> searchFlights(
            String origin, String destination, LocalDate departureDate,
            LocalDate returnDate, int passengers, FareClass fareClass,
            Pageable pageable) {
        
        log.info("Searching flights: origin={}, destination={}, departureDate={}, passengers={}, fareClass={}",
                origin, destination, departureDate, passengers, fareClass);
        
        try {
            // Search for flights
            Page<Flight> flightPage = flightRepository.findFlightsByRoute(origin, destination, departureDate, pageable);
            
            // Get schedules for these flights
            List<Long> flightIds = flightPage.getContent().stream()
                    .map(Flight::getFlightId)
                    .collect(Collectors.toList());
            
            List<FlightSchedule> schedules = flightScheduleRepository
                    .findByFlightIdInAndDepartureTimeBetween(
                            flightIds,
                            departureDate.atStartOfDay(),
                            departureDate.atTime(LocalTime.MAX)
                    );
            
            // Get schedule IDs for fare lookup
            List<UUID> scheduleIds = schedules.stream()
                    .map(FlightSchedule::getScheduleId)
                    .collect(Collectors.toList());
            
            // Get fares for all schedules
            Map<UUID, List<FlightFareDto>> faresMap = pricingService.getFaresForSchedules(scheduleIds);
            
            // Convert to search result DTOs
            List<FlightSearchResultDto> searchResults = flightPage.getContent().stream()
                    .map(flight -> convertToSearchResult(flight, schedules, faresMap, passengers, fareClass))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
            
            return new PageImpl<>(searchResults, pageable, flightPage.getTotalElements());
            
        } catch (Exception e) {
            log.error("Error searching flights", e);
            return Page.empty(pageable);
        }
    }
    
    /**
     * Convert Flight entity to FlightSearchResultDto with pricing
     */
    private FlightSearchResultDto convertToSearchResult(
            Flight flight, List<FlightSchedule> schedules, 
            Map<UUID, List<FlightFareDto>> faresMap,
            int passengers, FareClass fareClass) {
        
        // Find matching schedule for this flight
        FlightSchedule matchingSchedule = schedules.stream()
                .filter(schedule -> schedule.getFlightId().equals(flight.getFlightId()))
                .findFirst()
                .orElse(null);
        
        if (matchingSchedule == null) {
            return null;
        }
        
        // Get fares for this schedule
        List<FlightFareDto> fares = faresMap.getOrDefault(matchingSchedule.getScheduleId(), new ArrayList<>());
        
        // Find fare for requested class or get the cheapest available
        FlightFareDto selectedFare = fares.stream()
                .filter(fare -> fareClass == null || 
                        (fare.getFareClass() != null && fare.getFareClass().equals(fareClass.name())))
                .min(Comparator.comparing(FlightFareDto::getPrice))
                .orElse(null);
        
        // If no fare found, calculate price
        BigDecimal price = selectedFare != null && selectedFare.getPrice() != null
                ? selectedFare.getPrice().multiply(BigDecimal.valueOf(passengers))
                : pricingService.calculatePrice(matchingSchedule, fareClass, LocalDate.now(), 
                                              matchingSchedule.getDepartureTime().toLocalDate(), passengers);
        
        // Build result DTO
        return FlightSearchResultDto.builder()
                .flightId(flight.getFlightId().toString())
                .airline(flight.getAirline() != null ? flight.getAirline().getName() : "Unknown")
                .airlineCode(flight.getAirline() != null ? flight.getAirline().getIataCode() : "")
                .flightNumber(flight.getFlightNumber())
                .origin(flight.getDepartureAirport() != null ? flight.getDepartureAirport().getIataCode() : "")
                .destination(flight.getArrivalAirport() != null ? flight.getArrivalAirport().getIataCode() : "")
                .originName(flight.getDepartureAirport() != null ? flight.getDepartureAirport().getName() : "")
                .destinationName(flight.getArrivalAirport() != null ? flight.getArrivalAirport().getName() : "")
                .departureTime(matchingSchedule.getDepartureTime().format(DateTimeFormatter.ofPattern("HH:mm")))
                .arrivalTime(matchingSchedule.getArrivalTime().format(DateTimeFormatter.ofPattern("HH:mm")))
                .departureDateTime(matchingSchedule.getDepartureTime())
                .arrivalDateTime(matchingSchedule.getArrivalTime())
                .duration(formatDuration(calculateDuration(matchingSchedule)))
                .durationMinutes(calculateDuration(matchingSchedule))
                .price(price.doubleValue())
                .currency("VND")
                .formattedPrice(formatPrice(price))
                .seatClass(fareClass != null ? fareClass.name() : "ECONOMY")
                .availableSeats(selectedFare != null ? selectedFare.getAvailableSeats() : 100)
                .totalSeats(getTotalSeats(flight.getAircraft()))
                .aircraft(flight.getAircraft() != null ? flight.getAircraft().getModel() : "Unknown")
                .aircraftType(flight.getAircraftType())
                .stops(0) // Direct flight
                .amenities(Arrays.asList("In-flight entertainment", "Meal service"))
                .mealService("Complimentary meal")
                .wifiAvailable(true)
                .entertainmentAvailable(true)
                .refundable(true)
                .changeable(true)
                .baggage(FlightSearchResultDto.BaggageInfo.builder()
                        .cabinBaggage("7kg")
                        .checkedBaggage(fareClass == FareClass.BUSINESS || fareClass == FareClass.FIRST ? "30kg" : "20kg")
                        .additionalBaggageAvailable(true)
                        .additionalBaggagePrice(150000.0)
                        .build())
                .build();
    }
    
    /**
     * Calculate flight duration in minutes
     */
    private Integer calculateDuration(FlightSchedule schedule) {
        if (schedule.getDepartureTime() != null && schedule.getArrivalTime() != null) {
            return (int) java.time.temporal.ChronoUnit.MINUTES.between(
                    schedule.getDepartureTime(), schedule.getArrivalTime());
        }
        return 120; // Default 2 hours
    }
    
    /**
     * Format duration as string
     */
    private String formatDuration(Integer durationMinutes) {
        if (durationMinutes == null) {
            return "2h 0m";
        }
        
        int hours = durationMinutes / 60;
        int minutes = durationMinutes % 60;
        
        if (hours > 0 && minutes > 0) {
            return String.format("%dh %dm", hours, minutes);
        } else if (hours > 0) {
            return String.format("%dh", hours);
        } else {
            return String.format("%dm", minutes);
        }
    }
    
    /**
     * Format price with currency
     */
    private String formatPrice(BigDecimal price) {
        return String.format("%,.0f VND", price.doubleValue());
    }
    
    /**
     * Get total seats for an aircraft
     */
    private Integer getTotalSeats(Aircraft aircraft) {
        if (aircraft != null && aircraft.getTotalCapacity() != null) {
            return aircraft.getTotalCapacity();
        }
        return 200; // Default capacity
    }
}