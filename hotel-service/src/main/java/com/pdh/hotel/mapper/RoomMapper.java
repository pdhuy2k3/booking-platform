package com.pdh.hotel.mapper;

import com.pdh.hotel.dto.request.RoomRequestDto;
import com.pdh.hotel.dto.response.RoomResponseDto;
import com.pdh.hotel.model.Room;
import com.pdh.hotel.model.RoomImage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper for converting between Room entity and DTOs
 */
@Component
public class RoomMapper {
    
    @Autowired
    private AmenityMapper amenityMapper;
    
    /**
     * Convert RoomRequestDto to Room entity
     */
    public Room toEntity(RoomRequestDto dto) {
        if (dto == null) {
            return null;
        }
        
        Room room = new Room();
        room.setRoomNumber(dto.getRoomNumber());
        room.setDescription(dto.getDescription());
        room.setPrice(dto.getPrice());
        room.setMaxOccupancy(dto.getMaxOccupancy());
        room.setBedType(dto.getBedType());
        room.setRoomSize(dto.getRoomSize());
        room.setIsAvailable(dto.getIsAvailable());
        
        return room;
    }
    
    /**
     * Update existing Room entity from RoomRequestDto
     */
    public void updateEntity(Room room, RoomRequestDto dto) {
        if (room == null || dto == null) {
            return;
        }
        
        room.setRoomNumber(dto.getRoomNumber());
        room.setDescription(dto.getDescription());
        room.setPrice(dto.getPrice());
        room.setMaxOccupancy(dto.getMaxOccupancy());
        room.setBedType(dto.getBedType());
        room.setRoomSize(dto.getRoomSize());
        room.setIsAvailable(dto.getIsAvailable());
    }
    
    /**
     * Convert Room entity to RoomResponseDto
     */
    public RoomResponseDto toResponseDto(Room room) {
        if (room == null) {
            return null;
        }
        
        RoomResponseDto.RoomResponseDtoBuilder builder = RoomResponseDto.builder()
                .id(room.getId())
                .roomNumber(room.getRoomNumber())
                .description(room.getDescription())
                .price(room.getPrice())
                .maxOccupancy(room.getMaxOccupancy())
                .bedType(room.getBedType())
                .roomSize(room.getRoomSize())
                .isAvailable(room.getIsAvailable())
                .createdAt(room.getCreatedAt())
                .updatedAt(room.getUpdatedAt());
        
        // Add hotel information if available
        if (room.getHotel() != null) {
            builder.hotelId(room.getHotel().getHotelId())
                   .hotelName(room.getHotel().getName());
        }
        
        // Add room type information if available
        if (room.getRoomType() != null) {
            builder.roomType(RoomResponseDto.RoomTypeDto.builder()
                    .id(room.getRoomType().getRoomTypeId())
                    .name(room.getRoomType().getName())
                    .description(room.getRoomType().getDescription())
                    .build());
        }
        
        // Add room images if available
        if (room.getRoomImages() != null && !room.getRoomImages().isEmpty()) {
            List<String> imageUrls = room.getRoomImages().stream()
                    .map(RoomImage::getImageUrl)
                    .collect(Collectors.toList());
            builder.images(imageUrls);
        }
        
        return builder.build();
    }
    
    /**
     * Convert list of Room entities to list of RoomResponseDto
     */
    public List<RoomResponseDto> toResponseDtoList(List<Room> rooms) {
        if (rooms == null) {
            return null;
        }
        
        return rooms.stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }
}
