package com.pdh.booking.kafka.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.pdh.common.kafka.cdc.config.BaseKafkaListenerConfig;
import org.springframework.boot.autoconfigure.kafka.KafkaProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;

/**
 * Shared Kafka listener configuration for Debezium outbox topics that publish booking saga events.
 */
@Configuration
public class BookingOutboxKafkaListenerConfig extends BaseKafkaListenerConfig<String, JsonNode> {

    public BookingOutboxKafkaListenerConfig(KafkaProperties kafkaProperties) {
        super(String.class, JsonNode.class, kafkaProperties);
    }

    @Bean("bookingOutboxListenerContainerFactory")
    @Override
    public ConcurrentKafkaListenerContainerFactory<String, JsonNode> listenerContainerFactory() {
        return super.kafkaListenerContainerFactory();
    }
}

