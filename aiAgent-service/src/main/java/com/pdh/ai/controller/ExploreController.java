package com.pdh.ai.controller;

import com.pdh.ai.agent.ExploreAgent;
import com.pdh.ai.model.dto.ExploreResponse;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/explore")
public class ExploreController {
    
    private final ExploreAgent exploreAgent;

    public ExploreController(ExploreAgent exploreAgent) {
        this.exploreAgent = exploreAgent;
    }

    /**
     * Explore destinations and travel recommendations
     * This endpoint is stateless and provides curated destination suggestions
     * 
     * Examples:
     * - GET /explore?query=popular beaches in Vietnam
     * - GET /explore?query=best summer destinations in Asia&userCountry=Vietnam
     * - GET /explore?query=romantic getaways under $1000
     * 
     * @param query The exploration query describing desired destinations/experiences
     * @param userCountry Optional user's current country (for region-based suggestions)
     * @return ResponseEntity with ExploreResponse containing destination recommendations
     */
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ExploreResponse> explore(
            @RequestParam String query,
            @RequestParam(required = false) String userCountry) {
        try {
            ExploreResponse result = exploreAgent.exploreSyncStructured(query, userCountry).block();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(
                ExploreResponse.builder()
                    .message("Xin lỗi, có lỗi xảy ra khi tìm kiếm địa điểm.")
                    .results(java.util.List.of())
                    .build()
            );
        }
    }

    /**
     * Get trending destinations (predefined popular queries)
     * 
     * @param userCountry Optional user's current country
     * @return ResponseEntity with trending destination recommendations
     */
    @GetMapping(value = "/trending", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ExploreResponse> getTrending(
            @RequestParam(required = false) String userCountry) {
        try {
            String trendingQuery = "What are the top 6 trending travel destinations right now? Include mix of beach, city, and nature destinations.";
            ExploreResponse result = exploreAgent.exploreSyncStructured(trendingQuery, userCountry).block();
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
     * Get seasonal recommendations based on current time of year
     * 
     * @param season Optional season parameter (spring, summer, fall, winter)
     * @param userCountry Optional user's current country
     * @return ResponseEntity with seasonal destination recommendations
     */
    @GetMapping(value = "/seasonal", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ExploreResponse> getSeasonalRecommendations(
            @RequestParam(required = false) String season,
            @RequestParam(required = false) String userCountry) {
        try {
            String query;
            if (season != null && !season.isEmpty()) {
                query = String.format("What are the best destinations to visit during %s? Suggest 5-6 locations with reasons.", season);
            } else {
                query = "What are the best destinations to visit right now based on current season? Suggest 5-6 locations with reasons.";
            }
            ExploreResponse result = exploreAgent.exploreSyncStructured(query, userCountry).block();
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
}
