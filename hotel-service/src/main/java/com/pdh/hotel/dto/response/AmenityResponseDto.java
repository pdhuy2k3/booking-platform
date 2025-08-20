package com.pdh.hotel.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;

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
    
    // Audit fields
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
}
