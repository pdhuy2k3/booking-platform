package com.pdh.hotel.controller;

import com.pdh.hotel.dto.request.RoomTypeRequestDto;
import com.pdh.hotel.dto.response.RoomTypeResponseDto;
import com.pdh.hotel.service.RoomTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Slf4j

public class BackofficeRoomTypeController {
    
    private final RoomTypeService roomTypeService;
    
    /**
     * Get all room types for a specific hotel
     */
    @GetMapping("/backoffice/room-types/{hotelId}/hotel")
    public ResponseEntity<Map<String, Object>> getRoomTypesByHotel(@PathVariable Long hotelId) {
        log.info("Fetching room types for hotel ID: {}", hotelId);
        
        try {
            List<RoomTypeResponseDto> roomTypes = roomTypeService.getRoomTypesByHotel(hotelId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("roomTypes", roomTypes);
            response.put("message", "Room types fetched successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error fetching room types for hotel ID: {}", hotelId, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch room types");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * Get room type details by ID
     */
    @GetMapping("/backoffice/room-types/{id}")
    public ResponseEntity<Map<String, Object>> getRoomTypeById(@PathVariable Long id) {
        log.info("Fetching room type details for ID: {}", id);
        
        try {
            RoomTypeResponseDto roomType = roomTypeService.getRoomTypeById(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("roomType", roomType);
            response.put("message", "Room type fetched successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error fetching room type details for ID: {}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch room type details");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * Get suitable room types for a specific number of guests
     */
    @GetMapping("/backoffice/room-types/{hotelId}/suitable")
    public ResponseEntity<Map<String, Object>> getSuitableRoomTypes(
            @PathVariable Long hotelId,
            @RequestParam Integer guestCount) {
        
        log.info("Fetching suitable room types for hotel ID: {} and {} guests", hotelId, guestCount);
        
        try {
            List<RoomTypeResponseDto> roomTypes = roomTypeService.getSuitableRoomTypes(hotelId, guestCount);
            
            Map<String, Object> response = new HashMap<>();
            response.put("roomTypes", roomTypes);
            response.put("message", "Suitable room types fetched successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error fetching suitable room types for hotel ID: {} and {} guests", hotelId, guestCount, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch suitable room types");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
    
    /**
     * Create a new room type for a hotel
     */
    @PostMapping("/backoffice/room-types/{hotelId}")
    public ResponseEntity<Map<String, Object>> createRoomType(
            @PathVariable Long hotelId,
            @Valid @RequestBody RoomTypeRequestDto requestDto) {
        
        log.info("Creating new room type for hotel ID: {}", hotelId);
        
        try {
            RoomTypeResponseDto roomType = roomTypeService.createRoomType(hotelId, requestDto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("roomType", roomType);
            response.put("message", "Room type created successfully");
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Validation error creating room type for hotel ID: {}", hotelId, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Validation failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            log.error("Error creating room type for hotel ID: {}", hotelId, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create room type");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Update an existing room type
     */
    @PutMapping("/backoffice/room-types/{id}")
    public ResponseEntity<Map<String, Object>> updateRoomType(
            @PathVariable Long id,
            @Valid @RequestBody RoomTypeRequestDto requestDto) {
        
        log.info("Updating room type with ID: {}", id);
        
        try {
            RoomTypeResponseDto roomType = roomTypeService.updateRoomType(id, requestDto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("roomType", roomType);
            response.put("message", "Room type updated successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Validation error updating room type with ID: {}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Validation failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            log.error("Error updating room type with ID: {}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update room type");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Delete a room type
     */
    @DeleteMapping("/backoffice/room-types/{id}")
    public ResponseEntity<Map<String, Object>> deleteRoomType(@PathVariable Long id) {
        log.info("Deleting room type with ID: {}", id);
        
        try {
            roomTypeService.deleteRoomType(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Room type deleted successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalStateException e) {
            log.error("Business logic error deleting room type with ID: {}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Cannot delete room type");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
        } catch (Exception e) {
            log.error("Error deleting room type with ID: {}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to delete room type");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
