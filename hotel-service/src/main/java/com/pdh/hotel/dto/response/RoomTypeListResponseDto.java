package com.pdh.hotel.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for returning a list of room types
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomTypeListResponseDto {
    
    private List<RoomTypeResponseDto> roomTypes;
    private long total;
}