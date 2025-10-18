package com.pdh.flight.mapper;


import com.pdh.flight.constant.ImageTypes;
import com.pdh.flight.dto.request.AirportRequestDto;
import com.pdh.flight.dto.response.AirportDto;
import com.pdh.flight.model.Airport;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Mapper for converting between Airport entity and DTOs
 * Handles data transformations and media integration
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AirportMapper {



    /**
     * Convert Airport entity to AirportDto (basic response)
     */
    public AirportDto toDto(Airport airport) {
        if (airport == null) {
            return null;
        }

        return AirportDto.builder()
                .airportId(airport.getAirportId())
                .name(airport.getName())
                .iataCode(airport.getIataCode())
                .city(airport.getCity())
                .country(airport.getCountry())
                .latitude(airport.getLatitude())
                .longitude(airport.getLongitude())
                .isActive(airport.getIsActive())
                .featuredMediaUrl(airport.getFeaturedMediaUrl()) // Map the media URL directly
                .createdAt(convertToLocalDateTime(airport.getCreatedAt()))
                .createdBy(airport.getCreatedBy())
                .updatedAt(convertToLocalDateTime(airport.getUpdatedAt()))
                .updatedBy(airport.getUpdatedBy())
                .status(airport.getIsActive() ? "ACTIVE" : "INACTIVE")
                .build();
    }

    /**
     * Convert Airport entity to AirportDto with media and statistics
     */
    public AirportDto toDtoWithMediaAndStats(Airport airport, Long totalDepartureFlights, Long totalArrivalFlights, 
                                           Long activeDepartureFlights, Long activeArrivalFlights) {
        if (airport == null) {
            return null;
        }

        AirportDto dto = toDto(airport);
        
        // Add statistics
        dto.setTotalDepartureFlights(totalDepartureFlights);
        dto.setTotalArrivalFlights(totalArrivalFlights);
        dto.setActiveDepartureFlights(activeDepartureFlights);
        dto.setActiveArrivalFlights(activeArrivalFlights);
        
        // Media is now handled in the entity - we'll set it from the featured media URL
        // In the future, if full media lists are needed, they should be loaded separately
        // For now, we'll just return an empty list as the media handling has changed
        dto.setImages(Collections.emptyList());

        return dto;
    }

    /**
     * Convert list of Airports to list of AirportDtos
     */
    public List<AirportDto> toDtoList(List<Airport> airports) {
        if (airports == null) {
            return Collections.emptyList();
        }
        
        return airports.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Convert Airports to DTOs with media (batch fetch for performance)
     */
    public List<AirportDto> toDtoListWithMedia(List<Airport> airports) {
        if (airports == null || airports.isEmpty()) {
            return Collections.emptyList();
        }

        // Convert to DTOs - media is no longer fetched through the media service client
        // In the future, if full media lists are needed, they should be loaded separately
        return airports.stream()
                .map(airport -> {
                    AirportDto dto = toDto(airport);
                    // Set empty list for now since media handling has changed
                    dto.setImages(Collections.emptyList());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    /**
     * Convert Airport to simple response format (for autocomplete/search)
     */
    public Map<String, Object> toSimpleResponse(Airport airport) {
        if (airport == null) {
            return Collections.emptyMap();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("id", airport.getAirportId());
        response.put("name", airport.getName());
        response.put("iataCode", airport.getIataCode());
        response.put("city", airport.getCity());
        response.put("country", airport.getCountry());
        response.put("label", airport.getIataCode() + " - " + airport.getName() + " (" + airport.getCity() + ")");
        return response;
    }

    /**
     * Convert list of Airports to simple response list
     */
    public List<Map<String, Object>> toSimpleResponseList(List<Airport> airports) {
        if (airports == null) {
            return Collections.emptyList();
        }
        
        return airports.stream()
                .map(this::toSimpleResponse)
                .collect(Collectors.toList());
    }

    /**
     * Update Airport entity from AirportRequestDto
     */
    public void updateEntityFromRequest(Airport airport, AirportRequestDto requestDto) {
        if (airport == null || requestDto == null) {
            return;
        }
        
        if (StringUtils.hasText(requestDto.getName())) {
            airport.setName(requestDto.getName());
        }
        
        if (StringUtils.hasText(requestDto.getIataCode())) {
            airport.setIataCode(requestDto.getIataCode().toUpperCase());
        }
        
        if (StringUtils.hasText(requestDto.getCity())) {
            airport.setCity(requestDto.getCity());
        }
        
        if (StringUtils.hasText(requestDto.getCountry())) {
            airport.setCountry(requestDto.getCountry());
        }
        
        if (requestDto.getLatitude() != null) {
            airport.setLatitude(requestDto.getLatitude());
        }
        
        if (requestDto.getLongitude() != null) {
            airport.setLongitude(requestDto.getLongitude());
        }
        
        if (requestDto.getFeaturedMediaUrl() != null) {
            airport.setFeaturedMediaUrl(requestDto.getFeaturedMediaUrl());
        }
    }

    /**
     * Create new Airport entity from AirportRequestDto
     */
    public Airport toEntity(AirportRequestDto requestDto) {
        if (requestDto == null) {
            return null;
        }
        
        Airport airport = new Airport();
        airport.setName(requestDto.getName());
        airport.setIataCode(requestDto.getIataCode().toUpperCase());
        airport.setCity(requestDto.getCity());
        airport.setCountry(requestDto.getCountry());
        airport.setLatitude(requestDto.getLatitude());
        airport.setLongitude(requestDto.getLongitude());
        airport.setIsActive(true);
        airport.setFeaturedMediaUrl(requestDto.getFeaturedMediaUrl());
        
        return airport;
    }

    /**
     * Helper method to convert ZonedDateTime to LocalDateTime
     */
    private LocalDateTime convertToLocalDateTime(ZonedDateTime zonedDateTime) {
        return zonedDateTime != null ? zonedDateTime.toLocalDateTime() : null;
    }
}
