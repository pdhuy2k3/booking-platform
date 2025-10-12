package com.pdh.hotel.mapper;

import com.pdh.common.dto.response.MediaResponse;
import com.pdh.hotel.dto.request.RoomRequestDto;
import com.pdh.hotel.dto.response.RoomResponseDto;
import com.pdh.hotel.model.Room;
import com.pdh.hotel.model.RoomImage;
import com.pdh.hotel.repository.RoomImageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Mapper for converting between Room entity and DTOs
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RoomMapper {
    
    private final RoomImageRepository roomImageRepository;
    
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
     * Convert Room entity to RoomResponseDto with media information
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
                   .hotelName(room.getHotel().getName())
                   .hotelLatitude(toDouble(room.getHotel().getLatitude()))
                   .hotelLongitude(toDouble(room.getHotel().getLongitude()));
        }

        // Add room type information if available
        if (room.getRoomType() != null) {
            builder.roomType(RoomResponseDto.RoomTypeDto.builder()
                    .id(room.getRoomType().getRoomTypeId())
                    .name(room.getRoomType().getName())
                    .description(room.getRoomType().getDescription())
                    .build());
        }

        RoomResponseDto dto = builder.build();
        
        // Fetch and set media information
        setMediaInfo(dto, "ROOM", room.getId());

        return dto;
    }

    /**
     * Convert list of Room entities to list of RoomResponseDto with optimized media fetching
     */
    public List<RoomResponseDto> toResponseDtoList(List<Room> rooms) {
        if (rooms == null || rooms.isEmpty()) {
            return List.of();
        }

        // First, convert entities to DTOs without media
        List<RoomResponseDto> dtos = rooms.stream()
                .map(room -> {
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
                               .hotelName(room.getHotel().getName())
                               .hotelLatitude(toDouble(room.getHotel().getLatitude()))
                               .hotelLongitude(toDouble(room.getHotel().getLongitude()));
                    }

                    // Add room type information if available
                    if (room.getRoomType() != null) {
                        builder.roomType(RoomResponseDto.RoomTypeDto.builder()
                                .id(room.getRoomType().getRoomTypeId())
                                .name(room.getRoomType().getName())
                                .description(room.getRoomType().getDescription())
                                .build());
                    }

                    return builder.build();
                })
                .collect(Collectors.toList());

        // Then, fetch media for all rooms using room image associations
        try {
            // Get room-media associations and set media information
            dtos.forEach(dto -> {
                List<RoomImage> roomImages = roomImageRepository.findByRoomId(dto.getId());
                setMediaFromRoomImages(dto, roomImages);
            });
        } catch (Exception e) {
            log.error("Failed to fetch media for rooms: {}", e.getMessage());
            // Set default values for all DTOs
            dtos.forEach(dto -> setDefaultMediaValues(dto));
        }

        return dtos;
    }
    
    /**
     * Helper method to fetch and set media information for a single room
     */
    private void setMediaInfo(RoomResponseDto dto, String entityType, Long entityId) {
        try {
            List<RoomImage> roomImages = roomImageRepository.findByRoomId(entityId);
            setMediaFromRoomImages(dto, roomImages);
        } catch (Exception e) {
            log.error("Failed to fetch media for {} {}: {}", entityType, entityId, e.getMessage());
            setDefaultMediaValues(dto);
        }
    }

    /**
     * Helper method to set media information from room images
     */
    private void setMediaFromRoomImages(RoomResponseDto dto, List<RoomImage> roomImages) {
        if (roomImages == null || roomImages.isEmpty()) {
            setDefaultMediaValues(dto);
            return;
        }
        
        // Create complete MediaResponse objects with all available data from RoomImage
        List<MediaResponse> mediaResponseList = roomImages.stream()
                .map(roomImage -> MediaResponse.builder()
                        .id(roomImage.getMediaId())
                        .mediaId(roomImage.getMediaId())
                        .publicId(roomImage.getPublicId())
                        .url(roomImage.getUrl())
                        .secureUrl(roomImage.getUrl()) // For now, use the same URL for both
                        .isPrimary(roomImage.isPrimary())
                        .displayOrder(0) // Default display order
                        .build())
                .collect(Collectors.toList());
        
        dto.setMedia(mediaResponseList);
        dto.setHasMedia(true);
        dto.setMediaCount(mediaResponseList.size());
        
        // Set first image as primary for now (or find actual primary if available)
        MediaResponse primaryImage = mediaResponseList.stream()
                .filter(MediaResponse::getIsPrimary)
                .findFirst()
                .orElse(mediaResponseList.isEmpty() ? null : mediaResponseList.get(0));
        dto.setPrimaryImage(primaryImage);
    }
    
    /**
     * Helper method to set default media values when no media is found
     */
    private void setDefaultMediaValues(RoomResponseDto dto) {
        dto.setMedia(List.of());
        dto.setPrimaryImage(null);
        dto.setHasMedia(false);
        dto.setMediaCount(0);
    }
    
    private Double toDouble(BigDecimal value) {
        return value != null ? value.doubleValue() : null;
    }
}
