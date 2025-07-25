package com.pdh.common.lock;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.core.RedisTemplate;

/**
 * Configuration for Redis-based Distributed Lock Manager
 * Simplified to use Redis as the primary and only implementation
 */
@Configuration
@Slf4j
public class LockManagerConfiguration {

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
