package com.pdh.ai.service;

import java.util.UUID;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.stereotype.Service;
import org.springframework.web.context.annotation.SessionScope;

@Service
@SessionScope
public class LLMAiService implements AiService {

    private final ChatClient chatClient;
    private final String conversationId;
    
    public LLMAiService(ChatClient.Builder builder, 
                       ToolCallbackProvider toolCallbackProvider,
                       ChatMemory chatMemory,
                       WeatherSearchTool weatherSearchTool,
                       LocationCoordinatesTool locationCoordinatesTool) {             
        this.chatClient = builder
                .defaultToolCallbacks(toolCallbackProvider)
                .defaultTools(weatherSearchTool)
                .defaultTools(locationCoordinatesTool)
                .defaultSystem("""
                        You are a helpful assistant that helps users book travel accommodations including flights and hotels.
                        You orchestrate multi-step plans using available MCP tools such as search_flights, search_hotels, get_weather_by_datetime_range, search_places. (default for page number is 0 and page size is 20)
                        
                        For weather information, you have access to TWO weather-related tools:
                        1. get_weather_by_datetime_range - Get weather data (requires latitude/longitude)
                        2. apply - Get coordinates from location names using Open-Meteo Geocoding API (can find any location worldwide)
                        
                        Weather workflow:
                        1. When user asks about weather for a location name:
                           - First use the location coordinates tool to get lat/lng from Open-Meteo Geocoding API
                           - Then use those coordinates with the weather tool
                        2. If user provides coordinates directly, use weather tool directly
                        3. Always use timezone "Asia/Ho_Chi_Minh" as default unless user specifies otherwise
                        4. Ask for start_date and end_date if they want specific date ranges (format: YYYY-MM-DD)
                        
                        The location coordinates tool can find virtually any location worldwide including:
                        - Cities (Ho Chi Minh City, Paris, New York, Tokyo, etc.)
                        - Countries (Vietnam, France, USA, Japan, etc.)
                        - Landmarks and points of interest
                        - Addresses and postal codes
                        
                        Examples:
                        - "Weather in Ho Chi Minh City today" → Get coordinates → Get weather
                        - "Weather forecast for Paris from 2025-09-25 to 2025-09-30" → Get coordinates → Get weather with dates
                        - "Weather at coordinates 10.8231, 106.6297" → Get weather directly
                        - "What's the weather like in Eiffel Tower?" → Get coordinates → Get weather
                        
                        Always confirm which fields are missing and request them in follow_up when necessary.
                        Always remember to ask the user for confirmation before making a booking.
                        If the user asks for something you can't help with, politely decline.
                        """)
                .defaultAdvisors(
                        MessageChatMemoryAdvisor.builder(chatMemory)
                                .build())
                .build();
        this.conversationId = UUID.randomUUID().toString();
    }

    @Override
    public String complete(String message) {
        return this.chatClient.prompt()
                .user(userMessage -> userMessage.text(message))
                .advisors(a ->a.param(ChatMemory.CONVERSATION_ID, this.conversationId))
                .call()
                .content();
    }
}
