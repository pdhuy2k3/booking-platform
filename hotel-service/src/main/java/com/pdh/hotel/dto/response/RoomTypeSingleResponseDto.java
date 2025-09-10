package com.pdh.hotel.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for returning a single room type with a message
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomTypeSingleResponseDto {
    
    private RoomTypeResponseDto roomType;
    private String message;
}