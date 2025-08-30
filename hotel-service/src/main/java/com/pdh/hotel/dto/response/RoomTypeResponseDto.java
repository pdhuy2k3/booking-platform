package com.pdh.hotel.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.ZonedDateTime;

/**
 * DTO for returning room type information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomTypeResponseDto {
    
    private Long id;
    private String name;
    private String description;
    private Integer capacityAdults;
    private BigDecimal basePrice;
    
    // Audit fields
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
}
