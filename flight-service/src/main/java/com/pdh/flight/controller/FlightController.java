package com.pdh.flight.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.common.config.OpenApiResponses;
import com.pdh.flight.dto.FlightBookingDetailsDto;
import com.pdh.flight.dto.response.FlightSearchResultDto;
import com.pdh.flight.model.Flight;
import com.pdh.flight.model.Airport;
import com.pdh.flight.model.Airline;
import com.pdh.flight.model.enums.FareClass;
import com.pdh.flight.repository.FlightRepository;
import com.pdh.flight.repository.AirportRepository;
import com.pdh.flight.repository.AirlineRepository;
import com.pdh.flight.service.FlightService;
import com.pdh.flight.service.FlightSearchService;
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
 * Flight Controller
 * 
 * Handles all flight-related API endpoints including search, details, and reservations.
 * This controller provides both public APIs for storefront and internal APIs for booking integration.
 */
@RestController
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Flights", description = "Flight search and booking operations")
@SecurityRequirement(name = "oauth2")
public class FlightController {

    private final FlightRepository flightRepository;
    private final AirportRepository airportRepository;
    private final AirlineRepository airlineRepository;
    private final FlightService flightService;
    private final FlightSearchService flightSearchService;
    private final ObjectMapper objectMapper;


    // === STOREFRONT API ENDPOINTS ===

    /**
     * Search flights for storefront
     * GET /flights/storefront/search?origin=HAN&destination=SGN&departureDate=2024-02-15&passengers=1&seatClass=ECONOMY
     */
    @Operation(
        summary = "Search flights",
        description = "Search for flights based on origin, destination, date, and passenger requirements. Returns paginated results with availability and pricing information.",
        tags = {"Public API", "Search"}
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Flights found successfully",
            content = @Content(schema = @Schema(implementation = Map.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid search parameters")
    })
    @GetMapping("/storefront/search")
    public ResponseEntity<Map<String, Object>> searchFlights(
            @Parameter(description = "Origin airport IATA code", required = true, example = "HAN")
            @RequestParam String origin,
            @Parameter(description = "Destination airport IATA code", required = true, example = "SGN")
            @RequestParam String destination,
            @Parameter(description = "Departure date in YYYY-MM-DD format", required = true, example = "2024-02-15")
            @RequestParam String departureDate,
            @Parameter(description = "Return date in YYYY-MM-DD format (for round-trip)", example = "2024-02-20")
            @RequestParam(required = false) String returnDate,
            @Parameter(description = "Number of passengers", example = "1")
            @RequestParam(defaultValue = "1") int passengers,
            @Parameter(description = "Seat class", example = "ECONOMY")
            @RequestParam(defaultValue = "ECONOMY") String seatClass,
            @Parameter(description = "Page number (1-based)", example = "1")
            @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "Number of results per page", example = "20")
            @RequestParam(defaultValue = "20") int limit) {

        log.info("Flight search request: origin={}, destination={}, departureDate={}, passengers={}, seatClass={}",
                origin, destination, departureDate, passengers, seatClass);

        try {
            // Parse date
            LocalDate depDate = LocalDate.parse(departureDate);

            // Parse fare class
            FareClass fareClass = FareClass.valueOf(seatClass);

            // Create pageable
            Pageable pageable = PageRequest.of(page - 1, limit);

            // Search flights using the new service with integrated pricing
            Page<FlightSearchResultDto> flightPage = flightSearchService.searchFlights(
                    origin, destination, depDate, 
                    returnDate != null ? LocalDate.parse(returnDate) : null,
                    passengers, fareClass, pageable);

            // Convert to response format
            List<Map<String, Object>> flights = flightPage.getContent().stream()
                .map(this::convertSearchResultToResponse)
                .collect(Collectors.toList());

            Map<String, Object> response = Map.of(
                "flights", flights,
                "totalCount", flightPage.getTotalElements(),
                "page", page,
                "limit", limit,
                "hasMore", flightPage.hasNext(),
                "filters", Map.of(
                    "priceRange", Map.of("min", 1500000, "max", 5000000),
                    "airlines", List.of("Vietnam Airlines", "VietJet Air", "Bamboo Airways"),
                    "airports", Map.of(
                        "origins", List.of(Map.of("code", origin, "name", getAirportName(origin), "city", getAirportCity(origin))),
                        "destinations", List.of(Map.of("code", destination, "name", getAirportName(destination), "city", getAirportCity(destination)))
                    )
                )
            );

            log.info("Found {} flights for search criteria", flights.size());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error searching flights", e);
            Map<String, Object> errorResponse = Map.of(
                "error", "Failed to search flights",
                "message", e.getMessage(),
                "flights", List.of(),
                "totalCount", 0,
                "page", page,
                "limit", limit,
                "hasMore", false
            );
            return ResponseEntity.ok(errorResponse);
        }
    }

    /**
     * Get flight details by ID for storefront
     */
    @Operation(
        summary = "Get flight details",
        description = "Retrieve detailed information about a specific flight including schedule, pricing, and availability",
        tags = {"Public API"}
    )
    @OpenApiResponses.StandardApiResponsesWithNotFound
    @GetMapping("/storefront/{flightId}")
    public ResponseEntity<Map<String, Object>> getStorefrontFlightDetails(
            @Parameter(description = "Flight ID", required = true, example = "1")
            @PathVariable Long flightId) {
        log.info("Flight details request for ID: {}", flightId);

        try {
            Optional<Flight> flightOpt = flightRepository.findById(flightId);
            if (flightOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Flight flight = flightOpt.get();
            Map<String, Object> response = convertFlightToResponse(flight);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting flight details", e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get popular destinations for storefront
     */
    @Operation(
        summary = "Get popular destinations",
        description = "Retrieve a list of popular flight destinations with average pricing information",
        tags = {"Public API"}
    )
    @OpenApiResponses.StandardApiResponses
    @GetMapping("/storefront/popular-destinations")
    public ResponseEntity<List<Map<String, Object>>> getPopularDestinations(
            @Parameter(description = "Origin airport code to filter destinations", example = "HAN")
            @RequestParam(required = false) String origin) {

        log.info("Popular destinations request with origin: {}", origin);

        try {
            // For now, return static popular destinations
            // In production, this would be based on booking statistics
            List<Map<String, Object>> destinations = List.of(
                Map.of(
                    "code", "SGN",
                    "name", "Tan Son Nhat International Airport",
                    "city", "Ho Chi Minh City",
                    "country", "Vietnam",
                    "image", "/destinations/hcmc.jpg",
                    "averagePrice", 2200000,
                    "currency", "VND"
                ),
                Map.of(
                    "code", "DAD",
                    "name", "Da Nang International Airport",
                    "city", "Da Nang",
                    "country", "Vietnam",
                    "image", "/destinations/danang.jpg",
                    "averagePrice", 1800000,
                    "currency", "VND"
                ),
                Map.of(
                    "code", "HAN",
                    "name", "Noi Bai International Airport",
                    "city", "Hanoi",
                    "country", "Vietnam",
                    "image", "/destinations/hanoi.jpg",
                    "averagePrice", 2500000,
                    "currency", "VND"
                )
            );

            return ResponseEntity.ok(destinations);
        } catch (Exception e) {
            log.error("Error getting popular destinations", e);
            return ResponseEntity.ok(List.of());
        }
    }

    /**
     * Get flight details for backoffice
     */
    @Operation(
        summary = "Get flight details for backoffice",
        description = "Retrieve flight information for administrative purposes",
        tags = {"Admin API"}
    )
    @SecurityRequirement(name = "oauth2", scopes = {"admin"})
    @OpenApiResponses.StandardApiResponsesWithNotFound
    @GetMapping("/backoffice/flight/{flightId}")
    public ResponseEntity<Long> getFlightDetails(
            @Parameter(description = "Flight ID", required = true, example = "1")
            @PathVariable Long flightId) {
        log.info("Getting flight details for ID: {}", flightId);
        
        return ResponseEntity.ok(flightId);
    }

    // === BOOKING INTEGRATION ENDPOINTS ===
    
    /**
     * Reserve flight for booking (called by Booking Service)
     * Enhanced to handle detailed product information
     */
    @Operation(
        summary = "Reserve flight",
        description = "Create a flight reservation as part of the booking process. Supports both detailed product information and legacy mode.",
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
    public ResponseEntity<Map<String, Object>> reserveFlight(
            @Parameter(description = "Reservation request containing booking details", required = true)
            @RequestBody Map<String, Object> request) {
        log.info("Flight reservation request: {}", request);

        try {
            String bookingId = (String) request.get("bookingId");
            String sagaId = (String) request.get("sagaId");
            String customerId = (String) request.get("customerId");

            // Check if detailed flight information is provided
            Object flightDetailsObj = request.get("flightDetails");

            if (flightDetailsObj != null) {
                // Handle detailed reservation with product information
                FlightBookingDetailsDto flightDetails = objectMapper.convertValue(flightDetailsObj, FlightBookingDetailsDto.class);

                // Call enhanced flight service method
                flightService.reserveFlight(UUID.fromString(bookingId), sagaId, flightDetails);

                Map<String, Object> response = Map.of(
                    "status", "success",
                    "message", "Flight reservation created with detailed product information",
                    "reservationId", "FLT-" + bookingId.substring(0, 8),
                    "bookingId", bookingId,
                    "sagaId", sagaId,
                    "flightId", flightDetails.getFlightId(),
                    "passengers", flightDetails.getPassengerCount(),
                    "seatClass", flightDetails.getSeatClass()
                );

                log.info("Detailed flight reservation response: {}", response);
                return ResponseEntity.ok(response);

            } else {
                // Legacy support - basic reservation without detailed product info
                flightService.reserveFlight(UUID.fromString(bookingId));

                Map<String, Object> response = Map.of(
                    "status", "success",
                    "message", "Flight reservation created (legacy mode)",
                    "reservationId", "FLT-" + bookingId,
                    "bookingId", bookingId,
                    "sagaId", sagaId
                );

                log.info("Legacy flight reservation response: {}", response);
                return ResponseEntity.ok(response);
            }

        } catch (Exception e) {
            log.error("Error processing flight reservation: {}", e.getMessage(), e);

            Map<String, Object> errorResponse = Map.of(
                "status", "error",
                "message", "Flight reservation failed: " + e.getMessage(),
                "bookingId", request.get("bookingId"),
                "sagaId", request.get("sagaId")
            );

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Cancel flight reservation (compensation)
     */
    @Operation(
        summary = "Cancel flight reservation",
        description = "Cancel a flight reservation as part of compensation logic in the booking saga",
        tags = {"Internal API", "Booking"}
    )
    @SecurityRequirement(name = "oauth2", scopes = {"admin", "internal"})
    @OpenApiResponses.StandardApiResponses
    @PostMapping("/cancel-reservation")
    public ResponseEntity<Map<String, Object>> cancelFlightReservation(@RequestBody Map<String, Object> request) {
        log.info("Flight cancellation request: {}", request);
        
        String bookingId = (String) request.get("bookingId");
        String sagaId = (String) request.get("sagaId");
        String reason = (String) request.get("reason");
        
        // TODO
        // 1. Find and cancel the reservation
        // 2. Free up the seats
        // 3. Update reservation status
        

        return ResponseEntity.ok(Map.of());
    }
    
    /**
     * Confirm flight reservation (final step)
     */
    @Operation(
        summary = "Confirm flight reservation",
        description = "Confirm a flight reservation as the final step in the booking process",
        tags = {"Internal API", "Booking"}
    )
    @SecurityRequirement(name = "oauth2", scopes = {"admin", "internal"})
    @OpenApiResponses.StandardApiResponses
    @PostMapping("/confirm-reservation")
    public ResponseEntity<Map<String, Object>> confirmFlightReservation(@RequestBody Map<String, Object> request) {
        log.info("Flight confirmation request: {}", request);
        
        String bookingId = (String) request.get("bookingId");
        String sagaId = (String) request.get("sagaId");
        String confirmationNumber = (String) request.get("confirmationNumber");
        
        // Mock implementation - in real scenario, this would:
        // 1. Convert temporary reservation to confirmed booking
        // 2. Generate tickets
        // 3. Send confirmation to customer
        

        return ResponseEntity.ok(Map.of());
    }

    // === HELPER METHODS ===

    /**
     * Convert FlightSearchResultDto to response format
     */
    private Map<String, Object> convertSearchResultToResponse(FlightSearchResultDto result) {
        Map<String, Object> response = new HashMap<>();
        response.put("flightId", result.getFlightId());
        response.put("airline", result.getAirline());
        response.put("flightNumber", result.getFlightNumber());
        response.put("origin", result.getOrigin());
        response.put("destination", result.getDestination());
        response.put("departureTime", result.getDepartureTime());
        response.put("arrivalTime", result.getArrivalTime());
        response.put("duration", result.getDuration());
        response.put("price", result.getPrice());
        response.put("currency", result.getCurrency());
        response.put("formattedPrice", result.getFormattedPrice());
        response.put("seatClass", result.getSeatClass());
        response.put("availableSeats", result.getAvailableSeats());
        response.put("aircraft", result.getAircraft());
        return response;
    }

    /**
     * Convert Flight entity to response format
     */
    private Map<String, Object> convertFlightToResponse(Flight flight) {
        Map<String, Object> response = new HashMap<>();
        response.put("flightId", flight.getFlightId().toString());
        response.put("airline", flight.getAirline() != null ? flight.getAirline().getName() : "Unknown Airline");
        response.put("flightNumber", flight.getFlightNumber());
        response.put("origin", flight.getDepartureAirport() != null ? flight.getDepartureAirport().getIataCode() : "");
        response.put("destination", flight.getArrivalAirport() != null ? flight.getArrivalAirport().getIataCode() : "");
        response.put("departureTime", "08:00"); // Mock time - in production, get from schedule
        response.put("arrivalTime", "10:30");   // Mock time - in production, calculate from departure + duration
        response.put("duration", formatDuration(flight.getBaseDurationMinutes()));
        response.put("price", 2500000); // Default price - in production, get from pricing service
        response.put("currency", "VND");
        response.put("seatClass", "ECONOMY");
        response.put("availableSeats", 100); // Default - in production, get from inventory
        return response;
    }
//
//    /**
//     * Get airport name by IATA code
//     */
    private String getAirportName(String iataCode) {
        try {
            return airportRepository.findByIataCode(iataCode)
                .map(Airport::getName)
                .orElse(iataCode + " Airport");
        } catch (Exception e) {
            return iataCode + " Airport";
        }
    }
//
//    /**
//     * Get airport city by IATA code
//     */
    private String getAirportCity(String iataCode) {
        try {
            return airportRepository.findByIataCode(iataCode)
                .map(Airport::getCity)
                .orElse("Unknown City");
        } catch (Exception e) {
            return "Unknown City";
        }
    }
//
//    /**
//     * Format duration from minutes to readable string
//     */
    private String formatDuration(Integer durationMinutes) {
        if (durationMinutes == null) {
            return "2h 30m"; // Default duration
        }

        int hours = durationMinutes / 60;
        int minutes = durationMinutes % 60;

        if (hours > 0 && minutes > 0) {
            return String.format("%dh %dm", hours, minutes);
        } else if (hours > 0) {
            return String.format("%dh", hours);
        } else {
            return String.format("%dm", minutes);
        }
    }
//
//    /**
//     * Generate mock price (in production, this would come from pricing service)
//     */
    private long generateMockPrice() {
        // Generate random price between 1.5M and 5M VND
        return 1500000L + (long)(Math.random() * 3500000L);
    }
//
//    /**
//     * Generate mock available seats (in production, this would come from inventory service)
//     */
    private int generateMockAvailableSeats() {
        // Generate random available seats between 10 and 100
        return 10 + (int)(Math.random() * 90);
    }
}
