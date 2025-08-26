package com.pdh.hotel.controller;

import com.pdh.hotel.dto.request.RoomRequestDto;
import com.pdh.hotel.dto.response.RoomResponseDto;
import com.pdh.hotel.service.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class BackofficeRoomController {
    
    private final RoomService roomService;
    
    /**
     * Get all rooms for a specific hotel with pagination
     */
    @GetMapping("/rooms/{hotelId}/rooms")
    public ResponseEntity<Map<String, Object>> getRoomsByHotel(
            @PathVariable Long hotelId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "roomNumber") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {
        
        log.info("Fetching rooms for hotel ID: {}, page: {}, size: {}", hotelId, page, size);
        
        try {
            Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") 
                ? Sort.Direction.DESC 
                : Sort.Direction.ASC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
            
            Page<RoomResponseDto> roomPage = roomService.getRoomsByHotel(hotelId, pageable);
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", roomPage.getContent());
            response.put("totalElements", roomPage.getTotalElements());
            response.put("totalPages", roomPage.getTotalPages());
            response.put("size", roomPage.getSize());
            response.put("number", roomPage.getNumber());
            response.put("first", roomPage.isFirst());
            response.put("last", roomPage.isLast());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error fetching rooms for hotel ID: {}", hotelId, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch rooms");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get room details by ID
     */
    @GetMapping("/rooms/{id}")
    public ResponseEntity<?> getRoomById(@PathVariable Long id) {
        log.info("Fetching room details for ID: {}", id);
        
        try {
            RoomResponseDto room = roomService.getRoomById(id);
            return ResponseEntity.ok(room);
        } catch (Exception e) {
            log.error("Error fetching room details for ID: {}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch room details");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Create a new room for a hotel
     */
    @PostMapping("/rooms/{hotelId}/rooms")
    public ResponseEntity<?> createRoom(
            @PathVariable Long hotelId,
            @Valid @RequestBody RoomRequestDto requestDto) {
        
        log.info("Creating new room for hotel ID: {}", hotelId);
        
        try {
            RoomResponseDto createdRoom = roomService.createRoom(hotelId, requestDto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("room", createdRoom);
            response.put("message", "Room created successfully");
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            log.error("Error creating room for hotel ID: {}", hotelId, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create room");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Update an existing room
     */
    @PutMapping("/rooms/{id}")
    public ResponseEntity<?> updateRoom(
            @PathVariable Long id,
            @Valid @RequestBody RoomRequestDto requestDto) {
        
        log.info("Updating room with ID: {}", id);
        
        try {
            RoomResponseDto updatedRoom = roomService.updateRoom(id, requestDto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("room", updatedRoom);
            response.put("message", "Room updated successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error updating room with ID: {}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update room");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Delete a room
     */
    @DeleteMapping("/rooms/{id}")
    public ResponseEntity<?> deleteRoom(@PathVariable Long id) {
        log.info("Deleting room with ID: {}", id);
        
        try {
            roomService.deleteRoom(id);
            
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
    public ResponseEntity<?> toggleRoomAvailability(
            @PathVariable Long id,
            @RequestParam boolean isAvailable) {
        
        log.info("Toggling room availability for ID: {} to {}", id, isAvailable);
        
        try {
            RoomResponseDto updatedRoom = roomService.toggleRoomAvailability(id, isAvailable);
            
            Map<String, Object> response = new HashMap<>();
            response.put("room", updatedRoom);
            response.put("message", "Room availability updated successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error toggling room availability for ID: {}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update room availability");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Bulk update room availability
     */
    @PatchMapping("/rooms/bulk-availability")
    public ResponseEntity<?> bulkUpdateAvailability(
            @RequestBody Map<String, Object> request) {
        
        try {
            @SuppressWarnings("unchecked")
            List<Long> roomIds = (List<Long>) request.get("roomIds");
            Boolean isAvailable = (Boolean) request.get("isAvailable");
            
            if (roomIds == null || roomIds.isEmpty()) {
                throw new IllegalArgumentException("Room IDs list cannot be empty");
            }
            
            if (isAvailable == null) {
                throw new IllegalArgumentException("Availability status is required");
            }
            
            log.info("Bulk updating availability for {} rooms to {}", roomIds.size(), isAvailable);
            
            roomService.bulkUpdateAvailability(roomIds, isAvailable);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Room availability updated successfully for " + roomIds.size() + " rooms");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error in bulk update room availability", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to bulk update room availability");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get available rooms count for a hotel
     */
    @GetMapping("/rooms/{hotelId}/rooms/count")
    public ResponseEntity<?> getAvailableRoomsCount(@PathVariable Long hotelId) {
        log.info("Getting available rooms count for hotel ID: {}", hotelId);
        
        try {
            Long count = roomService.getAvailableRoomsCount(hotelId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("hotelId", hotelId);
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
}
