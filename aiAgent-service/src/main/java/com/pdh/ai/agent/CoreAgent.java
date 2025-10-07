package com.pdh.ai.agent;

import java.util.List;
import java.util.stream.Collectors;
import com.pdh.ai.util.CurlyBracketEscaper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.pdh.ai.agent.advisor.LoggingAdvisor;
import com.pdh.ai.agent.guard.InputValidationGuard;
import com.pdh.ai.agent.guard.ScopeGuard;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.ai.mistralai.MistralAiChatModel;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import com.pdh.ai.service.JpaChatMemory;

import com.pdh.ai.model.dto.StructuredChatPayload;


@Component

public class CoreAgent {

    private static final Logger logger = LoggerFactory.getLogger(CoreAgent.class);


    // Messages
    private static final String ERROR_MESSAGE = "Xin lỗi, tôi gặp lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại.";
    // private static final String MISSING_INFO_PREFIX = "Để tôi có thể giúp bạn tốt
    // hơn, tôi cần thêm một số thông tin:\n\n";
    private static final String MODIFICATION_NOT_IMPLEMENTED = "Tính năng thay đổi đặt chỗ đang được phát triển. Vui lòng liên hệ bộ phận hỗ trợ để được trợ giúp.";

    private static final String SYSTEM_PROMPT = """
            You are BookingSmart AI Travel Assistant - a professional, friendly travel booking assistant.
            ## CRITICAL: ALWAYS USE TOOLS - NEVER GENERATE FAKE DATA
            **MANDATORY TOOL USAGE**:
            - Flight searches: ALWAYS use `search_flights` tool
            - Hotel searches: ALWAYS use `search_hotels` tool  
            - Weather info: ALWAYS use `weather` tool
            - Locations/maps: ALWAYS use mapbox tools
            **FORBIDDEN**: Never invent flight schedules, hotel listings, weather data, or location info.
            **If tool fails**: Tell user the service is temporarily unavailable.
            ## Core Services
            **Flights**: Search real flights, compare options, provide booking guidance
            **Hotels**: Search accommodations, check availability, compare by location/price  
            **Weather**: Current conditions and forecasts for travel planning
            **Maps**: Find places, get directions, calculate travel times
            ## Communication
            - Respond in Vietnamese or English (match user's language)
            - Use ISO date format (YYYY-MM-DD) for all searches
            - Present clear options with reasoning
            - Always confirm details before any booking actions
            ## Important Rules
            - Use English city names for weather/location tools (e.g., "Hanoi", "Ho Chi Minh City", "Da Nang")
            - Never confirm bookings without explicit user approval
            - Provide multiple options when available
            - Ask clarifying questions when information is incomplete
            ## Response Format Instructions
            ALWAYS structure responses as JSON with message and results array.
            
            **For Flight Results**: Map flight data from search_flights tool response:
            - Tool returns: {flights: [...], totalCount, page, limit, hasMore, filters}
            - Each flight has: flightId, airline, flightNumber, origin, destination, departureTime, arrivalTime, duration, price, formattedPrice, currency, seatClass, availableSeats, aircraft
            - Map to result: type="flight", title="{airline} {flightNumber}", subtitle="{origin} → {destination} • {departureTime}-{arrivalTime}", metadata={price: formattedPrice, duration, airline, departure_time: departureTime, arrival_time: arrivalTime, available_seats: availableSeats, aircraft}
            
            **For Hotel Results**: Map hotel data from search_hotels tool response:
            - Tool returns: {hotels: [...], totalCount, page, limit, hasMore, filters}
            - Each hotel has: hotelId, name, address, city, country, rating, pricePerNight, currency, availableRooms, amenities, images, primaryImage
            - Map to result: type="hotel", title="{name}", subtitle="{city}, {country} • {rating}⭐", metadata={price: "{pricePerNight} {currency}/night", rating, location: "{city}, {country}", amenities: amenities, available_rooms: availableRooms}
            
            **For Info Results**: Use type="info" for general information, weather, or guidance
            
            Always extract real data from tool responses and format consistently.
            Help users plan amazing trips with real, accurate information!
            """;
    private final ChatMemory chatMemory;
    private final MistralAiChatModel mistraModel;
    private final ToolCallbackProvider toolCallbackProvider;
    private final ChatClient chatClient;

    public CoreAgent(
            ToolCallbackProvider toolCallbackProvider,
            JpaChatMemory chatMemory,
            InputValidationGuard inputValidationGuard,
            ScopeGuard scopeGuard,
            MistralAiChatModel mistraModel
    ) {

        this.chatMemory = chatMemory;
        this.toolCallbackProvider = toolCallbackProvider;
        this.mistraModel = mistraModel;
        // Advisors

        MessageChatMemoryAdvisor memoryAdvisor = MessageChatMemoryAdvisor.builder(chatMemory)
                .order(Ordered.HIGHEST_PRECEDENCE + 10) // Ensure memory advisor runs early
                .build();
//        SecurityGuardAdvisor chatSecurityAdvisor = SecurityGuardAdvisor
//                .forChat(inputValidationGuard, scopeGuard);

        // ToolIsolationAdvisor toolCallbackAdvisor = ToolIsolationAdvisor.forSearch();
        LoggingAdvisor chatLoggingAdvisor = LoggingAdvisor.forChat();
        this.chatClient = ChatClient.builder(mistraModel)
                .defaultSystem(SYSTEM_PROMPT)
                .defaultToolCallbacks(toolCallbackProvider)
                .defaultAdvisors(memoryAdvisor, chatLoggingAdvisor)
                .build();

    }


    /**
     * Streaming structured processing - returns Flux of StructuredChatPayload.
     * Follows Spring AI test pattern: collect stream, then convert to structured output.
     *
     * @param message        User message to process
     * @param conversationId Conversation ID for context
     * @return Flux of StructuredChatPayload chunks
     */
    public Flux<StructuredChatPayload> processStreamStructured(String message, String conversationId) {

        return Flux.defer(() -> {
            BeanOutputConverter<StructuredChatPayload> converter =
                    new BeanOutputConverter<>(StructuredChatPayload.class);

            logger.info("🚀 [STREAM-TOOL-TRACKER] Starting processStreamStructured - conversationId: {}", conversationId);
            logger.info("🔍 [STREAM-TOOL-TRACKER] User message: {}", message);
            logger.info("🔧 [STREAM-TOOL-TRACKER] JSON Schema generated: {}", converter.getFormat());

            // Stream content and collect into single StructuredChatPayload
            Flux<String> contentStream = chatClient.prompt()
                    .user(u->{
                        u.text(message+System.lineSeparator()+"{format}")
                                .param("format", CurlyBracketEscaper.escapeCurlyBrackets(converter.getFormat()));
                    })
                    
                    .advisors(advisorSpec -> advisorSpec
                            .param(ChatMemory.CONVERSATION_ID, conversationId))
                    .stream()
                    .content();

            return contentStream
                    .collectList()
                    .flatMapMany(chunks -> {
                        String generatedText = chunks.stream().collect(Collectors.joining());
                        logger.info("✅ [STREAM-TOOL-TRACKER] Collected {} chunks, total length: {}",
                                chunks.size(), generatedText.length());

                        try {
                            StructuredChatPayload result = converter.convert(generatedText);
                            logger.info("✅ [STREAM-TOOL-TRACKER] Converted to structured payload: message={}, results={}",
                                    result.getMessage(), result.getResults() != null ? result.getResults().size() : 0);
                            return Flux.just(result);
                        } catch (Exception e) {
                            logger.error("❌ [STREAM-TOOL-TRACKER] Conversion error: {}", e.getMessage(), e);
                            return Flux.just(StructuredChatPayload.builder()
                                    .message(ERROR_MESSAGE)
                                    .results(List.of())
                                    .build());
                        }
                    });
        }).onErrorResume(e -> {
            logger.error("❌ [STREAM-TOOL-TRACKER] Error in processStreamStructured: {}", e.getMessage(), e);
            return Flux.just(StructuredChatPayload.builder()
                    .message(ERROR_MESSAGE)
                    .results(List.of())
                    .build());
        });
    }

    /**
     * Synchronous structured processing - returns single StructuredChatPayload.
     * Uses ChatClient.entity() for direct structured output without streaming.
     *
     * @param message        User message to process
     * @param conversationId Conversation ID for context
     * @return Mono of complete StructuredChatPayload
     */
    public Mono<StructuredChatPayload> processSyncStructured(String message, String conversationId) {
        logger.info("🚀 [SYNC-TOOL-TRACKER] Starting processSyncStructured - conversationId: {}", conversationId);
        logger.info("🔍 [SYNC-TOOL-TRACKER] User message: {}", message);

        return Mono.fromCallable(() -> {


            // Use .entity() for direct structured output instead of streaming
            StructuredChatPayload result = chatClient.prompt()
                    .user(message)

                    .advisors(advisorSpec -> advisorSpec.param(ChatMemory.CONVERSATION_ID, conversationId))
                    .call()
                    .entity(StructuredChatPayload.class);

            logger.info("✅ [SYNC-TOOL-TRACKER] Successfully got structured response: message={}, results={}",
                    result != null ? result.getMessage() : "null",
                    result != null && result.getResults() != null ? result.getResults().size() : 0);

            return result != null ? result : StructuredChatPayload.builder()
                    .message("Đã xử lý yêu cầu nhưng không có kết quả.")
                    .results(List.of())
                    .build();

        }).onErrorResume(e -> {
            logger.error("❌ [SYNC-TOOL-TRACKER] Error in processSyncStructured: {}", e.getMessage(), e);
            return Mono.just(StructuredChatPayload.builder()
                    .message(ERROR_MESSAGE)
                    .results(List.of())
                    .build());
        });
    }


}
