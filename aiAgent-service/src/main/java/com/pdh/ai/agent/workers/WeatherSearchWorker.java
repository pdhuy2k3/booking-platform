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
 * Specialized worker for weather information queries.
 *
 * <p>This worker handles weather-related requests including:</p>
 * <ul>
 *   <li>Current weather conditions for locations</li>
 *   <li>Weather forecasts (5-day forecast)</li>
 *   <li>Weather comparison between multiple destinations</li>
 *   <li>Travel weather recommendations</li>
 * </ul>
 *
 * <p>Uses OpenWeather MCP server for actual weather data.</p>
 *
 * @author BookingSmart AI Team
 */
@Component
public class WeatherSearchWorker extends BaseWorker {

    private static final String WORKER_NAME = "WEATHER_SEARCH";

    private final ChatClient chatClient;
    private final ToolResultCollector toolResultCollector;

    private static final String SYSTEM_PROMPT = """
        You are a specialized weather information assistant for travel planning.
        
        Your responsibilities:
        - Provide current weather conditions using the 'weather' tool from OpenWeather MCP server
        - Analyze weather forecasts for travel destinations
        - Compare weather between multiple locations
        - Provide weather-based travel recommendations
        - Alert about severe weather conditions that might affect travel
        
        Important notes:
        - City names must be in ENGLISH (e.g., "Ho Chi Minh City", not "Thành phố Hồ Chí Minh")
        - For Vietnamese cities: "Hanoi", "Ho Chi Minh City", "Da Nang", "Nha Trang", "Hue"
        - Default temperature unit is Celsius unless user requests otherwise
        - Always mention temperature, humidity, wind speed, and weather description
        
        When presenting weather information, highlight:
        - Current temperature and "feels like" temperature
        - Weather conditions (clear, cloudy, rain, etc.)
        - Humidity and wind speed
        - Forecast trends if relevant to travel planning
        - Recommendations based on weather (e.g., "Pack an umbrella", "Perfect beach weather")
        
        For travel planning context:
        - Suggest best times to visit based on weather
        - Alert if weather might affect flight schedules
        - Recommend appropriate clothing and gear
        """;

    private static final String OUTPUT_INSTRUCTIONS = """
        Return a JSON response with:
        {
            "summary": "Brief weather summary with travel implications",
            "itemsFound": number of locations checked,
            "recommendations": "Travel recommendations based on weather conditions"
        }
        """;

    public WeatherSearchWorker(ChatClient.Builder builder,
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
     * Searches for weather information based on location parameters.
     *
     * @param userRequest Original user request for context
     * @param parameters Search parameters (city names, comparison requests, etc.)
     * @return Structured results with weather information
     */
    public WorkerResponse search(String userRequest, Map<String, Object> parameters) {
        toolResultCollector.clear();

        try {
            String searchPrompt = buildWorkerPrompt(
                "User wants weather information for travel planning.\n" +
                "Use the 'weather' tool to get current weather data.\n" +
                "Provide helpful travel recommendations based on the weather conditions.\n" +
                "Remember: city names must be in ENGLISH.",
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
                "Failed to fetch weather information: " + e.getMessage());
        } finally {
            toolResultCollector.clear();
        }
    }

    /**
     * Compares weather between multiple destinations.
     *
     * @param userRequest Original user request
     * @param cities List of city names to compare
     * @return Comparison results with recommendations
     */
    public WorkerResponse compareWeather(String userRequest, List<String> cities) {
        toolResultCollector.clear();

        try {
            String comparePrompt = String.format("""
                User wants to compare weather between multiple destinations for travel planning.
                
                Cities to compare: %s
                Original request: %s
                
                For each city:
                1. Get current weather using the 'weather' tool
                2. Note key differences (temperature, conditions, etc.)
                3. Provide a comparison summary
                4. Recommend which destination has better weather for the user's purpose
                
                Remember: city names must be in ENGLISH.
                
                %s
                """,
                String.join(", ", cities),
                userRequest,
                OUTPUT_INSTRUCTIONS
            );

            String response = chatClient.prompt(comparePrompt)
                .call()
                .content();

            List<StructuredResultItem> results = toolResultCollector.consume();

            return WorkerResponse.success(WORKER_NAME, response, results);
        } catch (Exception e) {
            return WorkerResponse.failure(WORKER_NAME,
                "Failed to compare weather: " + e.getMessage());
        } finally {
            toolResultCollector.clear();
        }
    }
}
