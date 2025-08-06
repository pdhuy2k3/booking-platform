package com.pdh.hotel.kafka.config;

import com.pdh.common.kafka.cdc.config.BaseKafkaListenerConfig;
import com.pdh.common.kafka.cdc.message.BookingMsgKey;
import com.pdh.common.kafka.cdc.message.BookingCdcMessage;
import org.springframework.boot.autoconfigure.kafka.KafkaProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;

/**
 * Hotel service Kafka listener configuration
 * Chỉ cần override specific container factory cho typed events
 */
@Configuration
public class HotelCdcKafkaListenerConfig extends BaseKafkaListenerConfig<BookingMsgKey, BookingCdcMessage> {

    public HotelCdcKafkaListenerConfig(KafkaProperties kafkaProperties) {
        super(BookingMsgKey.class, BookingCdcMessage.class, kafkaProperties);
    }

    @Bean("hotelEventListenerContainerFactory")
    @Override
    public ConcurrentKafkaListenerContainerFactory<BookingMsgKey, BookingCdcMessage> listenerContainerFactory() {
        return kafkaListenerContainerFactory();
    }
}
