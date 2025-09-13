package com.pdh.flight.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;

/**
 * DTO for aircraft creation and updates
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class AircraftRequestDto {
    
    @NotBlank(message = "Aircraft model is required")
    @Size(max = 100, message = "Aircraft model cannot exceed 100 characters")
    private String model;
    
    @Size(max = 100, message = "Manufacturer name cannot exceed 100 characters")
    private String manufacturer;
    
    @Min(value = 0, message = "Economy capacity must be non-negative")
    @Max(value = 1000, message = "Economy capacity cannot exceed 1000")
    private Integer capacityEconomy;
    
    @Min(value = 0, message = "Business capacity must be non-negative")
    @Max(value = 1000, message = "Business capacity cannot exceed 1000")
    private Integer capacityBusiness;
    
    @Min(value = 0, message = "First class capacity must be non-negative")
    @Max(value = 1000, message = "First class capacity cannot exceed 1000")
    private Integer capacityFirst;
    
    @Min(value = 0, message = "Total capacity must be non-negative")
    @Max(value = 1000, message = "Total capacity cannot exceed 1000")
    private Integer totalCapacity;
    
    @Size(max = 20, message = "Registration number cannot exceed 20 characters")
    private String registrationNumber;
    
    // Media public IDs for aircraft images
    private List<String> mediaPublicIds;
}