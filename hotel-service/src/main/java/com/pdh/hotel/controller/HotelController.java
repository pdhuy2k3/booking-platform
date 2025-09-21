package com.pdh.hotel.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.common.config.OpenApiResponses;
import com.pdh.hotel.dto.HotelBookingDetailsDto;
import com.pdh.hotel.dto.response.RoomResponseDto;
import com.pdh.hotel.model.Hotel;
import com.pdh.hotel.repository.HotelRepository;
import com.pdh.hotel.repository.RoomRepository;
import com.pdh.hotel.service.AmenityService;
import com.pdh.hotel.service.HotelService;
import com.pdh.hotel.service.HotelSearchSpecificationService;
import com.pdh.hotel.service.ImageService;
import com.pdh.hotel.service.RoomService;
import com.pdh.hotel.service.RoomTypeService;
import com.pdh.hotel.mapper.HotelMapper;
import com.pdh.common.dto.SearchResponse;
import com.pdh.common.dto.DestinationSearchResult;
import com.pdh.common.dto.ErrorResponse;
import com.pdh.common.validation.SearchValidation;
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
import java.util.ArrayList;
import java.util.UUID;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import jakarta.persistence.EntityNotFoundException;

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
    private final HotelSearchSpecificationService hotelSearchSpecificationService;
    private final RoomService roomService;
    private final RoomTypeService roomTypeService;
    private final AmenityService amenityService;
    private final ObjectMapper objectMapper;
    private final ImageService imageService;
    private final HotelMapper hotelMapper;
    

  
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

    @Operation(
        summary = "Get room details",
        description = "Retrieve detailed information about a specific room by ID",
        tags = {"Public API", "Details"}
    )
    @OpenApiResponses.StandardApiResponsesWithNotFound
    @GetMapping("/storefront/rooms/{roomId}")
    public ResponseEntity<RoomResponseDto> getRoomDetails(
            @Parameter(description = "Room ID", required = true, example = "101")
            @PathVariable Long roomId) {
        log.info("Room details request for ID: {}", roomId);
        try {
            RoomResponseDto room = roomService.getRoomById(roomId);
            return ResponseEntity.ok(room);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error retrieving room details", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
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
            @Parameter(description = "Destination city or location", example = "Ho Chi Minh City")
            @RequestParam(required = false) String destination,
            @Parameter(description = "Check-in date in YYYY-MM-DD format", example = "2024-02-15")
            @RequestParam(required = false) String checkInDate,
            @Parameter(description = "Check-out date in YYYY-MM-DD format", example = "2024-02-17")
            @RequestParam(required = false) String checkOutDate,
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
            // Validate destination parameter if provided
            if (destination != null && !destination.trim().isEmpty()) {
                SearchValidation.ValidationResult destinationValidation = SearchValidation.validateSearchQuery(destination);
                if (!destinationValidation.isValid()) {
                    log.warn("Invalid destination parameter: {}", destinationValidation.getErrorMessage());
                    return ResponseEntity.badRequest().body(Map.of(
                        "error", "VALIDATION_ERROR",
                        "message", "Invalid destination: " + destinationValidation.getErrorMessage(),
                        "hotels", List.of(),
                        "totalCount", 0
                    ));
                }
            }
            
            // Sanitize destination
            String sanitizedDestination = SearchValidation.sanitizeSearchQuery(destination);
            
            // Check if this is a search request or initial data request
            boolean isSearchRequest = sanitizedDestination != null && !sanitizedDestination.trim().isEmpty() && 
                                    checkInDate != null && !checkInDate.trim().isEmpty() && 
                                    checkOutDate != null && !checkOutDate.trim().isEmpty();

            if (!isSearchRequest) {
                // Return initial data - all hotels without search filters
                log.info("Returning initial hotel data without search filters");
                
                // Create pageable for hotels
                Pageable pageable = PageRequest.of(page - 1, limit);
                
                // Get all hotels (without search filters) for initial display
                Page<Hotel> hotelPage = hotelRepository.findAll(pageable);
                
                // Convert hotels to response format using mapper
                List<Map<String, Object>> hotels = hotelPage.getContent().stream()
                    .map(hotel -> hotelMapper.toStorefrontSearchResponse(hotel, LocalDate.now(), LocalDate.now().plusDays(1), 2, 1))
                    .collect(Collectors.toList());
                Map<String, Object> response = Map.of(
                    "hotels", hotels,
                    "totalCount", hotelPage.getTotalElements(),
                    "page", page,
                    "limit", limit,
                    "hasMore", hotelPage.hasNext()
                );
                
                return ResponseEntity.ok(response);
            }

            // Parse dates for search request
            LocalDate checkIn = LocalDate.parse(checkInDate);
            LocalDate checkOut = LocalDate.parse(checkOutDate);

            // Create pageable
            Pageable pageable = PageRequest.of(page - 1, limit);

            // Search hotels using JPA Specifications
            HotelSearchSpecificationService.HotelSearchCriteria criteria = new HotelSearchSpecificationService.HotelSearchCriteria();
            criteria.setDestination(sanitizedDestination);
            
            Page<Hotel> hotelPage = hotelSearchSpecificationService.searchHotels(criteria, pageable);

            // Convert to response format using mapper
            List<Map<String, Object>> hotels = hotelPage.getContent().stream()
                .map(hotel -> hotelMapper.toStorefrontSearchResponse(hotel, checkIn, checkOut, guests, rooms))
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
            Map<String, Object> response = hotelMapper.toStorefrontDetailedResponse(hotel);

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

    // === PUBLIC ENDPOINTS ===


    /**
     * Get popular origins for hotel search
     */
    @GetMapping("/storefront/origins")
    public ResponseEntity<Map<String, Object>> getPopularOrigins() {
        return ResponseEntity.ok(Map.of(
            "origins", List.of(
                Map.of(
                    "name", "Ho Chi Minh City",
                    "code", "SGN",
                    "type", "Thành phố",
                    "country", "Vietnam"
                ),
                Map.of(
                    "name", "Hanoi",
                    "code", "HAN",
                    "type", "Thành phố",
                    "country", "Vietnam"
                ),
                Map.of(
                    "name", "Da Nang",
                    "code", "DAD",
                    "type", "Thành phố",
                    "country", "Vietnam"
                ),
                Map.of(
                    "name", "Nha Trang",
                    "code", "CXR",
                    "type", "Thành phố",
                    "country", "Vietnam"
                ),
                Map.of(
                    "name", "Phu Quoc",
                    "code", "PQC",
                    "type", "Đảo",
                    "country", "Vietnam"
                )
            )
        ));
    }
    
    /**
     * Search hotel destinations
     * GET /hotels/storefront/destinations/search?q=hanoi
     */
    @GetMapping("/storefront/destinations/search")
    @Operation(summary = "Search hotel destinations", description = "Search for hotel destinations by city, district, or hotel name")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "Search results returned successfully",
            content = @Content(schema = @Schema(implementation = Map.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400", 
            description = "Invalid search query",
            content = @Content
        )
    })
    public ResponseEntity<SearchResponse<DestinationSearchResult>> searchDestinations(
            @Parameter(description = "Search query (city or hotel name)", example = "hanoi")
            @RequestParam(required = false) String q) {
        
        log.info("Hotel destination search request: q={}", q);
        
        try {
            // Validate input
            SearchValidation.ValidationResult validation = SearchValidation.validateSearchQuery(q);
            if (!validation.isValid()) {
                log.warn("Invalid search query: {}", validation.getErrorMessage());
                SearchResponse<DestinationSearchResult> errorResponse = SearchResponse.<DestinationSearchResult>builder()
                    .results(List.of())
                    .totalCount(0L)
                    .query(q != null ? q : "")
                    .metadata(Map.of("error", ErrorResponse.of("VALIDATION_ERROR", validation.getErrorMessage(), null, "/hotels/storefront/destinations/search")))
                    .build();
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            // Sanitize input
            String sanitizedQuery = SearchValidation.sanitizeSearchQuery(q);
            
            long startTime = System.currentTimeMillis();
            final List<DestinationSearchResult> destinations;
            
            if (sanitizedQuery != null && !sanitizedQuery.trim().isEmpty()) {
                String query = sanitizedQuery.trim();
                List<DestinationSearchResult> tempDestinations = new ArrayList<>();
                
                // Search in cities
                List<String> cities = hotelRepository.findDistinctCities();
                cities.stream()
                    .filter(city -> city.toLowerCase().contains(query.toLowerCase()))
                    .forEach(city -> tempDestinations.add(DestinationSearchResult.city(
                        city, "Vietnam", null
                    )));
                
                // Remove duplicates and limit results
                destinations = tempDestinations.stream()
                    .distinct()
                    .limit(20)
                    .collect(Collectors.toList());
            } else {
                // Return popular destinations when no query
                destinations = List.of(
                    DestinationSearchResult.city("Ho Chi Minh City", "Vietnam", null),
                    DestinationSearchResult.city("Hanoi", "Vietnam", null),
                    DestinationSearchResult.city("Da Nang", "Vietnam", null),
                    DestinationSearchResult.city("Nha Trang", "Vietnam", null),
                    DestinationSearchResult.builder()
                        .name("Phu Quoc")
                        .type("Đảo")
                        .country("Vietnam")
                        .category("island")
                        .relevanceScore(1.0)
                        .build(),
                    DestinationSearchResult.city("Da Lat", "Vietnam", null),
                    DestinationSearchResult.city("Hue", "Vietnam", null),
                    DestinationSearchResult.city("Hoi An", "Vietnam", null)
                );
            }
            
            long executionTime = System.currentTimeMillis() - startTime;
            
            SearchResponse<DestinationSearchResult> response = SearchResponse.<DestinationSearchResult>builder()
                .results(destinations)
                .totalCount((long) destinations.size())
                .query(q != null ? q : "")
                .executionTimeMs(executionTime)
                .metadata(Map.of("category", "hotel_destinations"))
                .build();
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error searching hotel destinations", e);
            SearchResponse<DestinationSearchResult> errorResponse = SearchResponse.<DestinationSearchResult>builder()
                .results(List.of())
                .totalCount(0L)
                .query(q != null ? q : "")
                .metadata(Map.of("error", ErrorResponse.of("SEARCH_ERROR", "Hotel destination search failed", e.getMessage(), "/hotels/storefront/destinations/search")))
                .build();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get popular hotel destinations
     * GET /hotels/storefront/destinations/popular
     */
    @GetMapping("/storefront/destinations/popular")
    @Operation(summary = "Get popular hotel destinations", description = "Get list of popular hotel destinations")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "Popular destinations returned successfully",
            content = @Content(schema = @Schema(implementation = Map.class))
        )
    })
    public ResponseEntity<SearchResponse<DestinationSearchResult>> getPopularDestinations() {
        log.info("Popular hotel destinations request");
        
        try {
            long startTime = System.currentTimeMillis();
            
            List<DestinationSearchResult> destinations = List.of(
                DestinationSearchResult.city("Ho Chi Minh City", "Vietnam", null).toBuilder()
                    .description("Thành phố lớn nhất Việt Nam")
                    .build(),
                DestinationSearchResult.city("Hanoi", "Vietnam", null).toBuilder()
                    .description("Thủ đô của Việt Nam")
                    .build(),
                DestinationSearchResult.city("Da Nang", "Vietnam", null).toBuilder()
                    .description("Thành phố biển miền Trung")
                    .build(),
                DestinationSearchResult.city("Nha Trang", "Vietnam", null).toBuilder()
                    .description("Thành phố biển nổi tiếng")
                    .build(),
                DestinationSearchResult.builder()
                    .name("Phu Quoc")
                    .type("Đảo")
                    .country("Vietnam")
                    .category("island")
                    .description("Đảo ngọc Việt Nam")
                    .relevanceScore(1.0)
                    .build(),
                DestinationSearchResult.city("Da Lat", "Vietnam", null).toBuilder()
                    .description("Thành phố ngàn hoa")
                    .build(),
                DestinationSearchResult.city("Hue", "Vietnam", null).toBuilder()
                    .description("Cố đô Huế")
                    .build(),
                DestinationSearchResult.city("Hoi An", "Vietnam", null).toBuilder()
                    .description("Phố cổ Hội An")
                    .build()
            );
            
            long executionTime = System.currentTimeMillis() - startTime;
            
            SearchResponse<DestinationSearchResult> response = SearchResponse.<DestinationSearchResult>builder()
                .results(destinations)
                .totalCount((long) destinations.size())
                .query("popular")
                .executionTimeMs(executionTime)
                .metadata(Map.of("category", "popular_hotel_destinations"))
                .build();
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error getting popular hotel destinations", e);
            SearchResponse<DestinationSearchResult> errorResponse = SearchResponse.<DestinationSearchResult>builder()
                .results(List.of())
                .totalCount(0L)
                .query("popular")
                .metadata(Map.of("error", ErrorResponse.of("POPULAR_DESTINATIONS_ERROR", "Failed to get popular hotel destinations", e.getMessage(), "/hotels/storefront/destinations/popular")))
                .build();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
