package com.pdh.flight.service;

import com.pdh.flight.dto.response.FlightFareDto;
import com.pdh.flight.dto.response.FlightSearchResultDto;
import com.pdh.flight.model.Flight;
import com.pdh.flight.model.FlightSchedule;
import com.pdh.flight.model.Aircraft;
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
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
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
    private final PricingService pricingService;
    private final FlightSearchSpecificationService flightSearchSpecificationService;
    
    /**
     * Search flights with pricing information and filters using JPA Specifications
     * 
     * @param origin Origin airport IATA code, city name, or country
     * @param destination Destination airport IATA code, city name, or country
     * @param originTerms Additional origin search terms for flexible matching
     * @param destinationTerms Additional destination search terms for flexible matching
     * @param departureDate Departure date
     * @param returnDate Return date (optional)
     * @param passengers Number of passengers
     * @param fareClass Fare class
     * @param pageable Pageable object for pagination
     * @param sortBy Sort by criteria (price, duration, departure, arrival)
     * @param airlineId Filter by airline ID
     * @param departureAirportId Filter by departure airport ID
     * @return Page of FlightSearchResultDto with pricing
     */
    @Transactional(readOnly = true)
    public Page<FlightSearchResultDto> searchFlights(
            String origin, String destination, List<String> originTerms, List<String> destinationTerms,
            LocalDate departureDate, LocalDate returnDate, int passengers, FareClass fareClass,
            Pageable pageable, String sortBy, Long airlineId, Long departureAirportId,
            String airlineName, String airlineCode, BigDecimal minPrice, BigDecimal maxPrice,
            Integer minDuration, Integer maxDuration) {

        log.info("Searching flights: origin={}, destination={}, originTerms={}, destinationTerms={}, departureDate={}, passengers={}, fareClass={}, sortBy={}, airlineId={}, departureAirportId={}, airlineName={}, airlineCode={}, minPrice={}, maxPrice={}, minDuration={}, maxDuration={}",
                origin, destination, originTerms, destinationTerms, departureDate, passengers, fareClass, sortBy, airlineId, departureAirportId, airlineName, airlineCode, minPrice, maxPrice, minDuration, maxDuration);
        
        try {
            // Build search criteria for JPA Specifications
            FlightSearchSpecificationService.FlightSearchCriteria criteria = new FlightSearchSpecificationService.FlightSearchCriteria();
            criteria.setOrigin(origin);
            criteria.setOriginTerms(originTerms);
            criteria.setDestination(destination);
            criteria.setDestinationTerms(destinationTerms);
            criteria.setAirlineName(airlineName);
            criteria.setAirlineCode(airlineCode);
            criteria.setMinPrice(minPrice);
            criteria.setMaxPrice(maxPrice);
            criteria.setMinDuration(minDuration);
            criteria.setMaxDuration(maxDuration);
            
            // Set date range
            if (departureDate != null) {
                criteria.setStartDate(departureDate.atStartOfDay());
                if (returnDate != null) {
                    criteria.setEndDate(returnDate.atTime(23, 59, 59));
                } else {
                    criteria.setEndDate(departureDate.atTime(23, 59, 59));
                }
            }
            
            // Search flights using JPA Specifications
            Page<Flight> flightPage = flightSearchSpecificationService.searchFlights(criteria, pageable);
            
            // Get schedules for these flights on the specific departure date
            List<Long> flightIds = flightPage.getContent().stream()
                    .map(Flight::getFlightId)
                    .collect(Collectors.toList());
            
            // Convert LocalDateTime to ZonedDateTime for repository call
            ZonedDateTime startTime = departureDate != null ? 
                departureDate.atStartOfDay().atZone(ZoneId.of("UTC")) : 
                LocalDate.now().atStartOfDay().atZone(ZoneId.of("UTC"));
            ZonedDateTime endTime = departureDate != null ? 
                departureDate.atTime(LocalTime.MAX).atZone(ZoneId.of("UTC")) : 
                LocalDate.now().atTime(LocalTime.MAX).atZone(ZoneId.of("UTC"));
            
            List<FlightSchedule> schedules = flightScheduleRepository
                    .findByFlightIdInAndDepartureTimeBetween(flightIds, startTime, endTime)
                    .stream()
                    .filter(schedule -> schedule != null && !schedule.isDeleted())
                    .sorted(Comparator.comparing(FlightSchedule::getDepartureTime))
                    .collect(Collectors.toList());
            
            Map<Long, List<FlightSchedule>> schedulesByFlightId = schedules.stream()
                    .collect(Collectors.groupingBy(FlightSchedule::getFlightId));

            // Get schedule IDs for fare lookup
            List<UUID> scheduleIds = schedules.stream()
                    .map(FlightSchedule::getScheduleId)
                    .collect(Collectors.toList());
            
            // Get fares for all schedules
            Map<UUID, List<FlightFareDto>> faresMap = pricingService.getFaresForSchedules(scheduleIds);
            
            // Convert to search result DTOs
            List<FlightSearchResultDto> searchResults = flightPage.getContent().stream()
                    .map(flight -> convertToSearchResult(
                            flight,
                            schedulesByFlightId.getOrDefault(flight.getFlightId(), List.of()),
                            faresMap,
                            passengers,
                            fareClass))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
            
            return new PageImpl<>(searchResults, pageable, searchResults.size());
            
        } catch (Exception e) {
            log.error("Error searching flights", e);
            return Page.empty(pageable);
        }
    }
    
    /**
     * Convert Flight entity to FlightSearchResultDto with pricing
     */
    private FlightSearchResultDto convertToSearchResult(
            Flight flight,
            List<FlightSchedule> flightSchedules,
            Map<UUID, List<FlightFareDto>> faresMap,
            int passengers,
            FareClass fareClass) {

        if (flightSchedules == null || flightSchedules.isEmpty()) {
            return null;
        }

        FlightScheduleWithFare selected = flightSchedules.stream()
                .sorted(Comparator.comparing(FlightSchedule::getDepartureTime))
                .map(schedule -> {
                    List<FlightFareDto> scheduleFares = faresMap.getOrDefault(schedule.getScheduleId(), List.of());
                    FlightFareDto scheduleFare = selectFareForSchedule(scheduleFares, fareClass);
                    if (scheduleFare == null || scheduleFare.getPrice() == null) {
                        return null;
                    }
                    return new FlightScheduleWithFare(schedule, scheduleFare);
                })
                .filter(Objects::nonNull)
                .findFirst()
                .orElse(null);

        if (selected == null) {
            return null;
        }

        FlightSchedule matchingSchedule = selected.schedule();
        FlightFareDto selectedFare = selected.fare();

        BigDecimal totalPrice = selectedFare.getPrice().multiply(BigDecimal.valueOf(passengers));
        String resolvedSeatClass = selectedFare.getFareClass() != null
                ? selectedFare.getFareClass()
                : fareClass != null ? fareClass.name() : "ECONOMY";

        return FlightSearchResultDto.builder()
                .flightId(flight.getFlightId().toString())
                .airline(flight.getAirline() != null ? flight.getAirline().getName() : "Unknown")
                .airlineCode(flight.getAirline() != null ? flight.getAirline().getIataCode() : "")
                .flightNumber(flight.getFlightNumber())
                .origin(flight.getDepartureAirport() != null ? flight.getDepartureAirport().getIataCode() : "")
                .destination(flight.getArrivalAirport() != null ? flight.getArrivalAirport().getIataCode() : "")
                .originName(flight.getDepartureAirport() != null ? flight.getDepartureAirport().getName() : "")
                .destinationName(flight.getArrivalAirport() != null ? flight.getArrivalAirport().getName() : "")
                .originLatitude(flight.getDepartureAirport() != null ? flight.getDepartureAirport().getLatitude() : null)
                .originLongitude(flight.getDepartureAirport() != null ? flight.getDepartureAirport().getLongitude() : null)
                .destinationLatitude(flight.getArrivalAirport() != null ? flight.getArrivalAirport().getLatitude() : null)
                .destinationLongitude(flight.getArrivalAirport() != null ? flight.getArrivalAirport().getLongitude() : null)
                .departureTime(matchingSchedule.getDepartureTime().format(DateTimeFormatter.ofPattern("HH:mm")))
                .arrivalTime(matchingSchedule.getArrivalTime().format(DateTimeFormatter.ofPattern("HH:mm")))
                .departureDateTime(matchingSchedule.getDepartureTime())
                .arrivalDateTime(matchingSchedule.getArrivalTime())
                .duration(formatDuration(calculateDuration(matchingSchedule)))
                .durationMinutes(calculateDuration(matchingSchedule))
                .price(totalPrice.doubleValue())
                .currency("VND")
                .formattedPrice(formatPrice(totalPrice))
                .seatClass(resolvedSeatClass)
                .availableSeats(selectedFare.getAvailableSeats() != null ? selectedFare.getAvailableSeats() : 0)
                .totalSeats(getTotalSeats(flight.getAircraft()))
                .scheduleId(matchingSchedule.getScheduleId() != null ? matchingSchedule.getScheduleId().toString() : null)
                .fareId(selectedFare.getFareId() != null ? selectedFare.getFareId().toString() : null)
                .aircraft(flight.getAircraft() != null ? flight.getAircraft().getModel() : "Unknown")
                .aircraftType(flight.getAircraftType())
                .stops(0)
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

    private FlightFareDto selectFareForSchedule(List<FlightFareDto> scheduleFares, FareClass requestedClass) {
        if (scheduleFares == null || scheduleFares.isEmpty()) {
            return null;
        }

        Comparator<FlightFareDto> byPrice = Comparator.comparing(FlightFareDto::getPrice, Comparator.nullsLast(Comparator.naturalOrder()));

        if (requestedClass != null) {
            Optional<FlightFareDto> exactMatch = scheduleFares.stream()
                    .filter(fare -> fare.getFareClass() != null && fare.getFareClass().equalsIgnoreCase(requestedClass.name()))
                    .min(byPrice);
            if (exactMatch.isPresent()) {
                return exactMatch.get();
            }
        }

        return scheduleFares.stream()
                .min(byPrice)
                .orElse(null);
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

    private record FlightScheduleWithFare(FlightSchedule schedule, FlightFareDto fare) {}
}
