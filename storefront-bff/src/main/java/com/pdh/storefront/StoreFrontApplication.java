package com.pdh.storefront;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
@Slf4j
public class StoreFrontApplication {

    public static void main(String[] args) {

        SpringApplication.run(StoreFrontApplication.class, args);

    }
}
