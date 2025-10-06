package com.pdh.ai.agent;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.pdh.ai.agent.advisor.LoggingAdvisor;
import com.pdh.ai.agent.guard.InputValidationGuard;
import com.pdh.ai.agent.guard.ScopeGuard;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.converter.BeanOutputConverter;
import org.springframework.ai.ollama.api.OllamaOptions;
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
        Help users plan amazing trips with real, accurate information!
        """;
    private final ChatMemory chatMemory;
    private final ChatClient chatClient;
    private final ToolCallbackProvider toolCallbackProvider;
    
    public CoreAgent(
            ChatClient.Builder builder,
            ToolCallbackProvider toolCallbackProvider,
            JpaChatMemory chatMemory,
            InputValidationGuard inputValidationGuard,
            ScopeGuard scopeGuard
            ) {

        this.chatMemory = chatMemory;
        this.toolCallbackProvider = toolCallbackProvider;

         // Advisors


        MessageChatMemoryAdvisor memoryAdvisor = MessageChatMemoryAdvisor.builder(chatMemory)
                .order(Ordered.HIGHEST_PRECEDENCE + 10) // Ensure memory advisor runs early
                .build();
//        SecurityGuardAdvisor chatSecurityAdvisor = SecurityGuardAdvisor
//                .forChat(inputValidationGuard, scopeGuard);

        // ToolIsolationAdvisor toolCallbackAdvisor = ToolIsolationAdvisor.forSearch();
        LoggingAdvisor chatLoggingAdvisor = LoggingAdvisor.forChat();
        this.chatClient=builder
                .defaultSystem(SYSTEM_PROMPT)
                .defaultAdvisors(memoryAdvisor, chatLoggingAdvisor)
                .defaultToolCallbacks(toolCallbackProvider)
                .build();

    }


    /**
     * Streaming structured processing - returns Flux of StructuredChatPayload.
     * Combines streaming with structured output.
     * 
     * @param message User message to process
     * @param conversationId Conversation ID for context
     * @return Flux of StructuredChatPayload chunks
     */
    public Flux<StructuredChatPayload> processStreamStructured(String message, String conversationId) {
        logger.info("🚀 [TOOL-TRACKER] Starting processStreamStructured - conversationId: {}", conversationId);
        logger.info("🔍 [TOOL-TRACKER] User message: {}", message);
        
        return Flux.defer(() -> {
            // Create converter and get format instructions
            BeanOutputConverter<StructuredChatPayload> converter = 
                new BeanOutputConverter<>(StructuredChatPayload.class);
            Prompt prompt=new Prompt(message,
                    OllamaOptions.builder()
                            .format(converter.getJsonSchemaMap())
                            .build()
                    );
            
            
            Flux<ChatResponse> contentStream = chatClient.prompt(prompt)
                    .advisors(advisorSpec -> advisorSpec.param(ChatMemory.CONVERSATION_ID, conversationId))
                    .stream()
                    .chatResponse();

            return contentStream
                    .scan(new StringBuilder(), (acc, chunk) -> {
                        String chunkText = "";
                        if (chunk.getResult() != null && chunk.getResult().getOutput() != null) {
                            chunkText = chunk.getResult().getOutput().getText();
                        }
                        return acc.append(chunkText);
                    })
                    .doOnNext(accumulated -> {
                        logger.debug("🔍 [STREAM] Accumulated text length: {}", accumulated.length());
                        System.out.println("Current accumulated: " + accumulated.toString());
                    })
                    // Only try to convert when we have substantial content
                    .filter(accumulated -> accumulated.length() > 10) // Skip empty/tiny chunks
                    .mapNotNull(accumulated -> {
                        try {
                            String accumulatedText = accumulated.toString().trim();
                            
                            // Skip if text is too short or doesn't look like JSON
                            if (accumulatedText.length() < 10 || 
                                (!accumulatedText.startsWith("{") && !accumulatedText.contains("{"))) {
                                logger.debug("🔍 [STREAM] Skipping conversion - text too short or not JSON-like");
                                return null;
                            }
                            
                            StructuredChatPayload result = converter.convert(accumulatedText);
                            logger.info("✅ [STREAM] Successfully converted to structured payload");
                            return result;
                            
                        } catch (Exception e) {
                            // This is expected for incomplete JSON chunks
                            logger.debug("🔄 [STREAM] Conversion failed (expected for incomplete JSON): {}", e.getMessage());
                            return null;
                        }
                    })
                    // Ensure we always emit at least one result at the end
                    .switchIfEmpty(Flux.defer(() -> {
                        logger.warn("⚠️ [STREAM] No valid JSON detected in stream, creating fallback response");
                        return Flux.just(StructuredChatPayload.builder()
                                .message("Đã tìm kiếm xong nhưng không có kết quả phù hợp.")
                                .results(List.of())
                                .build());
                    }));
        }).onErrorResume(e -> {
            logger.error("❌ [TOOL-TRACKER] Error in processStreamStructured: {}", e.getMessage(), e);
            return Flux.just(StructuredChatPayload.builder()
                    .message(ERROR_MESSAGE)
                    .results(List.of())
                    .build());
        });
    }


}
