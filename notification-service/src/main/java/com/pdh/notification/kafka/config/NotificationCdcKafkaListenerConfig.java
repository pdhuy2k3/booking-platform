package com.pdh.notification.kafka.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.pdh.common.kafka.cdc.config.BaseKafkaListenerConfig;
import org.springframework.boot.autoconfigure.kafka.KafkaProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;

/**
 * Notification service Kafka listener configuration
 * Creates the required notificationEventListenerContainerFactory bean
 */
@Configuration
public class NotificationCdcKafkaListenerConfig extends BaseKafkaListenerConfig<String, JsonNode> {

    public NotificationCdcKafkaListenerConfig(KafkaProperties kafkaProperties) {
        super(String.class, JsonNode.class, kafkaProperties);
    }

    @Bean("notificationEventListenerContainerFactory")
    @Override
    public ConcurrentKafkaListenerContainerFactory<String, JsonNode> listenerContainerFactory() {
        return kafkaListenerContainerFactory();
    }
}
