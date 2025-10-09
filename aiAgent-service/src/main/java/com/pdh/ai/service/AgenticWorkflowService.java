package com.pdh.ai.service;

import com.pdh.ai.agent.CoreAgent;
import com.pdh.ai.agent.workflow.ParallelizationWorkflow;
import com.pdh.ai.agent.workflow.RoutingWorkflow;
import com.pdh.ai.model.dto.StructuredChatPayload;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * UNIFIED Agentic Workflow Service - The ONLY service for intelligent AI processing.
 * 
 * This service combines ALL agentic patterns intelligently:
 * 1. **Routing** - Classifies queries and routes to specialized handlers
 * 2. **Parallelization** - Processes multiple items concurrently when beneficial
 * 3. **Standard Processing** - Uses CoreAgent for complex conversational AI
 * 
 * <p><b>Decision Tree:</b></p>
 * <pre>
 * User Query
 *     ↓
 * [Detect Query Type]
 *     ↓
 *     ├─ Simple/Conversational → CoreAgent (Standard Processing)
 *     │   └─ Handles: Complex reasoning, tool usage, booking, payments
 *     │
 *     ├─ Single-Target Specialized → Routing Workflow
 *     │   └─ Routes to: flight_search, hotel_search, destination_explore
 *     │
 *     └─ Multi-Target/Comparison → Routing + Parallelization
 *         └─ Processes items in parallel for speed
 * </pre>
 *
 * @author BookingSmart Team
 */
@Service
public class AgenticWorkflowService {

    private static final Logger logger = LoggerFactory.getLogger(AgenticWorkflowService.class);

    private final CoreAgent coreAgent;
    private final RoutingWorkflow routingWorkflow;
    private final ParallelizationWorkflow parallelizationWorkflow;
    private final ChatClient chatClient;

    @Value("${ai.workflow.agentic.enabled:true}")
    private boolean agenticWorkflowEnabled;

    @Value("${ai.workflow.parallelization.default-workers:3}")
    private int defaultWorkers;

    // Predefined specialized routes for travel queries
    private static final Map<String, String> TRAVEL_ROUTES = Map.of(
        "flight_search", """
            You are a flight search specialist. Analyze flight requirements and provide:
            1. Route analysis (direct vs layover, typical carriers)
            2. Price range and seasonal factors
            3. Best time to book
            4. Duration and convenience considerations
            Respond with actionable flight insights.
            """,
        
        "hotel_search", """
            You are a hotel recommendation expert. Analyze accommodation needs and provide:
            1. Neighborhood recommendations with pros/cons
            2. Price range by area and season
            3. Amenities and guest experience insights
            4. Booking tips (cancellation policies, best platforms)
            Respond with practical hotel guidance.
            """,
        
        "destination_explore", """
            You are a destination discovery specialist. Analyze travel interests and provide:
            1. Top attractions and hidden gems
            2. Best time to visit (weather, crowds, events)
            3. Budget breakdown (accommodation, food, activities)
            4. Local tips and cultural insights
            Respond with inspiring destination information.
            """,
        
        "general_travel", """
            You are a general travel assistant. Provide helpful travel information on any topic.
            Be concise, friendly, and redirect to specific services when appropriate.
            """
    );

    public AgenticWorkflowService(
            CoreAgent coreAgent,
            RoutingWorkflow routingWorkflow,
            ParallelizationWorkflow parallelizationWorkflow,
            ChatClient.Builder chatClientBuilder) {
        this.coreAgent = coreAgent;
        this.routingWorkflow = routingWorkflow;
        this.parallelizationWorkflow = parallelizationWorkflow;
        this.chatClient = chatClientBuilder.build();
    }

    /**
     * MAIN ENTRY POINT - Process any user query with optimal agentic pattern.
     * This is the method that chat.sync endpoint should call.
     *
     * @param message User's query
     * @param conversationId Conversation ID for context
     * @return StructuredChatPayload with results
     */
    public StructuredChatPayload processQuery(String message, String conversationId) {
        logger.info("🎯 [AGENTIC] Processing query: {}", truncate(message));

        if (!agenticWorkflowEnabled) {
            logger.info("➡️ [AGENTIC] Agentic workflows disabled, using CoreAgent");
            return StructuredChatPayload.builder()
                    .message("Using standard processing (agentic workflows disabled)")
                    .results(Collections.emptyList())
                    .build();
        }

        try {
            // Step 1: Analyze query to determine optimal pattern
            QueryAnalysis analysis = analyzeQuery(message);
            logger.info("📊 [AGENTIC] Analysis: type={}, needsParallel={}, confidence={}", 
                       analysis.queryType, analysis.needsParallelization, analysis.confidence);

            // Step 2: Route to appropriate processing strategy
            return switch (analysis.queryType) {
                case CONVERSATIONAL, BOOKING, COMPLEX -> processWithCoreAgent(message, conversationId);
                case SIMPLE_SPECIALIZED -> processWithRouting(message, analysis);
                case MULTI_TARGET -> processWithParallelization(message, analysis);
                case COMPARISON -> processWithRoutingAndParallel(message, analysis);
            };

        } catch (Exception e) {
            logger.error("❌ [AGENTIC] Processing failed: {}", e.getMessage(), e);
            return StructuredChatPayload.builder()
                    .message("Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu. Vui lòng thử lại.")
                    .results(Collections.emptyList())
                    .build();
        }
    }

    /**
     * Analyze query to determine optimal processing strategy.
     */
    private QueryAnalysis analyzeQuery(String message) {
        String lowerMessage = message.toLowerCase();

        // Keywords indicating different query types
        boolean hasBookingKeywords = containsAny(lowerMessage, 
            "book", "đặt", "reserve", "payment", "thanh toán", "confirm", "xác nhận");
        
        boolean hasToolKeywords = containsAny(lowerMessage,
            "weather", "thời tiết", "map", "bản đồ", "show me", "hiển thị");
        
        boolean hasMultipleItems = containsAny(lowerMessage,
            "compare", "so sánh", "between", "giữa", "versus", "vs", 
            "all", "tất cả", "multiple", "nhiều", "several", "vài");
        
        boolean hasNumberPattern = lowerMessage.matches(".*\\d+\\s+(cities|destinations|hotels|flights|places|thành phố|điểm đến|khách sạn).*");
        
        boolean hasEnumeration = lowerMessage.matches(".*(and|và|,).*");

        // Determine query type
        QueryType type;
        boolean needsParallel = false;
        double confidence = 0.8;

        if (hasBookingKeywords || hasToolKeywords) {
            type = QueryType.CONVERSATIONAL;
            logger.debug("🔍 [AGENTIC] Detected conversational/booking query");
        } else if (hasMultipleItems || hasNumberPattern) {
            if (hasMultipleItems && containsAny(lowerMessage, "compare", "so sánh", "versus")) {
                type = QueryType.COMPARISON;
                needsParallel = true;
                logger.debug("🔍 [AGENTIC] Detected comparison query");
            } else {
                type = QueryType.MULTI_TARGET;
                needsParallel = true;
                logger.debug("🔍 [AGENTIC] Detected multi-target query");
            }
        } else if (containsAny(lowerMessage, "flight", "chuyến bay", "hotel", "khách sạn", "destination", "điểm đến")) {
            type = QueryType.SIMPLE_SPECIALIZED;
            logger.debug("🔍 [AGENTIC] Detected simple specialized query");
        } else {
            type = QueryType.CONVERSATIONAL;
            logger.debug("🔍 [AGENTIC] Defaulting to conversational query");
        }

        return new QueryAnalysis(type, needsParallel, confidence, extractItems(message, hasEnumeration));
    }

    /**
     * Process with CoreAgent - For conversational, booking, tool usage.
     * This is the most powerful option with full context and tool access.
     */
    private StructuredChatPayload processWithCoreAgent(String message, String conversationId) {
        logger.info("🤖 [AGENTIC] Using CoreAgent (conversational/booking/tools)");
        
        try {
            // CoreAgent handles complex reasoning, tools, memory, etc.
            return coreAgent.processSyncStructured(message, conversationId).block();
        } catch (Exception e) {
            logger.error("❌ [AGENTIC] CoreAgent failed: {}", e.getMessage());
            return buildErrorResponse("CoreAgent processing failed");
        }
    }

    /**
     * Process with Routing - For simple specialized queries.
     */
    private StructuredChatPayload processWithRouting(String message, QueryAnalysis analysis) {
        logger.info("🔀 [AGENTIC] Using Routing Workflow (specialized prompt)");
        
        try {
            String result = routingWorkflow.route(message, TRAVEL_ROUTES);
            
            return StructuredChatPayload.builder()
                    .message(result)
                    .results(Collections.emptyList())
                    .build();
        } catch (Exception e) {
            logger.error("❌ [AGENTIC] Routing failed: {}", e.getMessage());
            return buildErrorResponse("Routing failed");
        }
    }

    /**
     * Process with Parallelization - For multi-target queries.
     */
    private StructuredChatPayload processWithParallelization(String message, QueryAnalysis analysis) {
        logger.info("⚡ [AGENTIC] Using Parallelization Workflow ({} items)", analysis.extractedItems.size());
        
        if (analysis.extractedItems.isEmpty()) {
            logger.warn("⚠️ [AGENTIC] No items extracted for parallelization, falling back to routing");
            return processWithRouting(message, analysis);
        }

        try {
            // Determine appropriate prompt based on query
            String prompt = buildParallelPrompt(message);
            
            int workers = Math.min(analysis.extractedItems.size(), defaultWorkers);
            List<String> results = parallelizationWorkflow.parallel(
                prompt, 
                analysis.extractedItems, 
                workers
            );

            // Aggregate results
            String aggregatedMessage = aggregateParallelResults(analysis.extractedItems, results);
            
            return StructuredChatPayload.builder()
                    .message(aggregatedMessage)
                    .results(Collections.emptyList())
                    .build();
        } catch (Exception e) {
            logger.error("❌ [AGENTIC] Parallelization failed: {}", e.getMessage());
            return buildErrorResponse("Parallel processing failed");
        }
    }

    /**
     * Process with Routing + Parallelization - For comparison queries.
     */
    private StructuredChatPayload processWithRoutingAndParallel(String message, QueryAnalysis analysis) {
        logger.info("🔀⚡ [AGENTIC] Using Routing + Parallelization (comparison)");
        
        if (analysis.extractedItems.isEmpty()) {
            logger.warn("⚠️ [AGENTIC] No items extracted for comparison, using voting pattern");
            return processWithVoting(message);
        }

        try {
            // Step 1: Determine route
            String routeKey = routingWorkflow.routeOnly(message, TRAVEL_ROUTES.keySet());
            String basePrompt = TRAVEL_ROUTES.get(routeKey);
            
            if (basePrompt == null) {
                basePrompt = TRAVEL_ROUTES.get("general_travel");
            }

            // Step 2: Parallel processing with specialized prompt
            String enhancedPrompt = basePrompt + "\n\nAnalyze this item: ";
            int workers = Math.min(analysis.extractedItems.size(), defaultWorkers);
            
            List<String> results = parallelizationWorkflow.parallel(
                enhancedPrompt,
                analysis.extractedItems,
                workers
            );

            // Step 3: Aggregate with comparison format
            String comparisonMessage = buildComparisonResponse(analysis.extractedItems, results);
            
            return StructuredChatPayload.builder()
                    .message(comparisonMessage)
                    .results(Collections.emptyList())
                    .build();
        } catch (Exception e) {
            logger.error("❌ [AGENTIC] Routing+Parallel failed: {}", e.getMessage());
            return buildErrorResponse("Comparison processing failed");
        }
    }

    /**
     * Process with Voting - Get multiple perspectives.
     */
    private StructuredChatPayload processWithVoting(String message) {
        logger.info("🗳️ [AGENTIC] Using Voting Pattern (diverse perspectives)");
        
        try {
            List<String> perspectives = parallelizationWorkflow.voting(message, 3);
            
            String aggregated = "Multiple Perspectives:\n\n" +
                perspectives.stream()
                    .map(p -> "---\n" + p)
                    .collect(Collectors.joining("\n\n"));
            
            return StructuredChatPayload.builder()
                    .message(aggregated)
                    .results(Collections.emptyList())
                    .build();
        } catch (Exception e) {
            logger.error("❌ [AGENTIC] Voting failed: {}", e.getMessage());
            return buildErrorResponse("Voting pattern failed");
        }
    }

    // ========== Helper Methods ==========

    private boolean containsAny(String text, String... keywords) {
        for (String keyword : keywords) {
            if (text.contains(keyword)) {
                return true;
            }
        }
        return false;
    }

    private List<String> extractItems(String message, boolean hasEnumeration) {
        if (!hasEnumeration) {
            return Collections.emptyList();
        }

        // Simple extraction: split by common delimiters
        String[] parts = message.split("(?i)(,|\\band\\b|\\bvà\\b|\\bor\\b|\\bhoặc\\b)");
        
        return Arrays.stream(parts)
                .map(String::trim)
                .filter(s -> s.length() > 2 && s.length() < 50) // Reasonable item length
                .filter(s -> !s.matches(".*[.?!]$")) // Not a sentence
                .collect(Collectors.toList());
    }

    private String buildParallelPrompt(String originalQuery) {
        String lowerQuery = originalQuery.toLowerCase();
        
        if (containsAny(lowerQuery, "destination", "điểm đến", "city", "thành phố")) {
            return "Analyze this destination for tourism: attractions, best time to visit, budget, highlights.";
        } else if (containsAny(lowerQuery, "hotel", "khách sạn", "accommodation")) {
            return "Analyze hotel options in this location: price range, neighborhoods, amenities, booking tips.";
        } else if (containsAny(lowerQuery, "flight", "chuyến bay", "route")) {
            return "Analyze this flight route: duration, price trends, airlines, booking recommendations.";
        } else {
            return "Provide comprehensive analysis for this travel-related item.";
        }
    }

    private String aggregateParallelResults(List<String> items, List<String> results) {
        StringBuilder sb = new StringBuilder();
        sb.append("Analysis Results:\n\n");
        
        for (int i = 0; i < items.size() && i < results.size(); i++) {
            sb.append(String.format("### %s\n", items.get(i)));
            sb.append(results.get(i));
            sb.append("\n\n");
        }
        
        return sb.toString();
    }

    private String buildComparisonResponse(List<String> items, List<String> results) {
        StringBuilder sb = new StringBuilder();
        sb.append("Comparison Results:\n\n");
        sb.append("| Item | Analysis |\n");
        sb.append("|------|----------|\n");
        
        for (int i = 0; i < items.size() && i < results.size(); i++) {
            String summary = results.get(i).length() > 200 
                ? results.get(i).substring(0, 200) + "..." 
                : results.get(i);
            sb.append(String.format("| %s | %s |\n", items.get(i), summary.replace("\n", " ")));
        }
        
        return sb.toString();
    }

    private StructuredChatPayload buildErrorResponse(String error) {
        return StructuredChatPayload.builder()
                .message("Xin lỗi, " + error + ". Vui lòng thử lại.")
                .results(Collections.emptyList())
                .build();
    }

    private String truncate(String text) {
        return text.length() > 100 ? text.substring(0, 100) + "..." : text;
    }

    // ========== Inner Classes ==========

    private enum QueryType {
        CONVERSATIONAL,  // Chat, booking, tool usage → CoreAgent
        BOOKING,         // Booking operations → CoreAgent
        COMPLEX,         // Complex reasoning → CoreAgent
        SIMPLE_SPECIALIZED, // Single specialized query → Routing
        MULTI_TARGET,    // Multiple items → Parallelization
        COMPARISON       // Comparison query → Routing + Parallelization
    }

    private record QueryAnalysis(
        QueryType queryType,
        boolean needsParallelization,
        double confidence,
        List<String> extractedItems
    ) {}
}
