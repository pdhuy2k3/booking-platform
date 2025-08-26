package com.pdh.flight.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

/**
 * DTO for airline creation and updates
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AirlineRequestDto {
    
    @NotBlank(message = "Airline name is required")
    @Size(max = 255, message = "Airline name cannot exceed 255 characters")
    private String name;
    
    @NotBlank(message = "IATA code is required")
    @Size(min = 2, max = 2, message = "IATA code must be exactly 2 characters")
    @Pattern(regexp = "^[A-Z]{2}$", message = "IATA code must be 2 uppercase letters")
    private String iataCode;
    
    @Size(max = 500, message = "Logo URL cannot exceed 500 characters")
    @Pattern(regexp = "^(https?://).*\\.(jpg|jpeg|png|gif|svg)$", 
             message = "Logo URL must be a valid HTTP/HTTPS URL ending with jpg, jpeg, png, gif, or svg")
    private String logoUrl;
}
