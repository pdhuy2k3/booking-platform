package com.pdh.flight.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

/**
 * DTO for flight search and filtering parameters
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlightFilterDto {
    
    @Min(value = 0, message = "Page number must be non-negative")
    private Integer page = 0;
    
    @Min(value = 1, message = "Page size must be at least 1")
    @Max(value = 100, message = "Page size cannot exceed 100")
    private Integer size = 10;
    
    @Size(max = 100, message = "Search term cannot exceed 100 characters")
    private String search; // Search in flight number, airline name
    
    @Size(max = 3, message = "Origin airport code cannot exceed 3 characters")
    @Pattern(regexp = "^[A-Z]{3}$", message = "Origin airport code must be 3 uppercase letters")
    private String origin;
    
    @Size(max = 3, message = "Destination airport code cannot exceed 3 characters")
    @Pattern(regexp = "^[A-Z]{3}$", message = "Destination airport code must be 3 uppercase letters")
    private String destination;
    
    @Pattern(regexp = "^(ACTIVE|CANCELLED|DELAYED)$", message = "Status must be ACTIVE, CANCELLED, or DELAYED")
    private String status;
    
    @Positive(message = "Airline ID must be positive")
    private Long airlineId;
    
    @Size(max = 50, message = "Aircraft type cannot exceed 50 characters")
    private String aircraftType;
    
    @Size(max = 20, message = "Sort field cannot exceed 20 characters")
    @Pattern(regexp = "^(flightNumber|airline|departureAirport|arrivalAirport|status|createdAt)$", 
             message = "Sort field must be one of: flightNumber, airline, departureAirport, arrivalAirport, status, createdAt")
    private String sortBy = "createdAt";
    
    @Pattern(regexp = "^(asc|desc)$", message = "Sort direction must be 'asc' or 'desc'")
    private String sortDirection = "desc";
}
