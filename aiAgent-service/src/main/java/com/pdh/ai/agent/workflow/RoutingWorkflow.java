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

    private final ChatClient routingChatClient;

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
        this.routingChatClient = chatClient;
    }

    /**
     * Routes input to a specialized workflow based on content classification.
     *
     * @param userInput The user's travel request
     * @param availableRoutes Map of route names to their descriptions
     * @return The selected route key based on content analysis
     */
    public RoutingDecision route(String userInput, Map<String, String> availableRoutes) {
        return route(userInput, availableRoutes, null);
    }

    /**
     * Routes input to a specialized workflow based on content classification.
     *
     * @param userInput The user's travel request
     * @param availableRoutes Map of route names to their descriptions
     * @param conversationId The conversation ID for memory context (not used in routing)
     * @return The selected route key based on content analysis
     */
    public RoutingDecision route(String userInput, Map<String, String> availableRoutes, String conversationId) {
        Assert.notNull(userInput, "User input cannot be null");
        Assert.notEmpty(availableRoutes, "Available routes cannot be empty");

        System.out.println("\n=== ROUTING ANALYSIS ===");
        System.out.println("Available routes: " + availableRoutes.keySet());

        try {
            String routingPrompt = buildRoutingPrompt(userInput, availableRoutes);

            // IMPORTANT: Don't use conversation memory for routing analysis
            // Routing is internal classification and shouldn't pollute chat history
            RoutingDecision decision = routingChatClient.prompt(routingPrompt)
                    .call()
                    .entity(RoutingDecision.class);

            // Validate routing decision
            decision = validateAndCorrectDecision(decision, availableRoutes);

            if (decision != null) {
                System.out.printf("✅ Selected route: %s (confidence: %.2f%%)%nReasoning: %s%n",
                        decision.route(),
                        decision.confidence() * 100,
                        decision.reasoning());
            }

            return decision;
            
        } catch (Exception e) {
            System.err.printf("❌ Routing failed: %s%n", e.getMessage());
            // Return fallback routing decision
            return createFallbackDecision(availableRoutes);
        }
    }
    
    /**
     * Validates and corrects routing decision if needed.
     */
    private RoutingDecision validateAndCorrectDecision(RoutingDecision decision, Map<String, String> availableRoutes) {
        if (decision == null) {
            System.err.println("⚠️ Null routing decision, using fallback");
            return createFallbackDecision(availableRoutes);
        }
        
        // Validate route exists
        if (!availableRoutes.containsKey(decision.route())) {
            System.err.printf("⚠️ Invalid route '%s', using fallback%n", decision.route());
            return createFallbackDecision(availableRoutes);
        }
        
        // Validate confidence threshold
        if (decision.confidence() != null && decision.confidence() < 0.3) {
            System.err.printf("⚠️ Low confidence %.2f, using fallback%n", decision.confidence());
            return createFallbackDecision(availableRoutes);
        }
        
        return decision;
    }
    
    /**
     * Creates fallback routing decision when primary routing fails.
     */
    private RoutingDecision createFallbackDecision(Map<String, String> availableRoutes) {
        // Default to INQUIRY for general handling
        String fallbackRoute = availableRoutes.containsKey("INQUIRY") ? "INQUIRY" : 
                              availableRoutes.keySet().iterator().next();
                              
        return new RoutingDecision(
            "Fallback routing due to classification failure",
            fallbackRoute,
            0.5,
            Map.of()
        );
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
