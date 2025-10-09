package com.pdh.ai.controller;

import com.pdh.ai.agent.ExploreAgent;
import com.pdh.ai.model.dto.ExploreResponse;
import com.pdh.ai.service.AgenticWorkflowService;
import com.pdh.ai.service.ExploreCacheService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/explore")
public class ExploreController {
    
    private static final Logger logger = LoggerFactory.getLogger(ExploreController.class);
    
    private final ExploreAgent exploreAgent;
    private final ExploreCacheService exploreCacheService;
    private final AgenticWorkflowService agenticWorkflowService;

    public ExploreController(
            ExploreAgent exploreAgent, 
            ExploreCacheService exploreCacheService,
            AgenticWorkflowService agenticWorkflowService) {
        this.exploreAgent = exploreAgent;
        this.exploreCacheService = exploreCacheService;
        this.agenticWorkflowService = agenticWorkflowService;
    }

    /**
     * Get default explore recommendations (cached)
     * This endpoint is called when user first loads the page
     * Always returns recommendations for Vietnam
     * 
     * @return ResponseEntity with cached ExploreResponse containing default recommendations for Vietnam
     */
    @GetMapping("/default")
    public ResponseEntity<ExploreResponse> getDefaultRecommendations() {
        try {
            ExploreResponse result = exploreCacheService.getDefaultExploreRecommendations();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                ExploreResponse.builder()
                    .message("Xin lỗi, có lỗi xảy ra khi tải gợi ý du lịch.")
                    .results(java.util.List.of())
                    .build()
            );
        }
    }

    /**
     * Explore destinations and travel recommendations with intelligent routing and parallelization.
     * Now automatically uses Hybrid Workflow when beneficial for multi-destination or comparison queries.
     * 
     * <p>Processing Strategy:</p>
     * <ul>
     * <li><b>Standard Queries:</b> Uses specialized ExploreAgent for single-destination recommendations</li>
     * <li><b>Multi-Destination/Comparison:</b> Automatically routes to Hybrid Workflow for parallel processing</li>
     * </ul>
     * 
     * Examples:
     * - GET /explore?query=popular beaches in Vietnam (Standard)
     * - GET /explore?query=compare Hanoi, Da Nang, and Phu Quoc (Hybrid - Parallel)
     * - GET /explore?query=best 5 destinations in Southeast Asia (Hybrid - Parallel)
     * - GET /explore?query=romantic getaways under $1000 (Standard)
     * 
     * @param query The exploration query describing desired destinations/experiences
     * @param userCountry Optional user's current country (for region-based suggestions)
     * @param useHybrid Optional flag to force hybrid workflow (default: auto-detect)
     * @return ResponseEntity with ExploreResponse containing destination recommendations
     */
    @GetMapping()
    public ResponseEntity<ExploreResponse> explore(
            @RequestParam String query,
            @RequestParam(required = false) String userCountry,
            @RequestParam(required = false, defaultValue = "auto") String useHybrid) {
        try {
            logger.info("🔍 [EXPLORE] Received query: '{}', country: {}, hybrid: {}", query, userCountry, useHybrid);
            
            // Determine if hybrid workflow should be used
            boolean shouldUseHybrid = "true".equalsIgnoreCase(useHybrid) || 
                                     ("auto".equalsIgnoreCase(useHybrid) && detectMultiDestination(query));
            
            if (shouldUseHybrid) {
                logger.info("🔀⚡ [EXPLORE] Using Hybrid Workflow for multi-destination query");
                return exploreWithHybridWorkflow(query, userCountry);
            }
            
            // Standard explore processing
            logger.info("➡️ [EXPLORE] Using standard ExploreAgent");
            ExploreResponse result = exploreAgent.explore(query, userCountry);
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            logger.error("❌ [EXPLORE] Failed to process query: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(
                ExploreResponse.builder()
                    .message("Xin lỗi, có lỗi xảy ra khi tìm kiếm địa điểm.")
                    .results(java.util.List.of())
                    .build()
            );
        }
    }
    
    /**
     * Detect if query contains multiple destinations or comparison keywords.
     */
    private boolean detectMultiDestination(String query) {
        if (query == null) return false;
        
        String lowerQuery = query.toLowerCase();
        String[] multiKeywords = {
            "so sánh", "compare", "khác nhau", "giữa", "between",
            "và", "and", "hoặc", "or", "versus", "vs"
        };
        
        // Check for numbers indicating multiple items
        if (lowerQuery.matches(".*\\d+\\s+(điểm đến|destinations|thành phố|cities|nơi|places).*")) {
            return true;
        }
        
        // Check for multi-destination keywords
        for (String keyword : multiKeywords) {
            if (lowerQuery.contains(keyword)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Process explore query using agentic workflow and convert to ExploreResponse.
     */
    private ResponseEntity<ExploreResponse> exploreWithHybridWorkflow(String query, String userCountry) {
        try {
            // Enhance query with country context
            String enhancedQuery = query;
            if (userCountry != null && !query.toLowerCase().contains(userCountry.toLowerCase())) {
                enhancedQuery = query + " (User is from " + userCountry + ")";
            }
            
            // Process with agentic workflow orchestrator
            com.pdh.ai.model.dto.StructuredChatPayload payload = agenticWorkflowService.processQuery(enhancedQuery, null);
            
            // Convert to ExploreResponse format
            ExploreResponse exploreResponse = ExploreResponse.builder()
                    .message(payload.getMessage())
                    .results(java.util.List.of()) // Workflow returns text, structured parsing can be added later
                    .build();
            
            return ResponseEntity.ok(exploreResponse);
            
        } catch (Exception e) {
            logger.error("❌ [EXPLORE-HYBRID] Failed: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(
                ExploreResponse.builder()
                    .message("Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu.")
                    .results(java.util.List.of())
                    .build()
            );
        }
    }

    /**
     * Get trending destinations (not cached - fresh results)
     * 
     * @param userCountry Optional user's current country
     * @return ResponseEntity with trending destination recommendations
     */
    @GetMapping("/trending")
    public ResponseEntity<ExploreResponse> getTrending(
            @RequestParam(required = false, defaultValue = "Việt Nam") String userCountry) {
        try {
            String trendingQuery = "Giúp tôi liệt kê 3 điểm đến du lịch đang thịnh hành hiện nay tại " + userCountry + 
                                 ". Bao gồm các điểm đến biển, thành phố, và thiên nhiên với hình ảnh đẹp.";
            ExploreResponse result = exploreAgent.explore(trendingQuery, userCountry);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                ExploreResponse.builder()
                    .message("Xin lỗi, không thể tải điểm đến phổ biến.")
                    .results(java.util.List.of())
                    .build()
            );
        }
    }

    /**
     * Get seasonal recommendations based on current time of year (cached)
     * 
     * @param season Required season parameter (spring, summer, fall, winter)
     * @param userCountry Optional user's current country
     * @return ResponseEntity with seasonal destination recommendations
     */
    @GetMapping(value = "/seasonal")
    public ResponseEntity<ExploreResponse> getSeasonalRecommendations(
            @RequestParam(required = true) String season,
            @RequestParam(required = false, defaultValue = "Việt Nam") String userCountry) {
        try {
            ExploreResponse result = exploreCacheService.getSeasonalExploreRecommendations(season, userCountry);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                ExploreResponse.builder()
                    .message("Xin lỗi, không thể tải gợi ý theo mùa.")
                    .results(java.util.List.of())
                    .build()
            );
        }
    }

    /**
     * Compare multiple destinations using parallel processing.
     * This endpoint explicitly uses parallelization for destination comparison.
     * Returns structured ExploreResponse format.
     * 
     * @param destinations Comma-separated list of destinations to compare
     * @param criteria Optional comparison criteria (e.g., "budget travel", "family friendly")
     * @return ResponseEntity with parallel comparison results in ExploreResponse format
     */
    @GetMapping("/compare")
    public ResponseEntity<ExploreResponse> compareDestinations(
            @RequestParam String destinations,
            @RequestParam(required = false, defaultValue = "general tourism") String criteria) {
        try {
            logger.info("⚡ [EXPLORE-COMPARE] Comparing destinations: {} with criteria: {}", destinations, criteria);
            
            // Split destinations
            String[] destArray = destinations.split(",");
            java.util.List<String> destList = java.util.Arrays.stream(destArray)
                    .map(String::trim)
                    .collect(java.util.stream.Collectors.toList());
            
            if (destList.size() < 2) {
                return ResponseEntity.badRequest().body(
                    ExploreResponse.builder()
                        .message("Please provide at least 2 destinations to compare")
                        .results(java.util.List.of())
                        .build()
                );
            }
            
            // Create comparison query
            String comparisonQuery = String.format(
                "Compare these destinations: %s. Analyze each for %s. Include: key attractions, best time to visit, " +
                "budget considerations, unique experiences, and traveler ratings.", 
                String.join(", ", destList),
                criteria
            );
            
            // Process with agentic workflow (will auto-detect parallel processing)
            com.pdh.ai.model.dto.StructuredChatPayload payload = agenticWorkflowService.processQuery(comparisonQuery, null);
            
            logger.info("✅ [EXPLORE-COMPARE] Comparison completed for {} destinations", destList.size());
            
            // Return as ExploreResponse
            return ResponseEntity.ok(
                ExploreResponse.builder()
                    .message(payload.getMessage())
                    .results(java.util.List.of())
                    .build()
            );
            
        } catch (Exception e) {
            logger.error("❌ [EXPLORE-COMPARE] Failed to compare destinations: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(
                ExploreResponse.builder()
                    .message("Xin lỗi, không thể so sánh các điểm đến. Vui lòng thử lại.")
                    .results(java.util.List.of())
                    .build()
            );
        }
    }
}
