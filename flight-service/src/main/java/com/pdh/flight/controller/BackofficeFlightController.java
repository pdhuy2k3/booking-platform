package com.pdh.flight.controller;

import com.pdh.common.dto.ApiResponse;
import com.pdh.flight.dto.request.FlightCreateDto;
import com.pdh.flight.dto.request.FlightUpdateDto;
import com.pdh.flight.dto.response.FlightDto;
import com.pdh.flight.service.BackofficeFlightService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

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
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllFlights(
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
            log.info("Found {} flights for backoffice", ((List<?>) response.getOrDefault("content", List.of())).size());
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error fetching flights for backoffice", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch flights", e.getMessage()));
        }
    }

    /**
     * Get flight by ID for backoffice
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FlightDto>> getFlight(@PathVariable Long id) {
        log.info("Fetching flight details for backoffice: ID={}", id);
        
        try {
            FlightDto response = backofficeFlightService.getFlight(id);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (jakarta.persistence.EntityNotFoundException e) {
            log.error("Flight not found for backoffice: ID={}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Flight not found", e.getMessage()));
        } catch (Exception e) {
            log.error("Error fetching flight details for backoffice: ID={}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch flight details", e.getMessage()));
        }
    }

    /**
     * Create a new flight
     */
    @PostMapping
    public ResponseEntity<ApiResponse<FlightDto>> createFlight(@Valid @RequestBody FlightCreateDto flightCreateDto) {
        log.info("Creating new flight: {}", flightCreateDto.getFlightNumber());
        
        try {
            FlightDto response = backofficeFlightService.createFlight(flightCreateDto);
            log.info("Flight created successfully: {}", flightCreateDto.getFlightNumber());
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
        } catch (IllegalArgumentException e) {
            log.error("Invalid flight data", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid flight data", e.getMessage()));
        } catch (jakarta.persistence.EntityNotFoundException e) {
            log.error("Referenced entity not found", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Referenced entity not found", e.getMessage()));
        } catch (Exception e) {
            log.error("Error creating flight", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create flight", e.getMessage()));
        }
    }

    /**
     * Update an existing flight
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FlightDto>> updateFlight(@PathVariable Long id, @Valid @RequestBody FlightUpdateDto flightUpdateDto) {
        log.info("Updating flight: ID={}", id);
        
        try {
            FlightDto response = backofficeFlightService.updateFlight(id, flightUpdateDto);
            log.info("Flight updated successfully with ID: {}", id);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (jakarta.persistence.EntityNotFoundException e) {
            log.error("Flight not found for update: ID={}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Flight not found", e.getMessage()));
        } catch (IllegalArgumentException e) {
            log.error("Invalid flight data for update", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid flight data", e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating flight: ID={}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update flight", e.getMessage()));
        }
    }

    /**
     * Delete a flight (soft delete)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, String>>> deleteFlight(@PathVariable Long id) {
        log.info("Deleting flight: ID={}", id);
        
        try {
            backofficeFlightService.deleteFlight(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Flight deleted successfully");
            log.info("Flight deleted successfully with ID: {}", id);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (jakarta.persistence.EntityNotFoundException e) {
            log.error("Flight not found for deletion: ID={}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Flight not found", e.getMessage()));
        } catch (Exception e) {
            log.error("Error deleting flight: ID={}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete flight", e.getMessage()));
        }
    }

    /**
     * Get flight statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFlightStatistics() {
        log.info("Fetching flight statistics for backoffice");
        
        try {
            Map<String, Object> response = backofficeFlightService.getFlightStatistics();
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error fetching flight statistics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch flight statistics", e.getMessage()));
        }
    }
}
