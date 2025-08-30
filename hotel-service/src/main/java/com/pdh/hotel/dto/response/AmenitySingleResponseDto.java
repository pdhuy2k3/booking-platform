package com.pdh.hotel.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response wrapper for single amenity with message
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AmenitySingleResponseDto {
    private AmenityResponseDto amenity;
    private String message;
    
    /**
     * Create from amenity with message
     */
    public static AmenitySingleResponseDto from(AmenityResponseDto amenity, String message) {
        return AmenitySingleResponseDto.builder()
                .amenity(amenity)
                .message(message)
                .build();
    }
}
