package com.pdh.flight.service;

import com.pdh.flight.dto.response.AirlineDto;
import com.pdh.flight.mapper.AirlineMapper;
import com.pdh.flight.model.Airline;
import com.pdh.flight.repository.AirlineRepository;
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

/**
 * Service for managing airlines in storefront
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class StorefrontAirlineService {

    private final AirlineRepository airlineRepository;
    private final AirlineMapper airlineMapper;

    /**
     * Get all airlines with pagination for storefront
     */
    public Map<String, Object> getAllAirlines(int page, int size) {
        log.info("Fetching airlines for storefront: page={}, size={}", page, size);

        Sort sort = Sort.by(Sort.Direction.ASC, "name");
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Airline> airlinePage = airlineRepository.findByIsActiveTrue(pageable);
        
        List<AirlineDto> airlines = airlineMapper.toDtoList(airlinePage.getContent());

        return Map.of(
            "content", airlines,
            "totalElements", airlinePage.getTotalElements(),
            "totalPages", airlinePage.getTotalPages(),
            "currentPage", page,
            "size", size
        );
    }

    /**
     * Search airlines by name or code for storefront
     */
    public List<AirlineDto> searchAirlines(String query) {
        log.info("Searching airlines for storefront: query={}", query);
        
        if (query == null || query.trim().length() < 2) {
            return List.of();
        }
        
        Pageable pageable = PageRequest.of(0, 10);
        Page<Airline> airlines = airlineRepository.findByNameContainingIgnoreCaseOrIataCodeContainingIgnoreCase(
            query.trim(), query.trim(), pageable);
        
        return airlineMapper.toDtoList(airlines.getContent());
    }

    /**
     * Get airline by ID for storefront
     */
    public AirlineDto getAirlineById(Long id,Boolean isActive) {
        log.info("Fetching airline by ID for storefront: id={}", id);
        
        return airlineRepository.findByAirlineIdAndIsActive(id,isActive)
            .map(airlineMapper::toDto)
            .orElse(null);
    }
}