package com.pdh.flight.service;

import com.pdh.flight.dto.response.AirportDto;
import com.pdh.flight.mapper.AirportMapper;
import com.pdh.flight.model.Airport;
import com.pdh.flight.repository.AirportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for managing airports in storefront
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class StorefrontAirportService {

    private final AirportRepository airportRepository;
    private final AirportMapper airportMapper;

    /**
     * Get all airports with pagination for storefront
     */
    public Map<String, Object> getAllAirports(int page, int size) {
        log.info("Fetching airports for storefront: page={}, size={}", page, size);

        Sort sort = Sort.by(Sort.Direction.ASC, "name");
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Airport> airportPage = airportRepository.findAllActive(pageable);
        
        List<AirportDto> airports = airportMapper.toDtoList(airportPage.getContent());

        return Map.of(
            "content", airports,
            "totalElements", airportPage.getTotalElements(),
            "totalPages", airportPage.getTotalPages(),
            "currentPage", page,
            "size", size
        );
    }

    /**
     * Search airports by name or code for storefront
     */
    public List<AirportDto> searchAirports(String query) {
        log.info("Searching airports for storefront: query={}", query);
        
        if (query == null || query.trim().length() < 2) {
            return List.of();
        }
        
        Pageable pageable = PageRequest.of(0, 10);
        Page<Airport> airports = airportRepository.findByNameContainingIgnoreCaseOrIataCodeContainingIgnoreCase(
            query.trim(), query.trim(), pageable);
        
        return airportMapper.toDtoList(airports.getContent());
    }

    /**
     * Get airport by ID for storefront
     */
    public AirportDto getAirportById(Long id) {
        log.info("Fetching airport by ID for storefront: id={}", id);
        
        return airportRepository.findById(id)
            .filter(Airport::getIsActive)
            .map(airportMapper::toDto)
            .orElse(null);
    }
}