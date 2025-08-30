package com.pdh.hotel.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.List;

/**
 * DTO for returning hotel information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelResponseDto {
    
    private Long id;
    private String name;
    private String address;
    private String city;
    private String country;
    private BigDecimal starRating;
    private String description;
    private BigDecimal latitude;
    private BigDecimal longitude;
    
    // Computed fields
    private Long availableRooms;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Double averageRating;
    private Integer totalReviews;
    
    // Related data
    private List<AmenityResponseDto> amenities;
    private List<String> images;
    
    // Audit fields
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
}
