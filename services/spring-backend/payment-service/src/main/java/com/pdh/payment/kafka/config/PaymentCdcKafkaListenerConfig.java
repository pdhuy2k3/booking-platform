package com.pdh.payment.kafka.config;

import com.pdh.common.kafka.cdc.config.BaseKafkaListenerConfig;
import com.pdh.common.kafka.cdc.message.BookingCdcMessage;
import com.pdh.common.kafka.cdc.message.BookingMsgKey;
import org.springframework.boot.autoconfigure.kafka.KafkaProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;

/**
 * Payment service Kafka listener configuration
 * Creates the required paymentEventListenerContainerFactory bean
 */
@Configuration
public class PaymentCdcKafkaListenerConfig extends BaseKafkaListenerConfig<BookingMsgKey, BookingCdcMessage> {

    public PaymentCdcKafkaListenerConfig(KafkaProperties kafkaProperties) {
        super(BookingMsgKey.class, BookingCdcMessage.class, kafkaProperties);
    }

    @Bean("paymentEventListenerContainerFactory")
    @Override
    public ConcurrentKafkaListenerContainerFactory<BookingMsgKey, BookingCdcMessage> listenerContainerFactory() {
        return kafkaListenerContainerFactory();
    }
}
