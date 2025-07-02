package com.pdh.gateway;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;

@SpringBootApplication
@EnableDiscoveryClient
@EnableWebFluxSecurity
@Slf4j
public class ApiGateWayApplication {

    public static void main(String[] args) {
        log.info("Starting BookingSmart API Gateway...");
        log.info("API Gateway will be available at: http://localhost:8080");
        
        SpringApplication.run(ApiGateWayApplication.class, args);
        
        log.info("BookingSmart API Gateway started successfully!");
        log.info("Ready to route requests to microservices");
    }
}
