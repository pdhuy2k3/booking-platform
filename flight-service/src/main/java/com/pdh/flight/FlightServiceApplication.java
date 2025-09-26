package com.pdh.flight;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.TimeZone;

@SpringBootApplication(scanBasePackages = { "com.pdh.flight","com.pdh.common" })
@EnableJpaRepositories(basePackages = {"com.pdh.flight"})
@EntityScan(basePackages = {"com.pdh.flight"})
@EnableDiscoveryClient
@EnableScheduling  // Enable scheduled tasks for status updates
@ComponentScan({"com.pdh.flight", "com.pdh.common"})

public class FlightServiceApplication {

    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone("GMT +0:00"));
        SpringApplication.run(FlightServiceApplication.class, args);

    }
}
