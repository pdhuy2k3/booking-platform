package com.pdh.common.lock;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnClass;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

/**
 * Configuration for Redis-based Distributed Lock Manager
 * Simplified to use Redis as the primary and only implementation
 */
@Configuration
@Slf4j
public class LockManagerConfiguration {
    @Bean
    @ConditionalOnClass(RedisConnectionFactory.class)
    public RedisTemplate<String, Object> lockRedisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        // Use String serializer for keys
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());

        // Use JSON serializer for values
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());

        template.afterPropertiesSet();
        log.info("Configured Redis template for distributed locking");
        return template;
    }
    /**
     * Redis-based lock manager
     * Provides high-performance distributed locking with automatic expiration
     */
    @Bean
    public DistributedLockManager distributedLockManager(RedisTemplate<String, Object> redisTemplate) {
        log.info("Configuring Redis-based Distributed Lock Manager");
        return new RedisDistributedLockManager(redisTemplate);
    }
}
