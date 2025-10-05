package com.pdh.ai.agent.workers;

import java.util.List;
import java.util.Map;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import com.pdh.ai.model.dto.StructuredResultItem;
import com.pdh.ai.service.ToolResultCollector;

/**
 * Specialized worker for location and mapping queries.
 *
 * <p>This worker handles location-related requests including:</p>
 * <ul>
 *   <li>Searching for places, POIs, addresses</li>
 *   <li>Geocoding and reverse geocoding</li>
 *   <li>Finding nearby attractions, restaurants, hotels</li>
 *   <li>Getting directions and travel time estimates</li>
 *   <li>Searching by category (restaurants, museums, etc.)</li>
 * </ul>
 *
 * <p>Uses Mapbox MCP server for location services.</p>
 *
 * @author BookingSmart AI Team
 */
@Component
public class LocationSearchWorker extends BaseWorker {

    private static final String WORKER_NAME = "LOCATION_SEARCH";

    private final ChatClient chatClient;
    private final ToolResultCollector toolResultCollector;

    private static final String SYSTEM_PROMPT = """
        You are a specialized location and mapping assistant for travel planning.
        
        Your responsibilities:
        - Search for places, addresses, and points of interest using Mapbox tools
        - Find nearby attractions, restaurants, hotels, and services
        - Provide directions and travel time estimates between locations
        - Search by category (e.g., "museums in Paris", "coffee shops near me")
        - Geocode addresses to coordinates and reverse geocode coordinates to addresses
        - Provide visual map representations when helpful
        
        Available Mapbox MCP tools:
        - search_and_geocode_tool: Search for places, addresses, cities by name
        - category_search_tool: Find all places matching a category (e.g., restaurants, hotels)
        - reverse_geocode_tool: Convert coordinates to human-readable addresses
        - directions_tool: Get directions and travel times between points
        - matrix_tool: Calculate travel times between multiple points
        - isochrone_tool: Show reachable areas within time/distance limits
        - static_map_image_tool: Generate static map images
        
        Best practices:
        - Use category_search_tool for generic queries like "restaurants", "museums" (plural)
        - Use search_and_geocode_tool for specific names or unique places
        - Set proximity parameter to bias results toward user's location
        - For Vietnamese locations, use English names when possible
        - Provide coordinates, addresses, and map links when relevant
        
        When presenting location results, include:
        - Place name and full address
        - Coordinates (latitude, longitude)
        - Distance from user's location or reference point
        - Category/type of place
        - Relevant details (opening hours, rating, etc. if available)
        - Travel directions or time if requested
        """;

    private static final String OUTPUT_INSTRUCTIONS = """
        Return a JSON response with:
        {
            "summary": "Brief summary of location search results with travel context",
            "itemsFound": number of locations found,
            "recommendations": "Top recommendations with reasoning and travel tips"
        }
        """;

    public LocationSearchWorker(ChatClient.Builder builder,
                               ToolCallbackProvider toolCallbackProvider,
                               ToolResultCollector toolResultCollector) {
        this.toolResultCollector = toolResultCollector;
        
        // Configure optimal ChatOptions for location search responses
        var locationOptions = org.springframework.ai.chat.prompt.ChatOptions.builder()
            .maxTokens(1000)        // Multiple locations with details
            .temperature(0.3)       // Factual location information
            .topP(0.85)             // Focused geography vocabulary
            .presencePenalty(0.0)   // No penalty for location data
            .frequencyPenalty(0.15) // Some variety in descriptions
            .build();
        
        this.chatClient = builder
            .defaultSystem(SYSTEM_PROMPT)
            .defaultToolCallbacks(toolCallbackProvider)
            .defaultOptions(locationOptions)
            .build();
    }

    @Override
    public String getWorkerName() {
        return WORKER_NAME;
    }

    @Override
    public String getSystemPrompt() {
        return SYSTEM_PROMPT;
    }

    @Override
    public String getOutputInstructions() {
        return OUTPUT_INSTRUCTIONS;
    }

    @Override
    public WorkerResponse execute(String userRequest, Map<String, Object> parameters) {
        return search(userRequest, parameters);
    }

    /**
     * Searches for locations based on query parameters.
     *
     * @param userRequest Original user request for context
     * @param parameters Search parameters (query, location, category, etc.)
     * @return Structured results with location information
     */
    public WorkerResponse search(String userRequest, Map<String, Object> parameters) {
        toolResultCollector.clear();

        try {
            String searchPrompt = buildWorkerPrompt(
                "User wants to search for locations or places.\n" +
                "Use appropriate Mapbox tools based on the query:\n" +
                "- For specific places/names: use search_and_geocode_tool\n" +
                "- For categories (plural like 'restaurants', 'museums'): use category_search_tool\n" +
                "- For 'where am I' or coordinate queries: use reverse_geocode_tool\n" +
                "Provide helpful travel recommendations and context.",
                userRequest,
                parameters,
                OUTPUT_INSTRUCTIONS
            );

            String response = chatClient.prompt(searchPrompt)
                .call()
                .content();

            List<StructuredResultItem> results = toolResultCollector.consume();

            return WorkerResponse.success(WORKER_NAME, response, results);
        } catch (Exception e) {
            return WorkerResponse.failure(WORKER_NAME,
                "Failed to search locations: " + e.getMessage());
        } finally {
            toolResultCollector.clear();
        }
    }

    /**
     * Finds places by category near a location.
     *
     * @param userRequest Original user request
     * @param category Category to search (e.g., "restaurant", "museum")
     * @param proximity Optional proximity point (latitude, longitude)
     * @return Category search results
     */
    public WorkerResponse searchByCategory(String userRequest, String category,
                                          Map<String, Object> proximity) {
        toolResultCollector.clear();

        try {
            String categoryPrompt = String.format("""
                User wants to find places in category: %s
                Original request: %s
                Proximity: %s
                
                Use the category_search_tool to find matching places.
                Provide results sorted by relevance and proximity.
                Include practical travel information (distance, how to get there, etc.).
                
                %s
                """,
                category,
                userRequest,
                proximity != null ? proximity.toString() : "not specified",
                OUTPUT_INSTRUCTIONS
            );

            String response = chatClient.prompt(categoryPrompt)
                .call()
                .content();

            List<StructuredResultItem> results = toolResultCollector.consume();

            return WorkerResponse.success(WORKER_NAME, response, results);
        } catch (Exception e) {
            return WorkerResponse.failure(WORKER_NAME,
                "Failed to search by category: " + e.getMessage());
        } finally {
            toolResultCollector.clear();
        }
    }

    /**
     * Gets directions between two locations.
     *
     * @param userRequest Original user request
     * @param origin Starting point (name or coordinates)
     * @param destination Ending point (name or coordinates)
     * @return Directions with travel time and distance
     */
    public WorkerResponse getDirections(String userRequest, String origin, String destination) {
        toolResultCollector.clear();

        try {
            String directionsPrompt = String.format("""
                User wants directions from %s to %s.
                Original request: %s
                
                Steps:
                1. If origin/destination are place names, use search_and_geocode_tool to get coordinates
                2. Use directions_tool to get routing information
                3. Provide clear step-by-step directions
                4. Include total travel time and distance
                5. Suggest best route based on travel mode
                
                %s
                """,
                origin,
                destination,
                userRequest,
                OUTPUT_INSTRUCTIONS
            );

            String response = chatClient.prompt(directionsPrompt)
                .call()
                .content();

            List<StructuredResultItem> results = toolResultCollector.consume();

            return WorkerResponse.success(WORKER_NAME, response, results);
        } catch (Exception e) {
            return WorkerResponse.failure(WORKER_NAME,
                "Failed to get directions: " + e.getMessage());
        } finally {
            toolResultCollector.clear();
        }
    }

    /**
     * Shows what areas are reachable within a time/distance limit.
     *
     * @param userRequest Original user request
     * @param location Starting location
     * @param timeMinutes Travel time limit in minutes
     * @return Isochrone map showing reachable areas
     */
    public WorkerResponse getReachableArea(String userRequest, String location, int timeMinutes) {
        toolResultCollector.clear();

        try {
            String isochronePrompt = String.format("""
                User wants to see what areas are reachable within %d minutes from %s.
                Original request: %s
                
                Steps:
                1. If location is a place name, use search_and_geocode_tool to get coordinates
                2. Use isochrone_tool to calculate reachable areas
                3. Provide context about what can be reached (neighborhoods, attractions, etc.)
                
                %s
                """,
                timeMinutes,
                location,
                userRequest,
                OUTPUT_INSTRUCTIONS
            );

            String response = chatClient.prompt(isochronePrompt)
                .call()
                .content();

            List<StructuredResultItem> results = toolResultCollector.consume();

            return WorkerResponse.success(WORKER_NAME, response, results);
        } catch (Exception e) {
            return WorkerResponse.failure(WORKER_NAME,
                "Failed to calculate reachable area: " + e.getMessage());
        } finally {
            toolResultCollector.clear();
        }
    }
}
