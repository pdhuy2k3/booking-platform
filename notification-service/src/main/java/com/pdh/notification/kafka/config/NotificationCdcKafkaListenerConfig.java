package com.pdh.notification.kafka.config;

import com.pdh.common.kafka.cdc.config.BaseKafkaListenerConfig;
import com.pdh.common.kafka.cdc.message.BookingCdcMessage;
import com.pdh.common.kafka.cdc.message.BookingMsgKey;

import org.springframework.boot.autoconfigure.kafka.KafkaProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;

/**
 * Notification service Kafka listener configuration
 * Creates the required notificationEventListenerContainerFactory bean
 */
@Configuration
public class NotificationCdcKafkaListenerConfig extends BaseKafkaListenerConfig<BookingMsgKey, BookingCdcMessage> {

    public NotificationCdcKafkaListenerConfig(KafkaProperties kafkaProperties) {
        super(BookingMsgKey.class, BookingCdcMessage.class, kafkaProperties);
    }

    @Bean("notificationEventListenerContainerFactory")
    @Override
    public ConcurrentKafkaListenerContainerFactory<BookingMsgKey, BookingCdcMessage> listenerContainerFactory() {
        return kafkaListenerContainerFactory();
    }
}
