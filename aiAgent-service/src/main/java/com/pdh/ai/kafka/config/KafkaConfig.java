package com.pdh.ai.kafka.config;

import com.pdh.common.kafka.cdc.config.BaseKafkaListenerConfig;
import com.pdh.common.kafka.cdc.message.FlightCdcMessage;
import com.pdh.common.kafka.cdc.message.FlightFareCdcMessage;
import com.pdh.common.kafka.cdc.message.FlightScheduleCdcMessage;
import com.pdh.common.kafka.cdc.message.HotelCdcMessage;
import com.pdh.common.kafka.cdc.message.RoomAvailabilityCdcMessage;
import com.pdh.common.kafka.cdc.message.RoomTypeCdcMessage;
import com.pdh.common.kafka.cdc.message.keys.FlightMsgKey;
import com.pdh.common.kafka.cdc.message.keys.FlightScheduleMsgKey;
import com.pdh.common.kafka.cdc.message.keys.FlightFareMsgKey;
import com.pdh.common.kafka.cdc.message.keys.HotelMsgKey;
import com.pdh.common.kafka.cdc.message.keys.RoomAvailabilityMsgKey;
import com.pdh.common.kafka.cdc.message.keys.RoomTypeMsgKey;

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
    public ConcurrentKafkaListenerContainerFactory<FlightScheduleMsgKey, FlightScheduleCdcMessage> flightScheduleKafkaListenerContainerFactory(KafkaProperties kafkaProperties) {
        BaseKafkaListenerConfig<FlightScheduleMsgKey, FlightScheduleCdcMessage> config = 
            new BaseKafkaListenerConfig<FlightScheduleMsgKey, FlightScheduleCdcMessage>(FlightScheduleMsgKey.class, FlightScheduleCdcMessage.class, kafkaProperties) {
                @Override
                public ConcurrentKafkaListenerContainerFactory<FlightScheduleMsgKey, FlightScheduleCdcMessage> listenerContainerFactory() {
                    return kafkaListenerContainerFactory();
                }
            };
        return config.listenerContainerFactory();
    }

    /**
     * Kafka listener container factory for flight fare CDC messages
     */
    @Bean
    public ConcurrentKafkaListenerContainerFactory<FlightFareMsgKey, FlightFareCdcMessage> flightFareKafkaListenerContainerFactory(KafkaProperties kafkaProperties) {
        BaseKafkaListenerConfig<FlightFareMsgKey, FlightFareCdcMessage> config = 
            new BaseKafkaListenerConfig<FlightFareMsgKey, FlightFareCdcMessage>(FlightFareMsgKey.class, FlightFareCdcMessage.class, kafkaProperties) {
                @Override
                public ConcurrentKafkaListenerContainerFactory<FlightFareMsgKey, FlightFareCdcMessage> listenerContainerFactory() {
                    return kafkaListenerContainerFactory();
                }
            };
        return config.listenerContainerFactory();
    }

    /**
     * Kafka listener container factory for room availability CDC messages
     */
    @Bean
    public ConcurrentKafkaListenerContainerFactory<RoomAvailabilityMsgKey, RoomAvailabilityCdcMessage> roomAvailabilityKafkaListenerContainerFactory(KafkaProperties kafkaProperties) {
        BaseKafkaListenerConfig<RoomAvailabilityMsgKey, RoomAvailabilityCdcMessage> config = 
            new BaseKafkaListenerConfig<RoomAvailabilityMsgKey, RoomAvailabilityCdcMessage>(RoomAvailabilityMsgKey.class, RoomAvailabilityCdcMessage.class, kafkaProperties) {
                @Override
                public ConcurrentKafkaListenerContainerFactory<RoomAvailabilityMsgKey, RoomAvailabilityCdcMessage> listenerContainerFactory() {
                    return kafkaListenerContainerFactory();
                }
            };
        return config.listenerContainerFactory();
    }

    /**
     * Kafka listener container factory for hotel CDC messages
     */
    @Bean
    public ConcurrentKafkaListenerContainerFactory<HotelMsgKey, HotelCdcMessage> hotelKafkaListenerContainerFactory(KafkaProperties kafkaProperties) {
        BaseKafkaListenerConfig<HotelMsgKey, HotelCdcMessage> config = 
            new BaseKafkaListenerConfig<HotelMsgKey, HotelCdcMessage>(HotelMsgKey.class, HotelCdcMessage.class, kafkaProperties) {
                @Override
                public ConcurrentKafkaListenerContainerFactory<HotelMsgKey, HotelCdcMessage> listenerContainerFactory() {
                    return kafkaListenerContainerFactory();
                }
            };
        return config.listenerContainerFactory();
    }

    /**
     * Kafka listener container factory for room type CDC messages
     */
    @Bean
    public ConcurrentKafkaListenerContainerFactory<RoomTypeMsgKey, RoomTypeCdcMessage> roomTypeKafkaListenerContainerFactory(KafkaProperties kafkaProperties) {
        BaseKafkaListenerConfig<RoomTypeMsgKey, RoomTypeCdcMessage> config = 
            new BaseKafkaListenerConfig<RoomTypeMsgKey, RoomTypeCdcMessage>(RoomTypeMsgKey.class, RoomTypeCdcMessage.class, kafkaProperties) {
                @Override
                public ConcurrentKafkaListenerContainerFactory<RoomTypeMsgKey, RoomTypeCdcMessage> listenerContainerFactory() {
                    return kafkaListenerContainerFactory();
                }
            };
        return config.listenerContainerFactory();
    }

    /**
     * Kafka listener container factory for flight CDC messages
     */
    @Bean
    public ConcurrentKafkaListenerContainerFactory<FlightMsgKey, FlightCdcMessage> flightKafkaListenerContainerFactory(KafkaProperties kafkaProperties) {
        BaseKafkaListenerConfig<FlightMsgKey, FlightCdcMessage> config = 
            new BaseKafkaListenerConfig<FlightMsgKey, FlightCdcMessage>(FlightMsgKey.class, FlightCdcMessage.class, kafkaProperties) {
                @Override
                public ConcurrentKafkaListenerContainerFactory<FlightMsgKey, FlightCdcMessage> listenerContainerFactory() {
                    return kafkaListenerContainerFactory();
                }
            };
        return config.listenerContainerFactory();
    }
}