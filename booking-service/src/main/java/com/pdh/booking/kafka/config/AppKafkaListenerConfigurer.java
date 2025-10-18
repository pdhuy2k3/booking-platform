package com.pdh.booking.kafka.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
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

    private final ObjectProvider<LocalValidatorFactoryBean> validatorProvider;

    public AppKafkaListenerConfigurer(ObjectProvider<LocalValidatorFactoryBean> validatorProvider) {
        this.validatorProvider = validatorProvider;
    }

    @Override
    public void configureKafkaListeners(KafkaListenerEndpointRegistrar registrar) {
        validatorProvider.ifAvailable(registrar::setValidator);
    }
}
