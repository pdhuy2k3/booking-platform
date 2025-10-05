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
 * Specialized worker for hotel search operations.
 *
 * <p>This worker handles all hotel-related queries including:</p>
 * <ul>
 *   <li>Searching available hotels by location</li>
 *   <li>Checking room availability</li>
 *   <li>Comparing hotel options by price, rating, and amenities</li>
 *   <li>Providing detailed hotel and room information</li>
 * </ul>
 *
 * <p>Uses MCP tools for actual hotel service integration.</p>
 *
 * @author BookingSmart AI Team
 */
@Component
public class HotelSearchWorker extends BaseWorker {

    private static final String WORKER_NAME = "HOTEL_SEARCH";

    private final ChatClient chatClient;
    private final ToolResultCollector toolResultCollector;

    private static final String SYSTEM_PROMPT = """
        You are a specialized hotel search assistant.
        
        Your responsibilities:
        - Search for hotels using the search_hotels tool
        - Check room availability and types
        - Compare hotels based on price, rating, location, and amenities
        - Provide detailed information about hotels including facilities and policies
        
        Always use ISO date format (YYYY-MM-DD) for check-in and check-out dates.
        Default pagination: page=0, size=20
        
        When presenting hotels, highlight:
        - Total price per night and for entire stay
        - Hotel rating and guest reviews
        - Location and distance to key attractions
        - Available room types and occupancy
        - Key amenities (WiFi, parking, breakfast, pool, etc.)
        - Cancellation policies
        """;

    private static final String OUTPUT_INSTRUCTIONS = """
        Return a JSON response with:
        {
            "summary": "Brief summary of search results",
            "itemsFound": number,
            "recommendations": "Your top recommendations with reasoning"
        }
        """;

    public HotelSearchWorker(ChatClient.Builder builder,
                            ToolCallbackProvider toolCallbackProvider,
                            ToolResultCollector toolResultCollector) {
        this.toolResultCollector = toolResultCollector;
        
        // Configure optimal ChatOptions for hotel search responses
        var hotelSearchOptions = org.springframework.ai.chat.prompt.ChatOptions.builder()
            .maxTokens(1200)        // Sufficient for detailed hotel results
            .temperature(0.4)       // Balanced accuracy for search tasks
            .topP(0.9)              // Good vocabulary range
            .presencePenalty(0.0)   // No penalty for independent searches
            .frequencyPenalty(0.2)  // Slight variety in descriptions
            .build();
        
        this.chatClient = builder
            .defaultSystem(SYSTEM_PROMPT)
            .defaultToolCallbacks(toolCallbackProvider)
            .defaultOptions(hotelSearchOptions)
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
     * Executes hotel search based on parameters.
     *
     * @param userRequest Original user request for context
     * @param parameters Search parameters (location, checkIn, checkOut, guests, etc.)
     * @return Structured results from hotel search
     */
    public WorkerResponse search(String userRequest, Map<String, Object> parameters) {
        toolResultCollector.clear();

        try {
            String searchPrompt = buildWorkerPrompt(
                "User wants to search for hotels.\nUse the search_hotels tool to find available accommodations.\nAnalyze the results and provide helpful recommendations.",
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
            return WorkerResponse.failure(WORKER_NAME, "Failed to search hotels: " + e.getMessage());
        } finally {
            toolResultCollector.clear();
        }
    }
}
