package com.pdh.flight.controller;

import com.pdh.flight.dto.response.FlightScheduleDto;
import com.pdh.flight.service.FlightScheduleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Controller for managing flight schedules in backoffice
 */
@RestController
@RequestMapping("/backoffice/flights/{flightId}/schedules")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Backoffice Flight Schedules", description = "Flight schedule management for backoffice")
public class BackofficeFlightScheduleController {

    private final FlightScheduleService flightScheduleService;

    /**
     * Get all schedules for a flight
     */
    @Operation(summary = "Get all schedules for a flight", description = "Retrieve all schedules for a specific flight")
    @GetMapping
    public ResponseEntity<List<FlightScheduleDto>> getFlightSchedules(
            @Parameter(description = "Flight ID", required = true)
            @PathVariable Long flightId) {
        
        log.info("Fetching schedules for flight ID: {}", flightId);
        List<FlightScheduleDto> schedules = flightScheduleService.getSchedulesByFlightId(flightId);
        return ResponseEntity.ok(schedules);
    }

    /**
     * Get active schedules for a flight
     */
    @Operation(summary = "Get active schedules for a flight", description = "Retrieve only active schedules for a specific flight")
    @GetMapping("/active")
    public ResponseEntity<List<FlightScheduleDto>> getActiveFlightSchedules(
            @Parameter(description = "Flight ID", required = true)
            @PathVariable Long flightId) {
        
        log.info("Fetching active schedules for flight ID: {}", flightId);
        List<FlightScheduleDto> schedules = flightScheduleService.getActiveSchedulesByFlightId(flightId);
        return ResponseEntity.ok(schedules);
    }

    /**
     * Get schedules for a flight on a specific date
     */
    @Operation(summary = "Get schedules by date", description = "Retrieve schedules for a flight on a specific date")
    @GetMapping("/date/{date}")
    public ResponseEntity<List<FlightScheduleDto>> getFlightSchedulesByDate(
            @Parameter(description = "Flight ID", required = true)
            @PathVariable Long flightId,
            @Parameter(description = "Departure date (YYYY-MM-DD)", required = true)
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        log.info("Fetching schedules for flight ID: {} on date: {}", flightId, date);
        List<FlightScheduleDto> schedules = flightScheduleService.getSchedulesByFlightIdAndDate(flightId, date);
        return ResponseEntity.ok(schedules);
    }

    /**
     * Get schedule statistics for a flight
     */
    @Operation(summary = "Get schedule statistics", description = "Get total and active schedule counts for a flight")
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Long>> getFlightScheduleStatistics(
            @Parameter(description = "Flight ID", required = true)
            @PathVariable Long flightId) {
        
        log.info("Fetching schedule statistics for flight ID: {}", flightId);
        Map<String, Long> statistics = flightScheduleService.getScheduleStatistics(flightId);
        return ResponseEntity.ok(statistics);
    }
}
