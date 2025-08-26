package com.pdh.hotel.mapper;

import com.pdh.hotel.dto.request.RoomTypeRequestDto;
import com.pdh.hotel.dto.response.RoomTypeResponseDto;
import com.pdh.hotel.model.RoomType;
import org.springframework.stereotype.Component;

/**
 * Mapper for RoomType entity and DTOs
 */
@Component
public class RoomTypeMapper {
    
    /**
     * Convert RoomType entity to RoomTypeResponseDto
     */
    public RoomTypeResponseDto toResponseDto(RoomType roomType) {
        if (roomType == null) {
            return null;
        }
        
        return RoomTypeResponseDto.builder()
                .id(roomType.getRoomTypeId())
                .name(roomType.getName())
                .description(roomType.getDescription())
                .capacityAdults(roomType.getCapacityAdults())
                .basePrice(roomType.getBasePrice())
                .createdAt(roomType.getCreatedAt())
                .updatedAt(roomType.getUpdatedAt())
                .build();
    }
    
    /**
     * Convert RoomTypeRequestDto to RoomType entity
     */
    public RoomType toEntity(RoomTypeRequestDto requestDto) {
        if (requestDto == null) {
            return null;
        }
        
        RoomType roomType = new RoomType();
        roomType.setName(requestDto.getName());
        roomType.setDescription(requestDto.getDescription());
        roomType.setCapacityAdults(requestDto.getCapacityAdults());
        roomType.setBasePrice(requestDto.getBasePrice());
        
        return roomType;
    }
    
    /**
     * Update existing RoomType entity with data from RoomTypeRequestDto
     */
    public void updateEntity(RoomType roomType, RoomTypeRequestDto requestDto) {
        if (roomType == null || requestDto == null) {
            return;
        }
        
        roomType.setName(requestDto.getName());
        roomType.setDescription(requestDto.getDescription());
        roomType.setCapacityAdults(requestDto.getCapacityAdults());
        roomType.setBasePrice(requestDto.getBasePrice());
    }
}
