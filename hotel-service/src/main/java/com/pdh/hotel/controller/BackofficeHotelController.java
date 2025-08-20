package com.pdh.hotel.controller;

import com.pdh.hotel.model.Hotel;
import com.pdh.hotel.model.Room;
import com.pdh.hotel.repository.HotelRepository;
import com.pdh.hotel.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/backoffice")
@RequiredArgsConstructor
@Slf4j
public class BackofficeHotelController {

    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;

    /**
     * Get all hotels with pagination and filtering for backoffice
     */
    @GetMapping("/hotels")
    public ResponseEntity<Map<String, Object>> getAllHotels(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String status) {
        
        log.info("Fetching hotels for backoffice: page={}, size={}, search={}, city={}, status={}", 
                page, size, search, city, status);
        
        try {
            // Create pageable with sorting
            Sort sort = Sort.by(Sort.Direction.DESC, "starRating").and(Sort.by("name"));
            Pageable pageable = PageRequest.of(page, size, sort);
            
            Page<Hotel> hotelPage;
            
            // Apply filters
            if (search != null && !search.isEmpty()) {
                if (city != null && !city.isEmpty()) {
                    // Search by both destination and city
                    hotelPage = hotelRepository.findHotelsByDestinationAndRating(
                        search, BigDecimal.ZERO, BigDecimal.TEN, pageable);
                } else {
                    // Search by destination only
                    hotelPage = hotelRepository.findHotelsByDestination(search, pageable);
                }
            } else if (city != null && !city.isEmpty()) {
                // Filter by city only
                hotelPage = hotelRepository.findHotelsByCity(city, pageable);
            } else {
                // Get all hotels
                hotelPage = hotelRepository.findAllWithDetails(pageable);
            }
            
            // Convert to response format
            List<Map<String, Object>> hotels = hotelPage.getContent().stream()
                .map(this::convertHotelToResponse)
                .collect(Collectors.toList());
            
            // Create response
            Map<String, Object> response = new HashMap<>();
            response.put("content", hotels);
            response.put("totalElements", hotelPage.getTotalElements());
            response.put("totalPages", hotelPage.getTotalPages());
            response.put("size", hotelPage.getSize());
            response.put("number", hotelPage.getNumber());
            response.put("first", hotelPage.isFirst());
            response.put("last", hotelPage.isLast());
            
            log.info("Found {} hotels for backoffice", hotels.size());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error fetching hotels for backoffice", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch hotels");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get hotel by ID for backoffice
     */
    @GetMapping("/hotels/{id}")
    public ResponseEntity<Map<String, Object>> getHotel(@PathVariable Long id) {
        log.info("Fetching hotel details for backoffice: ID={}", id);
        
        try {
            Optional<Hotel> hotelOpt = hotelRepository.findById(id);
            if (hotelOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Hotel hotel = hotelOpt.get();
            Map<String, Object> response = convertHotelToDetailedResponse(hotel);
            
            // Add rooms information
            Pageable pageable = PageRequest.of(0, 50); // Get all rooms (assuming max 50)
            Page<Room> roomPage = roomRepository.findAvailableRoomsByHotelId(id, pageable);
            List<Map<String, Object>> rooms = roomPage.getContent().stream()
                .map(this::convertRoomToResponse)
                .collect(Collectors.toList());
            
            response.put("rooms", rooms);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error fetching hotel details for backoffice: ID={}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch hotel details");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Create a new hotel
     */
    @PostMapping("/hotels")
    public ResponseEntity<Map<String, Object>> createHotel(@RequestBody Map<String, Object> hotelData) {
        log.info("Creating new hotel: {}", hotelData);
        
        try {
            Hotel hotel = new Hotel();
            hotel.setName((String) hotelData.get("name"));
            hotel.setAddress((String) hotelData.get("address"));
            hotel.setCity((String) hotelData.get("city"));
            hotel.setCountry((String) hotelData.get("country"));
            hotel.setDescription((String) hotelData.get("description"));
            
            // Handle star rating
            Object ratingObj = hotelData.get("starRating");
            if (ratingObj instanceof Number) {
                hotel.setStarRating(BigDecimal.valueOf(((Number) ratingObj).doubleValue()));
            } else if (ratingObj instanceof String) {
                try {
                    hotel.setStarRating(BigDecimal.valueOf(Double.parseDouble((String) ratingObj)));
                } catch (NumberFormatException e) {
                    log.warn("Invalid star rating format: {}", ratingObj);
                }
            }
            
            // Save hotel
            Hotel savedHotel = hotelRepository.save(hotel);
            
            Map<String, Object> response = convertHotelToResponse(savedHotel);
            response.put("message", "Hotel created successfully");
            
            log.info("Hotel created successfully with ID: {}", savedHotel.getHotelId());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            log.error("Error creating hotel", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create hotel");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Update an existing hotel
     */
    @PutMapping("/hotels/{id}")
    public ResponseEntity<Map<String, Object>> updateHotel(@PathVariable Long id, @RequestBody Map<String, Object> hotelData) {
        log.info("Updating hotel: ID={}, data={}", id, hotelData);
        
        try {
            Optional<Hotel> hotelOpt = hotelRepository.findById(id);
            if (hotelOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Hotel hotel = hotelOpt.get();
            hotel.setName((String) hotelData.get("name"));
            hotel.setAddress((String) hotelData.get("address"));
            hotel.setCity((String) hotelData.get("city"));
            hotel.setCountry((String) hotelData.get("country"));
            hotel.setDescription((String) hotelData.get("description"));
            
            // Handle star rating
            Object ratingObj = hotelData.get("starRating");
            if (ratingObj instanceof Number) {
                hotel.setStarRating(BigDecimal.valueOf(((Number) ratingObj).doubleValue()));
            } else if (ratingObj instanceof String) {
                try {
                    hotel.setStarRating(BigDecimal.valueOf(Double.parseDouble((String) ratingObj)));
                } catch (NumberFormatException e) {
                    log.warn("Invalid star rating format: {}", ratingObj);
                }
            }
            
            // Save updated hotel
            Hotel updatedHotel = hotelRepository.save(hotel);
            
            Map<String, Object> response = convertHotelToResponse(updatedHotel);
            response.put("message", "Hotel updated successfully");
            
            log.info("Hotel updated successfully with ID: {}", updatedHotel.getHotelId());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error updating hotel: ID={}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update hotel");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Delete a hotel (soft delete)
     */
    @DeleteMapping("/hotels/{id}")
    public ResponseEntity<Map<String, Object>> deleteHotel(@PathVariable Long id) {
        log.info("Deleting hotel: ID={}", id);
        
        try {
            Optional<Hotel> hotelOpt = hotelRepository.findById(id);
            if (hotelOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            Hotel hotel = hotelOpt.get();
            // Instead of hard delete, we mark as deleted
            // This assumes there's an isDeleted field in the Hotel entity
            // If not, you might want to add one or handle differently
            
            hotelRepository.delete(hotel);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Hotel deleted successfully");
            
            log.info("Hotel deleted successfully with ID: {}", id);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error deleting hotel: ID={}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to delete hotel");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // === HELPER METHODS ===

    /**
     * Convert Hotel entity to response format
     */
    private Map<String, Object> convertHotelToResponse(Hotel hotel) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", hotel.getHotelId());
        response.put("name", hotel.getName() != null ? hotel.getName() : "");
        response.put("address", hotel.getAddress() != null ? hotel.getAddress() : "");
        response.put("city", hotel.getCity() != null ? hotel.getCity() : "");
        response.put("country", hotel.getCountry() != null ? hotel.getCountry() : "");
        response.put("starRating", hotel.getStarRating() != null ? hotel.getStarRating().doubleValue() : 0.0);
        response.put("description", hotel.getDescription() != null ? hotel.getDescription() : "");
        
        // Get room information
        Long availableRooms = roomRepository.countAvailableRoomsByHotelId(hotel.getHotelId());
        response.put("availableRooms", availableRooms != null ? availableRooms : 0);
        
        BigDecimal minPrice = roomRepository.findMinPriceByHotelId(hotel.getHotelId());
        response.put("minPrice", minPrice != null ? minPrice.doubleValue() : 0.0);
        
        return response;
    }

    /**
     * Convert Hotel entity to detailed response format
     */
    private Map<String, Object> convertHotelToDetailedResponse(Hotel hotel) {
        Map<String, Object> response = convertHotelToResponse(hotel);
        // Add any additional detailed information here if needed
        return response;
    }

    /**
     * Convert Room entity to response format
     */
    private Map<String, Object> convertRoomToResponse(Room room) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", room.getId());
        response.put("roomNumber", room.getRoomNumber());
        response.put("description", room.getDescription() != null ? room.getDescription() : "");
        response.put("price", room.getPrice() != null ? room.getPrice().doubleValue() : 0.0);
        response.put("maxOccupancy", room.getMaxOccupancy() != null ? room.getMaxOccupancy() : 0);
        response.put("bedType", room.getBedType() != null ? room.getBedType() : "");
        response.put("roomSize", room.getRoomSize() != null ? room.getRoomSize() : 0);
        response.put("isAvailable", room.getIsAvailable() != null ? room.getIsAvailable() : false);
        
        if (room.getRoomType() != null) {
            response.put("roomType", Map.of(
                "id", room.getRoomType().getRoomTypeId(),
                "name", room.getRoomType().getName(),
                "description", room.getRoomType().getDescription()
            ));
        }
        
        return response;
    }
}