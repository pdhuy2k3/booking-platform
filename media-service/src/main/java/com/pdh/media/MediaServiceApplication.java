package com.pdh.media;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = { "com.pdh.media", "com.pdh.common.config", "com.pdh.common.model" })
@EnableJpaRepositories(basePackages = {"com.pdh.media"})
@EntityScan(basePackages = {"com.pdh.media"})
@EnableDiscoveryClient
public class MediaServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(MediaServiceApplication.class, args);
    }
}
