package com.pdh.payment.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;

import java.time.Duration;

/**
 * RestClient Configuration for Payment Service
 * Replaces WebClient for non-reactive HTTP calls
 */
@Configuration
public class RestClientConfig {
    
    @Bean
    public RestClient restClient() {
        return RestClient.builder()
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader("Accept", MediaType.APPLICATION_JSON_VALUE)
                .build();
    }
    
    @Bean
    public RestClient.Builder restClientBuilder() {
        return RestClient.builder()
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .defaultHeader("Accept", MediaType.APPLICATION_JSON_VALUE);
    }
}
