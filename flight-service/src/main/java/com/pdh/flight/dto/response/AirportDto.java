package com.pdh.flight.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for airport data transfer
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AirportDto {
    
    private Long airportId;
    
    private String name;
    
    private String iataCode;
    
    private String city;
    
    private String country;
    
    private Boolean isActive;
    
    // Images as publicIds - frontend can use these to generate URLs
    private List<String> images;
    
    // Audit information
    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime updatedAt;
    private String updatedBy;
    
    // Statistics (for list view)
    private Long totalDepartureFlights;
    private Long totalArrivalFlights;
    private Long activeDepartureFlights;
    private Long activeArrivalFlights;
    private String status; // ACTIVE, INACTIVE
}
