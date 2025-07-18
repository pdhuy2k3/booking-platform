package com.pdh.hotel.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.hotel.dto.HotelBookingDetailsDto;
import com.pdh.hotel.model.Hotel;
import com.pdh.hotel.model.Room;
import com.pdh.hotel.repository.HotelRepository;
import com.pdh.hotel.repository.RoomRepository;
import com.pdh.hotel.service.HotelService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
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
 * Xử lý các API requests liên quan đến khách sạn
 */
@RestController
@RequiredArgsConstructor
@Slf4j
public class HotelController {

    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final HotelService hotelService;
    private final ObjectMapper objectMapper;

    /**
     * Health check endpoint
     */
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
    @GetMapping("/storefront/search")
    public ResponseEntity<Map<String, Object>> searchHotels(
            @RequestParam String destination,
            @RequestParam String checkInDate,
            @RequestParam String checkOutDate,
            @RequestParam(defaultValue = "2") int guests,
            @RequestParam(defaultValue = "1") int rooms,
            @RequestParam(defaultValue = "1") int page,
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
    @GetMapping("/storefront/{hotelId}")
    public ResponseEntity<Map<String, Object>> getStorefrontHotelDetails(@PathVariable Long hotelId) {
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
     * Lấy thông tin chi tiết khách sạn
     */
    @GetMapping("/backoffice/{hotelId}")
    public ResponseEntity<Long> getHotelDetails(@PathVariable Long hotelId) {
        log.info("Getting hotel details for ID: {}", hotelId);

        return ResponseEntity.ok(hotelId);
    }

    // === BOOKING INTEGRATION ENDPOINTS ===
    
    /**
     * Reserve hotel for booking (called by Booking Service)
     * Enhanced to handle detailed product information
     */
    @PostMapping("/reserve")
    public ResponseEntity<Map<String, Object>> reserveHotel(@RequestBody Map<String, Object> request) {
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
        response.put("availableRooms", generateMockRooms(hotel)); // Mock rooms - in production, get from inventory
        response.put("amenities", generateMockAmenities()); // Mock amenities - in production, get from hotel amenities
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
        response.put("availableRooms", generateMockRooms(hotel));
        response.put("amenities", generateMockAmenities());
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
     * Generate mock available rooms (in production, this would come from inventory service)
     */
    private List<Map<String, Object>> generateMockRooms(Hotel hotel) {
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
     * Generate mock amenities (in production, this would come from hotel amenities)
     */
    private List<String> generateMockAmenities() {
        return List.of("WiFi", "Pool", "Spa", "Gym", "Restaurant", "Bar", "Parking", "Room Service");
    }
}
