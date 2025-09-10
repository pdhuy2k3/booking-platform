package com.pdh.flight.controller;

import com.pdh.common.dto.ApiResponse;
import com.pdh.flight.dto.request.FlightFareCreateDto;
import com.pdh.flight.dto.request.FlightFareUpdateDto;
import com.pdh.flight.dto.response.FlightFareDto;
import com.pdh.flight.service.BackofficeFlightFareService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST Controller for flight fare management in backoffice
 */
@RestController
@RequestMapping("/backoffice/flight-fares")
@RequiredArgsConstructor
@Slf4j
public class BackofficeFlightFareController {

    private final BackofficeFlightFareService backofficeFlightFareService;

    /**
     * Get all flight fares with pagination and filtering for backoffice
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllFlightFares(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String fareClass,
            @RequestParam(required = false) UUID scheduleId) {

        log.info("Fetching flight fares for backoffice: page={}, size={}, search={}, fareClass={}, scheduleId={}", 
                page, size, search, fareClass, scheduleId);
        
        try {
            Map<String, Object> response = backofficeFlightFareService.getAllFlightFares(page, size, search, fareClass, scheduleId);
            log.info("Found {} flight fares for backoffice", ((List<?>) response.getOrDefault("content", List.of())).size());
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error fetching flight fares for backoffice", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch flight fares", e.getMessage()));
        }
    }

    /**
     * Get flight fare by ID for backoffice
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FlightFareDto>> getFlightFare(@PathVariable UUID id) {
        log.info("Fetching flight fare details for backoffice: ID={}", id);
        
        try {
            FlightFareDto response = backofficeFlightFareService.getFlightFare(id);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (jakarta.persistence.EntityNotFoundException e) {
            log.error("Flight fare not found for backoffice: ID={}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Flight fare not found", e.getMessage()));
        } catch (Exception e) {
            log.error("Error fetching flight fare details for backoffice: ID={}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch flight fare details", e.getMessage()));
        }
    }

    /**
     * Create a new flight fare
     */
    @PostMapping
    public ResponseEntity<ApiResponse<FlightFareDto>> createFlightFare(@Valid @RequestBody FlightFareCreateDto flightFareCreateDto) {
        log.info("Creating new flight fare for schedule: {}", flightFareCreateDto.getScheduleId());
        
        try {
            FlightFareDto response = backofficeFlightFareService.createFlightFare(flightFareCreateDto);
            log.info("Flight fare created successfully for schedule: {}", flightFareCreateDto.getScheduleId());
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
        } catch (IllegalArgumentException e) {
            log.error("Invalid flight fare data", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid flight fare data", e.getMessage()));
        } catch (jakarta.persistence.EntityNotFoundException e) {
            log.error("Referenced entity not found", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Referenced entity not found", e.getMessage()));
        } catch (Exception e) {
            log.error("Error creating flight fare", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create flight fare", e.getMessage()));
        }
    }

    /**
     * Update an existing flight fare
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FlightFareDto>> updateFlightFare(@PathVariable UUID id, @Valid @RequestBody FlightFareUpdateDto flightFareUpdateDto) {
        log.info("Updating flight fare: ID={}", id);
        
        try {
            FlightFareDto response = backofficeFlightFareService.updateFlightFare(id, flightFareUpdateDto);
            log.info("Flight fare updated successfully with ID: {}", id);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (jakarta.persistence.EntityNotFoundException e) {
            log.error("Flight fare not found for update: ID={}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Flight fare not found", e.getMessage()));
        } catch (IllegalArgumentException e) {
            log.error("Invalid flight fare data for update", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid flight fare data", e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating flight fare: ID={}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update flight fare", e.getMessage()));
        }
    }

    /**
     * Delete a flight fare (soft delete)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, String>>> deleteFlightFare(@PathVariable UUID id) {
        log.info("Deleting flight fare: ID={}", id);
        
        try {
            backofficeFlightFareService.deleteFlightFare(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Flight fare deleted successfully");
            log.info("Flight fare deleted successfully with ID: {}", id);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (jakarta.persistence.EntityNotFoundException e) {
            log.error("Flight fare not found for deletion: ID={}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Flight fare not found", e.getMessage()));
        } catch (Exception e) {
            log.error("Error deleting flight fare: ID={}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete flight fare", e.getMessage()));
        }
    }

    /**
     * Get flight fares by schedule ID
     */
    @GetMapping("/schedule/{scheduleId}")
    public ResponseEntity<ApiResponse<List<FlightFareDto>>> getFlightFaresBySchedule(@PathVariable UUID scheduleId) {
        log.info("Fetching flight fares for schedule ID: {}", scheduleId);
        
        try {
            List<FlightFareDto> response = backofficeFlightFareService.getFlightFaresByScheduleId(scheduleId);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error fetching flight fares for schedule: {}", scheduleId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch flight fares for schedule", e.getMessage()));
        }
    }

    /**
     * Get flight fare statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFlightFareStatistics() {
        log.info("Fetching flight fare statistics for backoffice");
        
        try {
            Map<String, Object> response = backofficeFlightFareService.getFlightFareStatistics();
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error fetching flight fare statistics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch flight fare statistics", e.getMessage()));
        }
    }
}
