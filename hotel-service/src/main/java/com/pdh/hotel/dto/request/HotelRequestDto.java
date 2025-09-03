package com.pdh.hotel.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for creating or updating hotel information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelRequestDto {
    
    @NotBlank(message = "Hotel name is required")
    @Size(max = 255, message = "Hotel name cannot exceed 255 characters")
    private String name;
    
    @NotBlank(message = "Address is required")
    @Size(max = 500, message = "Address cannot exceed 500 characters")
    private String address;
    
    @NotBlank(message = "City is required")
    @Size(max = 100, message = "City name cannot exceed 100 characters")
    private String city;
    
    @NotBlank(message = "Country is required")
    @Size(max = 100, message = "Country name cannot exceed 100 characters")
    private String country;
    
    @Min(value = 1, message = "Star rating must be at least 1")
    @Max(value = 5, message = "Star rating cannot exceed 5")
    @NotNull(message = "Star rating is required")
    private BigDecimal starRating;
    
    @Size(max = 2000, message = "Description cannot exceed 2000 characters")
    private String description;
    
    @DecimalMin(value = "-90.0", message = "Invalid latitude")
    @DecimalMax(value = "90.0", message = "Invalid latitude")
    private BigDecimal latitude;
    
    @DecimalMin(value = "-180.0", message = "Invalid longitude")
    @DecimalMax(value = "180.0", message = "Invalid longitude")
    private BigDecimal longitude;
    
    // Images field for frontend MediaSelector compatibility
    private List<String> images;
}
