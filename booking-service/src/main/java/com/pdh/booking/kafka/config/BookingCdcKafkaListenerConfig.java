package com.pdh.booking.kafka.config;

import com.pdh.common.kafka.cdc.config.BaseKafkaListenerConfig;
import com.pdh.common.kafka.cdc.message.BookingCdcMessage;
import com.pdh.common.kafka.cdc.message.BookingMsgKey;
import org.springframework.boot.autoconfigure.kafka.KafkaProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;

/**
 * Booking CDC Kafka Listener Configuration
 */
@EnableKafka
@Configuration
public class BookingCdcKafkaListenerConfig extends BaseKafkaListenerConfig<BookingMsgKey, BookingCdcMessage> {

    public static final String BOOKING_CDC_LISTENER_CONTAINER_FACTORY = "bookingCdcListenerContainerFactory";

    public BookingCdcKafkaListenerConfig(KafkaProperties kafkaProperties) {
        super(BookingMsgKey.class, BookingCdcMessage.class, kafkaProperties);
    }

    @Bean(name = BOOKING_CDC_LISTENER_CONTAINER_FACTORY)
    @Override
    public ConcurrentKafkaListenerContainerFactory<BookingMsgKey, BookingCdcMessage> listenerContainerFactory() {
        return super.kafkaListenerContainerFactory();
    }
}
