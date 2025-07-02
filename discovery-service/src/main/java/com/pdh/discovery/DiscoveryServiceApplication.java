package com.pdh.discovery;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

import java.util.TimeZone;

@SpringBootApplication
@EnableEurekaServer
@Slf4j
public class DiscoveryServiceApplication {

    public static void main(String[] args) {
        log.info("Starting BookingSmart Discovery Service...");
        log.info("Eureka Server will be available at: http://localhost:8761");
        TimeZone.setDefault(TimeZone.getTimeZone("GMT +0:00"));
        SpringApplication.run(DiscoveryServiceApplication.class, args);
        
        log.info("BookingSmart Discovery Service started successfully!");
        log.info("Services can register at: http://localhost:8761/eureka");
    }
}
