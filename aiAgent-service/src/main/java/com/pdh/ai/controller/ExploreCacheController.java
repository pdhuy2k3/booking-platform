package com.pdh.ai.controller;

import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.pdh.ai.service.ExploreCacheService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/explore/cache")
public class ExploreCacheController {

    private final ExploreCacheService exploreCacheService;
    private final CacheManager cacheManager;

    public ExploreCacheController(ExploreCacheService exploreCacheService, CacheManager cacheManager) {
        this.exploreCacheService = exploreCacheService;
        this.cacheManager = cacheManager;
    }

    /**
     * Get cache statistics for monitoring
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getCacheStats() {
        Map<String, Object> stats = new HashMap<>();
        
        cacheManager.getCacheNames().forEach(cacheName -> {
            var cache = cacheManager.getCache(cacheName);
            if (cache instanceof CaffeineCache caffeineCache) {
                var nativeCache = caffeineCache.getNativeCache();
                var cacheStats = nativeCache.stats();
                
                Map<String, Object> cacheStatMap = Map.of(
                    "size", nativeCache.estimatedSize(),
                    "hitCount", cacheStats.hitCount(),
                    "missCount", cacheStats.missCount(),
                    "hitRate", cacheStats.hitRate(),
                    "evictionCount", cacheStats.evictionCount(),
                    "loadCount", cacheStats.loadCount(),
                    "averageLoadTimeNanos", cacheStats.averageLoadPenalty()
                );
                
                stats.put(cacheName, cacheStatMap);
            }
        });
        
        return ResponseEntity.ok(stats);
    }

    /**
     * Clear all caches
     */
    @DeleteMapping("/clear")
    public ResponseEntity<Map<String, String>> clearAllCaches() {
        exploreCacheService.clearDefaultCache();
        return ResponseEntity.ok(Map.of("message", "Default explore cache cleared successfully"));
    }

    /**
     * Clear default cache for Vietnam
     */
    @DeleteMapping("/clear/default")
    public ResponseEntity<Map<String, String>> clearDefaultCache() {
        exploreCacheService.clearDefaultCache("Việt Nam");
        return ResponseEntity.ok(Map.of("message", "Default cache cleared for Vietnam"));
    }

}