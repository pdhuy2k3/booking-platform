package com.pdh.booking;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;


import java.util.TimeZone;

@SpringBootApplication
@EnableDiscoveryClient
@Slf4j
public class BookingServiceApplication {

    public static void main(String[] args) {
        log.info("Starting BookingSmart Booking Service...");
        log.info("Booking Service will be available at: http://localhost:8083");
        
        TimeZone.setDefault(TimeZone.getTimeZone("GMT +0:00"));
        SpringApplication.run(BookingServiceApplication.class, args);
        
        log.info("BookingSmart Booking Service started successfully!");
    }
}
