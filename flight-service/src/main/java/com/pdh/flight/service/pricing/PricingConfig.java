package com.pdh.flight.service.pricing;

import org.springframework.context.annotation.Configuration;

/**
 * Configuration class for pricing service
 */
@Configuration
public class PricingConfig {
    
    // Pricing factors configuration
    public static final double BASE_PRICE_FACTOR = 1.0;
    public static final double DEMAND_FACTOR = 0.5;
    public static final double TIME_FACTOR = 0.3;
    public static final double SEASONALITY_FACTOR = 0.2;
    
    // Fare class multipliers
    public static final double ECONOMY_MULTIPLIER = 1.0;
    public static final double PREMIUM_ECONOMY_MULTIPLIER = 1.6;
    public static final double BUSINESS_MULTIPLIER = 2.8;
    public static final double FIRST_MULTIPLIER = 4.5;
    
    // Time-based multipliers
    public static final double BUSINESS_HOUR_PREMIUM = 1.15;
    public static final double OFF_PEAK_DISCOUNT = 0.85;
    public static final double WEEKEND_PREMIUM = 1.1;
    
    // Seasonal multipliers
    public static final double PEAK_SEASON_PREMIUM = 1.25;
    public static final double SHOULDER_SEASON_DISCOUNT = 0.95;
    
    // Advance booking multipliers
    public static final double ADVANCE_90_DAYS_DISCOUNT = 0.8;
    public static final double ADVANCE_30_DAYS_DISCOUNT = 0.9;
    public static final double LAST_MINUTE_SURCHARGE = 1.3;
}