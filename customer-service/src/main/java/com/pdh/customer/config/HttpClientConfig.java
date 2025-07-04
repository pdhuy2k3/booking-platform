package com.pdh.customer.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

/**
 * Configuration for HTTP clients used to communicate with external services
 */
@Configuration
public class HttpClientConfig {
    
    private final LogtoProperties logtoProperties;
    
    public HttpClientConfig(LogtoProperties logtoProperties) {
        this.logtoProperties = logtoProperties;
    }
    
    /**
     * RestTemplate bean configured with timeouts for Logto API calls
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplateBuilder()
                .setConnectTimeout(Duration.ofMillis(logtoProperties.getConnectionTimeout()))
                .setReadTimeout(Duration.ofMillis(logtoProperties.getReadTimeout()))
                .build();
    }
}
