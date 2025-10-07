package com.pdh.hotel.mapper;

import com.pdh.common.dto.response.MediaResponse;
import com.pdh.hotel.dto.request.HotelRequestDto;
import com.pdh.hotel.dto.response.HotelResponseDto;
import com.pdh.hotel.dto.response.MediaInfo;
import com.pdh.hotel.dto.response.RoomTypeResponseDto;
import com.pdh.hotel.model.Hotel;
import com.pdh.hotel.model.HotelImage;
import com.pdh.hotel.repository.HotelImageRepository;
import com.pdh.hotel.service.AmenityService;
import com.pdh.hotel.service.HotelInventoryService;
import com.pdh.hotel.service.ImageService;
import com.pdh.hotel.service.RoomTypeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Mapper for converting between Hotel entity and DTOs
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class HotelMapper {

    private static final double DEFAULT_PRICE = 500000.0;

    private final HotelImageRepository hotelImageRepository;
    private final RoomTypeService roomTypeService;
    private final AmenityService amenityService;
    private final ImageService imageService;
    private final HotelInventoryService hotelInventoryService;

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

        try {
            dtos.forEach(dto -> {
                List<HotelImage> hotelImages = hotelImageRepository.findByHotelId(dto.getId());
                setMediaFromHotelImages(dto, hotelImages);
            });
        } catch (Exception e) {
            log.error("Failed to fetch media for hotels: {}", e.getMessage());
            dtos.forEach(this::setDefaultMediaValues);
        }

        return dtos;
    }

    /**
     * Convert Hotel entity to storefront search response format
     */
    public Map<String, Object> toStorefrontSearchResponse(Hotel hotel, LocalDate checkIn, LocalDate checkOut, int guests, int rooms) {
        if (hotel == null) {
            return Map.of();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("hotelId", hotel.getHotelId() != null ? hotel.getHotelId().toString() : "unknown");
        response.put("name", hotel.getName() != null ? hotel.getName() : "Unknown Hotel");
        response.put("address", hotel.getAddress() != null ? hotel.getAddress() : "");
        response.put("city", hotel.getCity() != null ? hotel.getCity() : "");
        response.put("country", hotel.getCountry() != null ? hotel.getCountry() : "");
        response.put("rating", hotel.getStarRating() != null ? hotel.getStarRating().intValue() : 3);

        List<RoomTypeResponseDto> roomTypes = fetchRoomTypes(hotel.getHotelId());
        double minPrice = resolveMinPrice(roomTypes);
        if (minPrice <= 0) {
            minPrice = DEFAULT_PRICE;
        }

        response.put("pricePerNight", minPrice);
        response.put("currency", "VND");
        response.put("availableRooms", buildRoomTypeAvailability(hotel, roomTypes, checkIn, checkOut, rooms, minPrice));
        response.put("amenities", getRealHotelAmenities());

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

        LocalDate today = LocalDate.now();
        LocalDate tomorrow = today.plusDays(1);

        List<RoomTypeResponseDto> roomTypes = fetchRoomTypes(hotel.getHotelId());
        double minPrice = resolveMinPrice(roomTypes);
        if (minPrice <= 0) {
            minPrice = DEFAULT_PRICE;
        }

        response.put("pricePerNight", minPrice);
        response.put("currency", "VND");
        response.put("availableRooms", buildRoomTypeAvailability(hotel, roomTypes, today, tomorrow, 1, minPrice));
        response.put("roomTypes", getRealRoomTypes(hotel, roomTypes, minPrice));
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

    private List<RoomTypeResponseDto> fetchRoomTypes(Long hotelId) {
        try {
            return roomTypeService.getRoomTypesByHotel(hotelId);
        } catch (Exception e) {
            log.warn("Failed to load room types for hotel {}: {}", hotelId, e.getMessage());
            return List.of();
        }
    }

    private double resolveMinPrice(List<RoomTypeResponseDto> roomTypes) {
        return roomTypes.stream()
            .map(RoomTypeResponseDto::getBasePrice)
            .filter(Objects::nonNull)
            .mapToDouble(BigDecimal::doubleValue)
            .min()
            .orElse(0.0);
    }

    private List<Map<String, Object>> buildRoomTypeAvailability(Hotel hotel,
                                                                List<RoomTypeResponseDto> roomTypes,
                                                                LocalDate checkIn,
                                                                LocalDate checkOut,
                                                                int roomsRequested,
                                                                double fallbackPrice) {
        if (roomTypes == null || roomTypes.isEmpty()) {
            return List.of();
        }

        return roomTypes.stream()
            .map(roomType -> mapRoomTypeToAvailableRoom(hotel, roomType, checkIn, checkOut, roomsRequested, fallbackPrice))
            .collect(Collectors.toList());
    }

    private Map<String, Object> mapRoomTypeToAvailableRoom(Hotel hotel,
                                                           RoomTypeResponseDto roomType,
                                                           LocalDate checkIn,
                                                           LocalDate checkOut,
                                                           int roomsRequested,
                                                           double fallbackPrice) {
        boolean available = true;
        if (roomType.getName() != null) {
            try {
                HotelInventoryService.AvailabilitySummary summary = hotelInventoryService.getAvailabilitySummary(
                    hotel.getHotelId(), roomType.getName(), roomsRequested, checkIn, checkOut);
                available = summary.isAvailable();
            } catch (Exception e) {
                log.warn("Unable to compute availability for hotel {} room type {}: {}",
                    hotel.getHotelId(), roomType.getName(), e.getMessage());
            }
        }

        Map<String, Object> roomData = new HashMap<>();
        roomData.put("roomId", roomType.getId() != null ? roomType.getId().toString() : "room-type");
        roomData.put("roomType", roomType.getName());
        roomData.put("capacity", roomType.getCapacityAdults() != null ? roomType.getCapacityAdults() : 0);
        roomData.put("pricePerNight", roomType.getBasePrice() != null ? roomType.getBasePrice().doubleValue() : fallbackPrice);
        roomData.put("amenities", List.of());
        roomData.put("available", available);
        return roomData;
    }

    private List<Map<String, Object>> getRealRoomTypes(Hotel hotel,
                                                       List<RoomTypeResponseDto> roomTypes,
                                                       double fallbackPrice) {
        try {
            return roomTypes.stream()
                .map(roomType -> {
                    Map<String, Object> roomTypeMap = new HashMap<>();
                    roomTypeMap.put("id", roomType.getId());
                    roomTypeMap.put("name", roomType.getName());
                    roomTypeMap.put("description", roomType.getDescription());
                    roomTypeMap.put("capacityAdults", roomType.getCapacityAdults());
                    roomTypeMap.put("basePrice", roomType.getBasePrice() != null
                        ? roomType.getBasePrice().doubleValue()
                        : fallbackPrice);
                    roomTypeMap.put("features", List.of("Queen bed", "City view", "25 sqm", "Free WiFi"));
                    roomTypeMap.put("image", roomType.getPrimaryImage() != null
                        ? roomType.getPrimaryImage().getUrl()
                        : "/placeholder.svg?height=200&width=300");
                    return roomTypeMap;
                })
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.warn("Failed to get room type data for hotel {}: {}", hotel.getHotelId(), e.getMessage());
            return List.of();
        }
    }

    private List<String> getRealHotelAmenities() {
        try {
            return amenityService.getActiveAmenities().stream()
                .map(dto -> dto.getName())
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.warn("Failed to get real amenity data, falling back to empty list", e);
            return List.of();
        }
    }

    private List<String> getHotelImages(Long hotelId) {
        try {
            List<MediaResponse> mediaList = imageService.getHotelMedia(hotelId);
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
                .filter(Objects::nonNull)
                .filter(url -> !url.isEmpty())
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

    private void setMediaInfo(HotelResponseDto dto, String entityType, Long entityId) {
        try {
            List<HotelImage> hotelImages = hotelImageRepository.findByHotelId(entityId);
            setMediaFromHotelImages(dto, hotelImages);
        } catch (Exception e) {
            log.error("Failed to fetch media for {} {}: {}", entityType, entityId, e.getMessage());
            setDefaultMediaValues(dto);
        }
    }

    private void setMediaFromHotelImages(HotelResponseDto dto, List<HotelImage> hotelImages) {
        if (hotelImages == null || hotelImages.isEmpty()) {
            setDefaultMediaValues(dto);
            return;
        }

        List<MediaInfo> mediaInfos = hotelImages.stream()
            .map(img -> MediaInfo.builder()
                .id(img.getId())
                .publicId(img.getPublicId())
                .url(img.getUrl())
                .secureUrl(img.getUrl())
                .isPrimary(img.isPrimary())
                .build())
            .collect(Collectors.toList());

        dto.setImages(mediaInfos);
        dto.setHasMedia(true);
        dto.setMediaCount(mediaInfos.size());

        dto.setPrimaryImage(mediaInfos.stream()
            .filter(MediaInfo::getIsPrimary)
            .findFirst()
            .orElse(mediaInfos.get(0)));
    }

    private void setDefaultMediaValues(HotelResponseDto dto) {
        dto.setImages(List.of());
        dto.setPrimaryImage(null);
        dto.setHasMedia(false);
        dto.setMediaCount(0);
    }
}
