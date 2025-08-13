package com.pdh.booking.kafka.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.annotation.KafkaListenerConfigurer;
import org.springframework.kafka.config.KafkaListenerEndpointRegistrar;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

/**
 * App Kafka Listener Configurer
 * Configures Kafka listeners with optional message validation
 */
@EnableKafka
@Configuration
@Slf4j
public class AppKafkaListenerConfigurer implements KafkaListenerConfigurer {

    private final LocalValidatorFactoryBean validator;

    public AppKafkaListenerConfigurer(@Autowired(required = false) LocalValidatorFactoryBean validator) {
        this.validator = validator;
        if (validator == null) {
            log.warn("LocalValidatorFactoryBean not available - Kafka message validation will be disabled");
        } else {
            log.info("Kafka message validation enabled");
        }
    }

    @Override
    public void configureKafkaListeners(KafkaListenerEndpointRegistrar registrar) {
        // Enable message validation only if validator is available
        if (this.validator != null) {
            registrar.setValidator(this.validator);
            log.debug("Configured Kafka listeners with message validation");
        } else {
            log.debug("Configured Kafka listeners without message validation");
        }
    }
}
