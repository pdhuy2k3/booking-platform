package com.pdh.hotel.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.pdh.common.dto.response.MediaResponse;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for creating or updating room type information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class RoomTypeRequestDto {
    
    @NotBlank(message = "Room type name is required")
    @Size(max = 255, message = "Room type name cannot exceed 255 characters")
    private String name;
    
    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;
    
    @Min(value = 1, message = "Capacity must be at least 1 adult")
    @Max(value = 20, message = "Capacity cannot exceed 20 adults")
    private Integer capacityAdults;
    
    @NotNull(message = "Base price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Base price must be greater than 0")
    @DecimalMax(value = "99999999.99", message = "Base price cannot exceed 99,999,999.99")
    @Digits(integer = 8, fraction = 2, message = "Base price format invalid - maximum 8 digits before decimal point")
    private BigDecimal basePrice;
    
    /**
     * List of complete media responses to associate with this room type
     */
    private List<MediaResponse> media;
}
