package com.pdh.hotel.controller;

import com.pdh.common.dto.response.ApiResponse;
import com.pdh.hotel.dto.request.RoomRequestDto;
import com.pdh.hotel.dto.response.RoomListResponseDto;
import com.pdh.hotel.dto.response.RoomSingleResponseDto;
import com.pdh.hotel.dto.response.RoomTypeInheritanceDto;
import com.pdh.hotel.service.BackofficeRoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST controller for managing rooms in backoffice
 */
@RestController
@RequestMapping("/backoffice")
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
@RequiredArgsConstructor
@Tag(name = "Backoffice Room", description = "APIs for managing rooms in backoffice")
public class BackofficeRoomController {
    
    private final BackofficeRoomService backofficeRoomService;
    
    /**
     * Get all rooms for a specific hotel with pagination
     */
    @GetMapping("/rooms/{hotelId}/rooms")
    @Operation(summary = "Get all rooms for a hotel", description = "Retrieve all rooms associated with a specific hotel with pagination support")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved rooms"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Hotel not found", content = @Content),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<RoomListResponseDto>> getRoomsByHotel(
            @Parameter(description = "Hotel ID", required = true)
            @PathVariable Long hotelId,
            @Parameter(description = "Page number (0-based)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size", example = "20")
            @RequestParam(defaultValue = "20") int size,
            @Parameter(description = "Field to sort by", example = "roomNumber")
            @RequestParam(defaultValue = "roomNumber") String sortBy,
            @Parameter(description = "Sort direction", example = "ASC")
            @RequestParam(defaultValue = "ASC") String sortDirection) {
        
        log.info("Fetching rooms for hotel ID: {}, page: {}, size: {}", hotelId, page, size);
        
        try {
            RoomListResponseDto response = backofficeRoomService.getRoomsByHotelDto(hotelId, page, size, sortBy, sortDirection);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error fetching rooms for hotel ID: {}", hotelId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to fetch rooms: " + e.getMessage()));
        }
    }
    
    /**
     * Get room by ID
     */
    @GetMapping("/rooms/{id}")
    @Operation(summary = "Get room by ID", description = "Retrieve a specific room by its ID")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved room"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Room not found", content = @Content),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<RoomSingleResponseDto>> getRoom(
            @Parameter(description = "Room ID", required = true)
            @PathVariable Long id) {
        log.info("Fetching room with ID: {}", id);
        
        try {
            RoomSingleResponseDto response = backofficeRoomService.getRoomDto(id);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error fetching room with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to fetch room: " + e.getMessage()));
        }
    }
    
    /**
     * Create a new room
     */
    @PostMapping("/rooms/{hotelId}/rooms")
    @Operation(summary = "Create room", description = "Create a new room for a specific hotel")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Room created successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request data", content = @Content),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Hotel not found", content = @Content),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<RoomSingleResponseDto>> createRoom(
            @Parameter(description = "Hotel ID", required = true)
            @PathVariable Long hotelId,
            @Valid @RequestBody RoomRequestDto requestDto) {
        
        log.info("Creating room for hotel ID: {}", hotelId);
        
        try {
            RoomSingleResponseDto response = backofficeRoomService.createRoomDto(hotelId, requestDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response, "Room created successfully"));
        } catch (Exception e) {
            log.error("Error creating room for hotel ID: {}", hotelId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to create room: " + e.getMessage()));
        }
    }
    
    /**
     * Update an existing room
     */
    @PutMapping("/rooms/{id}")
    @Operation(summary = "Update room", description = "Update an existing room")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Room updated successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request data", content = @Content),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Room not found", content = @Content),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<RoomSingleResponseDto>> updateRoom(
            @Parameter(description = "Room ID", required = true)
            @PathVariable Long id,
            @Valid @RequestBody RoomRequestDto requestDto) {
        
        log.info("Updating room with ID: {}", id);
        
        try {
            RoomSingleResponseDto response = backofficeRoomService.updateRoomDto(id, requestDto);
            return ResponseEntity.ok(ApiResponse.success(response, "Room updated successfully"));
        } catch (Exception e) {
            log.error("Error updating room with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to update room: " + e.getMessage()));
        }
    }
    
    /**
     * Delete a room
     */
    @DeleteMapping("/rooms/{id}")
    public ResponseEntity<Map<String, Object>> deleteRoom(@PathVariable Long id) {
        log.info("Deleting room with ID: {}", id);
        
        try {
            backofficeRoomService.deleteRoom(id);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Room deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error deleting room with ID: {}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to delete room");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Toggle room availability
     */
    @PatchMapping("/rooms/{id}/availability")
    @Operation(summary = "Toggle room availability", description = "Toggle the availability status of a room")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Room availability updated successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Room not found", content = @Content),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<RoomSingleResponseDto>> toggleRoomAvailability(
            @Parameter(description = "Room ID", required = true)
            @PathVariable Long id,
            @Parameter(description = "Availability status", required = true)
            @RequestParam boolean isAvailable) {
        
        log.info("Toggling availability for room ID: {} to {}", id, isAvailable);
        
        try {
            RoomSingleResponseDto response = backofficeRoomService.toggleRoomAvailabilityDto(id, isAvailable);
            return ResponseEntity.ok(ApiResponse.success(response, "Room availability updated successfully"));
        } catch (Exception e) {
            log.error("Error toggling availability for room ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to toggle room availability: " + e.getMessage()));
        }
    }
    
    /**
     * Bulk update room availability
     */
    @PatchMapping("/rooms/bulk-availability")
    public ResponseEntity<Map<String, Object>> bulkUpdateAvailability(
            @RequestBody Map<String, Object> requestBody) {
        
        log.info("Bulk updating room availability");
        
        try {
            @SuppressWarnings("unchecked")
            List<Long> roomIds = (List<Long>) requestBody.get("roomIds");
            Boolean isAvailable = (Boolean) requestBody.get("isAvailable");
            
            if (roomIds == null || roomIds.isEmpty()) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Room IDs are required");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            if (isAvailable == null) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Availability status is required");
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            backofficeRoomService.bulkUpdateAvailability(roomIds, isAvailable);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Room availability updated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error bulk updating room availability", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update room availability");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get available rooms count for a hotel
     */
    @GetMapping("/hotels/{hotelId}/rooms/count")
    public ResponseEntity<Map<String, Object>> getAvailableRoomsCount(@PathVariable Long hotelId) {
        log.info("Getting available rooms count for hotel ID: {}", hotelId);
        
        try {
            long count = backofficeRoomService.getAvailableRoomsCount(hotelId);
            Map<String, Object> response = new HashMap<>();
            response.put("availableRooms", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting available rooms count for hotel ID: {}", hotelId, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to get available rooms count");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get room type information for inheritance purposes
     */
    @GetMapping("/room-types/{id}/inheritance-info")
    @Operation(summary = "Get room type inheritance info", description = "Retrieve room type information that can be inherited by rooms")
    @ApiResponses({
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
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to fetch room type inheritance info: " + e.getMessage()));
        }
    }
}
