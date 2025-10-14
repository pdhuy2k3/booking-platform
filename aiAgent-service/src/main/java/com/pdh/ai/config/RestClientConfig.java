package com.pdh.ai.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClient;

/**
 * Configuration for REST client with load balancing
 */
@Configuration
public class RestClientConfig {

    @Bean
    
    public RestClient getRestClient(RestClient.Builder restClientBuilder) {
        return restClientBuilder
                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                .build();
    }
}