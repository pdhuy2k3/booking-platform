package com.pdh.booking.config;

// No imports needed - using event-driven architecture
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for service implementations
 * Payment Service now uses real payment-service integration
 * Flight and Hotel services use real implementations with crawled data
 *
 * Note: Services are auto-configured using @Service annotation with @Profile
 * - PaymentServiceImpl: @Profile("!docker") - for development/local
 * - PaymentServiceMockImpl: @Profile("docker") - for docker deployment
 */
@Configuration
public class ServiceConfig {

    // Payment Service configuration is now handled by @Profile annotations
    // No explicit bean configuration needed
}
