package com.pdh.hotel.mapper;

import com.pdh.hotel.dto.request.AmenityRequestDto;
import com.pdh.hotel.dto.response.AmenityResponseDto;
import com.pdh.hotel.model.Amenity;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Mapper for converting between Amenity entity and DTOs
 */
@Component
public class AmenityMapper {
    
    /**
     * Convert AmenityRequestDto to Amenity entity
     */
    public Amenity toEntity(AmenityRequestDto dto) {
        if (dto == null) {
            return null;
        }
        
        Amenity amenity = new Amenity();
        amenity.setName(dto.getName());
        amenity.setIconUrl(dto.getIconUrl());
        amenity.setIsActive(dto.getIsActive());
        amenity.setDisplayOrder(dto.getDisplayOrder());
        
        return amenity;
    }
    
    /**
     * Update existing Amenity entity from AmenityRequestDto
     */
    public void updateEntity(Amenity amenity, AmenityRequestDto dto) {
        if (amenity == null || dto == null) {
            return;
        }
        
        amenity.setName(dto.getName());
        amenity.setIconUrl(dto.getIconUrl());
        amenity.setIsActive(dto.getIsActive());
        amenity.setDisplayOrder(dto.getDisplayOrder());
    }
    
    /**
     * Convert Amenity entity to AmenityResponseDto
     */
    public AmenityResponseDto toResponseDto(Amenity amenity) {
        if (amenity == null) {
            return null;
        }
        
        return AmenityResponseDto.builder()
                .id(amenity.getAmenityId())
                .name(amenity.getName())
                .iconUrl(amenity.getIconUrl())
                .isActive(amenity.getIsActive())
                .displayOrder(amenity.getDisplayOrder())
                .images(Collections.emptyList()) // Currently amenities use iconUrl, not image collections
                .createdAt(amenity.getCreatedAt())
                .updatedAt(amenity.getUpdatedAt())
                .build();
    }
    
    /**
     * Convert list of Amenity entities to list of AmenityResponseDto
     */
    public List<AmenityResponseDto> toResponseDtoList(List<Amenity> amenities) {
        if (amenities == null) {
            return null;
        }
        
        return amenities.stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }
}
