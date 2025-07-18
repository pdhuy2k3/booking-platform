package com.pdh.booking.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import java.time.LocalDateTime;

/**
 * DTO for additional hotel services (spa, restaurant, etc.)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelServiceDto {
    
    /**
     * Service ID
     */
    @NotBlank(message = "Service ID is required")
    private String serviceId;
    
    /**
     * Service name
     */
    @NotBlank(message = "Service name is required")
    private String serviceName;
    
    /**
     * Service type (SPA, RESTAURANT, TRANSPORT, etc.)
     */
    @NotBlank(message = "Service type is required")
    private String serviceType;
    
    /**
     * Service description
     */
    private String description;
    
    /**
     * Service price
     */
    @NotNull(message = "Service price is required")
    @Min(value = 0, message = "Service price must be positive")
    private Double price;
    
    /**
     * Quantity
     */
    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;
    
    /**
     * Service date/time (if applicable)
     */
    private LocalDateTime serviceDateTime;
    
    /**
     * Guest ID this service applies to
     */
    private String guestId;
}
