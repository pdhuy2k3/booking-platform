package com.pdh.flight.dto.response;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for airline data transfer
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AirlineDto {
    
    private Long airlineId;
    
    private String name;
    
    private String iataCode;
    
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
    private Long totalRoutes;
    private String status; // ACTIVE, INACTIVE
}
