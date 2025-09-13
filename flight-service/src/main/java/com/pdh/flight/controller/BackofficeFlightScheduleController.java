package com.pdh.flight.controller;

import com.pdh.common.dto.ApiResponse;
import com.pdh.flight.dto.request.FlightScheduleCreateDto;
import com.pdh.flight.dto.request.FlightScheduleUpdateDto;
import com.pdh.flight.dto.response.FlightScheduleDto;
import com.pdh.flight.service.BackofficeFlightScheduleService;
import com.pdh.flight.service.FlightScheduleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

/**
 * Controller for managing flight schedules in backoffice
 */
@RestController
@RequestMapping("/backoffice/schedules")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Backoffice Flight Schedules", description = "Flight schedule management for backoffice")
public class BackofficeFlightScheduleController {

    private final BackofficeFlightScheduleService backofficeFlightScheduleService;
    private final FlightScheduleService flightScheduleService;

    /**
     * Get all flight schedules with pagination and filtering
     */
    @Operation(summary = "Get all flight schedules", description = "Retrieve all flight schedules with pagination and filtering")
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllFlightSchedules(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long flightId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {

        log.info("Fetching flight schedules: page={}, size={}, flightId={}, status={}, date={}", 
                page, size, flightId, status, date);
        
        try {
            Map<String, Object> response = backofficeFlightScheduleService.getAllFlightSchedules(page, size, flightId, status, date);
            log.info("Found {} flight schedules", ((List<?>) response.getOrDefault("content", List.of())).size());
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error fetching flight schedules", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch flight schedules", e.getMessage()));
        }
    }

    /**
     * Get flight schedule by ID
     */
    @Operation(summary = "Get flight schedule by ID", description = "Retrieve a specific flight schedule by its ID")
    @GetMapping("/{scheduleId}")
    public ResponseEntity<ApiResponse<FlightScheduleDto>> getFlightSchedule(
            @Parameter(description = "Schedule ID", required = true)
            @PathVariable UUID scheduleId) {
        
        log.info("Fetching flight schedule details: ID={}", scheduleId);
        
        try {
            FlightScheduleDto response = backofficeFlightScheduleService.getFlightSchedule(scheduleId);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (jakarta.persistence.EntityNotFoundException e) {
            log.error("Flight schedule not found: ID={}", scheduleId, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Flight schedule not found", e.getMessage()));
        } catch (Exception e) {
            log.error("Error fetching flight schedule details: ID={}", scheduleId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch flight schedule details", e.getMessage()));
        }
    }

    /**
     * Create a new flight schedule
     */
    @Operation(summary = "Create flight schedule", description = "Create a new flight schedule")
    @PostMapping
    public ResponseEntity<ApiResponse<FlightScheduleDto>> createFlightSchedule(
            @Valid @RequestBody FlightScheduleCreateDto scheduleCreateDto) {
        
        log.info("Creating new flight schedule for flight: {}", scheduleCreateDto.getFlightId());
        
        try {
            FlightScheduleDto response = backofficeFlightScheduleService.createFlightSchedule(scheduleCreateDto);
            log.info("Flight schedule created successfully: {}", response.getScheduleId());
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
        } catch (IllegalArgumentException e) {
            log.error("Invalid flight schedule data", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid flight schedule data", e.getMessage()));
        } catch (jakarta.persistence.EntityNotFoundException e) {
            log.error("Referenced entity not found", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Referenced entity not found", e.getMessage()));
        } catch (Exception e) {
            log.error("Error creating flight schedule", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create flight schedule", e.getMessage()));
        }
    }

    /**
     * Update an existing flight schedule
     */
    @Operation(summary = "Update flight schedule", description = "Update an existing flight schedule")
    @PutMapping("/{scheduleId}")
    public ResponseEntity<ApiResponse<FlightScheduleDto>> updateFlightSchedule(
            @Parameter(description = "Schedule ID", required = true)
            @PathVariable UUID scheduleId,
            @Valid @RequestBody FlightScheduleUpdateDto scheduleUpdateDto) {
        
        log.info("Updating flight schedule: ID={}", scheduleId);
        
        try {
            FlightScheduleDto response = backofficeFlightScheduleService.updateFlightSchedule(scheduleId, scheduleUpdateDto);
            log.info("Flight schedule updated successfully: ID={}", scheduleId);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (jakarta.persistence.EntityNotFoundException e) {
            log.error("Flight schedule not found for update: ID={}", scheduleId, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Flight schedule not found", e.getMessage()));
        } catch (IllegalArgumentException e) {
            log.error("Invalid flight schedule data for update", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid flight schedule data", e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating flight schedule: ID={}", scheduleId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update flight schedule", e.getMessage()));
        }
    }

    /**
     * Delete a flight schedule
     */
    @Operation(summary = "Delete flight schedule", description = "Delete a flight schedule (soft delete)")
    @DeleteMapping("/{scheduleId}")
    public ResponseEntity<ApiResponse<Map<String, String>>> deleteFlightSchedule(
            @Parameter(description = "Schedule ID", required = true)
            @PathVariable UUID scheduleId) {
        
        log.info("Deleting flight schedule: ID={}", scheduleId);
        
        try {
            backofficeFlightScheduleService.deleteFlightSchedule(scheduleId);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Flight schedule deleted successfully");
            log.info("Flight schedule deleted successfully: ID={}", scheduleId);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (jakarta.persistence.EntityNotFoundException e) {
            log.error("Flight schedule not found for deletion: ID={}", scheduleId, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Flight schedule not found", e.getMessage()));
        } catch (IllegalStateException e) {
            log.error("Cannot delete flight schedule: ID={}", scheduleId, e);
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error("Cannot delete flight schedule", e.getMessage()));
        } catch (Exception e) {
            log.error("Error deleting flight schedule: ID={}", scheduleId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete flight schedule", e.getMessage()));
        }
    }

    /**
     * Get flight schedule statistics
     */
    @Operation(summary = "Get flight schedule statistics", description = "Get statistics about flight schedules")
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFlightScheduleStatistics() {
        log.info("Fetching flight schedule statistics");
        
        try {
            Map<String, Object> response = backofficeFlightScheduleService.getFlightScheduleStatistics();
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error fetching flight schedule statistics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch flight schedule statistics", e.getMessage()));
        }
    }

    // Legacy endpoints for backward compatibility (nested under flights)
    
    /**
     * Get all schedules for a specific flight (legacy endpoint)
     */
    @Operation(summary = "Get schedules for flight", description = "Get all schedules for a specific flight")
    @GetMapping("/flight/{flightId}")
    public ResponseEntity<ApiResponse<List<FlightScheduleDto>>> getSchedulesForFlight(
            @Parameter(description = "Flight ID", required = true)
            @PathVariable Long flightId) {
        
        log.info("Fetching schedules for flight ID: {}", flightId);
        
        try {
            List<FlightScheduleDto> schedules = flightScheduleService.getSchedulesByFlightId(flightId);
            return ResponseEntity.ok(ApiResponse.success(schedules));
        } catch (Exception e) {
            log.error("Error fetching schedules for flight: {}", flightId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch schedules for flight", e.getMessage()));
        }
    }
}
