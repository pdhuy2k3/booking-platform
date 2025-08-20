package com.pdh.hotel.mapper;

import com.pdh.hotel.dto.request.HotelRequestDto;
import com.pdh.hotel.dto.response.HotelResponseDto;
import com.pdh.hotel.model.Hotel;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper for converting between Hotel entity and DTOs
 */
@Component
public class HotelMapper {
    
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
     * Convert Hotel entity to HotelResponseDto
     */
    public HotelResponseDto toResponseDto(Hotel hotel) {
        if (hotel == null) {
            return null;
        }
        
        return HotelResponseDto.builder()
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
    }
    
    /**
     * Convert list of Hotel entities to list of HotelResponseDto
     */
    public List<HotelResponseDto> toResponseDtoList(List<Hotel> hotels) {
        if (hotels == null) {
            return null;
        }
        
        return hotels.stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }
}
