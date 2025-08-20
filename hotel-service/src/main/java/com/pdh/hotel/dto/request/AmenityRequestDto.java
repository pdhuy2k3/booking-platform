package com.pdh.hotel.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;

/**
 * DTO for creating or updating amenity information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AmenityRequestDto {
    
    @NotBlank(message = "Amenity name is required")
    @Size(max = 100, message = "Amenity name cannot exceed 100 characters")
    private String name;
    
    @Size(max = 500, message = "Icon URL cannot exceed 500 characters")
    @Pattern(regexp = "^(https?://.*|/.*)?$", message = "Invalid icon URL format")
    private String iconUrl;
    
    @NotNull(message = "Active status is required")
    private Boolean isActive;
    
    @Min(value = 0, message = "Display order must be non-negative")
    @Max(value = 9999, message = "Display order cannot exceed 9999")
    private Integer displayOrder;
}
