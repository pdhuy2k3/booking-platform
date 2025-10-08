package com.pdh.ai.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
@EnableCaching
public class CacheConfig {

    public static final String EXPLORE_CACHE = "explore";

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        
        // Configure Caffeine cache with specific settings
        cacheManager.setCaffeine(Caffeine.newBuilder()
            .initialCapacity(100)           // Initial cache size
            .maximumSize(1000)              // Maximum number of entries
            .expireAfterWrite(Duration.ofHours(6))  // Expire after 6 hours of writing
            .expireAfterAccess(Duration.ofHours(2)) // Expire after 2 hours of no access
            .recordStats()                  // Enable cache statistics
        );
        
        // Set cache names - only default explore cache
        cacheManager.setCacheNames(java.util.List.of(EXPLORE_CACHE));
        
        return cacheManager;
    }
}