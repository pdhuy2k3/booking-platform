package com.pdh.flight.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;

/**
 * DTO for airline creation and updates
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class AirlineRequestDto {
    
    @NotBlank(message = "Airline name is required")
    @Size(max = 255, message = "Airline name cannot exceed 255 characters")
    private String name;
    
    @NotBlank(message = "IATA code is required")
    @Size(min = 2, max = 2, message = "IATA code must be exactly 2 characters")
    @Pattern(regexp = "^[A-Z]{2}$", message = "IATA code must be 2 uppercase letters")
    private String code;
    
    // Media public IDs for airline images (logos, etc.)
    // Contains list of publicIds that will be processed by the service layer
    private List<String> mediaPublicIds;
}