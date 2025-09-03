package com.pdh.flight.service;

import com.pdh.flight.dto.request.AirlineRequestDto;
import com.pdh.flight.dto.response.AirlineDto;
import com.pdh.flight.model.Airline;
import com.pdh.flight.model.AirlineImage;
import com.pdh.flight.repository.AirlineImageRepository;
import com.pdh.flight.repository.AirlineRepository;
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

import java.time.ZonedDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for managing airlines in backoffice
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BackofficeAirlineService {

    private final AirlineRepository airlineRepository;
    private final FlightRepository flightRepository;
    private final AirlineImageRepository airlineImageRepository;

    /**
     * Get all airlines with pagination and filtering
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getAllAirlines(int page, int size, String search) {
        log.info("Fetching airlines for backoffice: page={}, size={}, search={}", page, size, search);

        Sort sort = Sort.by(Sort.Direction.ASC, "name").and(Sort.by("iataCode"));
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Airline> airlinePage;
        
        if (StringUtils.hasText(search)) {
            airlinePage = airlineRepository.findByNameContainingIgnoreCase(search, pageable);
        } else {
            airlinePage = airlineRepository.findAllActive(pageable);
        }

        List<Map<String, Object>> airlines = airlinePage.getContent().stream()
            .map(this::convertAirlineToResponse)
            .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("content", airlines);
        response.put("totalElements", airlinePage.getTotalElements());
        response.put("totalPages", airlinePage.getTotalPages());
        response.put("size", airlinePage.getSize());
        response.put("number", airlinePage.getNumber());
        response.put("first", airlinePage.isFirst());
        response.put("last", airlinePage.isLast());
        response.put("empty", airlinePage.isEmpty());

        log.info("Found {} airlines for backoffice", airlines.size());
        return response;
    }

    /**
     * Get single airline with full details
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getAirline(Long id) {
        log.info("Fetching airline details for backoffice: ID={}", id);
        
        Airline airline = airlineRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Airline not found with ID: " + id));
        
        Map<String, Object> response = convertAirlineToDetailedResponse(airline);
        
        // Add statistics
        Long totalFlights = flightRepository.countByAirlineId(id);
        Long activeFlights = flightRepository.countByAirlineIdAndStatus(id, "ACTIVE");
        
        response.put("totalFlights", totalFlights);
        response.put("activeFlights", activeFlights);
        
        return response;
    }

    /**
     * Create new airline
     */
    public Map<String, Object> createAirline(AirlineRequestDto requestDto) {
        log.info("Creating new airline: {}", requestDto.getName());
        
        // Validate IATA code uniqueness
        if (airlineRepository.existsByIataCodeIgnoreCase(requestDto.getCode())) {
            throw new IllegalArgumentException("IATA code already exists: " + requestDto.getCode());
        }
        
        // Create new airline
        Airline airline = new Airline();
        airline.setName(requestDto.getName());
        airline.setIataCode(requestDto.getCode().toUpperCase());
        airline.setLogoUrl(requestDto.getLogoUrl());
        
        Airline savedAirline = airlineRepository.save(airline);
        
        // Handle images if provided
        if (requestDto.getImages() != null && !requestDto.getImages().isEmpty()) {
            processAirlineImages(savedAirline.getAirlineId(), requestDto.getImages());
        }
        
        Map<String, Object> response = convertAirlineToResponse(savedAirline);
        response.put("message", "Airline created successfully");
        
        log.info("Airline created successfully with ID: {}", savedAirline.getAirlineId());
        return response;
    }

    /**
     * Update existing airline
     */
    public Map<String, Object> updateAirline(Long id, AirlineRequestDto requestDto) {
        log.info("Updating airline: ID={}", id);
        
        Airline airline = airlineRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Airline not found with ID: " + id));
        
        // Check if IATA code is unique (exclude current airline)
        if (StringUtils.hasText(requestDto.getCode())) {
            String upperIataCode = requestDto.getCode().toUpperCase();
            if (!upperIataCode.equals(airline.getIataCode()) && 
                airlineRepository.existsByIataCodeIgnoreCase(upperIataCode)) {
                throw new IllegalArgumentException("IATA code already exists: " + upperIataCode);
            }
            airline.setIataCode(upperIataCode);
        }
        
        // Update fields
        if (StringUtils.hasText(requestDto.getName())) {
            airline.setName(requestDto.getName());
        }
        
        if (StringUtils.hasText(requestDto.getLogoUrl())) {
            airline.setLogoUrl(requestDto.getLogoUrl());
        }
        
        Airline updatedAirline = airlineRepository.save(airline);
        
        // Handle images if provided
        if (requestDto.getImages() != null) {
            processAirlineImages(id, requestDto.getImages());
        }
        
        Map<String, Object> response = convertAirlineToResponse(updatedAirline);
        response.put("message", "Airline updated successfully");
        
        log.info("Airline updated successfully with ID: {}", id);
        return response;
    }

    /**
     * Soft delete airline
     */
    public void deleteAirline(Long id) {
        log.info("Deleting airline: ID={}", id);
        
        Airline airline = airlineRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Airline not found with ID: " + id));
        
        // Check if airline has active flights
        Long activeFlights = flightRepository.countByAirlineIdAndStatus(id, "ACTIVE");
        if (activeFlights > 0) {
            throw new IllegalStateException("Cannot delete airline with active flights. Found " + activeFlights + " active flights.");
        }
        
        // Soft delete to preserve referential integrity
        airline.setDeleted(true);
        airline.setDeletedAt(ZonedDateTime.now());
        airlineRepository.save(airline);
        
        log.info("Airline deleted successfully with ID: {}", id);
    }

    /**
     * Get airline statistics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getAirlineStatistics() {
        long totalAirlines = airlineRepository.count();
        long activeAirlines = airlineRepository.findAllActive().size();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalAirlines", totalAirlines);
        stats.put("activeAirlines", activeAirlines);
        
        return stats;
    }

    /**
     * Process airline images by replacing existing active images with new ones
     * @param airlineId The airline ID
     * @param imageUrls List of image URLs/publicIds from frontend
     */
    private void processAirlineImages(Long airlineId, List<String> imageUrls) {
        if (imageUrls == null) {
            // If no images provided, deactivate all existing images
            List<AirlineImage> existingImages = airlineImageRepository.findByAirlineIdAndIsActiveTrue(airlineId);
            existingImages.forEach(img -> img.setIsActive(false));
            if (!existingImages.isEmpty()) {
                airlineImageRepository.saveAll(existingImages);
            }
            return;
        }

        // Deactivate all existing images first
        List<AirlineImage> existingImages = airlineImageRepository.findByAirlineIdAndIsActiveTrue(airlineId);
        existingImages.forEach(img -> img.setIsActive(false));
        if (!existingImages.isEmpty()) {
            airlineImageRepository.saveAll(existingImages);
        }

        // Create new active images
        List<AirlineImage> newImages = new ArrayList<>();
        for (int i = 0; i < imageUrls.size(); i++) {
            String imageUrl = imageUrls.get(i);
            if (imageUrl != null && !imageUrl.trim().isEmpty()) {
                AirlineImage airlineImage = new AirlineImage();
                // Set the airline reference instead of airlineId
                Airline airline = new Airline();
                airline.setAirlineId(airlineId);
                airlineImage.setAirline(airline);
                airlineImage.setImageUrl(imageUrl.trim());
                airlineImage.setIsActive(true);
                airlineImage.setDisplayOrder(i + 1);
                newImages.add(airlineImage);
            }
        }

        if (!newImages.isEmpty()) {
            airlineImageRepository.saveAll(newImages);
        }
    }

    // === Helper Methods ===

    /**
     * Convert Airline entity to response format
     */
    public Map<String, Object> convertAirlineToResponse(Airline airline) {
        Map<String, Object> response = new HashMap<>();
        
        response.put("id", airline.getAirlineId());
        response.put("name", airline.getName() != null ? airline.getName() : "");
        response.put("code", airline.getIataCode() != null ? airline.getIataCode() : "");
        response.put("country", ""); // Not available in current schema
        response.put("isActive", !airline.isDeleted());
        response.put("createdAt", airline.getCreatedAt() != null ? airline.getCreatedAt().toString() : "");
        response.put("updatedAt", airline.getUpdatedAt() != null ? airline.getUpdatedAt().toString() : "");
        // Add images field - return simple URLs/publicIds for frontend MediaSelector compatibility
        List<String> imageUrls = airline.getImages() != null ? 
            airline.getImages().stream()
                .filter(img -> img.getIsActive() != null && img.getIsActive())
                .map(img -> img.getImageUrl())
                .collect(Collectors.toList()) : new ArrayList<>();
        response.put("images", imageUrls);
        return response;
    }

    private Map<String, Object> convertAirlineToDetailedResponse(Airline airline) {
        return convertAirlineToResponse(airline);
    }
}