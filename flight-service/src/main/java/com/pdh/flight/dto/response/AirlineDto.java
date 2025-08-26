package com.pdh.flight.dto.response;

import lombok.*;
import java.time.LocalDateTime;

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
    
    private String logoUrl;
    
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
