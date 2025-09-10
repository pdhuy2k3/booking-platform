package com.pdh.hotel.mapper;

import com.pdh.common.dto.response.MediaResponse;
import com.pdh.hotel.dto.request.RoomTypeRequestDto;
import com.pdh.hotel.dto.response.RoomTypeResponseDto;
import com.pdh.hotel.model.RoomType;
import com.pdh.hotel.model.RoomTypeImage;
import com.pdh.hotel.repository.RoomTypeImageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper for RoomType entity and DTOs
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RoomTypeMapper {
    
    private final RoomTypeImageRepository roomTypeImageRepository;
    
    /**
     * Convert RoomType entity to RoomTypeResponseDto with media information
     */
    public RoomTypeResponseDto toResponseDto(RoomType roomType) {
        if (roomType == null) {
            return null;
        }
        
        RoomTypeResponseDto.RoomTypeResponseDtoBuilder builder = RoomTypeResponseDto.builder()
                .id(roomType.getRoomTypeId())
                .name(roomType.getName())
                .description(roomType.getDescription())
                .capacityAdults(roomType.getCapacityAdults())
                .basePrice(roomType.getBasePrice())
                .createdAt(roomType.getCreatedAt())
                .updatedAt(roomType.getUpdatedAt());
                
        // Add media information
        setMediaInfo(builder, roomType.getRoomTypeId());
        
        return builder.build();
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
    
    /**
     * Helper method to fetch and set media information for a room type
     */
    private void setMediaInfo(RoomTypeResponseDto.RoomTypeResponseDtoBuilder builder, Long roomTypeId) {
        try {
            List<RoomTypeImage> roomTypeImages = roomTypeImageRepository.findByRoomTypeId(roomTypeId);
            setMediaFromRoomTypeImages(builder, roomTypeImages);
        } catch (Exception e) {
            log.error("Failed to fetch media for room type {}: {}", roomTypeId, e.getMessage());
            setDefaultMediaValues(builder);
        }
    }
    
    /**
     * Helper method to set media information from room type images
     */
    private void setMediaFromRoomTypeImages(RoomTypeResponseDto.RoomTypeResponseDtoBuilder builder, List<RoomTypeImage> roomTypeImages) {
        if (roomTypeImages == null || roomTypeImages.isEmpty()) {
            setDefaultMediaValues(builder);
            return;
        }
        
        // Create complete MediaResponse objects with all available data from RoomTypeImage
        List<MediaResponse> mediaResponseList = roomTypeImages.stream()
                .map(roomTypeImage -> MediaResponse.builder()
                        .id(roomTypeImage.getMediaId())
                        .mediaId(roomTypeImage.getMediaId())
                        .publicId(roomTypeImage.getPublicId())
                        .url(roomTypeImage.getUrl())
                        .secureUrl(roomTypeImage.getUrl()) // For now, use the same URL for both
                        .isPrimary(roomTypeImage.isPrimary())
                        .displayOrder(0) // Default display order
                        .build())
                .collect(Collectors.toList());
        
        builder.media(mediaResponseList)
               .hasMedia(true)
               .mediaCount(mediaResponseList.size());
        
        // Set primary image (find actual primary if available)
        MediaResponse primaryImage = mediaResponseList.stream()
                .filter(MediaResponse::getIsPrimary)
                .findFirst()
                .orElse(mediaResponseList.isEmpty() ? null : mediaResponseList.get(0));
        builder.primaryImage(primaryImage);
    }
    
    /**
     * Helper method to set default media values when no media is found
     */
    private void setDefaultMediaValues(RoomTypeResponseDto.RoomTypeResponseDtoBuilder builder) {
        builder.media(List.of())
               .primaryImage(null)
               .hasMedia(false)
               .mediaCount(0);
    }
}
