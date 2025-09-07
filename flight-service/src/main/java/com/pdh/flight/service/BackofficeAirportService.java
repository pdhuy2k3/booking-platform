package com.pdh.flight.service;

import com.pdh.flight.client.MediaServiceClient;
import com.pdh.flight.dto.request.AirportRequestDto;
import com.pdh.flight.dto.response.AirportDto;
import com.pdh.flight.mapper.AirportMapper;
import com.pdh.flight.model.Airport;
import com.pdh.flight.repository.AirportRepository;
import com.pdh.flight.repository.FlightRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for managing airports in backoffice
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BackofficeAirportService {

    private final AirportRepository airportRepository;
    private final FlightRepository flightRepository;
    private final AirportMapper airportMapper;
    private final MediaServiceClient mediaServiceClient;

    /**
     * Get all airports with pagination and filtering
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getAllAirports(int page, int size, String search, String city, String country) {
        log.info("Fetching airports for backoffice: page={}, size={}, search={}, city={}, country={}", 
                page, size, search, city, country);

        Sort sort = Sort.by(Sort.Direction.ASC, "name").and(Sort.by("iataCode"));
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Airport> airportPage;
        
        if (StringUtils.hasText(search)) {
            airportPage = airportRepository.findByNameContainingIgnoreCaseOrIataCodeContainingIgnoreCaseOrCityContainingIgnoreCase(
                search, search, search, pageable);
        } else if (StringUtils.hasText(city)) {
            airportPage = airportRepository.findByCityIgnoreCase(city, pageable);
        } else if (StringUtils.hasText(country)) {
            airportPage = airportRepository.findByCountryIgnoreCase(country, pageable);
        } else {
            airportPage = airportRepository.findAllActive(pageable);
        }

        List<AirportDto> airports = airportMapper.toDtoListWithMedia(airportPage.getContent());

        Map<String, Object> response = new HashMap<>();
        response.put("content", airports);
        response.put("totalElements", airportPage.getTotalElements());
        response.put("totalPages", airportPage.getTotalPages());
        response.put("size", airportPage.getSize());
        response.put("number", airportPage.getNumber());
        response.put("first", airportPage.isFirst());
        response.put("last", airportPage.isLast());
        response.put("empty", airportPage.isEmpty());

        log.info("Found {} airports for backoffice", airports.size());
        return response;
    }

    /**
     * Get single airport with full details
     */
    @Transactional(readOnly = true)
    public AirportDto getAirport(Long id) {
        log.info("Fetching airport details for backoffice: ID={}", id);
        
        Airport airport = airportRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Airport not found with ID: " + id));
        
        // Get statistics
        Long totalDepartureFlights = flightRepository.countByDepartureAirportId(id);
        Long totalArrivalFlights = flightRepository.countByArrivalAirportId(id);
        Long activeDepartureFlights = flightRepository.countByDepartureAirportIdAndStatus(id, "ACTIVE");
        Long activeArrivalFlights = flightRepository.countByArrivalAirportIdAndStatus(id, "ACTIVE");
        
        AirportDto airportDto = airportMapper.toDtoWithMediaAndStats(airport, totalDepartureFlights, 
                totalArrivalFlights, activeDepartureFlights, activeArrivalFlights);
        
        log.info("Retrieved airport details for ID: {}", id);
        return airportDto;
    }

    /**
     * Create new airport
     */
    public AirportDto createAirport(AirportRequestDto requestDto) {
        log.info("Creating new airport: {}", requestDto.getName());
        
        // Validate IATA code uniqueness
        if (airportRepository.existsByIataCodeIgnoreCase(requestDto.getCode())) {
            throw new IllegalArgumentException("IATA code already exists: " + requestDto.getCode());
        }
        
        // Create new airport using mapper
        Airport airport = airportMapper.toEntity(requestDto);
        Airport savedAirport = airportRepository.save(airport);

        // Associate media if provided
        if (requestDto.getMediaPublicIds() != null && !requestDto.getMediaPublicIds().isEmpty()) {
            try {
                mediaServiceClient.associateMediaWithEntity("AIRPORT", savedAirport.getAirportId(), requestDto.getMediaPublicIds());
                log.info("Associated {} media items with airport ID: {}", requestDto.getMediaPublicIds().size(), savedAirport.getAirportId());
            } catch (Exception e) {
                log.error("Failed to associate media with airport ID: {}. Error: {}", savedAirport.getAirportId(), e.getMessage());
                // Continue without failing the airport creation
            }
        }

        AirportDto response = airportMapper.toDto(savedAirport);
        
        log.info("Airport created successfully with ID: {}", savedAirport.getAirportId());
        return response;
    }

    /**
     * Update existing airport
     */
    public AirportDto updateAirport(Long id, AirportRequestDto requestDto) {
        log.info("Updating airport: ID={}", id);
        
        Airport airport = airportRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Airport not found with ID: " + id));
        
        // Check if IATA code is unique (exclude current airport)
        if (StringUtils.hasText(requestDto.getCode())) {
            String upperIataCode = requestDto.getCode().toUpperCase();
            if (!upperIataCode.equals(airport.getIataCode()) && 
                airportRepository.existsByIataCodeIgnoreCase(upperIataCode)) {
                throw new IllegalArgumentException("IATA code already exists: " + upperIataCode);
            }
        }
        
        // Update entity using mapper
        airportMapper.updateEntityFromRequest(airport, requestDto);
        Airport updatedAirport = airportRepository.save(airport);

        // Associate media if provided
        if (requestDto.getMediaPublicIds() != null && !requestDto.getMediaPublicIds().isEmpty()) {
            try {
                mediaServiceClient.associateMediaWithEntity("AIRPORT", updatedAirport.getAirportId(), requestDto.getMediaPublicIds());
                log.info("Associated {} media items with airport ID: {}", requestDto.getMediaPublicIds().size(), updatedAirport.getAirportId());
            } catch (Exception e) {
                log.error("Failed to associate media with airport ID: {}. Error: {}", updatedAirport.getAirportId(), e.getMessage());
                // Continue without failing the airport update
            }
        }

        AirportDto response = airportMapper.toDto(updatedAirport);
        
        log.info("Airport updated successfully with ID: {}", id);
        return response;
    }

    /**
     * Soft delete airport
     */
    public void deleteAirport(Long id) {
        log.info("Deleting airport: ID={}", id);
        
        Airport airport = airportRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Airport not found with ID: " + id));
        
        // Check if airport has active flights
        Long activeDepartureFlights = flightRepository.countByDepartureAirportIdAndStatus(id, "ACTIVE");
        Long activeArrivalFlights = flightRepository.countByArrivalAirportIdAndStatus(id, "ACTIVE");
        
        if (activeDepartureFlights > 0 || activeArrivalFlights > 0) {
            throw new IllegalStateException("Cannot delete airport with active flights. Found " + 
                (activeDepartureFlights + activeArrivalFlights) + " active flights.");
        }
        
        // Soft delete to preserve referential integrity
        airport.setIsActive(false);
        airportRepository.save(airport);
        
        log.info("Airport deleted successfully with ID: {}", id);
    }

    /**
     * Search airports for autocomplete
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> searchAirports(String query) {
        log.info("Searching airports for autocomplete: query={}", query);
        
        if (!StringUtils.hasText(query) || query.length() < 2) {
            return Collections.emptyList();
        }
        
        // Limit results for autocomplete
        Pageable pageable = PageRequest.of(0, 20);
        Page<Airport> airports = airportRepository.findByNameContainingIgnoreCaseOrIataCodeContainingIgnoreCaseOrCityContainingIgnoreCase(
            query, query, query, pageable);
        
        return airportMapper.toSimpleResponseList(airports.getContent());
    }

    /**
     * Get airport statistics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getAirportStatistics() {
        long totalAirports = airportRepository.count();
        long activeAirports = airportRepository.findAllActive().size();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalAirports", totalAirports);
        stats.put("activeAirports", activeAirports);
        
        return stats;
    }
}
