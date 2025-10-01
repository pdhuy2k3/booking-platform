package com.pdh.hotel.controller;

import com.pdh.common.dto.response.ApiResponse;
import com.pdh.hotel.dto.request.RoomAvailabilityUpdateRequestDto;
import com.pdh.hotel.dto.response.RoomAvailabilityResponseDto;
import com.pdh.hotel.dto.response.RoomTypeInheritanceDto;
import com.pdh.hotel.service.BackofficeRoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

/**
 * REST controller for managing room-type availability in backoffice.
 */
@RestController
@RequestMapping("/backoffice")
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
@Tag(name = "Backoffice Room Availability", description = "APIs for managing room availability in backoffice")
@Deprecated
public class BackofficeRoomController {

    private final BackofficeRoomService backofficeRoomService;

    @GetMapping("/hotels/{hotelId}/room-types/{roomTypeId}/availability")
    @Operation(summary = "Get room availability", description = "Retrieve per-day inventory details for a room type")
    public ResponseEntity<ApiResponse<RoomAvailabilityResponseDto>> getRoomAvailability(
            @Parameter(description = "Hotel ID", required = true) @PathVariable Long hotelId,
            @Parameter(description = "Room type ID", required = true) @PathVariable Long roomTypeId,
            @Parameter(description = "Start date (YYYY-MM-DD)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "End date (YYYY-MM-DD)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        log.info("Fetching room availability for hotel {} and room type {} between {} and {}",
            hotelId, roomTypeId, startDate, endDate);

        try {
            RoomAvailabilityResponseDto response = backofficeRoomService.getRoomAvailability(hotelId, roomTypeId, startDate, endDate);
            return ResponseEntity.ok(ApiResponse.success(response, "Room availability retrieved successfully"));
        } catch (Exception e) {
            log.error("Error fetching room availability for hotel {} and room type {}", hotelId, roomTypeId, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Failed to fetch room availability: " + e.getMessage()));
        }
    }

    @PutMapping("/hotels/{hotelId}/room-types/{roomTypeId}/availability")
    @Operation(summary = "Update room availability", description = "Create or update availability records for a room type")
    public ResponseEntity<ApiResponse<RoomAvailabilityResponseDto>> updateRoomAvailability(
            @Parameter(description = "Hotel ID", required = true) @PathVariable Long hotelId,
            @Parameter(description = "Room type ID", required = true) @PathVariable Long roomTypeId,
            @RequestBody List<RoomAvailabilityUpdateRequestDto> updates) {

        log.info("Updating room availability for hotel {} and room type {} with {} entries", hotelId, roomTypeId,
            updates != null ? updates.size() : 0);

        try {
            RoomAvailabilityResponseDto response = backofficeRoomService.updateRoomAvailability(hotelId, roomTypeId, updates);
            return ResponseEntity.ok(ApiResponse.success(response, "Room availability updated successfully"));
        } catch (IllegalArgumentException ex) {
            log.warn("Invalid availability update for hotel {} and room type {}: {}", hotelId, roomTypeId, ex.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()));
        } catch (Exception e) {
            log.error("Error updating room availability for hotel {} and room type {}", hotelId, roomTypeId, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Failed to update room availability: " + e.getMessage()));
        }
    }

    @PostMapping("/hotels/{hotelId}/room-types/{roomTypeId}/availability/generate")
    @Operation(summary = "Generate random room availability", description = "Seed availability with random data for a date range")
    public ResponseEntity<ApiResponse<RoomAvailabilityResponseDto>> generateRandomAvailability(
            @Parameter(description = "Hotel ID", required = true) @PathVariable Long hotelId,
            @Parameter(description = "Room type ID", required = true) @PathVariable Long roomTypeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false, defaultValue = "15") Integer minInventory,
            @RequestParam(required = false, defaultValue = "50") Integer maxInventory,
            @RequestParam(required = false) Integer minReserved,
            @RequestParam(required = false) Integer maxReserved) {

        log.info("Generating random availability for hotel {} roomType {} between {} and {}", hotelId, roomTypeId, startDate, endDate);

        try {
            RoomAvailabilityResponseDto response = backofficeRoomService.generateRandomAvailability(
                hotelId,
                roomTypeId,
                startDate,
                endDate,
                minInventory,
                maxInventory,
                minReserved,
                maxReserved
            );
            return ResponseEntity.ok(ApiResponse.success(response, "Generated random availability successfully"));
        } catch (IllegalArgumentException ex) {
            log.warn("Invalid request when generating availability for hotel {} roomType {}: {}", hotelId, roomTypeId, ex.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error(ex.getMessage()));
        } catch (Exception e) {
            log.error("Error generating availability for hotel {} roomType {}", hotelId, roomTypeId, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Failed to generate availability: " + e.getMessage()));
        }
    }

    @GetMapping("/room-types/{id}/inheritance-info")
    @Operation(summary = "Get room type inheritance info", description = "Retrieve room type information used for derived defaults")
    @io.swagger.v3.oas.annotations.responses.ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved room type inheritance info"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Room type not found", content = @Content),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<RoomTypeInheritanceDto>> getRoomTypeInheritanceInfo(
            @Parameter(description = "Room type ID", required = true)
            @PathVariable Long id) {
        log.info("Fetching room type inheritance info for ID: {}", id);

        try {
            RoomTypeInheritanceDto response = backofficeRoomService.getRoomTypeInheritanceInfo(id);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error fetching room type inheritance info for ID: {}", id, e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Failed to fetch room type inheritance info: " + e.getMessage()));
        }
    }
}
