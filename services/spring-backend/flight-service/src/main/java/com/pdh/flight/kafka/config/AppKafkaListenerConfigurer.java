package com.pdh.flight.kafka.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.KafkaListenerConfigurer;
import org.springframework.kafka.config.KafkaListenerEndpointRegistrar;
import org.springframework.lang.NonNull;

/**
 * Flight service Kafka listener configurer
 */
@Configuration
public class AppKafkaListenerConfigurer implements KafkaListenerConfigurer {

    @Override
    public void configureKafkaListeners(@NonNull KafkaListenerEndpointRegistrar registrar) {
        // Additional configuration can be added here if needed
    }
}
