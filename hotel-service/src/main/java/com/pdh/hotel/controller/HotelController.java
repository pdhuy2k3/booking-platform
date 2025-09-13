package com.pdh.hotel.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.common.config.OpenApiResponses;
import com.pdh.hotel.dto.HotelBookingDetailsDto;
import com.pdh.hotel.dto.response.AmenityResponseDto;
import com.pdh.hotel.dto.response.RoomResponseDto;
import com.pdh.hotel.model.Hotel;
import com.pdh.hotel.repository.HotelRepository;
import com.pdh.hotel.repository.RoomRepository;
import com.pdh.hotel.service.AmenityService;
import com.pdh.hotel.service.HotelService;
import com.pdh.hotel.service.RoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.UUID;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Hotel Controller
 * 
 * Handles all hotel-related API endpoints including search, details, and reservations.
 * This controller provides both public APIs for storefront and internal APIs for booking integration.
 */
@RestController
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Hotels", description = "Hotel management and search operations")
@SecurityRequirement(name = "oauth2")
public class HotelController {

    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final HotelService hotelService;
    private final RoomService roomService;
    private final AmenityService amenityService;
    private final ObjectMapper objectMapper;
    

  
    /**
     * Health check endpoint
     */
    @Operation(
        summary = "Hotel service health check",
        description = "Returns the health status of the hotel service",
        tags = {"Monitoring"}
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Service is healthy",
            content = @Content(schema = @Schema(implementation = Map.class)))
    })
    @GetMapping("/backoffice/hotel/health")
    public ResponseEntity<Map<String, Object>> health() {
        log.info("Hotel service health check requested");
        
        Map<String, Object> healthStatus = Map.of(
            "status", "UP",
            "service", "hotel-service",
            "timestamp", LocalDateTime.now(),
            "message", "Hotel Service is running properly"
        );
        
        return ResponseEntity.ok(healthStatus);
    }

    // === STOREFRONT API ENDPOINTS ===

    /**
     * Search hotels for storefront
     * GET /hotels/storefront/search?destination=Ho Chi Minh City&checkInDate=2024-02-15&checkOutDate=2024-02-17&guests=2&rooms=1
     */
    @Operation(
        summary = "Search hotels",
        description = "Search for hotels based on destination, dates, and guest requirements. Returns paginated results with availability and pricing information.",
        tags = {"Public API", "Search"}
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Hotels found successfully",
            content = @Content(schema = @Schema(implementation = Map.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid search parameters")
    })
    @GetMapping("/storefront/search")
    public ResponseEntity<Map<String, Object>> searchHotels(
            @Parameter(description = "Destination city or location", required = true, example = "Ho Chi Minh City")
            @RequestParam String destination,
            @Parameter(description = "Check-in date in YYYY-MM-DD format", required = true, example = "2024-02-15")
            @RequestParam String checkInDate,
            @Parameter(description = "Check-out date in YYYY-MM-DD format", required = true, example = "2024-02-17")
            @RequestParam String checkOutDate,
            @Parameter(description = "Number of guests", example = "2")
            @RequestParam(defaultValue = "2") int guests,
            @Parameter(description = "Number of rooms", example = "1")
            @RequestParam(defaultValue = "1") int rooms,
            @Parameter(description = "Page number (1-based)", example = "1")
            @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "Number of results per page", example = "20")
            @RequestParam(defaultValue = "20") int limit) {

        log.info("Hotel search request: destination={}, checkIn={}, checkOut={}, guests={}, rooms={}",
                destination, checkInDate, checkOutDate, guests, rooms);

        try {
            // Parse dates
            LocalDate checkIn = LocalDate.parse(checkInDate);
            LocalDate checkOut = LocalDate.parse(checkOutDate);

            // Create pageable
            Pageable pageable = PageRequest.of(page - 1, limit);

            // Search hotels using repository
            Page<Hotel> hotelPage = hotelRepository.findHotelsByDestination(destination, pageable);

            // Convert to response format
            List<Map<String, Object>> hotels = hotelPage.getContent().stream()
                .map(hotel -> convertHotelToResponse(hotel, checkIn, checkOut, guests, rooms))
                .collect(Collectors.toList());

            Map<String, Object> response = Map.of(
                "hotels", hotels,
                "totalCount", hotelPage.getTotalElements(),
                "page", page,
                "limit", limit,
                "hasMore", hotelPage.hasNext(),
                "filters", Map.of(
                    "priceRange", Map.of("min", 500000, "max", 5000000),
                    "starRatings", List.of(3, 4, 5),
                    "amenities", List.of("WiFi", "Pool", "Spa", "Gym", "Restaurant", "Bar"),
                    "propertyTypes", List.of("Hotel", "Resort", "Apartment"),
                    "neighborhoods", List.of("District 1", "District 3", "District 7")
                )
            );

            log.info("Found {} hotels for search criteria", hotels.size());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error searching hotels", e);
            Map<String, Object> errorResponse = Map.of(
                "error", "Failed to search hotels",
                "message", e.getMessage(),
                "hotels", List.of(),
                "totalCount", 0,
                "page", page,
                "limit", limit,
                "hasMore", false
            );
            return ResponseEntity.ok(errorResponse);
        }
    }

    /**
     * Get hotel details by ID for storefront
     */
    @Operation(
        summary = "Get hotel details",
        description = "Retrieve detailed information about a specific hotel including rooms, amenities, and policies",
        tags = {"Public API"}
    )
    @OpenApiResponses.StandardApiResponsesWithNotFound
    @GetMapping("/storefront/{hotelId}")
    public ResponseEntity<Map<String, Object>> getStorefrontHotelDetails(
            @Parameter(description = "Hotel ID", required = true, example = "1")
            @PathVariable Long hotelId) {
        log.info("Hotel details request for ID: {}", hotelId);

        try {
            Optional<Hotel> hotelOpt = hotelRepository.findById(hotelId);
            if (hotelOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Hotel hotel = hotelOpt.get();
            Map<String, Object> response = convertHotelToDetailedResponse(hotel);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting hotel details", e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get hotel details for backoffice
     */
    @Operation(
        summary = "Get hotel details for backoffice",
        description = "Retrieve hotel information for administrative purposes",
        tags = {"Admin API"}
    )
    @SecurityRequirement(name = "oauth2", scopes = {"admin"})
    @OpenApiResponses.StandardApiResponsesWithNotFound
    @GetMapping("/backoffice/{hotelId}")
    public ResponseEntity<Long> getHotelDetails(
            @Parameter(description = "Hotel ID", required = true, example = "1")
            @PathVariable Long hotelId) {
        log.info("Getting hotel details for ID: {}", hotelId);

        return ResponseEntity.ok(hotelId);
    }

    // === BOOKING INTEGRATION ENDPOINTS ===
    
    /**
     * Reserve hotel for booking (called by Booking Service)
     * Enhanced to handle detailed product information
     */
    @Operation(
        summary = "Reserve hotel",
        description = "Create a hotel reservation as part of the booking process. Supports both detailed product information and legacy mode.",
        tags = {"Internal API", "Booking"}
    )
    @SecurityRequirement(name = "oauth2", scopes = {"admin", "internal"})
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Reservation created successfully",
            content = @Content(schema = @Schema(implementation = Map.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid reservation data"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Reservation failed")
    })
    @PostMapping("/reserve")
    public ResponseEntity<Map<String, Object>> reserveHotel(
            @Parameter(description = "Reservation request containing booking details", required = true)
            @RequestBody Map<String, Object> request) {
        log.info("Hotel reservation request: {}", request);

        try {
            String bookingId = (String) request.get("bookingId");
            String sagaId = (String) request.get("sagaId");
            String customerId = (String) request.get("customerId");

            // Check if detailed hotel information is provided
            Object hotelDetailsObj = request.get("hotelDetails");

            if (hotelDetailsObj != null) {
                // Handle detailed reservation with product information
                HotelBookingDetailsDto hotelDetails = objectMapper.convertValue(hotelDetailsObj, HotelBookingDetailsDto.class);

                // Call enhanced hotel service method
                hotelService.reserveHotel(UUID.fromString(bookingId), sagaId, hotelDetails);

                Map<String, Object> response = Map.of(
                    "status", "success",
                    "message", "Hotel reservation created with detailed product information",
                    "reservationId", "HTL-" + bookingId.substring(0, 8),
                    "bookingId", bookingId,
                    "sagaId", sagaId,
                    "hotelId", hotelDetails.getHotelId(),
                    "roomId", hotelDetails.getRoomId(),
                    "guests", hotelDetails.getGuests(),
                    "rooms", hotelDetails.getRooms()
                );

                log.info("Detailed hotel reservation response: {}", response);
                return ResponseEntity.ok(response);

            } else {
                // Legacy support - basic reservation without detailed product info
                hotelService.reserveHotel(UUID.fromString(bookingId));

                Map<String, Object> response = Map.of(
                    "status", "success",
                    "message", "Hotel reservation created (legacy mode)",
                    "reservationId", "HTL-" + bookingId,
                    "bookingId", bookingId,
                    "sagaId", sagaId
                );

                log.info("Legacy hotel reservation response: {}", response);
                return ResponseEntity.ok(response);
            }

        } catch (Exception e) {
            log.error("Error processing hotel reservation: {}", e.getMessage(), e);

            Map<String, Object> errorResponse = Map.of(
                "status", "error",
                "message", "Hotel reservation failed: " + e.getMessage(),
                "bookingId", request.get("bookingId"),
                "sagaId", request.get("sagaId")
            );

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Cancel hotel reservation (compensation)
     */
    @Operation(
        summary = "Cancel hotel reservation",
        description = "Cancel a hotel reservation as part of compensation logic in the booking saga",
        tags = {"Internal API", "Booking"}
    )
    @SecurityRequirement(name = "oauth2", scopes = {"admin", "internal"})
    @OpenApiResponses.StandardApiResponses
    @PostMapping("/cancel-reservation")
    public ResponseEntity<Map<String, Object>> cancelHotelReservation(@RequestBody Map<String, Object> request) {
        log.info("Hotel cancellation request: {}", request);
        
        String bookingId = (String) request.get("bookingId");
        String sagaId = (String) request.get("sagaId");
        String reason = (String) request.get("reason");
        
        // Mock implementation - in real scenario, this would:
        // 1. Find and cancel the reservation
        // 2. Free up the rooms
        // 3. Update reservation status
        
        Map<String, Object> response = Map.of(
            "status", "success",
            "message", "Hotel reservation cancelled",
            "bookingId", bookingId,
            "sagaId", sagaId,
            "reason", reason
        );
        
        log.info("Hotel cancellation response: {}", response);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Confirm hotel reservation (final step)
     */
    @Operation(
        summary = "Confirm hotel reservation",
        description = "Confirm a hotel reservation as the final step in the booking process",
        tags = {"Internal API", "Booking"}
    )
    @SecurityRequirement(name = "oauth2", scopes = {"admin", "internal"})
    @OpenApiResponses.StandardApiResponses
    @PostMapping("/confirm-reservation")
    public ResponseEntity<Map<String, Object>> confirmHotelReservation(@RequestBody Map<String, Object> request) {
        log.info("Hotel confirmation request: {}", request);
        
        String bookingId = (String) request.get("bookingId");
        String sagaId = (String) request.get("sagaId");
        String confirmationNumber = (String) request.get("confirmationNumber");
        
        // Mock implementation - in real scenario, this would:
        // 1. Convert temporary reservation to confirmed booking
        // 2. Generate vouchers
        // 3. Send confirmation to customer
        
        Map<String, Object> response = Map.of(
            "status", "success",
            "message", "Hotel reservation confirmed",
            "bookingId", bookingId,
            "sagaId", sagaId,
            "confirmationNumber", confirmationNumber,
            "voucherNumber", "VCH-" + bookingId
        );
        
        log.info("Hotel confirmation response: {}", response);
        return ResponseEntity.ok(response);
    }

    // === HELPER METHODS ===

    /**
     * Convert Hotel entity to response format for search results
     */
    private Map<String, Object> convertHotelToResponse(Hotel hotel, LocalDate checkIn, LocalDate checkOut, int guests, int rooms) {
        Map<String, Object> response = new HashMap<>();
        response.put("hotelId", hotel.getHotelId().toString()); // Convert to string for frontend compatibility
        response.put("name", hotel.getName() != null ? hotel.getName() : "Unknown Hotel");
        response.put("address", hotel.getAddress() != null ? hotel.getAddress() : "");
        response.put("city", hotel.getCity() != null ? hotel.getCity() : "");
        response.put("rating", hotel.getStarRating() != null ? hotel.getStarRating().intValue() : 3);
        response.put("pricePerNight", generateMockPrice()); // Mock price - in production, get from pricing service
        response.put("currency", "VND");
        response.put("availableRooms", getRealAvailableRooms(hotel)); // Get real rooms from service
        response.put("amenities", getRealHotelAmenities()); // Get real amenities from service
        response.put("images", List.of("/hotel-" + hotel.getHotelId() + ".jpg")); // Mock images
        return response;
    }

    /**
     * Convert Hotel entity to detailed response format
     */
    private Map<String, Object> convertHotelToDetailedResponse(Hotel hotel) {
        Map<String, Object> response = new HashMap<>();
        response.put("hotelId", hotel.getHotelId().toString());
        response.put("name", hotel.getName() != null ? hotel.getName() : "Unknown Hotel");
        response.put("address", hotel.getAddress() != null ? hotel.getAddress() : "");
        response.put("city", hotel.getCity() != null ? hotel.getCity() : "");
        response.put("rating", hotel.getStarRating() != null ? hotel.getStarRating().intValue() : 3);
        response.put("description", hotel.getDescription() != null ? hotel.getDescription() : "");
        response.put("pricePerNight", generateMockPrice());
        response.put("currency", "VND");
        response.put("availableRooms", getRealAvailableRooms(hotel)); // Get real rooms from service
        response.put("amenities", getRealHotelAmenities()); // Get real amenities from service
        response.put("images", List.of("/hotel-" + hotel.getHotelId() + ".jpg", "/hotel-" + hotel.getHotelId() + "-room.jpg"));
        response.put("checkInTime", "14:00");
        response.put("checkOutTime", "12:00");
        response.put("policies", Map.of(
            "cancellation", "Free cancellation up to 24 hours before check-in",
            "children", "Children are welcome",
            "pets", "Pets not allowed",
            "smoking", "Non-smoking property"
        ));
        return response;
    }

    /**
     * Generate mock price (in production, this would come from pricing service)
     */
    private long generateMockPrice() {
        // Generate random price between 500K and 5M VND
        return 500000L + (long)(Math.random() * 4500000L);
    }

    /**
     * Get real available rooms from room service
     */
    private List<Map<String, Object>> getRealAvailableRooms(Hotel hotel) {
        try {
            // Get rooms for this hotel using room service
            Page<RoomResponseDto> roomsPage = roomService.getRoomsByHotel(hotel.getHotelId(), PageRequest.of(0, 20));
            
            return roomsPage.getContent().stream()
                .map(room -> {
                    Map<String, Object> roomMap = new HashMap<>();
                    roomMap.put("roomId", room.getId());
                    roomMap.put("roomNumber", room.getRoomNumber());
                    roomMap.put("roomType", room.getRoomType() != null ? room.getRoomType().getName() : "Standard Room");
                    roomMap.put("capacity", room.getMaxOccupancy() != null ? room.getMaxOccupancy() : 2);
                    roomMap.put("pricePerNight", room.getPrice() != null ? room.getPrice().longValue() : generateMockPrice());
                    roomMap.put("amenities", room.getAmenities() != null ? 
                        room.getAmenities().stream().map(amenity -> amenity.getName()).collect(Collectors.toList()) : 
                        List.of("WiFi", "Air Conditioning", "TV"));
                    roomMap.put("available", room.getIsAvailable() != null ? room.getIsAvailable() : true);
                    return roomMap;
                })
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.warn("Failed to get real room data for hotel {}, falling back to fallback room data", hotel.getHotelId(), e);
            return createFallbackRooms(hotel);
        }
    }

    /**
     * Get real hotel amenities from amenity service
     */
    private List<String> getRealHotelAmenities() {
        try {
            // Get all active amenities
            List<AmenityResponseDto> amenities = amenityService.getActiveAmenities();
            
            return amenities.stream()
                .map(AmenityResponseDto::getName)
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.warn("Failed to get real amenity data, falling back to fallback amenities", e);
            return createFallbackAmenities();
        }
    }

    /**
     * Create fallback room data when real data is not available
     */
    private List<Map<String, Object>> createFallbackRooms(Hotel hotel) {
        return List.of(
            Map.of(
                "roomId", "room-" + hotel.getHotelId() + "-1",
                "roomType", "Standard Room",
                "capacity", 2,
                "pricePerNight", generateMockPrice(),
                "amenities", List.of("WiFi", "Air Conditioning", "TV"),
                "available", true
            ),
            Map.of(
                "roomId", "room-" + hotel.getHotelId() + "-2",
                "roomType", "Deluxe Room",
                "capacity", 3,
                "pricePerNight", generateMockPrice() + 500000L,
                "amenities", List.of("WiFi", "Air Conditioning", "TV", "Mini Bar"),
                "available", true
            )
        );
    }

    /**
     * Create fallback amenity data when real data is not available
     */
    private List<String> createFallbackAmenities() {
        return List.of("WiFi", "Pool", "Spa", "Gym", "Restaurant", "Bar", "Parking", "Room Service");
    }
}
