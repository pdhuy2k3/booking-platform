package com.pdh.booking.config;

import com.pdh.booking.service.*;
import com.pdh.booking.service.impl.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for service implementations
 * Only Payment Service uses mock by default (not integrated with real payment gateway yet)
 * Flight and Hotel services use real implementations with crawled data
 * 
 * Note: Other services are auto-configured using @Service annotation
 */
@Configuration
public class ServiceConfig {

    // Payment Service - MOCK only (no real payment gateway integration yet)
    @Bean
    public PaymentService paymentService() {
        return new PaymentServiceMockImpl();
    }
}
