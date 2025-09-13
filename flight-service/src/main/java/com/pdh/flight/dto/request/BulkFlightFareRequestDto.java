package com.pdh.flight.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * DTO for bulk flight fare creation/update requests
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkFlightFareRequestDto {
    
    @NotNull(message = "Schedule IDs are required")
    private List<UUID> scheduleIds;
    
    @NotNull(message = "Fare class is required")
    private String fareClass;
    
    @NotNull(message = "Price is required")
    private BigDecimal price;
    
    @NotNull(message = "Available seats is required")
    private Integer availableSeats;
    
    // Optional: Apply different prices based on demand or other factors
    private Boolean applyDynamicPricing;
    
    // Optional: Override existing fares
    private Boolean overrideExisting;
}