package com.pdh.hotel;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

import java.util.TimeZone;

@SpringBootApplication
@EnableDiscoveryClient
@Slf4j
public class HotelServiceApplication {

    public static void main(String[] args) {
        log.info("Starting BookingSmart Hotel Service...");
        log.info("Hotel Service will be available at: http://localhost:8082");
        
        TimeZone.setDefault(TimeZone.getTimeZone("GMT +0:00"));
        SpringApplication.run(HotelServiceApplication.class, args);
        
        log.info("BookingSmart Hotel Service started successfully!");
    }
}
