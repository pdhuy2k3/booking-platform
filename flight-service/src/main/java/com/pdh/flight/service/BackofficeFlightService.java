package com.pdh.flight.service;

import com.pdh.flight.dto.request.FlightCreateDto;
import com.pdh.flight.dto.request.FlightUpdateDto;
import com.pdh.flight.dto.response.FlightDto;
import com.pdh.flight.model.Airline;
import com.pdh.flight.model.Airport;
import com.pdh.flight.model.Flight;
import com.pdh.flight.repository.AirlineRepository;
import com.pdh.flight.repository.AirportRepository;
import com.pdh.flight.repository.FlightRepository;
import com.pdh.flight.repository.FlightScheduleRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for managing flights in backoffice
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BackofficeFlightService {

    private final FlightRepository flightRepository;
    private final AirlineRepository airlineRepository;
    private final AirportRepository airportRepository;
    private final FlightScheduleRepository flightScheduleRepository;

    /**
     * Get all flights with pagination and filtering
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getAllFlights(int page, int size, String search, String origin, 
                                           String destination, String status) {
        log.info("Fetching flights for backoffice: page={}, size={}, search={}, origin={}, destination={}, status={}", 
                page, size, search, origin, destination, status);

        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt").and(Sort.by("flightNumber"));
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Flight> flightPage;
        
        // Build query based on filters
        if (StringUtils.hasText(search) || StringUtils.hasText(origin) || 
            StringUtils.hasText(destination) || StringUtils.hasText(status)) {
            flightPage = findFlightsWithFilters(search, origin, destination, status, pageable);
        } else {
            flightPage = flightRepository.findAllWithDetails(pageable);
        }

        List<Map<String, Object>> flights = flightPage.getContent().stream()
            .map(this::convertFlightToResponse)
            .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("content", flights);
        response.put("totalElements", flightPage.getTotalElements());
        response.put("totalPages", flightPage.getTotalPages());
        response.put("size", flightPage.getSize());
        response.put("number", flightPage.getNumber());
        response.put("first", flightPage.isFirst());
        response.put("last", flightPage.isLast());
        response.put("empty", flightPage.isEmpty());

        log.info("Found {} flights for backoffice", flights.size());
        return response;
    }

    /**
     * Get single flight with full details
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getFlight(Long id) {
        log.info("Fetching flight details for backoffice: ID={}", id);
        
        Flight flight = flightRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Flight not found with ID: " + id));
        
        Map<String, Object> response = convertFlightToDetailedResponse(flight);
        
        // Add statistics
        Long totalSchedules = flightScheduleRepository.countByFlightId(id);
        Long activeSchedules = flightScheduleRepository.countByFlightIdAndStatus(id, "SCHEDULED");
        
        response.put("totalSchedules", totalSchedules);
        response.put("activeSchedules", activeSchedules);
        
        return response;
    }

    /**
     * Create new flight
     */
    public Map<String, Object> createFlight(FlightCreateDto createDto) {
        log.info("Creating new flight: {}", createDto.getFlightNumber());
        
        // Validate flight number uniqueness
        if (flightRepository.findByFlightNumberWithDetails(createDto.getFlightNumber()).isPresent()) {
            throw new IllegalArgumentException("Flight number already exists: " + createDto.getFlightNumber());
        }
        
        // Validate airline exists
        Airline airline = airlineRepository.findById(createDto.getAirlineId())
            .orElseThrow(() -> new EntityNotFoundException("Airline not found with ID: " + createDto.getAirlineId()));
        
        // Validate airports exist
        Airport departureAirport = airportRepository.findById(createDto.getDepartureAirportId())
            .orElseThrow(() -> new EntityNotFoundException("Departure airport not found with ID: " + createDto.getDepartureAirportId()));
        
        Airport arrivalAirport = airportRepository.findById(createDto.getArrivalAirportId())
            .orElseThrow(() -> new EntityNotFoundException("Arrival airport not found with ID: " + createDto.getArrivalAirportId()));
        
        // Create new flight
        Flight flight = new Flight();
        flight.setFlightNumber(createDto.getFlightNumber());
        flight.setAirline(airline);
        flight.setDepartureAirport(departureAirport);
        flight.setArrivalAirport(arrivalAirport);
        flight.setBaseDurationMinutes(createDto.getBaseDurationMinutes());
        flight.setAircraftType(createDto.getAircraftType());
        flight.setStatus(createDto.getStatus());
        flight.setBasePrice(createDto.getBasePrice());
        
        Flight savedFlight = flightRepository.save(flight);
        
        Map<String, Object> response = convertFlightToResponse(savedFlight);
        response.put("message", "Flight created successfully");
        
        log.info("Flight created successfully with ID: {}", savedFlight.getFlightId());
        return response;
    }

    /**
     * Update existing flight
     */
    public Map<String, Object> updateFlight(Long id, FlightUpdateDto updateDto) {
        log.info("Updating flight: ID={}", id);
        
        Flight flight = flightRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Flight not found with ID: " + id));
        
        // Update fields if provided
        if (StringUtils.hasText(updateDto.getFlightNumber())) {
            // Check if flight number is unique (exclude current flight)
            Optional<Flight> existingFlight = flightRepository.findByFlightNumberWithDetails(updateDto.getFlightNumber());
            if (existingFlight.isPresent() && !existingFlight.get().getFlightId().equals(id)) {
                throw new IllegalArgumentException("Flight number already exists: " + updateDto.getFlightNumber());
            }
            flight.setFlightNumber(updateDto.getFlightNumber());
        }
        
        if (updateDto.getAirlineId() != null) {
            Airline airline = airlineRepository.findById(updateDto.getAirlineId())
                .orElseThrow(() -> new EntityNotFoundException("Airline not found with ID: " + updateDto.getAirlineId()));
            flight.setAirline(airline);
        }
        
        if (updateDto.getDepartureAirportId() != null) {
            Airport departureAirport = airportRepository.findById(updateDto.getDepartureAirportId())
                .orElseThrow(() -> new EntityNotFoundException("Departure airport not found with ID: " + updateDto.getDepartureAirportId()));
            flight.setDepartureAirport(departureAirport);
        }
        
        if (updateDto.getArrivalAirportId() != null) {
            Airport arrivalAirport = airportRepository.findById(updateDto.getArrivalAirportId())
                .orElseThrow(() -> new EntityNotFoundException("Arrival airport not found with ID: " + updateDto.getArrivalAirportId()));
            flight.setArrivalAirport(arrivalAirport);
        }
        
        if (updateDto.getBaseDurationMinutes() != null) {
            flight.setBaseDurationMinutes(updateDto.getBaseDurationMinutes());
        }
        
        if (StringUtils.hasText(updateDto.getAircraftType())) {
            flight.setAircraftType(updateDto.getAircraftType());
        }
        
        if (StringUtils.hasText(updateDto.getStatus())) {
            flight.setStatus(updateDto.getStatus());
        }
        
        if (updateDto.getBasePrice() != null) {
            flight.setBasePrice(updateDto.getBasePrice());
        }
        
        Flight updatedFlight = flightRepository.save(flight);
        
        Map<String, Object> response = convertFlightToResponse(updatedFlight);
        response.put("message", "Flight updated successfully");
        
        log.info("Flight updated successfully with ID: {}", id);
        return response;
    }

    /**
     * Soft delete flight
     */
    public void deleteFlight(Long id) {
        log.info("Deleting flight: ID={}", id);
        
        Flight flight = flightRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Flight not found with ID: " + id));
        
        // Soft delete to preserve referential integrity
        flight.setDeleted(true);
        flight.setDeletedAt(ZonedDateTime.now());
        flightRepository.save(flight);
        
        log.info("Flight deleted successfully with ID: {}", id);
    }

    /**
     * Get flight statistics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getFlightStatistics() {
        long totalFlights = flightRepository.count();
        long activeFlights = flightRepository.countByStatus("ACTIVE");
        long cancelledFlights = flightRepository.countByStatus("CANCELLED");
        long delayedFlights = flightRepository.countByStatus("DELAYED");
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalFlights", totalFlights);
        stats.put("activeFlights", activeFlights);
        stats.put("cancelledFlights", cancelledFlights);
        stats.put("delayedFlights", delayedFlights);
        stats.put("totalAirlines", airlineRepository.count());
        stats.put("totalAirports", airportRepository.count());
        
        return stats;
    }

    // === Helper Methods ===

    private Page<Flight> findFlightsWithFilters(String search, String origin, String destination, 
                                               String status, Pageable pageable) {
        // For now, use the basic findAll and filter manually
        // In production, you would create custom repository methods with @Query
        Page<Flight> allFlights = flightRepository.findAllWithDetails(pageable);
        
        // TODO: Implement proper filtering with custom queries
        // This is a simplified version for demonstration
        return allFlights;
    }

    /**
     * Convert Flight entity to response format
     */
    public Map<String, Object> convertFlightToResponse(Flight flight) {
        Map<String, Object> response = new HashMap<>();
        
        response.put("id", flight.getFlightId());
        response.put("flightNumber", flight.getFlightNumber() != null ? flight.getFlightNumber() : "");
        response.put("baseDurationMinutes", flight.getBaseDurationMinutes());
        response.put("aircraftType", flight.getAircraftType() != null ? flight.getAircraftType() : "");
        response.put("status", flight.getStatus() != null ? flight.getStatus() : "ACTIVE");
        response.put("basePrice", flight.getBasePrice() != null ? flight.getBasePrice().doubleValue() : 0.0);
        
        // Airline information
        if (flight.getAirline() != null) {
            response.put("airlineId", flight.getAirline().getAirlineId());
            response.put("airline", flight.getAirline().getName());
            response.put("airlineIataCode", flight.getAirline().getIataCode());
            response.put("airlineLogoUrl", flight.getAirline().getLogoUrl());
        }
        
        // Departure airport information
        if (flight.getDepartureAirport() != null) {
            response.put("departureAirportId", flight.getDepartureAirport().getAirportId());
            response.put("origin", flight.getDepartureAirport().getIataCode());
            response.put("originName", flight.getDepartureAirport().getName());
            response.put("originCity", flight.getDepartureAirport().getCity());
            response.put("originCountry", flight.getDepartureAirport().getCountry());
        }
        
        // Arrival airport information
        if (flight.getArrivalAirport() != null) {
            response.put("arrivalAirportId", flight.getArrivalAirport().getAirportId());
            response.put("destination", flight.getArrivalAirport().getIataCode());
            response.put("destinationName", flight.getArrivalAirport().getName());
            response.put("destinationCity", flight.getArrivalAirport().getCity());
            response.put("destinationCountry", flight.getArrivalAirport().getCountry());
        }
        
        // Audit information
        response.put("createdAt", flight.getCreatedAt());
        response.put("createdBy", flight.getCreatedBy());
        response.put("updatedAt", flight.getUpdatedAt());
        response.put("updatedBy", flight.getUpdatedBy());
        
        return response;
    }

    private Map<String, Object> convertFlightToDetailedResponse(Flight flight) {
        return convertFlightToResponse(flight);
    }
}
