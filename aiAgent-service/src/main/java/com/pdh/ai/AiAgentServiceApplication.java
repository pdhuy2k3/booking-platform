package com.pdh.ai;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.i18n.LocaleContextHolder;




@SpringBootApplication
@EnableDiscoveryClient

public class AiAgentServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AiAgentServiceApplication.class, args);
        LocaleContextHolder.setDefaultLocale(java.util.Locale.forLanguageTag("vi-VN"));
    }


}
