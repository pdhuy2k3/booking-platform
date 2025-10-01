package com.pdh.common.kafka.cdc.config;

import org.springframework.boot.autoconfigure.kafka.KafkaProperties;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.support.serializer.ErrorHandlingDeserializer;
import org.springframework.kafka.support.serializer.JsonDeserializer;

import java.util.Map;

/**
 * Base configuration class for setting up Kafka consumers with typed deserialization.
 */
public abstract class BaseKafkaListenerConfig<K, V> {

    private final Class<K> keyType;
    private final Class<V> valueType;
    private final KafkaProperties kafkaProperties;

    public BaseKafkaListenerConfig(Class<K> keyType, Class<V> valueType, KafkaProperties kafkaProperties) {
        this.keyType = keyType;
        this.valueType = valueType;
        this.kafkaProperties = kafkaProperties;
    }

    /**
     * Abstract method to provide a custom instance of ConcurrentKafkaListenerContainerFactory.
     * Override method must be recognized as bean
     */
    public abstract ConcurrentKafkaListenerContainerFactory<K, V> listenerContainerFactory();

    /**
     * Common instance type ConcurrentKafkaListenerContainerFactory.
     */
    public ConcurrentKafkaListenerContainerFactory<K, V> kafkaListenerContainerFactory() {
        var factory = new ConcurrentKafkaListenerContainerFactory<K, V>();
        factory.setConsumerFactory(typeConsumerFactory(keyType, valueType));
        return factory;
    }

    private ConsumerFactory<K, V> typeConsumerFactory(Class<K> keyClazz, Class<V> valueClazz) {
        Map<String, Object> props = buildConsumerProperties();
        // wrapper in case serialization/deserialization occur
        var keyDeserialize = new ErrorHandlingDeserializer<>(getJsonDeserializer(keyClazz));
        var valueDeserialize = new ErrorHandlingDeserializer<>(getJsonDeserializer(valueClazz));
        return new DefaultKafkaConsumerFactory<>(props, keyDeserialize, valueDeserialize);
    }

    private static <T> JsonDeserializer<T> getJsonDeserializer(Class<T> clazz) {
        var jsonDeserializer = new JsonDeserializer<>(clazz);
        jsonDeserializer.addTrustedPackages("*");
        jsonDeserializer.ignoreTypeHeaders();
        return jsonDeserializer;
    }

    private Map<String, Object> buildConsumerProperties() {
        return kafkaProperties.buildConsumerProperties(null);
    }
}
