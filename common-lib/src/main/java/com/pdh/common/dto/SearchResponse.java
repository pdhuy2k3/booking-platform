package com.pdh.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Standardized search response format for all services
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SearchResponse<T> {
    
    /**
     * The search results
     */
    private List<T> results;
    
    /**
     * Total number of results found
     */
    private Long totalCount;
    
    /**
     * Current page number (1-based)
     */
    private Integer page;
    
    /**
     * Number of results per page
     */
    private Integer limit;
    
    /**
     * Whether there are more results available
     */
    private Boolean hasMore;
    
    /**
     * The search query that was used
     */
    private String query;
    
    /**
     * Additional metadata about the search
     */
    private Map<String, Object> metadata;
    
    /**
     * Search execution time in milliseconds
     */
    private Long executionTimeMs;
    
    /**
     * Create a simple search response with just results and total count
     */
    public static <T> SearchResponse<T> of(List<T> results, String query) {
        return SearchResponse.<T>builder()
                .results(results)
                .totalCount((long) results.size())
                .query(query)
                .build();
    }
    
    /**
     * Create a paginated search response
     */
    public static <T> SearchResponse<T> of(List<T> results, Long totalCount, Integer page, Integer limit, String query) {
        return SearchResponse.<T>builder()
                .results(results)
                .totalCount(totalCount)
                .page(page)
                .limit(limit)
                .hasMore(totalCount > (long) page * limit)
                .query(query)
                .build();
    }
}
