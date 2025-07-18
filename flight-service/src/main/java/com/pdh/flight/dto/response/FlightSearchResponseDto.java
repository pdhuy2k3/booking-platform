package com.pdh.flight.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for flight search response
 * Contains paginated flight results and metadata
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlightSearchResponseDto {
    
    /**
     * List of flight search results
     */
    private List<FlightSearchResultDto> flights;
    
    /**
     * Total number of flights found
     */
    private Long totalCount;
    
    /**
     * Current page number
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
     * Search filters and metadata
     */
    private SearchFilters filters;
    
    /**
     * Nested class for search filters and available options
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SearchFilters {
        
        /**
         * Price range information
         */
        private PriceRange priceRange;
        
        /**
         * Available airlines
         */
        private List<String> airlines;
        
        /**
         * Airport information
         */
        private AirportInfo airports;
        
        /**
         * Available seat classes
         */
        private List<String> seatClasses;
        
        /**
         * Duration range in minutes
         */
        private DurationRange durationRange;
    }
    
    /**
     * Nested class for price range
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PriceRange {
        private Double min;
        private Double max;
    }
    
    /**
     * Nested class for airport information
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AirportInfo {
        private List<AirportDto> origins;
        private List<AirportDto> destinations;
    }
    
    /**
     * Nested class for airport details
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AirportDto {
        private String code;
        private String name;
        private String city;
        private String country;
    }
    
    /**
     * Nested class for duration range
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DurationRange {
        private Integer min; // in minutes
        private Integer max; // in minutes
    }
}
