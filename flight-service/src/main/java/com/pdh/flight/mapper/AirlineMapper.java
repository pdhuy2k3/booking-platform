package com.pdh.flight.mapper;


import com.pdh.flight.constant.ImageTypes;
import com.pdh.flight.dto.request.AirlineRequestDto;
import com.pdh.flight.dto.response.AirlineDto;
import com.pdh.flight.model.Airline;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import java.util.*;
import java.util.stream.Collectors;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;


/**
 * Mapper for converting between Airline entity and DTOs
 * Handles data transformations and media integration
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AirlineMapper {



    /**
     * Convert Airline entity to AirlineDto (basic response)
     */
    public AirlineDto toDto(Airline airline) {
        if (airline == null) {
            return null;
        }

        return AirlineDto.builder()
                .airlineId(airline.getAirlineId())
                .name(airline.getName())
                .iataCode(airline.getIataCode())
                .isActive(airline.getIsActive())
                .featuredMediaUrl(airline.getFeaturedMediaUrl()) // Map the media URL directly
                .createdAt(convertToLocalDateTime(airline.getCreatedAt()))
                .createdBy(airline.getCreatedBy())
                .updatedAt(convertToLocalDateTime(airline.getUpdatedAt()))
                .updatedBy(airline.getUpdatedBy())
                .status(airline.getIsActive() ? "ACTIVE" : "INACTIVE")
                .build();
    }

    /**
     * Convert Airline entity to AirlineDto with media and statistics
     */
    public AirlineDto toDtoWithMediaAndStats(Airline airline, Long totalFlights, Long activeFlights) {
        if (airline == null) {
            return null;
        }

        AirlineDto dto = toDto(airline);
        
        // Add statistics
        dto.setTotalFlights(totalFlights);
        dto.setActiveFlights(activeFlights);
        
        // Media is now handled in the entity - we'll set it from the featured media URL
        // In the future, if full media lists are needed, they should be loaded separately
        // For now, we'll just return an empty list as the media handling has changed
        dto.setImages(Collections.emptyList());

        return dto;
    }

    /**
     * Convert list of Airlines to list of AirlineDtos
     */
    public List<AirlineDto> toDtoList(List<Airline> airlines) {
        if (airlines == null) {
            return Collections.emptyList();
        }
        
        return airlines.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Convert Airlines to DTOs with media (batch fetch for performance)
     */
    public List<AirlineDto> toDtoListWithMedia(List<Airline> airlines) {
        if (airlines == null || airlines.isEmpty()) {
            return Collections.emptyList();
        }

        // Convert to DTOs - media is no longer fetched through the media service client
        // In the future, if full media lists are needed, they should be loaded separately
        return airlines.stream()
                .map(airline -> {
                    AirlineDto dto = toDto(airline);
                    // Set empty list for now since media handling has changed
                    dto.setImages(Collections.emptyList());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    /**
     * Update Airline entity from AirlineRequestDto
     */
    public void updateEntityFromRequest(Airline airline, AirlineRequestDto requestDto) {
        if (airline == null || requestDto == null) {
            return;
        }
        
        if (StringUtils.hasText(requestDto.getName())) {
            airline.setName(requestDto.getName());
        }
        
        if (StringUtils.hasText(requestDto.getCode())) {
            airline.setIataCode(requestDto.getCode().toUpperCase());
        }
        
        if (requestDto.getFeaturedMediaUrl() != null) {
            airline.setFeaturedMediaUrl(requestDto.getFeaturedMediaUrl());
        }
    }

    /**
     * Create new Airline entity from AirlineRequestDto
     */
    public Airline toEntity(AirlineRequestDto requestDto) {
        if (requestDto == null) {
            return null;
        }
        
        Airline airline = new Airline();
        airline.setName(requestDto.getName());
        airline.setIataCode(requestDto.getCode().toUpperCase());
        airline.setIsActive(true);
        airline.setFeaturedMediaUrl(requestDto.getFeaturedMediaUrl());
        
        return airline;
    }

    /**
     * Helper method to convert ZonedDateTime to LocalDateTime
     */
    private LocalDateTime convertToLocalDateTime(ZonedDateTime zonedDateTime) {
        return zonedDateTime != null ? zonedDateTime.toLocalDateTime() : null;
    }
}
