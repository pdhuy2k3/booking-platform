package com.pdh.common.lock;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.jdbc.core.JdbcTemplate;

/**
 * Configuration for Distributed Lock Manager
 * Allows choosing between Redis and PostgreSQL implementations
 */
@Configuration
@Slf4j
public class LockManagerConfiguration {
    
    /**
     * Redis-based lock manager (default and recommended)
     * Enabled when: distributed-lock.provider=redis (default)
     */
    @Bean
    @Primary
    @ConditionalOnProperty(
        name = "distributed-lock.provider", 
        havingValue = "redis", 
        matchIfMissing = true  // Default to Redis if not specified
    )
    public DistributedLockManager redisDistributedLockManager(RedisTemplate<String, Object> redisTemplate) {
        log.info("Configuring Redis-based Distributed Lock Manager");
        return new RedisDistributedLockManager(redisTemplate);
    }
    
    /**
     * PostgreSQL-based lock manager (fallback option)
     * Enabled when: distributed-lock.provider=postgresql
     */
    @Bean
    @ConditionalOnProperty(
        name = "distributed-lock.provider", 
        havingValue = "postgresql"
    )
    public DistributedLockManager databaseDistributedLockManager(JdbcTemplate jdbcTemplate) {
        log.info("Configuring PostgreSQL-based Distributed Lock Manager");
        return new DatabaseDistributedLockManager(jdbcTemplate);
    }
}
