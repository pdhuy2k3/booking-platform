package com.pdh.flight.mapper;

import com.pdh.flight.client.MediaServiceClient;
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

    private final MediaServiceClient mediaServiceClient;

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
        
        // Fetch and set media
        try {
            List<Map<String, Object>> mediaList = mediaServiceClient.getMediaByEntity(
                    ImageTypes.ENTITY_TYPE_AIRPORT, 
                    airport.getAirportId()
            );
            
            List<String> imagePublicIds = mediaList.stream()
                    .map(media -> (String) media.get("publicId"))
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
                    
            dto.setImages(imagePublicIds);
        } catch (Exception e) {
            log.warn("Failed to fetch media for airport {}: {}", airport.getAirportId(), e.getMessage());
            dto.setImages(Collections.emptyList());
        }

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

        // Batch fetch media for all airports
        List<Long> airportIds = airports.stream()
                .map(Airport::getAirportId)
                .collect(Collectors.toList());

        Map<Long, List<Map<String, Object>>> mediaMap = Collections.emptyMap();
        try {
            mediaMap = mediaServiceClient.getMediaForEntities(
                    ImageTypes.ENTITY_TYPE_AIRPORT, 
                    airportIds
            );
        } catch (Exception e) {
            log.warn("Failed to batch fetch media for airports: {}", e.getMessage());
        }

        // Convert to DTOs with media
        final Map<Long, List<Map<String, Object>>> finalMediaMap = mediaMap;
        return airports.stream()
                .map(airport -> {
                    AirportDto dto = toDto(airport);
                    
                    // Set media if available
                    List<Map<String, Object>> airportMedia = finalMediaMap.get(airport.getAirportId());
                    if (airportMedia != null) {
                        List<String> imagePublicIds = airportMedia.stream()
                                .map(media -> (String) media.get("publicId"))
                                .filter(Objects::nonNull)
                                .collect(Collectors.toList());
                        dto.setImages(imagePublicIds);
                    } else {
                        dto.setImages(Collections.emptyList());
                    }
                    
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
        
        return airport;
    }

    /**
     * Helper method to convert ZonedDateTime to LocalDateTime
     */
    private LocalDateTime convertToLocalDateTime(ZonedDateTime zonedDateTime) {
        return zonedDateTime != null ? zonedDateTime.toLocalDateTime() : null;
    }
}
