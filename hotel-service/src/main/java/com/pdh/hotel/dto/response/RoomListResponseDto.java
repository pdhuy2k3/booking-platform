package com.pdh.hotel.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for returning a list of rooms with pagination information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomListResponseDto {
    
    private List<RoomResponseDto> rooms;
    private long totalElements;
    private int totalPages;
    private int size;
    private int number;
    private boolean first;
    private boolean last;
}