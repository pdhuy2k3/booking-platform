package com.pdh.ai.agent.workflow;
import java.util.Map;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.util.Assert;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Routing workflow pattern that classifies user input and directs it to specialized workflows.
 *
 * <p>This workflow enables separation of concerns by routing different types of travel requests
 * to specialized agents optimized for specific categories:</p>
 * <ul>
 *   <li>SEARCH: Flight and hotel search queries</li>
 *   <li>BOOKING: Booking execution and confirmation</li>
 *   <li>INQUIRY: General questions about availability, prices, policies</li>
 *   <li>MODIFICATION: Changes to existing bookings</li>
 * </ul>
 *
 * <p>The routing process involves:</p>
 * <ol>
 *   <li>Content analysis to determine the appropriate category</li>
 *   <li>Selection of a specialized workflow optimized for that category</li>
 *   <li>Processing the input with the selected workflow</li>
 * </ol>
 *
 * @see <a href="https://www.anthropic.com/research/building-effective-agents">Building Effective Agents</a>
 */
public class RoutingWorkflow {

    private final ChatClient chatClient;

    /**
     * Routing decision made by the classifier.
     */
    public record RoutingDecision(
            @JsonProperty("reasoning") String reasoning,
            @JsonProperty("route") String route,
            @JsonProperty("confidence") Double confidence,
            @JsonProperty("extractedParams") Map<String, Object> extractedParams
    ) {}

    public RoutingWorkflow(ChatClient chatClient) {
        this.chatClient = chatClient;
    }

    /**
     * Routes input to a specialized workflow based on content classification.
     *
     * @param userInput The user's travel request
     * @param availableRoutes Map of route names to their descriptions
     * @return The selected route key based on content analysis
     */
    public RoutingDecision route(String userInput, Map<String, String> availableRoutes) {
        Assert.notNull(userInput, "User input cannot be null");
        Assert.notEmpty(availableRoutes, "Available routes cannot be empty");

        System.out.println("\n=== ROUTING ANALYSIS ===");
        System.out.println("Available routes: " + availableRoutes.keySet());

        String routingPrompt = buildRoutingPrompt(userInput, availableRoutes);

        @SuppressWarnings("null")
        RoutingDecision decision = chatClient.prompt(routingPrompt)
                .call()
                .entity(RoutingDecision.class);

        System.out.println(String.format("Selected route: %s (confidence: %.2f%%)\nReasoning: %s\n",
                decision.route(),
                decision.confidence() * 100,
                decision.reasoning()));

        return decision;
    }

    /**
     * Builds the routing classification prompt.
     */
    private String buildRoutingPrompt(String userInput, Map<String, String> routes) {
        StringBuilder routeDescriptions = new StringBuilder();
        routes.forEach((name, description) ->
                routeDescriptions.append(String.format("- %s: %s\n", name, description))
        );

        return String.format("""
            Analyze the user's travel request and classify it into the most appropriate category.
            
            Available Categories:
            %s
            
            User Request: "%s"
            
            Consider:
            1. Primary intent (search, book, inquire, modify)
            2. Urgency and complexity
            3. Required information completeness
            4. Key entities mentioned (flights, hotels, dates, locations)
            
            Also extract any parameters mentioned:
            - origin/destination cities
            - dates (checkIn, checkOut, departure, return)
            - number of passengers/guests
            - preferences (class, amenities, etc.)
            
            Return your analysis in this JSON format:
            {
                "reasoning": "Brief explanation of why this category was chosen",
                "route": "The chosen category name (must match exactly)",
                "confidence": 0.95,
                "extractedParams": {
                    "key": "value pairs of extracted information"
                }
            }
            """,
                routeDescriptions.toString(),
                userInput
        );
    }
}
