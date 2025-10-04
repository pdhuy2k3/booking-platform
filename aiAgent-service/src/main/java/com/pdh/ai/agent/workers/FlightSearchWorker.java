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
 * Specialized worker for flight search operations.
 *
 * <p>This worker handles all flight-related queries including:</p>
 * <ul>
 *   <li>Searching available flights between destinations</li>
 *   <li>Checking seat availability</li>
 *   <li>Comparing flight options</li>
 *   <li>Providing flight details and recommendations</li>
 * </ul>
 *
 * <p>Uses MCP tools for actual flight service integration.</p>
 *
 * @author BookingSmart AI Team
 */
@Component
public class FlightSearchWorker extends BaseWorker {

    private static final String WORKER_NAME = "FLIGHT_SEARCH";

    private final ChatClient chatClient;
    private final ToolResultCollector toolResultCollector;

    private static final String SYSTEM_PROMPT = """
        You are a specialized flight search assistant.
        
        Your responsibilities:
        - Search for flights using the search_flights tool
        - Check seat availability for specific flights
        - Compare flight options based on price, duration, and convenience
        - Provide detailed flight information including layovers, airlines, and amenities
        
        Always use ISO date format (YYYY-MM-DD) for dates.
        Default pagination: page=0, size=20
        
        When presenting flights, highlight:
        - Total price and currency
        - Flight duration and layovers
        - Departure and arrival times (with timezone)
        - Available seat classes and counts
        - Airline and aircraft information
        """;

    private static final String OUTPUT_INSTRUCTIONS = """
        Return a JSON response with:
        {
            "summary": "Brief summary of search results",
            "itemsFound": number,
            "recommendations": "Your top recommendations with reasoning"
        }
        """;

    public FlightSearchWorker(ChatClient.Builder builder,
                             @Qualifier("customSyncMcpToolCallbackProvider") ToolCallbackProvider toolCallbackProvider,
                             ToolResultCollector toolResultCollector) {
        this.toolResultCollector = toolResultCollector;
        this.chatClient = builder
            .defaultSystem(SYSTEM_PROMPT)
            .defaultToolCallbacks(toolCallbackProvider)
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
     * Executes flight search based on parameters.
     *
     * @param userRequest Original user request for context
     * @param parameters Search parameters (origin, destination, date, etc.)
     * @return Structured results from flight search
     */
    public WorkerResponse search(String userRequest, Map<String, Object> parameters) {
        toolResultCollector.clear();

        try {
            String searchPrompt = buildWorkerPrompt(
                "User wants to search for flights.\nUse the search_flights tool to find available flights.\nAnalyze the results and provide helpful recommendations.",
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
            return WorkerResponse.failure(WORKER_NAME, "Failed to search flights: " + e.getMessage());
        } finally {
            toolResultCollector.clear();
        }
    }
}
