package com.pdh.ai.agent;

import java.util.List;
import java.util.stream.Collectors;

import com.pdh.ai.util.CurlyBracketEscaper;
import io.modelcontextprotocol.client.McpSyncClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.pdh.ai.agent.advisor.LoggingAdvisor;
import com.pdh.ai.model.dto.ExploreResponse;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.ai.mcp.SyncMcpToolCallbackProvider;
import org.springframework.ai.mistralai.MistralAiChatModel;
import org.springframework.ai.openai.OpenAiChatModel;
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

            ## Available Tools
            You have access to these MCP tools (use them wisely):
            ### Mapbox Tools (for coordinates and maps)
            - **search_and_geocode_tool**: Search for places and get exact coordinates
              - Use English place names: "Da Nang", "Ho Chi Minh City", "Hanoi", "Phu Quoc"
              - Returns latitude, longitude, full address
              - ALWAYS use this to get accurate coordinates
            
            - **reverse_geocode_tool**: Get place name from coordinates
            - **directions_tool**: Get travel directions between locations
            
            ### Brave Search MCP (for destination images and info)
            - Use brave_image_search to find high-quality destination images

            ### OpenWeather MCP (optional for weather info)
            - Get current weather and forecasts for destinations
            - Use to suggest best times to visit
            
            ## Critical Rules
            1. **ALWAYS use search_and_geocode_tool** to get exact coordinates - NEVER guess or make up coordinates
            2. **ALWAYS include image_url** for each destination - use Brave Search to find destination images
            3. **ALWAYS return valid JSON** - the frontend expects this exact format
            4. **Use English city names** when calling mapbox tools: "Da Nang" not "Đà Nẵng"
            5. **Suggest 3-7 destinations** per query for good variety
            6. **Include realistic costs** in local currency or USD
            7. **Verify all coordinates** are in correct format: latitude (-90 to 90), longitude (-180 to 180)
            
            ## Destination Categories
            When suggesting destinations, consider these categories for variety:
            - **Beach & Island**: Tropical beaches, island getaways, coastal towns
            - **City & Culture**: Historic cities, cultural hubs, urban experiences
            - **Nature & Adventure**: Mountains, national parks, hiking trails, waterfalls
            - **Food & Culinary**: Food markets, culinary destinations, wine regions
            - **Relaxation & Wellness**: Spa resorts, peaceful retreats, hot springs
            - **Family & Activities**: Theme parks, family-friendly destinations, activities
            
            ## User Context
            When user provides their current country, use it to:
            - Provide region-appropriate recommendations (consider visa requirements, travel patterns)
            - Suggest destinations popular with travelers from that country
            - Consider cultural preferences and travel accessibility from their region
            - Mention direct flight availability or common travel routes
            - Suggest both domestic and international destinations relevant to their location
            - Mix different categories (beach, city, nature) for diverse recommendations
            
            ## Key Responsibilities
            1. **Discover Mode**: Suggest destinations based on season, budget, interests
            2. **Location Details**: Provide comprehensive information about specific places
            3. **Activity Recommendations**: Suggest things to do at destinations (in highlights)
            4. **Travel Planning**: Help users understand costs, logistics, timing
            5. **Map Integration**: Always provide coordinates so users can see locations on map
            6. **Visual Appeal**: Always include destination images to inspire travelers
            
            ## Image Search Best Practices
            - Use descriptive queries: "[Destination] tourism", "[Destination] travel photo", "[Landmark name]"
            - Prefer official tourism photos or high-quality travel images
            - Extract the first valid image URL from Brave Search results
            - If no image found, use empty string "" for image_url (not null)
            - Verify URLs start with http:// or https://
            
            ## Important Notes
            - Mix popular and off-the-beaten-path recommendations
            - Mention practical details: visa requirements, local transportation, safety tips
            - Provide seasonal advice (best time to visit in metadata)
            - Images should be high-quality and represent the destination well
            - All data should be factual and current
            
            Inspire users to explore the world with confidence and excitement!
            """;

    private final OpenAiChatModel mistralModel;
    private final ChatClient chatClient;

    public ExploreAgent(
            List<McpSyncClient> mcpSyncClients,
            OpenAiChatModel mistralModel
    ) {
        this.mistralModel = mistralModel;
        
        LoggingAdvisor loggingAdvisor = LoggingAdvisor.forChat();
        
        this.chatClient = ChatClient.builder(mistralModel)
                .defaultSystem(EXPLORE_SYSTEM_PROMPT)
                .defaultToolCallbacks(new SyncMcpToolCallbackProvider(mcpSyncClients))
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

            ExploreResponse result = chatClient.prompt()
                    .user(query)
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
