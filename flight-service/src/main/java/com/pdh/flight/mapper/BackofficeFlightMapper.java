package com.pdh.flight.mapper;

import com.pdh.flight.client.MediaServiceClient;
import com.pdh.flight.dto.response.FlightDto;
import com.pdh.flight.dto.response.FlightScheduleDto;
import com.pdh.flight.dto.response.FlightFareDto;
import com.pdh.flight.dto.response.MediaInfo;
import com.pdh.flight.model.Airline;
import com.pdh.flight.model.Airport;
import com.pdh.flight.model.Flight;
import com.pdh.flight.service.FlightScheduleService;
import com.pdh.flight.service.FlightFareService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Mapper for converting Flight entities to FlightDto for backoffice operations
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class BackofficeFlightMapper {

    private final MediaServiceClient mediaServiceClient;
    private final FlightScheduleService flightScheduleService;

    private final FlightFareService flightFareService;

    /**
     * Convert Flight entity to FlightDto with media information (includes schedules - use with caution for circular refs)
     */
    public FlightDto toDto(Flight flight) {
        if (flight == null) {
            return null;
        }

        FlightDto.FlightDtoBuilder builder = FlightDto.builder()
                .flightId(flight.getFlightId())
                .flightNumber(flight.getFlightNumber())
                .baseDurationMinutes(flight.getBaseDurationMinutes())
                .aircraftType(flight.getAircraftType())
                .status(flight.getStatus())
                .basePrice(flight.getBasePrice())
                .isActive(flight.getIsActive())
                .createdAt(convertToLocalDateTime(flight.getCreatedAt()))
                .updatedAt(convertToLocalDateTime(flight.getUpdatedAt()))
                .createdBy(flight.getCreatedBy())
                .updatedBy(flight.getUpdatedBy());

        // Map airline information
        if (flight.getAirline() != null) {
            Airline airline = flight.getAirline();
            builder.airlineId(airline.getAirlineId())
                   .airlineName(airline.getName())
                   .airlineIataCode(airline.getIataCode());
        }

        // Map departure airport information
        if (flight.getDepartureAirport() != null) {
            Airport departure = flight.getDepartureAirport();
            builder.departureAirportId(departure.getAirportId())
                   .departureAirportName(departure.getName())
                   .departureAirportIataCode(departure.getIataCode())
                   .departureAirportCity(departure.getCity())
                   .departureAirportCountry(departure.getCountry());
        }

        // Map arrival airport information
        if (flight.getArrivalAirport() != null) {
            Airport arrival = flight.getArrivalAirport();
            builder.arrivalAirportId(arrival.getAirportId())
                   .arrivalAirportName(arrival.getName())
                   .arrivalAirportIataCode(arrival.getIataCode())
                   .arrivalAirportCity(arrival.getCity())
                   .arrivalAirportCountry(arrival.getCountry());
        }

        FlightDto flightDto = builder.build();
        
        // Fetch and include schedule, leg, and fare information
        if (flight.getFlightId() != null) {
            Long flightId = flight.getFlightId();
            
            try {
                // Fetch schedules for this flight
                List<FlightScheduleDto> schedules = flightScheduleService.getSchedulesByFlightId(flightId);
                flightDto.setSchedules(schedules);
                

                
                // Fetch fares for all schedules of this flight
                if (!schedules.isEmpty()) {
                    List<UUID> scheduleIds = schedules.stream()
                            .map(FlightScheduleDto::getScheduleId)
                            .collect(Collectors.toList());
                    
                    Map<UUID, List<FlightFareDto>> fareMap = flightFareService.getFaresByScheduleIds(scheduleIds);
                    
                    // Flatten all fares into a single list
                    List<FlightFareDto> allFares = fareMap.values().stream()
                            .flatMap(List::stream)
                            .collect(Collectors.toList());
                    
                    flightDto.setFares(allFares);
                } else {
                    flightDto.setFares(List.of());
                }
                
            } catch (Exception e) {
                log.warn("Failed to fetch schedule/leg/fare data for flight {}: {}", flightId, e.getMessage());
                flightDto.setSchedules(List.of());
                flightDto.setFares(List.of());
            }
        }
        
        return addMediaInformation(flightDto, flight);
    }

    /**
     * Convert Flight entity to lightweight FlightDto WITHOUT schedules (prevents circular references)
     */
    public FlightDto toLightweightDto(Flight flight) {
        if (flight == null) {
            return null;
        }

        FlightDto.FlightDtoBuilder builder = FlightDto.builder()
                .flightId(flight.getFlightId())
                .flightNumber(flight.getFlightNumber())
                .baseDurationMinutes(flight.getBaseDurationMinutes())
                .aircraftType(flight.getAircraftType())
                .status(flight.getStatus())
                .basePrice(flight.getBasePrice())
                .isActive(flight.getIsActive())
                .createdAt(convertToLocalDateTime(flight.getCreatedAt()))
                .updatedAt(convertToLocalDateTime(flight.getUpdatedAt()))
                .createdBy(flight.getCreatedBy())
                .updatedBy(flight.getUpdatedBy());

        // Map airline information
        if (flight.getAirline() != null) {
            Airline airline = flight.getAirline();
            builder.airlineId(airline.getAirlineId())
                   .airlineName(airline.getName())
                   .airlineIataCode(airline.getIataCode());
        }

        // Map departure airport information
        if (flight.getDepartureAirport() != null) {
            Airport departure = flight.getDepartureAirport();
            builder.departureAirportId(departure.getAirportId())
                   .departureAirportName(departure.getName())
                   .departureAirportIataCode(departure.getIataCode())
                   .departureAirportCity(departure.getCity())
                   .departureAirportCountry(departure.getCountry());
        }

        // Map arrival airport information
        if (flight.getArrivalAirport() != null) {
            Airport arrival = flight.getArrivalAirport();
            builder.arrivalAirportId(arrival.getAirportId())
                   .arrivalAirportName(arrival.getName())
                   .arrivalAirportIataCode(arrival.getIataCode())
                   .arrivalAirportCity(arrival.getCity())
                   .arrivalAirportCountry(arrival.getCountry());
        }

        // Initialize empty collections to prevent null references
        FlightDto flightDto = builder.schedules(List.of())
                                    .fares(List.of())
                                    .build();
        
        return addMediaInformation(flightDto, flight);
    }
    
    /**
     * Add media information to a FlightDto
     */
    private FlightDto addMediaInformation(FlightDto flightDto, Flight flight) {
        // Always fetch and include media information
        if (flight.getFlightId() != null) {
            try {
                List<Map<String, Object>> mediaList = mediaServiceClient.getMediaByEntity(
                        "FLIGHT",
                        flight.getFlightId()
                );
                
                if (mediaList != null && !mediaList.isEmpty()) {
                    // Convert media maps to MediaInfo objects
                    List<MediaInfo> images = mediaList.stream()
                            .map(this::mapToMediaInfo)
                            .collect(Collectors.toList());
                    
                    flightDto.setImages(images);
                    flightDto.setHasMedia(true);
                    flightDto.setMediaCount((long) images.size());
                    
                    // Set primary image
                    images.stream()
                            .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                            .findFirst()
                            .ifPresent(flightDto::setPrimaryImage);
                } else {
                    flightDto.setImages(List.of());
                    flightDto.setHasMedia(false);
                    flightDto.setMediaCount(0L);
                }
            } catch (Exception e) {
                log.warn("Failed to fetch media for flight {}: {}", flight.getFlightId(), e.getMessage());
                flightDto.setImages(List.of());
                flightDto.setHasMedia(false);
                flightDto.setMediaCount(0L);
            }
        }

        return flightDto;
    }

    /**
     * Convert list of Flight entities to lightweight FlightDto list (no schedules to avoid circular refs)
     */
    public List<FlightDto> toLightweightDtoList(List<Flight> flights) {
        if (flights == null || flights.isEmpty()) {
            return List.of();
        }

        // Convert entities to lightweight DTOs without schedules/fares (to avoid circular references)
        return flights.stream()
                .map(this::toLightweightDto)
                .collect(Collectors.toList());
    }

    /**
     * Convert list of Flight entities to FlightDto list with batch media fetching (includes schedules - avoid for schedule contexts)
     */
    public List<FlightDto> toDtoList(List<Flight> flights) {
        if (flights == null || flights.isEmpty()) {
            return List.of();
        }

        // First, convert entities to DTOs without media (to avoid N+1 problem)
        List<FlightDto> flightDtos = flights.stream()
                .map(this::toDtoWithoutMedia)
                .collect(Collectors.toList());

        // Batch fetch flight media
        List<Long> flightIds = flights.stream()
                .map(Flight::getFlightId)
                .filter(id -> id != null)
                .distinct()
                .collect(Collectors.toList());

        if (!flightIds.isEmpty()) {
            try {
                // Batch fetch schedules for all flights
                Map<Long, List<FlightScheduleDto>> scheduleMap = flightScheduleService.getSchedulesByFlightIds(flightIds);

                
                // Collect all schedule IDs for fare fetching
                List<UUID> allScheduleIds = scheduleMap.values().stream()
                        .flatMap(List::stream)
                        .map(FlightScheduleDto::getScheduleId)
                        .collect(Collectors.toList());
                
                // Batch fetch fares for all schedules
                Map<UUID, List<FlightFareDto>> fareByScheduleMap = Map.of();
                if (!allScheduleIds.isEmpty()) {
                    fareByScheduleMap = flightFareService.getFaresByScheduleIds(allScheduleIds);
                }
                
                // Set schedule, leg, and fare data for each flight
                final Map<UUID, List<FlightFareDto>> finalFareMap = fareByScheduleMap;
                flightDtos.forEach(flightDto -> {
                    Long flightId = flightDto.getFlightId();
                    if (flightId != null) {
                        // Set schedules
                        List<FlightScheduleDto> schedules = scheduleMap.getOrDefault(flightId, List.of());
                        flightDto.setSchedules(schedules);

                        
                        // Set fares for this flight's schedules
                        List<FlightFareDto> flightFares = schedules.stream()
                                .map(FlightScheduleDto::getScheduleId)
                                .map(scheduleId -> finalFareMap.getOrDefault(scheduleId, List.of()))
                                .flatMap(List::stream)
                                .collect(Collectors.toList());
                        flightDto.setFares(flightFares);
                    }
                });
                
                // Batch fetch flight media
                Map<Long, List<Map<String, Object>>> flightMediaMap = mediaServiceClient.getMediaForEntities(
                        "FLIGHT",
                        flightIds
                );

                flightDtos.forEach(flightDto -> {
                    if (flightDto.getFlightId() != null) {
                        List<Map<String, Object>> mediaList = flightMediaMap.get(flightDto.getFlightId());
                        if (mediaList != null && !mediaList.isEmpty()) {
                            // Convert media maps to MediaInfo objects
                            List<MediaInfo> images = mediaList.stream()
                                    .map(this::mapToMediaInfo)
                                    .collect(Collectors.toList());
                            
                            flightDto.setImages(images);
                            flightDto.setHasMedia(true);
                            flightDto.setMediaCount((long) images.size());
                            
                            // Set primary image
                            images.stream()
                                    .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                                    .findFirst()
                                    .ifPresent(flightDto::setPrimaryImage);
                        } else {
                            flightDto.setImages(List.of());
                            flightDto.setHasMedia(false);
                            flightDto.setMediaCount(0L);
                        }
                    }
                });
            } catch (Exception e) {
                log.warn("Failed to batch fetch flight media: {}", e.getMessage());
                // Set default media values for all DTOs
                flightDtos.forEach(dto -> {
                    dto.setImages(List.of());
                    dto.setHasMedia(false);
                    dto.setMediaCount(0L);
                });
            }
        }

        return flightDtos;
    }
    
    /**
     * Convert Flight entity to FlightDto without media (for batch operations)
     */
    private FlightDto toDtoWithoutMedia(Flight flight) {
        if (flight == null) {
            return null;
        }

        FlightDto.FlightDtoBuilder builder = FlightDto.builder()
                .flightId(flight.getFlightId())
                .flightNumber(flight.getFlightNumber())
                .baseDurationMinutes(flight.getBaseDurationMinutes())
                .aircraftType(flight.getAircraftType())
                .status(flight.getStatus())
                .basePrice(flight.getBasePrice())
                .isActive(flight.getIsActive())
                .createdAt(convertToLocalDateTime(flight.getCreatedAt()))
                .updatedAt(convertToLocalDateTime(flight.getUpdatedAt()))
                .createdBy(flight.getCreatedBy())
                .updatedBy(flight.getUpdatedBy());

        // Map airline information
        if (flight.getAirline() != null) {
            Airline airline = flight.getAirline();
            builder.airlineId(airline.getAirlineId())
                   .airlineName(airline.getName())
                   .airlineIataCode(airline.getIataCode());
        }

        // Map departure airport information
        if (flight.getDepartureAirport() != null) {
            Airport departure = flight.getDepartureAirport();
            builder.departureAirportId(departure.getAirportId())
                   .departureAirportName(departure.getName())
                   .departureAirportIataCode(departure.getIataCode())
                   .departureAirportCity(departure.getCity())
                   .departureAirportCountry(departure.getCountry());
        }

        // Map arrival airport information
        if (flight.getArrivalAirport() != null) {
            Airport arrival = flight.getArrivalAirport();
            builder.arrivalAirportId(arrival.getAirportId())
                   .arrivalAirportName(arrival.getName())
                   .arrivalAirportIataCode(arrival.getIataCode())
                   .arrivalAirportCity(arrival.getCity())
                   .arrivalAirportCountry(arrival.getCountry());
        }

        // Initialize empty values (will be populated by batch operation)
        return builder.schedules(List.of())
                     .fares(List.of())
                     .images(List.of())
                     .hasMedia(false)
                     .mediaCount(0L)
                     .build();
    }

    /**
     * Helper method to convert ZonedDateTime to LocalDateTime
     */
    private LocalDateTime convertToLocalDateTime(ZonedDateTime zonedDateTime) {
        return zonedDateTime != null ? zonedDateTime.toLocalDateTime() : null;
    }
    
    /**
     * Helper method to map media data from media-service to MediaInfo
     */
    private MediaInfo mapToMediaInfo(Map<String, Object> mediaData) {
        if (mediaData == null) {
            return null;
        }
        
        return MediaInfo.builder()
                .id(getLongValue(mediaData, "id"))
                .publicId((String) mediaData.get("publicId"))
                .url((String) mediaData.get("url"))
                .secureUrl((String) mediaData.get("secureUrl"))
                .altText((String) mediaData.get("altText"))
                .isPrimary(getBooleanValue(mediaData, "isPrimary"))
                .displayOrder(getIntegerValue(mediaData, "displayOrder"))
                .mediaType((String) mediaData.get("mediaType"))
                .resourceType((String) mediaData.get("resourceType"))
                .format((String) mediaData.get("format"))
                .fileSize(getLongValue(mediaData, "fileSize"))
                .width(getIntegerValue(mediaData, "width"))
                .height(getIntegerValue(mediaData, "height"))
                .tags((String) mediaData.get("tags"))
                .createdAt(getLocalDateTimeValue(mediaData, "createdAt"))
                .updatedAt(getLocalDateTimeValue(mediaData, "updatedAt"))
                .build();
    }
    
    /**
     * Helper methods for safe type conversion
     */
    private Long getLongValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        return null;
    }
    
    private Integer getIntegerValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        return null;
    }
    
    private Boolean getBooleanValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value instanceof Boolean) {
            return (Boolean) value;
        }
        return null;
    }
    
    private LocalDateTime getLocalDateTimeValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value instanceof String) {
            try {
                return LocalDateTime.parse((String) value);
            } catch (Exception e) {
                log.warn("Failed to parse LocalDateTime from string: {}", value);
            }
        }
        return null;
    }
}
