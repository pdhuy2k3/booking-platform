package com.pdh.flight.service.pricing;

import com.pdh.flight.dto.request.FareClassMultiplierConfigDto;
import com.pdh.flight.dto.response.FareClassMultiplierConfigResponseDto;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * Service for managing fare class multipliers configuration
 */
@Service
public class FareClassMultiplierConfigService {
    
    // In-memory storage for fare class multipliers
    // In a production environment, this would be stored in a database
    private final ConcurrentMap<String, FareClassMultiplierConfigDto> fareClassMultipliers = new ConcurrentHashMap<>();
    
    public FareClassMultiplierConfigService() {
        // Initialize with default multipliers
        initializeDefaultMultipliers();
    }
    
    /**
     * Initialize default fare class multipliers
     */
    private void initializeDefaultMultipliers() {
        fareClassMultipliers.put("ECONOMY", FareClassMultiplierConfigDto.builder()
                .fareClass("ECONOMY")
                .multiplier(BigDecimal.valueOf(1.0))
                .description("Base fare class")
                .build());
        
        fareClassMultipliers.put("PREMIUM_ECONOMY", FareClassMultiplierConfigDto.builder()
                .fareClass("PREMIUM_ECONOMY")
                .multiplier(BigDecimal.valueOf(1.6))
                .description("Premium economy class")
                .build());
        
        fareClassMultipliers.put("BUSINESS", FareClassMultiplierConfigDto.builder()
                .fareClass("BUSINESS")
                .multiplier(BigDecimal.valueOf(2.8))
                .description("Business class")
                .build());
        
        fareClassMultipliers.put("FIRST", FareClassMultiplierConfigDto.builder()
                .fareClass("FIRST")
                .multiplier(BigDecimal.valueOf(4.5))
                .description("First class")
                .build());
    }
    
    /**
     * Get multiplier for a fare class
     */
    public BigDecimal getMultiplier(String fareClass) {
        FareClassMultiplierConfigDto config = fareClassMultipliers.get(fareClass.toUpperCase());
        return config != null ? config.getMultiplier() : BigDecimal.ONE;
    }
    
    /**
     * Get all fare class multipliers
     */
    public List<FareClassMultiplierConfigResponseDto> getAllMultipliers() {
        return fareClassMultipliers.values().stream()
                .map(config -> FareClassMultiplierConfigResponseDto.builder()
                        .fareClass(config.getFareClass())
                        .multiplier(config.getMultiplier())
                        .description(config.getDescription())
                        .isActive(true)
                        .build())
                .toList();
    }
    
    /**
     * Update fare class multiplier
     */
    public FareClassMultiplierConfigResponseDto updateMultiplier(FareClassMultiplierConfigDto configDto) {
        fareClassMultipliers.put(configDto.getFareClass().toUpperCase(), configDto);
        
        return FareClassMultiplierConfigResponseDto.builder()
                .fareClass(configDto.getFareClass())
                .multiplier(configDto.getMultiplier())
                .description(configDto.getDescription())
                .isActive(true)
                .build();
    }
    
    /**
     * Get fare class multiplier configuration
     */
    public FareClassMultiplierConfigResponseDto getMultiplierConfig(String fareClass) {
        FareClassMultiplierConfigDto config = fareClassMultipliers.get(fareClass.toUpperCase());
        if (config == null) {
            return null;
        }
        
        return FareClassMultiplierConfigResponseDto.builder()
                .fareClass(config.getFareClass())
                .multiplier(config.getMultiplier())
                .description(config.getDescription())
                .isActive(true)
                .build();
    }
}