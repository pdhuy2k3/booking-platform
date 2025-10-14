package com.pdh.ai.config;

import com.pdh.ai.rag.cdc.message.*;
import com.pdh.common.kafka.cdc.config.BaseKafkaListenerConfig;
import org.springframework.boot.autoconfigure.kafka.KafkaProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;


/**
 * Kafka configuration for the AI Agent service
 * Configures consumers for CDC messages from flight and hotel services
 */
@Configuration
public class KafkaConfig {



    /**
     * Kafka listener container factory for flight schedule CDC messages
     */
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, FlightScheduleCdcMessage> flightScheduleKafkaListenerContainerFactory(KafkaProperties kafkaProperties) {
        BaseKafkaListenerConfig<String, FlightScheduleCdcMessage> config = 
            new BaseKafkaListenerConfig<String, FlightScheduleCdcMessage>(String.class, FlightScheduleCdcMessage.class, kafkaProperties) {
                @Override
                public ConcurrentKafkaListenerContainerFactory<String, FlightScheduleCdcMessage> listenerContainerFactory() {
                    return kafkaListenerContainerFactory();
                }
            };
        return config.listenerContainerFactory();
    }

    /**
     * Kafka listener container factory for flight fare CDC messages
     */
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, FlightFareCdcMessage> flightFareKafkaListenerContainerFactory(KafkaProperties kafkaProperties) {
        BaseKafkaListenerConfig<String, FlightFareCdcMessage> config = 
            new BaseKafkaListenerConfig<String, FlightFareCdcMessage>(String.class, FlightFareCdcMessage.class, kafkaProperties) {
                @Override
                public ConcurrentKafkaListenerContainerFactory<String, FlightFareCdcMessage> listenerContainerFactory() {
                    return kafkaListenerContainerFactory();
                }
            };
        return config.listenerContainerFactory();
    }

    /**
     * Kafka listener container factory for room availability CDC messages
     */
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, RoomAvailabilityCdcMessage> roomAvailabilityKafkaListenerContainerFactory(KafkaProperties kafkaProperties) {
        BaseKafkaListenerConfig<String, RoomAvailabilityCdcMessage> config = 
            new BaseKafkaListenerConfig<String, RoomAvailabilityCdcMessage>(String.class, RoomAvailabilityCdcMessage.class, kafkaProperties) {
                @Override
                public ConcurrentKafkaListenerContainerFactory<String, RoomAvailabilityCdcMessage> listenerContainerFactory() {
                    return kafkaListenerContainerFactory();
                }
            };
        return config.listenerContainerFactory();
    }

    /**
     * Kafka listener container factory for hotel CDC messages
     */
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, HotelCdcMessage> hotelKafkaListenerContainerFactory(KafkaProperties kafkaProperties) {
        BaseKafkaListenerConfig<String, HotelCdcMessage> config = 
            new BaseKafkaListenerConfig<String, HotelCdcMessage>(String.class, HotelCdcMessage.class, kafkaProperties) {
                @Override
                public ConcurrentKafkaListenerContainerFactory<String, HotelCdcMessage> listenerContainerFactory() {
                    return kafkaListenerContainerFactory();
                }
            };
        return config.listenerContainerFactory();
    }

    /**
     * Kafka listener container factory for room type CDC messages
     */
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, RoomTypeCdcMessage> roomTypeKafkaListenerContainerFactory(KafkaProperties kafkaProperties) {
        BaseKafkaListenerConfig<String, RoomTypeCdcMessage> config = 
            new BaseKafkaListenerConfig<String, RoomTypeCdcMessage>(String.class, RoomTypeCdcMessage.class, kafkaProperties) {
                @Override
                public ConcurrentKafkaListenerContainerFactory<String, RoomTypeCdcMessage> listenerContainerFactory() {
                    return kafkaListenerContainerFactory();
                }
            };
        return config.listenerContainerFactory();
    }

    /**
     * Kafka listener container factory for flight CDC messages
     */
    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, FlightCdcMessage> flightKafkaListenerContainerFactory(KafkaProperties kafkaProperties) {
        BaseKafkaListenerConfig<String, FlightCdcMessage> config = 
            new BaseKafkaListenerConfig<String, FlightCdcMessage>(String.class, FlightCdcMessage.class, kafkaProperties) {
                @Override
                public ConcurrentKafkaListenerContainerFactory<String, FlightCdcMessage> listenerContainerFactory() {
                    return kafkaListenerContainerFactory();
                }
            };
        return config.listenerContainerFactory();
    }
}