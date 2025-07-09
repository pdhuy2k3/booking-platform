package com.pdh.booking.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuration properties for external service URLs
 */
@ConfigurationProperties(prefix = "booking.services.urls")
public record ServiceUrlConfig(
        String flightService,
        String hotelService,
        String paymentService,
        String notificationService
) {
}
