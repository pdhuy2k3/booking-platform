package com.pdh.flight.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.common.config.OpenApiResponses;
import com.pdh.flight.dto.FlightBookingDetailsDto;
import com.pdh.flight.dto.response.FlightSearchResultDto;
import com.pdh.flight.dto.response.FlightFareDetailsResponse;
import com.pdh.flight.model.Flight;
import com.pdh.flight.model.FlightSchedule;
import com.pdh.flight.model.FlightFare;
import com.pdh.flight.model.Airport;
import com.pdh.flight.model.enums.FareClass;
import com.pdh.flight.repository.FlightRepository;
import com.pdh.flight.repository.AirportRepository;
import com.pdh.flight.repository.AirlineRepository;
import com.pdh.flight.repository.FlightScheduleRepository;
import com.pdh.flight.repository.FlightFareRepository;
import com.pdh.flight.service.FlightService;
import com.pdh.flight.service.FlightSearchService;
import com.pdh.flight.service.CityDataService;
import com.pdh.flight.service.CityMappingService;
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
import java.time.Duration;
import java.time.ZonedDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.UUID;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Comparator;
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
    private final CityDataService cityDataService;
    private final CityMappingService cityMappingService;
    private final FlightScheduleRepository flightScheduleRepository;
    private final FlightFareRepository flightFareRepository;


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
            @Parameter(description = "Origin airport IATA code", example = "HAN")
            @RequestParam(required = false) String origin,
            @Parameter(description = "Destination airport IATA code", example = "SGN")
            @RequestParam(required = false) String destination,
            @Parameter(description = "Departure date in YYYY-MM-DD format", example = "2024-02-15")
            @RequestParam(required = false) String departureDate,
            @Parameter(description = "Return date in YYYY-MM-DD format (for round-trip)", example = "2024-02-20")
            @RequestParam(required = false) String returnDate,
            @Parameter(description = "Number of passengers", example = "1")
            @RequestParam(defaultValue = "1") int passengers,
            @Parameter(description = "Seat class", example = "ECONOMY")
            @RequestParam(defaultValue = "ECONOMY") String seatClass,
            @Parameter(description = "Sort by criteria (price, duration, departure, arrival)", example = "departure")
            @RequestParam(defaultValue = "departure") String sortBy,
            @Parameter(description = "Filter by airline ID", example = "1")
            @RequestParam(required = false) Long airlineId,
            @Parameter(description = "Filter by departure airport ID", example = "1")
            @RequestParam(required = false) Long departureAirportId,
            @Parameter(description = "Page number (1-based)", example = "1")
            @RequestParam(defaultValue = "1") int page,
            @Parameter(description = "Number of results per page", example = "20")
            @RequestParam(defaultValue = "20") int limit) {

        log.info("Flight search request: origin={}, destination={}, departureDate={}, passengers={}, seatClass={}",
                origin, destination, departureDate, passengers, seatClass);

        try {
            // Validate search parameters
            SearchValidation.ValidationResult originValidation = SearchValidation.validateSearchQuery(origin);
            SearchValidation.ValidationResult destinationValidation = SearchValidation.validateSearchQuery(destination);
            
            if (!originValidation.isValid()) {
                log.warn("Invalid origin parameter: {}", originValidation.getErrorMessage());
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "VALIDATION_ERROR",
                    "message", "Invalid origin: " + originValidation.getErrorMessage(),
                    "flights", List.of(),
                    "totalCount", 0
                ));
            }
            
            if (!destinationValidation.isValid()) {
                log.warn("Invalid destination parameter: {}", destinationValidation.getErrorMessage());
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "VALIDATION_ERROR",
                    "message", "Invalid destination: " + destinationValidation.getErrorMessage(),
                    "flights", List.of(),
                    "totalCount", 0
                ));
            }
            
            // Sanitize inputs
            String sanitizedOrigin = SearchValidation.sanitizeSearchQuery(origin);
            String sanitizedDestination = SearchValidation.sanitizeSearchQuery(destination);
            
            // Resolve city names to IATA codes if needed
            String resolvedOrigin = resolveCityToIataCode(sanitizedOrigin);
            String resolvedDestination = resolveCityToIataCode(sanitizedDestination);
            
            // Check if this is a search request or initial data request
            boolean hasSearchCriteria = (resolvedOrigin != null && !resolvedOrigin.trim().isEmpty()) ||
                                      (resolvedDestination != null && !resolvedDestination.trim().isEmpty()) ||
                                      (departureDate != null && !departureDate.trim().isEmpty());

            if (!hasSearchCriteria) {
                // Return initial data - all flights without search filters
                log.info("Returning initial flight data without search filters");
                
                // Create pageable
                Pageable pageable = PageRequest.of(page - 1, limit);
                
                // Get all flights (without search filters) for initial display
                Page<Flight> flightPage = flightRepository.findAll(pageable);
                
                // Convert flights to response format
                List<Map<String, Object>> flights = flightPage.getContent().stream()
                    .map(this::convertFlightToResponse)
                    .collect(Collectors.toList());
                
                // Get popular destinations
                List<Map<String, Object>> popularDestinations = getPopularDestinationsData();
                
                // Get origin and destination data from external API
                List<Map<String, Object>> origins = getOriginData();
                List<Map<String, Object>> destinations = getDestinationData();
                
                Map<String, Object> response = Map.of(
                    "flights", flights,
                    "popularDestinations", popularDestinations,
                    "origins", origins,
                    "destinations", destinations,
                    "totalCount", flightPage.getTotalElements(),
                    "page", page,
                    "limit", limit,
                    "hasMore", flightPage.hasNext()
                );
                
                return ResponseEntity.ok(response);
            }

            // Parse date
            LocalDate depDate;
            try {
                depDate = LocalDate.parse(departureDate);
            } catch (Exception e) {
                Map<String, Object> errorResponse = Map.of(
                    "error", "Validation failed",
                    "message", "Invalid departure date format. Expected YYYY-MM-DD",
                    "flights", List.of(),
                    "totalCount", 0,
                    "page", page,
                    "limit", limit,
                    "hasMore", false
                );
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Parse fare class
            FareClass fareClass;
            try {
                fareClass = FareClass.valueOf(seatClass);
            } catch (Exception e) {
                Map<String, Object> errorResponse = Map.of(
                    "error", "Validation failed",
                    "message", "Invalid seat class. Valid values are: ECONOMY, BUSINESS, FIRST",
                    "flights", List.of(),
                    "totalCount", 0,
                    "page", page,
                    "limit", limit,
                    "hasMore", false
                );
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // Create pageable
            Pageable pageable = PageRequest.of(page - 1, limit);

            // Parse return date if provided
            LocalDate retDate = null;
            if (returnDate != null && !returnDate.trim().isEmpty()) {
                try {
                    retDate = LocalDate.parse(returnDate);
                } catch (Exception e) {
                    Map<String, Object> errorResponse = Map.of(
                        "error", "Validation failed",
                        "message", "Invalid return date format. Expected YYYY-MM-DD",
                        "flights", List.of(),
                        "totalCount", 0,
                        "page", page,
                        "limit", limit,
                        "hasMore", false
                    );
                    return ResponseEntity.badRequest().body(errorResponse);
                }
            }

            // Search flights using the new service with integrated pricing
            Page<FlightSearchResultDto> flightPage = flightSearchService.searchFlights(
                    resolvedOrigin, resolvedDestination, depDate, 
                    retDate,
                    passengers, fareClass, pageable, sortBy, airlineId, departureAirportId);

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

    @Operation(
        summary = "Get fare details for booked flight",
        description = "Retrieve fare and schedule information for a specific flight booking context",
        tags = {"Public API"}
    )
    @OpenApiResponses.StandardApiResponsesWithNotFound
    @GetMapping("/storefront/{flightId}/fare-details")
    public ResponseEntity<FlightFareDetailsResponse> getFareDetails(
            @PathVariable Long flightId,
            @RequestParam(name = "seatClass") String seatClass,
            @RequestParam(name = "departureDateTime") String departureDateTime) {

        log.info("Fare details request flightId={}, seatClass={}, departureDateTime={}", flightId, seatClass, departureDateTime);

        try {
            FareClass fareClass = FareClass.valueOf(seatClass.toUpperCase());
            ZonedDateTime departureTime;
            try {
                departureTime = ZonedDateTime.parse(departureDateTime);
            } catch (DateTimeParseException ex) {
                LocalDateTime localDateTime = LocalDateTime.parse(departureDateTime);
                departureTime = localDateTime.atZone(ZoneOffset.UTC);
            }

            List<FlightSchedule> schedules = flightScheduleRepository.findByFlightId(flightId);
            if (schedules.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            FlightSchedule matchedSchedule = schedules.stream()
                .min(Comparator.comparingLong(schedule -> Math.abs(Duration.between(departureTime, schedule.getDepartureTime()).toMinutes())))
                .orElse(null);

            if (matchedSchedule == null) {
                return ResponseEntity.notFound().build();
            }

            long minutesDifference = Math.abs(Duration.between(departureTime, matchedSchedule.getDepartureTime()).toMinutes());
            if (minutesDifference > 360) {
                return ResponseEntity.notFound().build();
            }

            FlightFare fare = flightFareRepository.findByScheduleIdAndFareClass(matchedSchedule.getScheduleId(), fareClass);
            if (fare == null) {
                return ResponseEntity.notFound().build();
            }

            Flight flight = flightRepository.findById(flightId).orElse(null);

            FlightFareDetailsResponse response = FlightFareDetailsResponse.builder()
                .fareId(fare.getFareId())
                .scheduleId(matchedSchedule.getScheduleId())
                .seatClass(fareClass.name())
                .price(fare.getPrice())
                .currency("VND")
                .availableSeats(fare.getAvailableSeats())
                .departureTime(matchedSchedule.getDepartureTime().toString())
                .arrivalTime(matchedSchedule.getArrivalTime().toString())
                .flightNumber(flight != null ? flight.getFlightNumber() : null)
                .airline(flight != null && flight.getAirline() != null ? flight.getAirline().getName() : null)
                .originAirport(flight != null && flight.getDepartureAirport() != null ? flight.getDepartureAirport().getIataCode() : null)
                .destinationAirport(flight != null && flight.getArrivalAirport() != null ? flight.getArrivalAirport().getIataCode() : null)
                .aircraftType(matchedSchedule.getAircraftType())
                .build();

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException | DateTimeParseException e) {
            log.warn("Invalid fare detail request parameters", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            log.error("Error retrieving fare details", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
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

        
        // TODO


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
        // TODO

        

        return ResponseEntity.ok(Map.of());
    }

    // === HELPER METHODS ===

    /**
     * Get popular destinations data
     */
    private List<Map<String, Object>> getPopularDestinationsData() {
        // For now, return static popular destinations
        // In production, this would be based on booking statistics
        return List.of(
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
    }

    /**
     * Get origin data from external API
     */
    private List<Map<String, Object>> getOriginData() {
        // In production, this calls the tinhthanhpho.com API
        return cityDataService.getAllProvincesAndCities();
    }

    /**
     * Get destination data from external API
     */
    private List<Map<String, Object>> getDestinationData() {
        // In production, this calls the tinhthanhpho.com API
        return cityDataService.getAllProvincesAndCities();
    }

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

    /**
     * Get airport name by IATA code
     */
    private String getAirportName(String iataCode) {
        try {
            return airportRepository.findByIataCode(iataCode)
                .map(Airport::getName)
                .orElse(iataCode + " Airport");
        } catch (Exception e) {
            return iataCode + " Airport";
        }
    }

    /**
     * Get airport city by IATA code
     */
    private String getAirportCity(String iataCode) {
        try {
            return airportRepository.findByIataCode(iataCode)
                .map(Airport::getCity)
                .orElse("Unknown City");
        } catch (Exception e) {
            return "Unknown City";
        }
    }
    
    /**
     * Resolve city name to IATA code using the city mapping service
     * @param cityOrIataCode the city name or IATA code
     * @return resolved IATA code or original input if already IATA code
     */
    private String resolveCityToIataCode(String cityOrIataCode) {
        if (cityOrIataCode == null || cityOrIataCode.trim().isEmpty()) {
            return null;
        }
        
        String trimmed = cityOrIataCode.trim();
        
        // If it's already an IATA code, return as is
        if (cityMappingService.isIataCode(trimmed)) {
            return trimmed.toUpperCase();
        }
        
        // Try to resolve city name to IATA code
        List<String> iataCodes = cityMappingService.getIataCodesForCity(trimmed);
        if (!iataCodes.isEmpty()) {
            log.debug("Resolved city '{}' to IATA code '{}'", trimmed, iataCodes.get(0));
            return iataCodes.get(0);
        }
        
        // If no resolution found, return original input for flexible search
        log.debug("Could not resolve city '{}' to IATA code, using original input", trimmed);
        return trimmed;
    }
    
    /**
     * Get city suggestions for invalid city names
     * @param invalidCity the invalid city name
     * @return list of suggested cities
     */
    private List<Map<String, Object>> getCitySuggestions(String invalidCity) {
        List<CityMappingService.CitySearchResult> suggestions = cityMappingService.searchCities(invalidCity);
        return suggestions.stream()
            .map(city -> {
                Map<String, Object> result = new HashMap<>();
                result.put("cityName", city.getCityName());
                result.put("iataCode", city.getIataCode());
                result.put("country", city.getCountry());
                result.put("relevanceScore", city.getRelevanceScore());
                return result;
            })
            .collect(Collectors.toList());
    }
    
    
    
}
