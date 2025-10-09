package com.pdh.ai.agent.workflow;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;

/**
 * Implements the Routing Workflow pattern for intelligent task distribution in BookingSmart.
 * This pattern enables specialized handling for different types of travel-related queries.
 * 
 * <p>The routing workflow is particularly effective for:</p>
 * <ul>
 * <li>Complex tasks with distinct categories of travel queries (flights, hotels, destinations)</li>
 * <li>Different inputs requiring specialized processing (booking vs. exploration)</li>
 * <li>Classification that can be handled accurately by an LLM</li>
 * </ul>
 *
 * <p><b>BookingSmart Use Cases:</b></p>
 * <ul>
 * <li>Route flight search vs. hotel search vs. destination exploration</li>
 * <li>Direct booking requests vs. general inquiries</li>
 * <li>Simple queries to fast processing vs. complex multi-step workflows</li>
 * <li>User intent classification (book, explore, compare, inquire)</li>
 * </ul>
 *
 * <p><b>Integration with Parallelization:</b></p>
 * When combined with ParallelizationWorkflow:
 * <ul>
 * <li>Route determines WHAT to do (e.g., "multi-destination search")</li>
 * <li>Parallelization determines HOW to do it efficiently (concurrent processing)</li>
 * <li>Example: Route to "destination comparison" → Parallelize across multiple cities</li>
 * </ul>
 *
 * @author BookingSmart Team
 * @see ParallelizationWorkflow
 * @see org.springframework.ai.chat.client.ChatClient
 */
@Component
public class RoutingWorkflow {

    private static final Logger logger = LoggerFactory.getLogger(RoutingWorkflow.class);

    private final ChatClient chatClient;

    /**
     * Constructs a new RoutingWorkflow with the specified chat client.
     *
     * @param chatClient the Spring AI chat client used to make LLM calls for routing decisions
     */
    public RoutingWorkflow(ChatClient chatClient) {
        this.chatClient = chatClient;
    }

    /**
     * Routes input to a specialized prompt based on content classification.
     * This method first analyzes the input to determine the most appropriate route,
     * then processes the input using the specialized prompt for that route.
     * 
     * <p><b>Example Usage for BookingSmart:</b></p>
     * <pre>{@code
     * // Define specialized routes
     * Map<String, String> travelRoutes = Map.of(
     *     "flight_search", "You are a flight search specialist. Analyze flight options...",
     *     "hotel_booking", "You are a hotel expert. Find the best accommodations...",
     *     "destination_explore", "You are a travel advisor. Recommend destinations..."
     * );
     * 
     * String userQuery = "I want to find cheap flights from Hanoi to Da Nang next month";
     * String response = routingWorkflow.route(userQuery, travelRoutes);
     * // Will route to "flight_search" and process accordingly
     * }</pre>
     *
     * <p>The routing process involves:</p>
     * <ol>
     * <li>Content analysis to determine the appropriate category (flight, hotel, destination, etc.)</li>
     * <li>Selection of a specialized prompt optimized for that category</li>
     * <li>Processing the input with the selected prompt</li>
     * </ol>
     *
     * @param input  The user's travel query to be routed and processed
     * @param routes Map of route names to their corresponding specialized prompts.
     *               Route names should be descriptive (e.g., "flight_search", "hotel_booking")
     * @return Processed response from the selected specialized route
     * @throws IllegalArgumentException if input is null or routes is null/empty
     */
    public String route(String input, Map<String, String> routes) {
        Assert.notNull(input, "Input text cannot be null");
        Assert.notEmpty(routes, "Routes map cannot be null or empty");

        logger.info("🔀 [ROUTING-WORKFLOW] Starting route determination for input: {}", 
                    input.length() > 100 ? input.substring(0, 100) + "..." : input);

        // Determine the appropriate route for the input
        String routeKey = determineRoute(input, routes.keySet());

        // Get the selected prompt from the routes map
        String selectedPrompt = routes.get(routeKey);

        if (selectedPrompt == null) {
            logger.error("❌ [ROUTING-WORKFLOW] Selected route '{}' not found in routes map", routeKey);
            throw new IllegalArgumentException("Selected route '" + routeKey + "' not found in routes map");
        }

        logger.info("✅ [ROUTING-WORKFLOW] Route selected: '{}'. Processing with specialized prompt.", routeKey);

        // Process the input with the selected prompt
        long startTime = System.currentTimeMillis();
        String response = chatClient.prompt(selectedPrompt + "\n\nUser Query: " + input).call().content();
        long duration = System.currentTimeMillis() - startTime;

        logger.info("✅ [ROUTING-WORKFLOW] Completed processing via route '{}' in {}ms", routeKey, duration);

        return response;
    }

    /**
     * Routes input and returns the selected route key without processing.
     * Useful for hybrid workflows that need to know the route for further orchestration.
     *
     * <p><b>Example Usage for Hybrid Workflow:</b></p>
     * <pre>{@code
     * String routeKey = routingWorkflow.routeOnly(userQuery, travelRoutes.keySet());
     * if (routeKey.equals("multi_destination_search")) {
     *     // Use ParallelizationWorkflow for concurrent processing
     *     parallelWorkflow.parallel(prompt, destinations, 4);
     * } else {
     *     // Use standard route processing
     *     routingWorkflow.route(userQuery, travelRoutes);
     * }
     * }</pre>
     *
     * @param input           The user's query to analyze
     * @param availableRoutes Set of available route names
     * @return The selected route key based on content analysis
     */
    public String routeOnly(String input, Iterable<String> availableRoutes) {
        Assert.notNull(input, "Input text cannot be null");
        Assert.notNull(availableRoutes, "Available routes cannot be null");

        logger.info("🔀 [ROUTING-WORKFLOW] Determining route only (no processing)");
        return determineRoute(input, availableRoutes);
    }

    /**
     * Analyzes the input content and determines the most appropriate route based on
     * content classification. The classification process considers key terms, context,
     * and patterns in the input to select the optimal route.
     * 
     * <p>The method uses an LLM to:</p>
     * <ul>
     * <li>Analyze the input content and travel intent</li>
     * <li>Consider the available routing options</li>
     * <li>Provide reasoning for the routing decision</li>
     * <li>Select the most appropriate route</li>
     * </ul>
     *
     * @param input           The input text to analyze for routing
     * @param availableRoutes The set of available routing options
     * @return The selected route key based on content analysis
     */
    @SuppressWarnings("null")
    private String determineRoute(String input, Iterable<String> availableRoutes) {
        logger.debug("🔍 [ROUTING-WORKFLOW] Available routes: {}", availableRoutes);

        String selectorPrompt = String.format("""
                You are a travel query classifier for BookingSmart platform.
                
                Analyze the user's travel query and select the most appropriate category from these options: %s
                
                Consider:
                - Key terms related to flights, hotels, destinations, activities
                - User intent (booking, exploring, comparing, inquiring)
                - Urgency level and specificity
                - Multiple services mentioned (may need parallel processing)
                
                First explain your reasoning, then provide your selection in this JSON format:
                
                {
                    "reasoning": "Brief explanation of why this query should be routed to a specific category. Consider key terms, travel intent, and service type.",
                    "selection": "The chosen category name"
                }
                
                User Query: %s""", availableRoutes, input);

        RoutingResponse routingResponse = chatClient.prompt(selectorPrompt)
                .call()
                .entity(RoutingResponse.class);

        logger.info("📊 [ROUTING-WORKFLOW] Routing Analysis: {}", routingResponse.reasoning());
        logger.info("➡️ [ROUTING-WORKFLOW] Selected route: '{}'", routingResponse.selection());

        return routingResponse.selection();
    }

    /**
     * Record representing the response from the routing classification process.
     * 
     * @param reasoning   Detailed explanation of why a particular route was chosen
     * @param selection   The name of the selected route
     */
    public record RoutingResponse(String reasoning, String selection) {}
}
