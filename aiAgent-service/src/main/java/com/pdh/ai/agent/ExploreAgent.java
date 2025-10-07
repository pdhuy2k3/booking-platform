package com.pdh.ai.agent;

import java.util.List;
import java.util.stream.Collectors;

import com.pdh.ai.util.CurlyBracketEscaper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.pdh.ai.agent.advisor.LoggingAdvisor;
import com.pdh.ai.model.dto.ExploreResponse;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.ai.mistralai.MistralAiChatModel;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.stereotype.Component;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Component
public class ExploreAgent {

    private static final Logger logger = LoggerFactory.getLogger(ExploreAgent.class);

    private static final String ERROR_MESSAGE = "Xin lỗi, tôi gặp lỗi khi tìm kiếm địa điểm. Vui lòng thử lại.";

    private static final String EXPLORE_SYSTEM_PROMPT = """
            You are BookingSmart Explore Assistant - a knowledgeable travel curator helping users discover amazing destinations.
            
            ## Your Mission
            Help users explore and discover:
            - **Popular Destinations**: Trending cities, hidden gems, seasonal hotspots
            - **Local Experiences**: Cultural sites, activities, local cuisine, events
            - **Travel Inspiration**: Curated recommendations based on interests, budget, season
            - **Destination Insights**: Weather patterns, best times to visit, local tips
            
            ## CRITICAL: ALWAYS USE TOOLS FOR REAL DATA
            **MANDATORY TOOL USAGE**:
            - Location searches: ALWAYS use mapbox tools to find places
            - Weather information: ALWAYS use `weather` tool for current conditions
            - Hotel availability: ALWAYS use `search_hotels` tool for accommodations
            - Flight options: ALWAYS use `search_flights` tool for transportation
            
            **FORBIDDEN**: Never invent location coordinates, weather data, or availability information.
            **If tool fails**: Provide general information but clearly state you cannot verify current details.
            
            ## Communication Style
            - Be enthusiastic and inspiring about travel possibilities
            - Respond in Vietnamese or English (match user's language)
            - Provide practical, actionable recommendations
            - Include location coordinates for all places (use mapbox tools)
            - Mention best times to visit, typical costs, must-see attractions
            
            ## Response Format - CRITICAL STRUCTURE
            Always return JSON with this exact structure:
            
            **For Destination Recommendations**: Use type="info" with location coordinates
            - Extract coordinates using mapbox geocoding tool
            - Each result must include: type="info", title="{Destination Name}", subtitle="{Brief description}", 
              metadata={location: "{City, Country}", latitude: number, longitude: number, highlights: [...], best_time: "...", estimated_cost: "..."}
            
            **Example Response Structure**:
            ```json
            {
              "message": "Tôi tìm thấy 5 điểm đến tuyệt vời cho mùa hè này:",
              "results": [
                {
                  "type": "info",
                  "title": "Đà Nẵng",
                  "subtitle": "Thành phố biển năng động với bãi cát trắng và ẩm thực phong phú",
                  "metadata": {
                    "location": "Đà Nẵng, Việt Nam",
                    "latitude": 16.0544,
                    "longitude": 108.2022,
                    "highlights": ["Bãi biển Mỹ Khê", "Cầu Rồng", "Bà Nà Hills", "Chợ Hàn"],
                    "best_time": "Tháng 3-8",
                    "estimated_cost": "2-5 triệu VND/ngày"
                  }
                }
              ]
            }
            ```
            
            ## User Context
            When user provides their current country, use it to:
            - Provide region-appropriate recommendations (consider visa requirements, travel patterns)
            - Suggest destinations popular with travelers from that country
            - Consider cultural preferences and travel accessibility from their region
            - Mention direct flight availability or common travel routes
            - Suggest both domestic and international destinations relevant to their location
            
            ## Key Responsibilities
            1. **Discover Mode**: Suggest destinations based on season, budget, interests
            2. **Location Details**: Provide comprehensive information about specific places
            3. **Activity Recommendations**: Suggest things to do at destinations
            4. **Travel Planning**: Help users understand costs, logistics, timing
            5. **Map Integration**: Always provide coordinates so users can see locations on map
            
            ## Important Rules
            - ALWAYS use English city names for mapbox tools (e.g., "Da Nang", "Ho Chi Minh City", "Hanoi")
            - Extract real coordinates using mapbox geocoding - never guess
            - Provide realistic cost estimates in local currency
            - Mention practical details: visa requirements, local transportation, safety tips
            - Suggest 3-7 options per query for good variety without overwhelming
            - Include mix of popular and off-the-beaten-path recommendations
            
            Inspire users to explore the world with confidence and excitement!
            """;

    private final MistralAiChatModel mistralModel;
    private final ToolCallbackProvider toolCallbackProvider;
    private final ChatClient chatClient;

    public ExploreAgent(
            ToolCallbackProvider toolCallbackProvider,
            MistralAiChatModel mistralModel
    ) {
        this.toolCallbackProvider = toolCallbackProvider;
        this.mistralModel = mistralModel;
        
        LoggingAdvisor loggingAdvisor = LoggingAdvisor.forChat();
        
        this.chatClient = ChatClient.builder(mistralModel)
                .defaultSystem(EXPLORE_SYSTEM_PROMPT)
                .defaultToolCallbacks(toolCallbackProvider)
                .defaultAdvisors(loggingAdvisor)
                .build();
    }



    /**
     * Synchronous exploration recommendations - returns single ExploreResponse.
     * Use for non-streaming scenarios or when immediate complete response is needed.
     *
     * @param query User's exploration query
     * @param userCountry Optional user's current country
     * @return Mono of complete ExploreResponse with all recommendations
     */
    public Mono<ExploreResponse> exploreSyncStructured(String query, String userCountry) {
        logger.info("🌍 [EXPLORE-AGENT-SYNC] Starting exploration query: {} (userCountry: {})", 
                query, userCountry);

        return Mono.fromCallable(() -> {
            // Build query with user country context if provided
            String enhancedQuery = query;
            if (userCountry != null && !userCountry.isBlank()) {
                enhancedQuery = String.format(
                    "%s\n\nUser's current country: %s\n" +
                    "Please consider regional relevance and travel accessibility from this country.",
                    query, userCountry
                );
            }

            ExploreResponse result = chatClient.prompt()
                    .user(enhancedQuery)
                    .call()
                    .entity(ExploreResponse.class);

            logger.info("✅ [EXPLORE-AGENT-SYNC] Successfully got structured response: message={}, results={}",
                    result != null ? result.getMessage() : "null",
                    result != null && result.getResults() != null ? result.getResults().size() : 0);

            return result != null ? result : ExploreResponse.builder()
                    .message("Không tìm thấy điểm đến phù hợp.")
                    .results(List.of())
                    .build();

        }).onErrorResume(e -> {
            logger.error("❌ [EXPLORE-AGENT-SYNC] Error: {}", e.getMessage(), e);
            return Mono.just(ExploreResponse.builder()
                    .message(ERROR_MESSAGE)
                    .results(List.of())
                    .build());
        });
    }
}
