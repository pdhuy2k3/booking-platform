package com.pdh.flight.mapper;


import com.pdh.flight.constant.ImageTypes;
import com.pdh.flight.dto.request.AircraftRequestDto;
import com.pdh.flight.dto.response.AircraftDto;
import com.pdh.flight.model.Aircraft;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Mapper for converting between Aircraft entity and DTOs
 * Handles data transformations and media integration
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AircraftMapper {



    /**
     * Convert Aircraft entity to AircraftDto (basic response)
     */
    public AircraftDto toDto(Aircraft aircraft) {
        if (aircraft == null) {
            return null;
        }

        return AircraftDto.builder()
                .aircraftId(aircraft.getAircraftId())
                .model(aircraft.getModel())
                .manufacturer(aircraft.getManufacturer())
                .capacityEconomy(aircraft.getCapacityEconomy())
                .capacityBusiness(aircraft.getCapacityBusiness())
                .capacityFirst(aircraft.getCapacityFirst())
                .totalCapacity(aircraft.getTotalCapacity())
                .registrationNumber(aircraft.getRegistrationNumber())
                .isActive(aircraft.getIsActive())
                .featuredMediaUrl(aircraft.getFeaturedMediaUrl()) // Map the media URL directly
                .createdAt(convertToLocalDateTime(aircraft.getCreatedAt()))
                .createdBy(aircraft.getCreatedBy())
                .updatedAt(convertToLocalDateTime(aircraft.getUpdatedAt()))
                .updatedBy(aircraft.getUpdatedBy())
                .status(aircraft.getIsActive() ? "ACTIVE" : "INACTIVE")
                .build();
    }

    /**
     * Convert Aircraft entity to AircraftDto with media
     */
    public AircraftDto toDtoWithMedia(Aircraft aircraft) {
        if (aircraft == null) {
            return null;
        }

        AircraftDto dto = toDto(aircraft);
        
        // Media is now handled in the entity - we'll set it from the featured media URL
        // In the future, if full media lists are needed, they should be loaded separately
        // For now, we'll just return an empty list as the media handling has changed
        dto.setImages(Collections.emptyList());

        return dto;
    }

    /**
     * Convert list of Aircrafts to list of AircraftDtos
     */
    public List<AircraftDto> toDtoList(List<Aircraft> aircrafts) {
        if (aircrafts == null) {
            return Collections.emptyList();
        }
        
        return aircrafts.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Convert Aircrafts to DTOs with media (batch fetch for performance)
     */
    public List<AircraftDto> toDtoListWithMedia(List<Aircraft> aircrafts) {
        if (aircrafts == null || aircrafts.isEmpty()) {
            return Collections.emptyList();
        }

        // Convert to DTOs - media is no longer fetched through the media service client
        // In the future, if full media lists are needed, they should be loaded separately
        return aircrafts.stream()
                .map(aircraft -> {
                    AircraftDto dto = toDto(aircraft);
                    // Set empty list for now since media handling has changed
                    dto.setImages(Collections.emptyList());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    /**
     * Update Aircraft entity from AircraftRequestDto
     */
    public void updateEntityFromRequest(Aircraft aircraft, AircraftRequestDto requestDto) {
        if (aircraft == null || requestDto == null) {
            return;
        }
        
        if (StringUtils.hasText(requestDto.getModel())) {
            aircraft.setModel(requestDto.getModel());
        }
        
        if (StringUtils.hasText(requestDto.getManufacturer())) {
            aircraft.setManufacturer(requestDto.getManufacturer());
        }
        
        if (requestDto.getCapacityEconomy() != null) {
            aircraft.setCapacityEconomy(requestDto.getCapacityEconomy());
        }
        
        if (requestDto.getCapacityBusiness() != null) {
            aircraft.setCapacityBusiness(requestDto.getCapacityBusiness());
        }
        
        if (requestDto.getCapacityFirst() != null) {
            aircraft.setCapacityFirst(requestDto.getCapacityFirst());
        }
        
        if (requestDto.getTotalCapacity() != null) {
            aircraft.setTotalCapacity(requestDto.getTotalCapacity());
        }
        
        if (StringUtils.hasText(requestDto.getRegistrationNumber())) {
            aircraft.setRegistrationNumber(requestDto.getRegistrationNumber());
        }
        
        if (requestDto.getFeaturedMediaUrl() != null) {
            aircraft.setFeaturedMediaUrl(requestDto.getFeaturedMediaUrl());
        }
    }

    /**
     * Create new Aircraft entity from AircraftRequestDto
     */
    public Aircraft toEntity(AircraftRequestDto requestDto) {
        if (requestDto == null) {
            return null;
        }
        
        Aircraft aircraft = new Aircraft();
        aircraft.setModel(requestDto.getModel());
        aircraft.setManufacturer(requestDto.getManufacturer());
        aircraft.setCapacityEconomy(requestDto.getCapacityEconomy());
        aircraft.setCapacityBusiness(requestDto.getCapacityBusiness());
        aircraft.setCapacityFirst(requestDto.getCapacityFirst());
        aircraft.setTotalCapacity(requestDto.getTotalCapacity());
        aircraft.setRegistrationNumber(requestDto.getRegistrationNumber());
        aircraft.setIsActive(true);
        aircraft.setFeaturedMediaUrl(requestDto.getFeaturedMediaUrl());
        
        return aircraft;
    }

    /**
     * Helper method to convert ZonedDateTime to LocalDateTime
     */
    private LocalDateTime convertToLocalDateTime(ZonedDateTime zonedDateTime) {
        return zonedDateTime != null ? zonedDateTime.toLocalDateTime() : null;
    }
}