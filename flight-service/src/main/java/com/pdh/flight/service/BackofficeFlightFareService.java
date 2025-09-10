package com.pdh.flight.service;

import com.pdh.flight.dto.request.FlightFareCreateDto;
import com.pdh.flight.dto.request.FlightFareUpdateDto;
import com.pdh.flight.dto.response.FlightFareDto;
import com.pdh.flight.model.FlightFare;
import com.pdh.flight.model.enums.FareClass;
import com.pdh.flight.repository.FlightFareRepository;
import com.pdh.flight.repository.FlightScheduleRepository;
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

/**
 * Service for managing flight fares in backoffice
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BackofficeFlightFareService {

    private final FlightFareRepository flightFareRepository;
    private final FlightScheduleRepository flightScheduleRepository;

    /**
     * Get all flight fares with pagination and filtering
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getAllFlightFares(int page, int size, String search, String fareClass, UUID scheduleId) {
        log.info("Fetching flight fares for backoffice: page={}, size={}, search={}, fareClass={}, scheduleId={}", 
                page, size, search, fareClass, scheduleId);

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<FlightFare> flightFarePage;

        if (scheduleId != null) {
            // Filter by schedule ID
            if (StringUtils.hasText(fareClass)) {
                try {
                    FareClass fareClassEnum = FareClass.valueOf(fareClass.toUpperCase());
                    flightFarePage = flightFareRepository.findByScheduleIdAndFareClassAndIsDeletedFalse(
                            scheduleId, fareClassEnum, pageable);
                } catch (IllegalArgumentException e) {
                    flightFarePage = Page.empty();
                }
            } else {
                flightFarePage = flightFareRepository.findByScheduleIdAndIsDeletedFalse(scheduleId, pageable);
            }
        } else if (StringUtils.hasText(fareClass)) {
            // Filter by fare class only
            try {
                FareClass fareClassEnum = FareClass.valueOf(fareClass.toUpperCase());
                flightFarePage = flightFareRepository.findByFareClassAndIsDeletedFalse(fareClassEnum, pageable);
            } catch (IllegalArgumentException e) {
                flightFarePage = Page.empty();
            }
        } else {
            // No specific filters
            flightFarePage = flightFareRepository.findByIsDeletedFalse(pageable);
        }

        List<FlightFareDto> content = flightFarePage.getContent().stream()
                .map(this::toDto)
                .toList();

        Map<String, Object> response = new HashMap<>();
        response.put("content", content);
        response.put("page", flightFarePage.getNumber());
        response.put("size", flightFarePage.getSize());
        response.put("totalElements", flightFarePage.getTotalElements());
        response.put("totalPages", flightFarePage.getTotalPages());
        response.put("first", flightFarePage.isFirst());
        response.put("last", flightFarePage.isLast());

        return response;
    }

    /**
     * Get single flight fare with full details
     */
    @Transactional(readOnly = true)
    public FlightFareDto getFlightFare(UUID id) {
        log.info("Fetching flight fare details for backoffice: {}", id);
        
        FlightFare flightFare = flightFareRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Flight fare not found with ID: " + id));
        
        if (flightFare.isDeleted()) {
            throw new EntityNotFoundException("Flight fare not found with ID: " + id);
        }
        
        return toDto(flightFare);
    }

    /**
     * Create new flight fare
     */
    public FlightFareDto createFlightFare(FlightFareCreateDto createDto) {
        log.info("Creating new flight fare for schedule: {}", createDto.getScheduleId());
        
        // Verify that the schedule exists
        if (!flightScheduleRepository.existsById(createDto.getScheduleId())) {
            throw new EntityNotFoundException("Flight schedule not found with ID: " + createDto.getScheduleId());
        }
        
        // Convert string to enum
        FareClass fareClassEnum;
        try {
            fareClassEnum = FareClass.valueOf(createDto.getFareClass().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid fare class: " + createDto.getFareClass());
        }
        
        // Check if fare already exists for this schedule and fare class
        FlightFare existingFare = flightFareRepository.findByScheduleIdAndFareClass(
                createDto.getScheduleId(), fareClassEnum);
        if (existingFare != null && !existingFare.isDeleted()) {
            throw new IllegalArgumentException("Flight fare already exists for schedule " + 
                    createDto.getScheduleId() + " and fare class " + createDto.getFareClass());
        }
        
        FlightFare flightFare = new FlightFare();
        flightFare.setScheduleId(createDto.getScheduleId());
        flightFare.setFareClass(fareClassEnum);
        flightFare.setPrice(createDto.getPrice());
        flightFare.setAvailableSeats(createDto.getAvailableSeats());
        // isDeleted is automatically set to false by AbstractAuditEntity
        // createdAt and updatedAt are automatically managed by audit annotations
        
        FlightFare savedFare = flightFareRepository.save(flightFare);
        log.info("Flight fare created successfully with ID: {}", savedFare.getFareId());
        
        return toDto(savedFare);
    }

    /**
     * Update existing flight fare
     */
    public FlightFareDto updateFlightFare(UUID id, FlightFareUpdateDto updateDto) {
        log.info("Updating flight fare with ID: {}", id);
        
        FlightFare flightFare = flightFareRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Flight fare not found with ID: " + id));
        
        if (flightFare.isDeleted()) {
            throw new EntityNotFoundException("Flight fare not found with ID: " + id);
        }
        
        // Update only provided fields
        if (updateDto.getFareClass() != null) {
            // Convert string to enum
            FareClass fareClassEnum;
            try {
                fareClassEnum = FareClass.valueOf(updateDto.getFareClass().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid fare class: " + updateDto.getFareClass());
            }
            
            // Check if another fare with the same schedule and new fare class already exists
            FlightFare existingFare = flightFareRepository.findByScheduleIdAndFareClass(
                    flightFare.getScheduleId(), fareClassEnum);
            if (existingFare != null && !existingFare.getFareId().equals(id) && !existingFare.isDeleted()) {
                throw new IllegalArgumentException("Flight fare already exists for schedule " + 
                        flightFare.getScheduleId() + " and fare class " + updateDto.getFareClass());
            }
            flightFare.setFareClass(fareClassEnum);
        }
        
        if (updateDto.getPrice() != null) {
            flightFare.setPrice(updateDto.getPrice());
        }
        
        if (updateDto.getAvailableSeats() != null) {
            flightFare.setAvailableSeats(updateDto.getAvailableSeats());
        }
        
        // updatedAt is automatically managed by audit annotations
        
        FlightFare updatedFare = flightFareRepository.save(flightFare);
        log.info("Flight fare updated successfully with ID: {}", id);
        
        return toDto(updatedFare);
    }

    /**
     * Delete flight fare (soft delete)
     */
    public void deleteFlightFare(UUID id) {
        log.info("Deleting flight fare with ID: {}", id);
        
        FlightFare flightFare = flightFareRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Flight fare not found with ID: " + id));
        
        if (flightFare.isDeleted()) {
            throw new EntityNotFoundException("Flight fare not found with ID: " + id);
        }
        
        flightFare.setDeleted(true);
        flightFare.setDeletedAt(ZonedDateTime.now());
        // deletedBy would be set by audit if user context is available
        
        flightFareRepository.save(flightFare);
        log.info("Flight fare deleted successfully with ID: {}", id);
    }

    /**
     * Get flight fares by schedule ID
     */
    @Transactional(readOnly = true)
    public List<FlightFareDto> getFlightFaresByScheduleId(UUID scheduleId) {
        log.info("Fetching flight fares for schedule ID: {}", scheduleId);
        
        List<FlightFare> fares = flightFareRepository.findByScheduleId(scheduleId);
        return fares.stream()
                .map(this::toDto)
                .toList();
    }

    /**
     * Get flight fare statistics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getFlightFareStatistics() {
        log.info("Fetching flight fare statistics for backoffice");
        
        long totalFares = flightFareRepository.countByIsDeletedFalse();
        long economyFares = flightFareRepository.countByFareClassAndIsDeletedFalse(FareClass.ECONOMY);
        long businessFares = flightFareRepository.countByFareClassAndIsDeletedFalse(FareClass.BUSINESS);
        long firstFares = flightFareRepository.countByFareClassAndIsDeletedFalse(FareClass.FIRST);
        long premiumEconomyFares = flightFareRepository.countByFareClassAndIsDeletedFalse(FareClass.PREMIUM_ECONOMY);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalFares", totalFares);
        stats.put("economyFares", economyFares);
        stats.put("businessFares", businessFares);
        stats.put("firstFares", firstFares);
        stats.put("premiumEconomyFares", premiumEconomyFares);
        
        return stats;
    }

    /**
     * Convert FlightFare entity to DTO
     */
    private FlightFareDto toDto(FlightFare fare) {
        return FlightFareDto.builder()
                .fareId(fare.getFareId())
                .scheduleId(fare.getScheduleId())
                .fareClass(fare.getFareClass().name())
                .price(fare.getPrice())
                .availableSeats(fare.getAvailableSeats())
                .build();
    }
}
