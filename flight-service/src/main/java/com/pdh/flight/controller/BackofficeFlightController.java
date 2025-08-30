package com.pdh.flight.controller;

import com.pdh.flight.dto.request.FlightCreateDto;
import com.pdh.flight.dto.request.FlightUpdateDto;
import com.pdh.flight.service.BackofficeFlightService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * REST Controller for flight management in backoffice
 */
@RestController
@RequestMapping("/backoffice/flights")
@RequiredArgsConstructor
@Slf4j
public class BackofficeFlightController {

    private final BackofficeFlightService backofficeFlightService;

    /**
     * Get all flights with pagination and filtering for backoffice
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllFlights(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String origin,
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) String status) {

        log.info("Fetching flights for backoffice: page={}, size={}, search={}, origin={}, destination={}, status={}",
                page, size, search, origin, destination, status);
        
        try {
            Map<String, Object> response = backofficeFlightService.getAllFlights(page, size, search, origin, destination, status);
            log.info("Found {} flights for backoffice", ((java.util.List<?>) response.getOrDefault("content", java.util.List.of())).size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching flights for backoffice", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch flights");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get flight by ID for backoffice
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getFlight(@PathVariable Long id) {
        log.info("Fetching flight details for backoffice: ID={}", id);
        
        try {
            Map<String, Object> response = backofficeFlightService.getFlight(id);
            return ResponseEntity.ok(response);
        } catch (jakarta.persistence.EntityNotFoundException e) {
            log.error("Flight not found for backoffice: ID={}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Flight not found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (Exception e) {
            log.error("Error fetching flight details for backoffice: ID={}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch flight details");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Create a new flight
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createFlight(@Valid @RequestBody FlightCreateDto flightCreateDto) {
        log.info("Creating new flight: {}", flightCreateDto.getFlightNumber());
        
        try {
            Map<String, Object> response = backofficeFlightService.createFlight(flightCreateDto);
            log.info("Flight created successfully: {}", flightCreateDto.getFlightNumber());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            log.error("Invalid flight data", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid flight data");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (jakarta.persistence.EntityNotFoundException e) {
            log.error("Referenced entity not found", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Referenced entity not found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            log.error("Error creating flight", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create flight");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Update an existing flight
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateFlight(@PathVariable Long id, @Valid @RequestBody FlightUpdateDto flightUpdateDto) {
        log.info("Updating flight: ID={}", id);
        
        try {
            Map<String, Object> response = backofficeFlightService.updateFlight(id, flightUpdateDto);
            log.info("Flight updated successfully with ID: {}", id);
            return ResponseEntity.ok(response);
        } catch (jakarta.persistence.EntityNotFoundException e) {
            log.error("Flight not found for update: ID={}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Flight not found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (IllegalArgumentException e) {
            log.error("Invalid flight data for update", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid flight data");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            log.error("Error updating flight: ID={}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update flight");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Delete a flight (soft delete)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteFlight(@PathVariable Long id) {
        log.info("Deleting flight: ID={}", id);
        
        try {
            backofficeFlightService.deleteFlight(id);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Flight deleted successfully");
            log.info("Flight deleted successfully with ID: {}", id);
            return ResponseEntity.ok(response);
        } catch (jakarta.persistence.EntityNotFoundException e) {
            log.error("Flight not found for deletion: ID={}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Flight not found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (Exception e) {
            log.error("Error deleting flight: ID={}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to delete flight");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get flight statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getFlightStatistics() {
        log.info("Fetching flight statistics for backoffice");
        
        try {
            Map<String, Object> response = backofficeFlightService.getFlightStatistics();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching flight statistics", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch flight statistics");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
