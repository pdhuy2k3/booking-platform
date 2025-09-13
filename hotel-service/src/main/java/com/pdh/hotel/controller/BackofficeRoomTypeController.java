package com.pdh.hotel.controller;

import com.pdh.common.dto.response.ApiResponse;
import com.pdh.hotel.dto.request.RoomTypeRequestDto;
import com.pdh.hotel.dto.response.RoomTypeListResponseDto;
import com.pdh.hotel.dto.response.RoomTypeSingleResponseDto;
import com.pdh.hotel.service.BackofficeRoomTypeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/backoffice")
@Tag(name = "Backoffice Room Type", description = "APIs for managing room types in backoffice")
public class BackofficeRoomTypeController {
    
    private final BackofficeRoomTypeService backofficeRoomTypeService;
    
    /**
     * Get all room types for a specific hotel
     */
    @GetMapping("/room-types/{hotelId}/hotel")
    @Operation(summary = "Get all room types for a hotel", description = "Retrieve all room types associated with a specific hotel")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved room types"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Hotel not found", content = @Content),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<RoomTypeListResponseDto>> getRoomTypesByHotel(
            @Parameter(description = "Hotel ID", required = true)
            @PathVariable Long hotelId) {
        log.info("Fetching room types for hotel ID: {}", hotelId);
        
        try {
            RoomTypeListResponseDto response = backofficeRoomTypeService.getRoomTypesByHotel(hotelId);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error fetching room types for hotel ID: {}", hotelId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to fetch room types: " + e.getMessage()));
        }
    }
    
    /**
     * Get room type by ID
     */
    @GetMapping("/room-types/{id}")
    @Operation(summary = "Get room type by ID", description = "Retrieve a specific room type by its ID")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved room type"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Room type not found", content = @Content),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<RoomTypeSingleResponseDto>> getRoomType(
            @Parameter(description = "Room type ID", required = true)
            @PathVariable Long id) {
        log.info("Fetching room type with ID: {}", id);
        
        try {
            RoomTypeSingleResponseDto response = backofficeRoomTypeService.getRoomType(id);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error fetching room type with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to fetch room type: " + e.getMessage()));
        }
    }
    
    /**
     * Get suitable room types for a specific number of guests
     */
    @GetMapping("/room-types/{hotelId}/suitable")
    @Operation(summary = "Get suitable room types", description = "Retrieve room types suitable for a specific number of guests")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Successfully retrieved suitable room types"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Hotel not found", content = @Content),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<RoomTypeListResponseDto>> getSuitableRoomTypes(
            @Parameter(description = "Hotel ID", required = true)
            @PathVariable Long hotelId,
            @Parameter(description = "Number of guests", required = true)
            @RequestParam int guestCount) {
        
        log.info("Fetching suitable room types for hotel ID: {} and {} guests", hotelId, guestCount);
        
        try {
            RoomTypeListResponseDto response = backofficeRoomTypeService.getSuitableRoomTypes(hotelId, guestCount);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error fetching suitable room types for hotel ID: {} and {} guests", hotelId, guestCount, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to fetch suitable room types: " + e.getMessage()));
        }
    }
    
    /**
     * Create a new room type for a hotel
     */
    @PostMapping("/room-types/{hotelId}")
    @Operation(summary = "Create room type", description = "Create a new room type for a specific hotel")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Room type created successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request data", content = @Content),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Hotel not found", content = @Content),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<RoomTypeSingleResponseDto>> createRoomType(
            @Parameter(description = "Hotel ID", required = true)
            @PathVariable Long hotelId,
            @Valid @RequestBody RoomTypeRequestDto requestDto) {
        
        log.info("Creating room type for hotel ID: {}", hotelId);
        
        try {
            RoomTypeSingleResponseDto response = backofficeRoomTypeService.createRoomType(hotelId, requestDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response, "Room type created successfully"));
        } catch (Exception e) {
            log.error("Error creating room type for hotel ID: {}", hotelId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to create room type: " + e.getMessage()));
        }
    }
    
    /**
     * Update an existing room type
     */
    @PutMapping("/room-types/{id}")
    @Operation(summary = "Update room type", description = "Update an existing room type")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Room type updated successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request data", content = @Content),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Room type not found", content = @Content),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<RoomTypeSingleResponseDto>> updateRoomType(
            @Parameter(description = "Room type ID", required = true)
            @PathVariable Long id,
            @Valid @RequestBody RoomTypeRequestDto requestDto) {
        
        log.info("Updating room type with ID: {}", id);
        
        try {
            RoomTypeSingleResponseDto response = backofficeRoomTypeService.updateRoomType(id, requestDto);
            return ResponseEntity.ok(ApiResponse.success(response, "Room type updated successfully"));
        } catch (Exception e) {
            log.error("Error updating room type with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to update room type: " + e.getMessage()));
        }
    }
    
    /**
     * Delete a room type
     */
    @DeleteMapping("/room-types/{id}")
    @Operation(summary = "Delete room type", description = "Delete a room type by its ID")
    @ApiResponses({
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Room type deleted successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Room type not found", content = @Content),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResponse<Void>> deleteRoomType(
            @Parameter(description = "Room type ID", required = true)
            @PathVariable Long id) {
        log.info("Deleting room type with ID: {}", id);
        
        try {
            backofficeRoomTypeService.deleteRoomType(id);
            return ResponseEntity.ok(ApiResponse.success(null, "Room type deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting room type with ID: {}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to delete room type: " + e.getMessage()));
        }
    }
}
