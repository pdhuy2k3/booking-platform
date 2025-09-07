package com.pdh.hotel.mapper;

import com.pdh.hotel.client.MediaServiceClient;
import com.pdh.hotel.dto.request.HotelRequestDto;
import com.pdh.hotel.dto.response.HotelResponseDto;
import com.pdh.hotel.dto.response.MediaInfo;
import com.pdh.hotel.model.Hotel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Mapper for converting between Hotel entity and DTOs
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class HotelMapper {
    
    private final MediaServiceClient mediaServiceClient;
    
    /**
     * Convert HotelRequestDto to Hotel entity
     */
    public Hotel toEntity(HotelRequestDto dto) {
        if (dto == null) {
            return null;
        }
        
        Hotel hotel = new Hotel();
        hotel.setName(dto.getName());
        hotel.setAddress(dto.getAddress());
        hotel.setCity(dto.getCity());
        hotel.setCountry(dto.getCountry());
        hotel.setStarRating(dto.getStarRating());
        hotel.setDescription(dto.getDescription());
        hotel.setLatitude(dto.getLatitude());
        hotel.setLongitude(dto.getLongitude());
        
        return hotel;
    }
    
    /**
     * Update existing Hotel entity from HotelRequestDto
     */
    public void updateEntity(Hotel hotel, HotelRequestDto dto) {
        if (hotel == null || dto == null) {
            return;
        }
        
        hotel.setName(dto.getName());
        hotel.setAddress(dto.getAddress());
        hotel.setCity(dto.getCity());
        hotel.setCountry(dto.getCountry());
        hotel.setStarRating(dto.getStarRating());
        hotel.setDescription(dto.getDescription());
        hotel.setLatitude(dto.getLatitude());
        hotel.setLongitude(dto.getLongitude());
    }
    
    /**
     * Convert Hotel entity to HotelResponseDto with media information
     */
    public HotelResponseDto toResponseDto(Hotel hotel) {
        if (hotel == null) {
            return null;
        }
        
        HotelResponseDto dto = HotelResponseDto.builder()
                .id(hotel.getHotelId())
                .name(hotel.getName())
                .address(hotel.getAddress())
                .city(hotel.getCity())
                .country(hotel.getCountry())
                .starRating(hotel.getStarRating())
                .description(hotel.getDescription())
                .latitude(hotel.getLatitude())
                .longitude(hotel.getLongitude())
                .createdAt(hotel.getCreatedAt())
                .updatedAt(hotel.getUpdatedAt())
                .createdBy(hotel.getCreatedBy())
                .updatedBy(hotel.getUpdatedBy())
                .build();
        
        // Fetch and set media information
        setMediaInfo(dto, "HOTEL", hotel.getHotelId());
        
        return dto;
    }
    
    /**
     * Convert list of Hotel entities to list of HotelResponseDto with optimized media fetching
     */
    public List<HotelResponseDto> toResponseDtoList(List<Hotel> hotels) {
        if (hotels == null || hotels.isEmpty()) {
            return List.of();
        }
        
        // First, convert entities to DTOs without media
        List<HotelResponseDto> dtos = hotels.stream()
                .map(hotel -> HotelResponseDto.builder()
                        .id(hotel.getHotelId())
                        .name(hotel.getName())
                        .address(hotel.getAddress())
                        .city(hotel.getCity())
                        .country(hotel.getCountry())
                        .starRating(hotel.getStarRating())
                        .description(hotel.getDescription())
                        .latitude(hotel.getLatitude())
                        .longitude(hotel.getLongitude())
                        .createdAt(hotel.getCreatedAt())
                        .updatedAt(hotel.getUpdatedAt())
                        .createdBy(hotel.getCreatedBy())
                        .updatedBy(hotel.getUpdatedBy())
                        .build())
                .collect(Collectors.toList());
        
        // Then, fetch media for all hotels in one batch call
        List<Long> hotelIds = hotels.stream()
                .map(Hotel::getHotelId)
                .collect(Collectors.toList());
        
        try {
            Map<Long, List<Map<String, Object>>> mediaMap = mediaServiceClient.getMediaForEntities("HOTEL", hotelIds);
            
            // Set media information for each DTO
            dtos.forEach(dto -> {
                List<Map<String, Object>> mediaList = mediaMap.get(dto.getId());
                setMediaFromList(dto, mediaList);
            });
        } catch (Exception e) {
            log.error("Failed to fetch media for hotels: {}", e.getMessage());
            // Set default values for all DTOs
            dtos.forEach(dto -> setDefaultMediaValues(dto));
        }
        
        return dtos;
    }
    
    /**
     * Helper method to fetch and set media information for a single hotel
     */
    private void setMediaInfo(HotelResponseDto dto, String entityType, Long entityId) {
        try {
            List<Map<String, Object>> mediaList = mediaServiceClient.getMediaByEntity(entityType, entityId);
            setMediaFromList(dto, mediaList);
        } catch (Exception e) {
            log.error("Failed to fetch media for {} {}: {}", entityType, entityId, e.getMessage());
            setDefaultMediaValues(dto);
        }
    }
    
    /**
     * Helper method to set media information from media list
     */
    private void setMediaFromList(HotelResponseDto dto, List<Map<String, Object>> mediaList) {
        if (mediaList == null || mediaList.isEmpty()) {
            setDefaultMediaValues(dto);
            return;
        }
        
        List<MediaInfo> mediaInfoList = mediaList.stream()
                .map(this::convertToMediaInfo)
                .collect(Collectors.toList());
        
        dto.setImages(mediaInfoList);
        dto.setHasMedia(true);
        dto.setMediaCount(mediaInfoList.size());
        
        // Find primary image
        MediaInfo primaryImage = mediaInfoList.stream()
                .filter(media -> Boolean.TRUE.equals(media.getIsPrimary()))
                .findFirst()
                .orElse(mediaInfoList.isEmpty() ? null : mediaInfoList.get(0));
        
        dto.setPrimaryImage(primaryImage);
    }
    
    /**
     * Helper method to set default media values when no media is found
     */
    private void setDefaultMediaValues(HotelResponseDto dto) {
        dto.setImages(List.of());
        dto.setPrimaryImage(null);
        dto.setHasMedia(false);
        dto.setMediaCount(0);
    }
    
    /**
     * Helper method to convert media map to MediaInfo object
     */
    private MediaInfo convertToMediaInfo(Map<String, Object> mediaMap) {
        return MediaInfo.builder()
                .id(safeLongConvert(mediaMap.get("id")))
                .publicId(safeStringConvert(mediaMap.get("publicId")))
                .url(safeStringConvert(mediaMap.get("url")))
                .secureUrl(safeStringConvert(mediaMap.get("secureUrl")))
                .altText(safeStringConvert(mediaMap.get("altText")))
                .isPrimary(safeBooleanConvert(mediaMap.get("isPrimary")))
                .displayOrder(safeIntegerConvert(mediaMap.get("displayOrder")))
                .mediaType(safeStringConvert(mediaMap.get("mediaType")))
                .resourceType(safeStringConvert(mediaMap.get("resourceType")))
                .format(safeStringConvert(mediaMap.get("format")))
                .fileSize(safeLongConvert(mediaMap.get("fileSize")))
                .width(safeIntegerConvert(mediaMap.get("width")))
                .height(safeIntegerConvert(mediaMap.get("height")))
                .tags(safeStringConvert(mediaMap.get("tags")))
                .createdAt(safeLocalDateTimeConvert(mediaMap.get("createdAt")))
                .updatedAt(safeLocalDateTimeConvert(mediaMap.get("updatedAt")))
                .build();
    }
    
    // Helper methods for safe type conversion
    private String safeStringConvert(Object value) {
        return value != null ? value.toString() : null;
    }
    
    private Long safeLongConvert(Object value) {
        if (value == null) return null;
        if (value instanceof Number) return ((Number) value).longValue();
        try {
            return Long.parseLong(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }
    
    private Integer safeIntegerConvert(Object value) {
        if (value == null) return null;
        if (value instanceof Number) return ((Number) value).intValue();
        try {
            return Integer.parseInt(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }
    
    private Boolean safeBooleanConvert(Object value) {
        if (value == null) return null;
        if (value instanceof Boolean) return (Boolean) value;
        return Boolean.parseBoolean(value.toString());
    }
    
    private LocalDateTime safeLocalDateTimeConvert(Object value) {
        if (value == null) return null;
        if (value instanceof LocalDateTime) return (LocalDateTime) value;
        // Add more conversion logic if needed based on the actual format
        return null;
    }
}
