package com.pdh.hotel.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.List;

/**
 * DTO for returning amenity information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AmenityResponseDto {
    
    private Long id;
    private String name;
    private String iconUrl;
    private Boolean isActive;
    private Integer displayOrder;
    
    // Images field for frontend MediaSelector compatibility
    private List<String> images;
    
    // Audit fields
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
}
