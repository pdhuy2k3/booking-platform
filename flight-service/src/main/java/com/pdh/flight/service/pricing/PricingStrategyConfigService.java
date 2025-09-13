package com.pdh.flight.service.pricing;

import com.pdh.flight.dto.request.PricingStrategyConfigDto;
import com.pdh.flight.dto.response.PricingStrategyConfigResponseDto;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Service for managing pricing strategy configurations
 */
@Service
public class PricingStrategyConfigService {
    
    // In-memory storage for pricing strategies
    // In a production environment, this would be stored in a database
    private final ConcurrentMap<Long, PricingStrategyConfigDto> pricingStrategies = new ConcurrentHashMap<>();
    private final AtomicLong strategyIdGenerator = new AtomicLong(1);
    
    public PricingStrategyConfigService() {
        // Initialize with default strategy
        initializeDefaultStrategy();
    }
    
    /**
     * Initialize default pricing strategy
     */
    private void initializeDefaultStrategy() {
        PricingStrategyConfigDto defaultStrategy = PricingStrategyConfigDto.builder()
                .strategyId(strategyIdGenerator.getAndIncrement())
                .strategyName("Default Pricing Strategy")
                .description("Standard pricing strategy with balanced multipliers")
                .baseMultiplier(BigDecimal.valueOf(1.0))
                .demandFactor(BigDecimal.valueOf(0.5))
                .advanceBookingFactor(BigDecimal.valueOf(0.3))
                .seasonalityFactor(BigDecimal.valueOf(0.2))
                .fareClassMultipliers(Map.of(
                        "ECONOMY", BigDecimal.valueOf(1.0),
                        "PREMIUM_ECONOMY", BigDecimal.valueOf(1.6),
                        "BUSINESS", BigDecimal.valueOf(2.8),
                        "FIRST", BigDecimal.valueOf(4.5)
                ))
                .isActive(true)
                .build();
        
        pricingStrategies.put(defaultStrategy.getStrategyId(), defaultStrategy);
    }
    
    /**
     * Get all pricing strategies
     */
    public List<PricingStrategyConfigResponseDto> getAllStrategies() {
        return pricingStrategies.values().stream()
                .map(this::convertToResponse)
                .toList();
    }
    
    /**
     * Get pricing strategy by ID
     */
    public PricingStrategyConfigResponseDto getStrategyById(Long strategyId) {
        PricingStrategyConfigDto strategy = pricingStrategies.get(strategyId);
        return strategy != null ? convertToResponse(strategy) : null;
    }
    
    /**
     * Create or update pricing strategy
     */
    public PricingStrategyConfigResponseDto saveStrategy(PricingStrategyConfigDto strategyDto) {
        if (strategyDto.getStrategyId() == null) {
            // Create new strategy
            strategyDto.setStrategyId(strategyIdGenerator.getAndIncrement());
        }
        
        pricingStrategies.put(strategyDto.getStrategyId(), strategyDto);
        return convertToResponse(strategyDto);
    }
    
    /**
     * Delete pricing strategy
     */
    public boolean deleteStrategy(Long strategyId) {
        return pricingStrategies.remove(strategyId) != null;
    }
    
    /**
     * Get active pricing strategy
     */
    public PricingStrategyConfigResponseDto getActiveStrategy() {
        return pricingStrategies.values().stream()
                .filter(strategy -> Boolean.TRUE.equals(strategy.getIsActive()))
                .findFirst()
                .map(this::convertToResponse)
                .orElse(null);
    }
    
    /**
     * Set active pricing strategy
     */
    public PricingStrategyConfigResponseDto setActiveStrategy(Long strategyId) {
        // Deactivate all strategies
        pricingStrategies.values().forEach(strategy -> strategy.setIsActive(false));
        
        // Activate the specified strategy
        PricingStrategyConfigDto strategy = pricingStrategies.get(strategyId);
        if (strategy != null) {
            strategy.setIsActive(true);
            return convertToResponse(strategy);
        }
        
        return null;
    }
    
    /**
     * Convert PricingStrategyConfigDto to PricingStrategyConfigResponseDto
     */
    private PricingStrategyConfigResponseDto convertToResponse(PricingStrategyConfigDto strategyDto) {
        return PricingStrategyConfigResponseDto.builder()
                .strategyId(strategyDto.getStrategyId())
                .strategyName(strategyDto.getStrategyName())
                .description(strategyDto.getDescription())
                .baseMultiplier(strategyDto.getBaseMultiplier())
                .demandFactor(strategyDto.getDemandFactor())
                .advanceBookingFactor(strategyDto.getAdvanceBookingFactor())
                .seasonalityFactor(strategyDto.getSeasonalityFactor())
                .fareClassMultipliers(strategyDto.getFareClassMultipliers())
                .isActive(strategyDto.getIsActive())
                .createdAt(ZonedDateTime.now())
                .updatedAt(ZonedDateTime.now())
                .build();
    }
}