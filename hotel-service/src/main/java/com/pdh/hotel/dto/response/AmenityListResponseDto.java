package com.pdh.hotel.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response DTO for list of amenities
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AmenityListResponseDto {
    private List<AmenityResponseDto> amenities;
    private int total;
    
    /**
     * Create from list
     */
    public static AmenityListResponseDto from(List<AmenityResponseDto> amenities) {
        return AmenityListResponseDto.builder()
                .amenities(amenities)
                .total(amenities != null ? amenities.size() : 0)
                .build();
    }
}
