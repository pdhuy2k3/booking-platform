package com.pdh.hotel.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for returning a single room with a message
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomSingleResponseDto {
    
    private RoomResponseDto room;
    private String message;
}