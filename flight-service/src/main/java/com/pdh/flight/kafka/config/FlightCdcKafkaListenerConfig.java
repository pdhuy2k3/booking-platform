package com.pdh.flight.kafka.config;

import com.pdh.common.kafka.cdc.config.BaseKafkaListenerConfig;
import com.pdh.common.kafka.cdc.message.BookingMsgKey;
import com.pdh.common.kafka.cdc.message.BookingCdcMessage;
import org.springframework.boot.autoconfigure.kafka.KafkaProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;

/**
 * Flight service Kafka listener configuration
 */
@Configuration
public class FlightCdcKafkaListenerConfig extends BaseKafkaListenerConfig<BookingMsgKey, BookingCdcMessage> {

    public FlightCdcKafkaListenerConfig(KafkaProperties kafkaProperties) {
        super(BookingMsgKey.class, BookingCdcMessage.class, kafkaProperties);
    }

    @Bean("flightEventListenerContainerFactory")
    @Override
    public ConcurrentKafkaListenerContainerFactory<BookingMsgKey, BookingCdcMessage> listenerContainerFactory() {
        return kafkaListenerContainerFactory();
    }
}
