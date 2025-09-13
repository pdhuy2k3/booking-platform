package com.pdh.flight.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for aircraft data transfer
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AircraftDto {
    
    private Long aircraftId;
    
    private String model;
    
    private String manufacturer;
    
    private Integer capacityEconomy;
    
    private Integer capacityBusiness;
    
    private Integer capacityFirst;
    
    private Integer totalCapacity;
    
    private String registrationNumber;
    
    private Boolean isActive;
    
    // Images as publicIds - frontend can use these to generate URLs
    private List<String> images;
    
    // Audit information
    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime updatedAt;
    private String updatedBy;
    
    // Statistics (for list view)
    private Long totalFlights;
    private Long activeFlights;
    private String status; // ACTIVE, INACTIVE
}