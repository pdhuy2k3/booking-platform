package com.pdh.flight.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

/**
 * DTO for airport creation and updates
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AirportRequestDto {
    
    @NotBlank(message = "Airport name is required")
    @Size(max = 255, message = "Airport name cannot exceed 255 characters")
    private String name;
    
    @NotBlank(message = "IATA code is required")
    @Size(min = 3, max = 3, message = "IATA code must be exactly 3 characters")
    @Pattern(regexp = "^[A-Z]{3}$", message = "IATA code must be 3 uppercase letters")
    private String iataCode;
    
    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City name cannot exceed 100 characters")
    private String city;
    
    @NotBlank(message = "Country is required")
    @Size(max = 100, message = "Country name cannot exceed 100 characters")
    private String country;
}
