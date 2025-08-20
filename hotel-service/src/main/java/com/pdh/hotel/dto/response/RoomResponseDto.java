package com.pdh.hotel.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.List;

/**
 * DTO for returning room information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomResponseDto {
    
    private Long id;
    private Long hotelId;
    private String hotelName;
    private String roomNumber;
    private String description;
    private BigDecimal price;
    private Integer maxOccupancy;
    private String bedType;
    private Integer roomSize;
    private Boolean isAvailable;
    
    // Room type information
    private RoomTypeDto roomType;
    
    // Associated amenities
    private List<AmenityResponseDto> amenities;
    
    // Room images
    private List<String> images;
    
    // Audit fields
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoomTypeDto {
        private Long id;
        private String name;
        private String description;
    }
}
