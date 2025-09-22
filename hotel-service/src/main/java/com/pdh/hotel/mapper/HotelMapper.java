package com.pdh.hotel.mapper;

import com.pdh.hotel.dto.request.HotelRequestDto;
import com.pdh.hotel.dto.response.HotelResponseDto;
import com.pdh.hotel.dto.response.MediaInfo;
import com.pdh.hotel.dto.response.RoomResponseDto;
import com.pdh.hotel.dto.response.RoomTypeResponseDto;
import com.pdh.hotel.model.Hotel;
import com.pdh.hotel.model.HotelImage;
import com.pdh.hotel.repository.HotelImageRepository;
import com.pdh.hotel.service.AmenityService;
import com.pdh.hotel.service.ImageService;
import com.pdh.hotel.service.RoomService;
import com.pdh.hotel.service.RoomTypeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

/**
 * Mapper for converting between Hotel entity and DTOs
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class HotelMapper {
    
    private final HotelImageRepository hotelImageRepository;
    private final RoomService roomService;
    private final RoomTypeService roomTypeService;
    private final AmenityService amenityService;
    private final ImageService imageService;
    
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
        try {
            // Get hotel-media associations and set media information
            dtos.forEach(dto -> {
                List<HotelImage> hotelImages = hotelImageRepository.findByHotelId(dto.getId());
                setMediaFromHotelImages(dto, hotelImages);
            });
        } catch (Exception e) {
            log.error("Failed to fetch media for hotels: {}", e.getMessage());
            // Set default values for all DTOs
            dtos.forEach(dto -> setDefaultMediaValues(dto));
        }
        
        return dtos;
    }
    
    // === STOREFRONT RESPONSE METHODS ===
    
    /**
     * Convert Hotel entity to storefront search response format
     */
    public Map<String, Object> toStorefrontSearchResponse(Hotel hotel, LocalDate checkIn, LocalDate checkOut, int guests, int rooms) {
        Map<String, Object> response = new HashMap<>();
        response.put("hotelId", hotel.getHotelId().toString());
        response.put("name", hotel.getName() != null ? hotel.getName() : "Unknown Hotel");
        response.put("address", hotel.getAddress() != null ? hotel.getAddress() : "");
        response.put("city", hotel.getCity() != null ? hotel.getCity() : "");
        response.put("country", hotel.getCountry() != null ? hotel.getCountry() : "");
        response.put("rating", hotel.getStarRating() != null ? hotel.getStarRating().intValue() : 3);
        response.put("pricePerNight", getMinPriceOfHotel(hotel.getHotelId()));
        response.put("currency", "VND");
        
        // Get images via ImageService - return complete media responses for frontend
        List<String> images = getHotelImages(hotel.getHotelId());
        response.put("images", images);
        response.put("primaryImage", images.isEmpty() ? null : images.get(0));
        
        return response;
    }
    
    /**
     * Convert Hotel entity to detailed storefront response format
     */
    public Map<String, Object> toStorefrontDetailedResponse(Hotel hotel) {
        Map<String, Object> response = new HashMap<>();
        response.put("hotelId", hotel.getHotelId().toString());
        response.put("name", hotel.getName() != null ? hotel.getName() : "Unknown Hotel");
        response.put("address", hotel.getAddress() != null ? hotel.getAddress() : "");
        response.put("city", hotel.getCity() != null ? hotel.getCity() : "");
        response.put("country", hotel.getCountry() != null ? hotel.getCountry() : "");
        response.put("rating", hotel.getStarRating() != null ? hotel.getStarRating().intValue() : 3);
        response.put("description", hotel.getDescription() != null ? hotel.getDescription() : "");
        response.put("pricePerNight", getMinPriceOfHotel(hotel.getHotelId()));
        response.put("currency", "VND");
        response.put("availableRooms", getRealAvailableRooms(hotel));
        response.put("roomTypes", getRealRoomTypes(hotel));
        response.put("amenities", getRealHotelAmenities());
        
        List<String> images = getHotelImages(hotel.getHotelId());
        response.put("images", images);
        response.put("primaryImage", images.isEmpty() ? null : images.get(0));
        
        response.put("checkInTime", "14:00");
        response.put("checkOutTime", "12:00");
        response.put("policies", Map.of(
            "cancellation", "Free cancellation up to 24 hours before check-in",
            "children", "Children are welcome",
            "pets", "Pets not allowed",
            "smoking", "Non-smoking property"
        ));
        
        return response;
    }
    

    private BigDecimal getMinPriceOfHotel(Long hotelId) {

        return roomService.calculateMinRoomPerNightByHotel(hotelId);
    }
    
    /**
     * Get real available rooms from room service
     */
    private List<Map<String, Object>> getRealAvailableRooms(Hotel hotel) {
        try {
            // Get rooms for this hotel using room service
            Page<RoomResponseDto> roomsPage = roomService.getRoomsByHotel(hotel.getHotelId(), PageRequest.of(0, 20));
            
            return roomsPage.getContent().stream()
                .map(room -> {
                    Map<String, Object> roomMap = new HashMap<>();
                    roomMap.put("roomId", room.getId());
                    roomMap.put("roomNumber", room.getRoomNumber());
                    roomMap.put("roomType", room.getRoomType() != null ? room.getRoomType().getName() : "Standard Room");
                    roomMap.put("capacity", room.getMaxOccupancy() != null ? room.getMaxOccupancy() : 2);
                    roomMap.put("pricePerNight", room.getPrice() != null ? room.getPrice().longValue() : getMinPriceOfHotel(hotel.getHotelId()));
                    roomMap.put("amenities", room.getAmenities() != null ? 
                        room.getAmenities().stream().map(amenity -> amenity.getName()).collect(Collectors.toList()) : 
                        List.of("WiFi", "Air Conditioning", "TV"));
                    roomMap.put("available", room.getIsAvailable() != null ? room.getIsAvailable() : true);
                    return roomMap;
                })
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.warn("Failed to get real room data for hotel {}, falling back to fallback room data", hotel.getHotelId(), e);
            return List.of();
        }
    }
    
    /**
     * Get real room types from room type service
     */
    private List<Map<String, Object>> getRealRoomTypes(Hotel hotel) {
        try {
            // Get room types for this hotel using room type service
            List<RoomTypeResponseDto> roomTypes = roomTypeService.getRoomTypesByHotel(hotel.getHotelId());
            
            return roomTypes.stream()
                .map(roomType -> {
                    Map<String, Object> roomTypeMap = new HashMap<>();
                    roomTypeMap.put("id", roomType.getId());
                    roomTypeMap.put("name", roomType.getName());
                    roomTypeMap.put("description", roomType.getDescription());
                    roomTypeMap.put("capacityAdults", roomType.getCapacityAdults());
                    roomTypeMap.put("basePrice", roomType.getBasePrice() != null ? roomType.getBasePrice().longValue() : getMinPriceOfHotel(hotel.getHotelId()));
                    roomTypeMap.put("features", List.of("Queen bed", "City view", "25 sqm", "Free WiFi")); // Default features
                    roomTypeMap.put("image", roomType.getPrimaryImage() != null ? roomType.getPrimaryImage().getUrl() : "/placeholder.svg?height=200&width=300");
                    return roomTypeMap;
                })
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.warn("Failed to get real room type data for hotel {}, falling back to fallback room type data", hotel.getHotelId(), e);
            return List.of();
        }
    }
    
    /**
     * Get real hotel amenities from amenity service
     */
    private List<String> getRealHotelAmenities() {
        try {
            // Get all active amenities
            List<com.pdh.hotel.dto.response.AmenityResponseDto> amenities = amenityService.getActiveAmenities();
            
            return amenities.stream()
                .map(com.pdh.hotel.dto.response.AmenityResponseDto::getName)
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.warn("Failed to get real amenity data, falling back to fallback amenities", e);
            return List.of();
        }
    }
    
    /**
     * Get hotel images from image service
     */
    private List<String> getHotelImages(Long hotelId) {
        try {
            List<com.pdh.common.dto.response.MediaResponse> mediaList = imageService.getHotelMedia(hotelId);
            if (mediaList == null || mediaList.isEmpty()) {
                return List.of("/hotel-" + hotelId + ".jpg");
            }
            List<String> imageUrls = mediaList.stream()
                .sorted((a, b) -> {
                    if (Boolean.TRUE.equals(a.getIsPrimary()) && !Boolean.TRUE.equals(b.getIsPrimary())) {
                        return -1;
                    }
                    if (!Boolean.TRUE.equals(a.getIsPrimary()) && Boolean.TRUE.equals(b.getIsPrimary())) {
                        return 1;
                    }
                    return Integer.compare(
                        a.getDisplayOrder() != null ? a.getDisplayOrder() : 0,
                        b.getDisplayOrder() != null ? b.getDisplayOrder() : 0
                    );
                })
                .map(media -> media.getSecureUrl() != null ? media.getSecureUrl() : media.getUrl())
                .filter(url -> url != null && !url.isEmpty())
                .collect(Collectors.toList());
            if (imageUrls.isEmpty()) {
                return List.of("/hotel-" + hotelId + ".jpg");
            }
            return imageUrls;
        } catch (Exception e) {
            log.warn("Failed to get hotel images for hotel {}, falling back to mock image", hotelId, e);
            return List.of("/hotel-" + hotelId + ".jpg");
        }
    }
    
    /**
     * Create fallback room data when real data is unavailable
     */
//    private List<Map<String, Object>> createFallbackRooms(Hotel hotel) {
//        return List.of(
//            Map.of(
//                "roomId", "fallback-1",
//                "roomNumber", "101",
//                "roomType", "Standard Room",
//                "capacity", 2,
//                "pricePerNight", getMinPriceOfHotel(),
//                "amenities", List.of("WiFi", "Air Conditioning", "TV"),
//                "available", true
//            ),
//            Map.of(
//                "roomId", "fallback-2",
//                "roomNumber", "102",
//                "roomType", "Deluxe Room",
//                "capacity", 3,
//                "pricePerNight", getMinPriceOfHotel(hotel.getHotelId()) + 500000,
//                "amenities", List.of("WiFi", "Air Conditioning", "TV", "Mini Bar"),
//                "available", true
//            )
//        );
//    }
    
    /**
     * Create fallback room type data when real data is unavailable
     */
//    private List<Map<String, Object>> createFallbackRoomTypes(Hotel hotel) {
//        return List.of(
//            Map.of(
//                "id", "fallback-standard",
//                "name", "Standard Room",
//                "description", "Comfortable standard room with city view",
//                "capacityAdults", 2,
//                "basePrice", getMinPriceOfHotel(),
//                "features", List.of("Queen bed", "City view", "25 sqm", "Free WiFi"),
//                "image", "/placeholder.svg?height=200&width=300"
//            ),
//            Map.of(
//                "id", "fallback-deluxe",
//                "name", "Deluxe Room",
//                "description", "Spacious deluxe room with balcony",
//                "capacityAdults", 3,
//                "basePrice", getMinPriceOfHotel() + 500000,
//                "features", List.of("King bed", "Balcony", "35 sqm", "Mini bar", "Free WiFi"),
//                "image", "/placeholder.svg?height=200&width=300"
//            ),
//            Map.of(
//                "id", "fallback-suite",
//                "name", "Executive Suite",
//                "description", "Luxurious suite with separate living area",
//                "capacityAdults", 4,
//                "basePrice", getMinPriceOfHotel() + 1200000,
//                "features", List.of("King bed", "Separate living area", "50 sqm", "City view", "Mini bar", "Free WiFi"),
//                "image", "/placeholder.svg?height=200&width=300"
//            )
//        );
//    }
//
//    /**
//     * Create fallback amenities when real data is unavailable
//     */
//    private List<String> createFallbackAmenities() {
//        return List.of(
//            "Free WiFi", "Parking", "Restaurant", "Fitness Center", "Swimming Pool",
//            "Business Center", "Concierge", "Room Service", "Laundry Service", "Airport Shuttle"
//        );
//    }
//
    /**
     * Helper method to fetch and set media information for a single hotel
     */
    private void setMediaInfo(HotelResponseDto dto, String entityType, Long entityId) {
        try {
            List<HotelImage> hotelImages = hotelImageRepository.findByHotelId(entityId);
            setMediaFromHotelImages(dto, hotelImages);
        } catch (Exception e) {
            log.error("Failed to fetch media for {} {}: {}", entityType, entityId, e.getMessage());
            setDefaultMediaValues(dto);
        }
    }

    /**
     * Helper method to set media information from hotel images
     */
    private void setMediaFromHotelImages(HotelResponseDto dto, List<HotelImage> hotelImages) {
        if (hotelImages == null || hotelImages.isEmpty()) {
            setDefaultMediaValues(dto);
            return;
        }
        
        // For now, create basic MediaInfo objects with just mediaId
        // This will need to be enhanced to fetch full media details from media service
        List<MediaInfo> mediaInfoList = hotelImages.stream()
                .map(hotelImage -> MediaInfo.builder()
                        .id(hotelImage.getMediaId())
                        .build())
                .collect(Collectors.toList());
        
        dto.setImages(mediaInfoList);
        dto.setHasMedia(true);
        dto.setMediaCount(mediaInfoList.size());
        
        // Set first image as primary for now
        MediaInfo primaryImage = mediaInfoList.isEmpty() ? null : mediaInfoList.get(0);
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
