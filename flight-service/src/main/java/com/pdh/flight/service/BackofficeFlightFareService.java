package com.pdh.flight.service;

import com.pdh.flight.dto.request.FlightFareCreateDto;
import com.pdh.flight.dto.request.FlightFareUpdateDto;
import com.pdh.flight.dto.request.FlightFareCalculationRequestDto;
import com.pdh.flight.dto.request.BulkFlightFareRequestDto;
import com.pdh.flight.dto.request.FareClassMultiplierConfigDto;
import com.pdh.flight.dto.request.PricingStrategyConfigDto;
import com.pdh.flight.dto.response.FlightFareDto;
import com.pdh.flight.dto.response.FlightFareCalculationResultDto;
import com.pdh.flight.dto.response.FareClassMultiplierConfigResponseDto;
import com.pdh.flight.dto.response.PricingStrategyConfigResponseDto;
import com.pdh.flight.model.FlightFare;
import com.pdh.flight.model.FlightSchedule;
import com.pdh.flight.model.enums.FareClass;
import com.pdh.flight.repository.FlightFareRepository;
import com.pdh.flight.repository.FlightScheduleRepository;
import com.pdh.flight.service.pricing.PricingService;
import com.pdh.flight.service.pricing.FareClassMultiplierConfigService;
import com.pdh.flight.service.pricing.PricingStrategyConfigService;
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

import java.math.BigDecimal;
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
    private final PricingService pricingService;
    private final FareClassMultiplierConfigService fareClassMultiplierConfigService;
    private final PricingStrategyConfigService pricingStrategyConfigService;

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
     * Calculate suggested flight fares based on pricing algorithm
     */
    @Transactional(readOnly = true)
    public List<FlightFareCalculationResultDto> calculateFlightFares(FlightFareCalculationRequestDto calculationRequest) {
        log.info("Calculating flight fares for {} schedules", calculationRequest.getScheduleIds().size());
        
        List<FlightFareCalculationResultDto> results = new ArrayList<>();
        
        // Get flight schedules
        List<FlightSchedule> schedules = flightScheduleRepository.findAllById(calculationRequest.getScheduleIds());
        
        // Convert fare class string to enum
        FareClass fareClass;
        try {
            fareClass = FareClass.valueOf(calculationRequest.getFareClass().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid fare class: " + calculationRequest.getFareClass());
        }
        
        // Calculate price for each schedule
        for (FlightSchedule schedule : schedules) {
            try {
                // Get calculated price from pricing service
                BigDecimal calculatedPrice = pricingService.calculatePrice(
                        schedule, 
                        fareClass, 
                        java.time.LocalDate.now(), 
                        calculationRequest.getDepartureDate(), 
                        calculationRequest.getPassengerCount() != null ? calculationRequest.getPassengerCount() : 1
                );
                
                // Create result DTO
                FlightFareCalculationResultDto result = FlightFareCalculationResultDto.builder()
                        .scheduleId(schedule.getScheduleId())
                        .flightNumber(schedule.getFlight() != null ? schedule.getFlight().getFlightNumber() : "Unknown")
                        .origin(schedule.getFlight() != null && schedule.getFlight().getDepartureAirport() != null ? 
                                schedule.getFlight().getDepartureAirport().getIataCode() : "")
                        .destination(schedule.getFlight() != null && schedule.getFlight().getArrivalAirport() != null ? 
                                schedule.getFlight().getArrivalAirport().getIataCode() : "")
                        .aircraftType(schedule.getAircraftType())
                        .fareClass(fareClass.name())
                        .calculatedPrice(calculatedPrice)
                        .availableSeats(100) // Default value, would be based on aircraft capacity in real implementation
                        .currency("VND")
                        .build();
                
                results.add(result);
            } catch (Exception e) {
                log.error("Error calculating price for schedule: {}", schedule.getScheduleId(), e);
                // Add error result
                FlightFareCalculationResultDto errorResult = FlightFareCalculationResultDto.builder()
                        .scheduleId(schedule.getScheduleId())
                        .flightNumber(schedule.getFlight() != null ? schedule.getFlight().getFlightNumber() : "Unknown")
                        .origin("ERROR")
                        .destination("ERROR")
                        .aircraftType(schedule.getAircraftType())
                        .fareClass(fareClass.name())
                        .calculatedPrice(BigDecimal.ZERO)
                        .availableSeats(0)
                        .currency("VND")
                        .build();
                results.add(errorResult);
            }
        }
        
        return results;
    }

    /**
     * Create flight fares in bulk
     */
    public Map<String, Object> createFlightFaresBulk(BulkFlightFareRequestDto bulkRequest) {
        log.info("Creating flight fares in bulk for {} schedules", bulkRequest.getScheduleIds().size());
        
        int successCount = 0;
        int errorCount = 0;
        List<String> errors = new ArrayList<>();
        
        // Convert fare class string to enum
        FareClass fareClass;
        try {
            fareClass = FareClass.valueOf(bulkRequest.getFareClass().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid fare class: " + bulkRequest.getFareClass());
        }
        
        // Process each schedule
        for (UUID scheduleId : bulkRequest.getScheduleIds()) {
            try {
                // Check if schedule exists
                if (!flightScheduleRepository.existsById(scheduleId)) {
                    errors.add("Schedule not found: " + scheduleId);
                    errorCount++;
                    continue;
                }
                
                // Check if fare already exists (unless override is requested)
                FlightFare existingFare = flightFareRepository.findByScheduleIdAndFareClass(scheduleId, fareClass);
                if (existingFare != null && !existingFare.isDeleted() && 
                    (bulkRequest.getOverrideExisting() == null || !bulkRequest.getOverrideExisting())) {
                    errors.add("Fare already exists for schedule " + scheduleId + " and fare class " + bulkRequest.getFareClass());
                    errorCount++;
                    continue;
                }
                
                FlightFare flightFare;
                if (existingFare != null && !existingFare.isDeleted()) {
                    // Update existing fare
                    flightFare = existingFare;
                    flightFare.setPrice(bulkRequest.getPrice());
                    flightFare.setAvailableSeats(bulkRequest.getAvailableSeats());
                } else {
                    // Create new fare
                    flightFare = new FlightFare();
                    flightFare.setScheduleId(scheduleId);
                    flightFare.setFareClass(fareClass);
                    flightFare.setPrice(bulkRequest.getPrice());
                    flightFare.setAvailableSeats(bulkRequest.getAvailableSeats());
                }
                
                flightFareRepository.save(flightFare);
                successCount++;
                
            } catch (Exception e) {
                log.error("Error processing fare for schedule: {}", scheduleId, e);
                errors.add("Error for schedule " + scheduleId + ": " + e.getMessage());
                errorCount++;
            }
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("successCount", successCount);
        response.put("errorCount", errorCount);
        response.put("totalProcessed", bulkRequest.getScheduleIds().size());
        response.put("errors", errors);
        
        log.info("Bulk fare creation completed: {} success, {} errors", successCount, errorCount);
        return response;
    }

    /**
     * Update flight fare availability (seats)
     */
    public FlightFareDto updateFlightFareAvailability(UUID id, Integer availableSeats) {
        log.info("Updating flight fare availability: ID={}, seats={}", id, availableSeats);
        
        FlightFare flightFare = flightFareRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Flight fare not found with ID: " + id));
        
        if (flightFare.isDeleted()) {
            throw new EntityNotFoundException("Flight fare not found with ID: " + id);
        }
        
        flightFare.setAvailableSeats(availableSeats);
        FlightFare updatedFare = flightFareRepository.save(flightFare);
        
        log.info("Flight fare availability updated successfully with ID: {}", id);
        return toDto(updatedFare);
    }

    /**
     * Get all fare class multipliers
     */
    @Transactional(readOnly = true)
    public List<FareClassMultiplierConfigResponseDto> getFareClassMultipliers() {
        log.info("Fetching all fare class multipliers");
        return fareClassMultiplierConfigService.getAllMultipliers();
    }

    /**
     * Update fare class multiplier
     */
    public FareClassMultiplierConfigResponseDto updateFareClassMultiplier(FareClassMultiplierConfigDto configDto) {
        log.info("Updating fare class multiplier for: {}", configDto.getFareClass());
        return fareClassMultiplierConfigService.updateMultiplier(configDto);
    }

    /**
     * Get fare class multiplier by fare class
     */
    @Transactional(readOnly = true)
    public FareClassMultiplierConfigResponseDto getFareClassMultiplier(String fareClass) {
        log.info("Fetching fare class multiplier for: {}", fareClass);
        return fareClassMultiplierConfigService.getMultiplierConfig(fareClass);
    }

    /**
     * Get all pricing strategies
     */
    @Transactional(readOnly = true)
    public List<PricingStrategyConfigResponseDto> getPricingStrategies() {
        log.info("Fetching all pricing strategies");
        return pricingStrategyConfigService.getAllStrategies();
    }

    /**
     * Get pricing strategy by ID
     */
    @Transactional(readOnly = true)
    public PricingStrategyConfigResponseDto getPricingStrategy(Long strategyId) {
        log.info("Fetching pricing strategy: {}", strategyId);
        return pricingStrategyConfigService.getStrategyById(strategyId);
    }

    /**
     * Create or update pricing strategy
     */
    public PricingStrategyConfigResponseDto savePricingStrategy(PricingStrategyConfigDto strategyDto) {
        log.info("Saving pricing strategy: {}", strategyDto.getStrategyName());
        return pricingStrategyConfigService.saveStrategy(strategyDto);
    }

    /**
     * Delete pricing strategy
     */
    public boolean deletePricingStrategy(Long strategyId) {
        log.info("Deleting pricing strategy: {}", strategyId);
        return pricingStrategyConfigService.deleteStrategy(strategyId);
    }

    /**
     * Set active pricing strategy
     */
    public PricingStrategyConfigResponseDto activatePricingStrategy(Long strategyId) {
        log.info("Activating pricing strategy: {}", strategyId);
        return pricingStrategyConfigService.setActiveStrategy(strategyId);
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
