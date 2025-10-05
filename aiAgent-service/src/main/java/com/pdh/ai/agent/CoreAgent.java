package com.pdh.ai.agent;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.pdh.ai.agent.advisor.LoggingAdvisor;
import com.pdh.ai.agent.advisor.SecurityGuardAdvisor;
import com.pdh.ai.agent.advisor.ToolIsolationAdvisor;
import com.pdh.ai.agent.guard.InputValidationGuard;
import com.pdh.ai.agent.guard.ScopeGuard;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.prompt.ChatOptions;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import org.stringtemplate.v4.compiler.CodeGenerator.primary_return;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import com.pdh.ai.agent.workflow.ParallelizationWorkflow;
import com.pdh.ai.agent.workflow.RoutingWorkflow;
import com.pdh.ai.agent.workers.BaseWorker;
import com.pdh.ai.agent.workers.BookingWorker;
import com.pdh.ai.agent.workers.FlightSearchWorker;
import com.pdh.ai.agent.workers.HotelSearchWorker;
import com.pdh.ai.agent.workers.WeatherSearchWorker;
import com.pdh.ai.agent.workers.LocationSearchWorker;
import com.pdh.ai.model.dto.StructuredChatPayload;
import com.pdh.ai.model.dto.StructuredResultItem;

@Component

public class CoreAgent {

    // Route constants
    private static final String ROUTE_SEARCH = "SEARCH";
    private static final String ROUTE_BOOKING = "BOOKING";
    private static final String ROUTE_INQUIRY = "INQUIRY";
    private static final String ROUTE_MODIFICATION = "MODIFICATION";
    private static final String ROUTE_WEATHER = "WEATHER";
    private static final String ROUTE_LOCATION = "LOCATION";


    // Messages
    private static final String ERROR_MESSAGE = "Xin lỗi, tôi gặp lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại.";
    // private static final String MISSING_INFO_PREFIX = "Để tôi có thể giúp bạn tốt
    // hơn, tôi cần thêm một số thông tin:\n\n";
    private static final String MODIFICATION_NOT_IMPLEMENTED = "Tính năng thay đổi đặt chỗ đang được phát triển. Vui lòng liên hệ bộ phận hỗ trợ để được trợ giúp.";

    // ChatClient beans - injected from MultiLlmChatClientConfig
    
    private final ChatMemory chatMemory;
    private final RoutingWorkflow routingWorkflow;
    private final ParallelizationWorkflow parallelizationWorkflow;
    
    private final ChatClient chatClient;
    private final ChatOptions PRIMARY_CHAT_OPTIONS;
    private final FlightSearchWorker flightSearchWorker;
    private final HotelSearchWorker hotelSearchWorker;
    private final BookingWorker bookingWorker;
    private final WeatherSearchWorker weatherSearchWorker;
    private final LocationSearchWorker locationSearchWorker;

    public CoreAgent(
            ChatClient.Builder builder,
            ToolCallbackProvider toolCallbackProvider,
            ChatMemory chatMemory,
            FlightSearchWorker flightSearchWorker,
            HotelSearchWorker hotelSearchWorker,
            BookingWorker bookingWorker,
            WeatherSearchWorker weatherSearchWorker,
            LocationSearchWorker locationSearchWorker,
            InputValidationGuard inputValidationGuard,
            ScopeGuard scopeGuard
            ) {

        this.chatMemory = chatMemory;
        this.flightSearchWorker = flightSearchWorker;
        this.hotelSearchWorker = hotelSearchWorker;
        this.bookingWorker = bookingWorker;
        this.weatherSearchWorker = weatherSearchWorker;
        this.locationSearchWorker = locationSearchWorker;

        // ========== CHAT OPTIONS CONFIGURATION ==========
        // Configure optimal settings for each workflow type

        // Main Chat Options: Natural conversation with comprehensive responses
        this.PRIMARY_CHAT_OPTIONS = ChatOptions.builder()
                .maxTokens(3000) // Comprehensive responses
                .temperature(0.7) // More creative, natural conversation
                .topP(0.9) // Diverse vocabulary
                .presencePenalty(0.1) // Slight penalty for new topics (stay focused)
                .frequencyPenalty(0.3) // Encourage varied responses
                .build();

        // Routing Options: Fast, deterministic classification
        ChatOptions routingOptions = ChatOptions.builder()
                .maxTokens(1500) // Short classification response
                .temperature(0.1) // Very deterministic for consistent routing
                .topP(0.8) // Focused vocabulary
                .presencePenalty(0.0) // No penalty (simple classification)
                .frequencyPenalty(0.0) // No penalty (simple classification)
                .build();

        // Parallel Search Options: Balance speed and quality
        ChatOptions parallelOptions = ChatOptions.builder()
                .maxTokens(2000) // Moderate response length
                .temperature(0.5) // Balanced creativity/accuracy
                .topP(0.9) // Good vocabulary range
                .presencePenalty(0.0) // No penalty (independent searches)
                .frequencyPenalty(0.2) // Slight variety in results
                .build();

        // ========== CHAT CLIENT CONFIGURATION ==========

        // Create base chat client with memory for main workflows
        // Configure memory advisor with proper order to execute first in chain
        MessageChatMemoryAdvisor memoryAdvisor = MessageChatMemoryAdvisor.builder(chatMemory)
                .order(-36) // Higher order to execute after tool callbacks
                .build();

        // Add security and logging advisors for main chat workflows
        SecurityGuardAdvisor chatSecurityAdvisor = SecurityGuardAdvisor
                .forChat(inputValidationGuard, scopeGuard);
        LoggingAdvisor chatLoggingAdvisor = LoggingAdvisor.forChat();

        this.chatClient = builder
                .defaultToolCallbacks(toolCallbackProvider)
                .defaultAdvisors(chatSecurityAdvisor, memoryAdvisor, chatLoggingAdvisor)
                .defaultOptions(PRIMARY_CHAT_OPTIONS)
                .build();

        // Create routing workflow with separate ChatClient WITHOUT memory advisor
        // This prevents "default" conversation pollution in routing analysis
        // and avoids tool name conflicts by using isolated tool callbacks
        SecurityGuardAdvisor routingSecurityAdvisor = SecurityGuardAdvisor
                .forRouting(inputValidationGuard, scopeGuard);
        ToolIsolationAdvisor routingIsolation = ToolIsolationAdvisor.forRouting();
        LoggingAdvisor routingLoggingAdvisor = LoggingAdvisor.forRouting();

        ChatClient routingChatClient = builder
                .defaultToolCallbacks(toolCallbackProvider)
                .defaultAdvisors(routingSecurityAdvisor, routingIsolation, routingLoggingAdvisor)
                .defaultOptions(routingOptions) // Optimized for fast, deterministic routing
                .build(); // No memory advisor to prevent conversation ID issues!

        this.routingWorkflow = new RoutingWorkflow(routingChatClient);

        // Create parallelization workflow with dedicated ChatClient and isolation
        // Use parallel isolation advisor to prevent tool conflicts
        SecurityGuardAdvisor parallelSecurityAdvisor = SecurityGuardAdvisor
                .forParallel(inputValidationGuard, scopeGuard);
        ToolIsolationAdvisor parallelIsolation = ToolIsolationAdvisor.forParallel();
        LoggingAdvisor parallelLoggingAdvisor = LoggingAdvisor.forParallel();

        ChatClient parallelChatClient = builder
                .defaultToolCallbacks(toolCallbackProvider)
                .defaultAdvisors(parallelSecurityAdvisor, parallelIsolation, parallelLoggingAdvisor)
                .defaultOptions(parallelOptions) // Optimized for balanced parallel search
                .build();

        this.parallelizationWorkflow = new ParallelizationWorkflow(parallelChatClient);
    }

    /**
     * Reactive version of process method - returns Mono for non-blocking execution.
     * This is the main entry point for processing user requests.
     *
     * @param userRequest    User's travel-related request
     * @param conversationId Conversation ID for memory management
     * @return Mono of structured response with message and results
     */
    public Mono<StructuredChatPayload> processAsync(String userRequest, String conversationId) {
        return process(userRequest, conversationId);
    }

    /**
     * Main reactive process method - returns Mono for non-blocking execution.
     *
     * @param userRequest    User's travel-related request
     * @param conversationId Conversation ID for memory management
     * @return Mono of structured response with message and results
     */
    public Mono<StructuredChatPayload> process(String userRequest, String conversationId) {
        return Mono.fromCallable(() -> {
            logProcessingStart(userRequest, conversationId);
            return userRequest;
        })
                .flatMap(request -> {
                    // Step 0: Save user message to memory (reactive)
                    return saveToMemoryAsync(request, conversationId)
                            .then(Mono.fromCallable(
                                    () -> routingWorkflow.route(request, getAvailableRoutes(), conversationId)))
                            .flatMap(decision -> {
                                // Step 2: Process based on route (reactive)
                                return switch (decision.route()) {
                                    case ROUTE_SEARCH -> processSearchWorkflow(request, decision, conversationId);
                                    case ROUTE_BOOKING -> processBookingWorkflow(request, decision, conversationId);
                                    case ROUTE_INQUIRY -> processInquiryWorkflow(request, conversationId);
                                    case ROUTE_MODIFICATION -> processModificationWorkflow();
                                    case ROUTE_WEATHER -> processWeatherWorkflow(request, decision, conversationId);
                                    case ROUTE_LOCATION -> processLocationWorkflow(request, decision, conversationId);
                                    default -> Mono.just(handleUnknownRoute(request, conversationId));
                                };
                            });
                })
                .doOnSubscribe(s -> System.out.println("🚀 Starting reactive agent processing"))
                .doOnSuccess(result -> System.out.println("✅ Reactive agent processing completed"))
                .doOnError(error -> {
                    System.err.println("❌ Reactive agent processing failed: " + error.getMessage());
                    error.printStackTrace();
                })
                .onErrorReturn(buildErrorResponse());
    }

    /**
     * Streaming version of process method - returns real-time results.
     *
     * @param userRequest    User's travel-related request
     * @param conversationId Conversation ID for memory management
     * @return Flux of streaming response content
     */
    public Flux<String> processStream(String userRequest, String conversationId) {
        return Mono.fromCallable(() -> {
            logProcessingStart(userRequest, conversationId);
            return userRequest;
        })
                .flatMapMany(request -> {
                    // Route first, then stream the processing
                    return Mono.fromCallable(() -> routingWorkflow.route(request, getAvailableRoutes(), conversationId))
                            .flatMapMany(decision -> {
                                return switch (decision.route()) {
                                    case ROUTE_SEARCH -> processSearchWorkflowStream(request, decision, conversationId);
                                    case ROUTE_BOOKING -> Flux.just("Booking workflow does not support streaming yet.");
                                    case ROUTE_INQUIRY -> processInquiryWorkflowStream(request, conversationId);
                                    case ROUTE_WEATHER -> Flux.just("Weather workflow streaming not implemented yet.");
                                    case ROUTE_LOCATION ->
                                        Flux.just("Location workflow streaming not implemented yet.");
                                    default -> Flux.just("Unknown route - streaming not supported.");
                                };
                            });
                })
                .doOnSubscribe(s -> System.out.println("🌊 Starting streaming agent processing"))
                .doOnNext(chunk -> System.out.print("📡"))
                .doOnComplete(() -> System.out.println("\n🎯 Streaming agent processing completed"))
                .doOnError(error -> System.err.println("❌ Streaming failed: " + error.getMessage()));
    }

    /**
     * Helper method to save message to memory reactively.
     */
    private Mono<Void> saveToMemoryAsync(String userRequest, String conversationId) {
        return Mono.fromRunnable(() -> {
            if (conversationId != null && !conversationId.trim().isEmpty() &&
                    isValidUUID(conversationId) && !conversationId.equals("default")) {

                try {
                    chatMemory.add(conversationId, List.of(new UserMessage(userRequest)));
                    System.out.println("✓ Added message to conversation: " + conversationId);
                } catch (Exception e) {
                    System.err.println("Warning: Failed to add message to memory: " + e.getMessage());
                }
            } else {
                System.out.println("⚠ Skipping memory save - invalid or default conversation ID: " + conversationId);
            }
        });
    }

    /**
     * Search workflow - reactive implementation using Parallelization pattern.
     */
    private Mono<StructuredChatPayload> processSearchWorkflow(String userRequest,
            RoutingWorkflow.RoutingDecision decision,
            String conversationId) {
        System.out.println("\n=== REACTIVE SEARCH WORKFLOW ACTIVATED ===");

        Map<String, Object> extractedParams = decision.extractedParams() != null
                ? decision.extractedParams()
                : new HashMap<>();

        return parallelizationWorkflow.parallelTravelSearchAsync(userRequest, extractedParams)
                .map(parallelResults -> convertParallelResultsToStructuredPayload(parallelResults, userRequest))
                .doOnSuccess(result -> System.out.println("✅ Reactive search workflow completed"))
                .onErrorReturn(buildErrorResponse());
    }

    /**
     * Streaming version of search workflow.
     */
    private Flux<String> processSearchWorkflowStream(String userRequest,
            RoutingWorkflow.RoutingDecision decision,
            String conversationId) {
        System.out.println("\n=== STREAMING SEARCH WORKFLOW ACTIVATED ===");

        Map<String, Object> extractedParams = decision.extractedParams() != null
                ? decision.extractedParams()
                : new HashMap<>();

        return parallelizationWorkflow.parallelTravelSearchStream(userRequest, extractedParams)
                .doOnSubscribe(s -> System.out.println("🌊 Starting streaming search"))
                .doOnComplete(() -> System.out.println("🎯 Streaming search completed"));
    }

    /**
     * Booking workflow - reactive implementation with validation.
     */
    private Mono<StructuredChatPayload> processBookingWorkflow(String userRequest,
            RoutingWorkflow.RoutingDecision decision,
            String conversationId) {
        System.out.println("\n=== REACTIVE BOOKING WORKFLOW ACTIVATED ===");

        Map<String, Object> params = decision.extractedParams() != null
                ? decision.extractedParams()
                : new HashMap<>();

        return bookingWorker.executeAsync(userRequest, params)
                .map(this::buildBookingResponse)
                .doOnSuccess(result -> System.out.println("✅ Reactive booking workflow completed"))
                .onErrorReturn(buildErrorResponse());
    }

    /**
     * Builds structured response from booking validation result.
     */
    private StructuredChatPayload buildBookingResponse(BaseWorker.WorkerResponse validationResult) {
        List<StructuredResultItem> results = new ArrayList<>(validationResult.results());

        results.add(StructuredResultItem.builder()
                .type("info")
                .title("Booking Validation")
                .description(validationResult.message())
                .metadata(Map.of(
                        "status", validationResult.success() ? "validated" : "needs_action",
                        "worker", validationResult.workerName()))
                .build());

        return StructuredChatPayload.builder()
                .message(validationResult.message())
                .results(results)
                .build();
    }

    /**
     * Inquiry workflow - reactive implementation for general questions.
     * Uses Gemini ChatClient for text-based conversation.
     */
    private Mono<StructuredChatPayload> processInquiryWorkflow(String userRequest, String conversationId) {
        System.out.println("\n=== REACTIVE INQUIRY WORKFLOW ACTIVATED ===");

        return Mono.fromCallable(() -> {
            // Use Gemini ChatClient for text-based inquiry
            String response = chatClient.prompt()
                    .user(userRequest)
                    .advisors(advisor -> {
                        if (conversationId != null && !conversationId.trim().isEmpty() && isValidUUID(conversationId)) {
                            advisor.param(ChatMemory.CONVERSATION_ID, conversationId);
                        }
                    })
                    .call()
                    .content();

            return StructuredChatPayload.builder()
                    .message(response)
                    .results(List.of())
                    .build();
        })
                .doOnSuccess(result -> System.out.println("✅ Reactive inquiry workflow completed"))
                .onErrorReturn(buildErrorResponse());
    }

    /**
     * Streaming version of inquiry workflow.
     * Uses Gemini ChatClient for text-based streaming.
     */
    private Flux<String> processInquiryWorkflowStream(String userRequest, String conversationId) {
        System.out.println("\n=== STREAMING INQUIRY WORKFLOW ACTIVATED ===");

        return Mono.fromCallable(() -> {
            // Use Gemini ChatClient for text-based streaming
            return chatClient.prompt()
                    .user(userRequest)
                    .advisors(advisor -> {
                        if (conversationId != null && !conversationId.trim().isEmpty() && isValidUUID(conversationId)) {
                            advisor.param(ChatMemory.CONVERSATION_ID, conversationId);
                        }
                    })
                    .stream()
                    .content();
        })
                .flatMapMany(flux -> flux)
                .doOnSubscribe(s -> System.out.println("🌊 Starting streaming inquiry"))
                .doOnComplete(() -> System.out.println("🎯 Streaming inquiry completed"));
    }

    /**
     * Modification workflow - reactive implementation (future implementation).
     */
    private Mono<StructuredChatPayload> processModificationWorkflow() {
        System.out.println("\n=== REACTIVE MODIFICATION WORKFLOW ACTIVATED ===");

        return Mono.just(StructuredChatPayload.builder()
                .message(MODIFICATION_NOT_IMPLEMENTED)
                .results(List.of())
                .build());
    }

    /**
     * Weather workflow - reactive implementation using WeatherSearchWorker.
     */
    private Mono<StructuredChatPayload> processWeatherWorkflow(String userRequest,
            RoutingWorkflow.RoutingDecision decision,
            String conversationId) {
        System.out.println("\n=== REACTIVE WEATHER WORKFLOW ACTIVATED ===");

        Map<String, Object> params = decision.extractedParams() != null
                ? decision.extractedParams()
                : new HashMap<>();

        return weatherSearchWorker.executeAsync(userRequest, params)
                .map(this::buildWeatherResponse)
                .doOnSuccess(result -> System.out.println("✅ Reactive weather workflow completed"))
                .onErrorReturn(buildErrorResponse());
    }

    /**
     * Builds structured response from weather search result.
     */
    private StructuredChatPayload buildWeatherResponse(BaseWorker.WorkerResponse weatherResult) {
        List<StructuredResultItem> results = new ArrayList<>(weatherResult.results());

        results.add(StructuredResultItem.builder()
                .type("info")
                .title("Weather Information")
                .description(weatherResult.message())
                .metadata(Map.of(
                        "status", weatherResult.success() ? "found" : "not_found",
                        "worker", weatherResult.workerName()))
                .build());

        return StructuredChatPayload.builder()
                .message(weatherResult.message())
                .results(results)
                .build();
    }

    /**
     * Location workflow - reactive implementation using LocationSearchWorker.
     */
    private Mono<StructuredChatPayload> processLocationWorkflow(String userRequest,
            RoutingWorkflow.RoutingDecision decision,
            String conversationId) {
        System.out.println("\n=== REACTIVE LOCATION WORKFLOW ACTIVATED ===");

        Map<String, Object> params = decision.extractedParams() != null
                ? decision.extractedParams()
                : new HashMap<>();

        return locationSearchWorker.executeAsync(userRequest, params)
                .map(this::buildLocationResponse)
                .doOnSuccess(result -> System.out.println("✅ Reactive location workflow completed"))
                .onErrorReturn(buildErrorResponse());
    }

    /**
     * Builds structured response from location search result.
     */
    private StructuredChatPayload buildLocationResponse(BaseWorker.WorkerResponse locationResult) {
        List<StructuredResultItem> results = new ArrayList<>(locationResult.results());

        results.add(StructuredResultItem.builder()
                .type("info")
                .title("Location Information")
                .description(locationResult.message())
                .metadata(Map.of(
                        "status", locationResult.success() ? "found" : "not_found",
                        "worker", locationResult.workerName()))
                .build());

        return StructuredChatPayload.builder()
                .message(locationResult.message())
                .results(results)
                .build();
    }

    /**
     * Handles unknown or unsupported routes.
     * Uses Gemini ChatClient with proper advisor parameter pattern for conversation ID.
     */
    private StructuredChatPayload handleUnknownRoute(String userRequest, String conversationId) {
        // Use Gemini ChatClient for fallback responses
        String fallbackResponse = chatClient.prompt()
                .system("You are a helpful travel assistant. Answer the user's question as best you can.")
                .user(userRequest)
                .advisors(advisor -> {
                    // Only set conversation ID if it's valid UUID to prevent "default" pollution
                    if (conversationId != null && !conversationId.trim().isEmpty() && isValidUUID(conversationId)) {
                        advisor.param(ChatMemory.CONVERSATION_ID, conversationId);
                    }
                })
                .call()
                .content();

        return StructuredChatPayload.builder()
                .message(fallbackResponse)
                .results(List.of())
                .build();
    }

    /**
     * Converts parallel search results to structured chat payload.
     */
    private StructuredChatPayload convertParallelResultsToStructuredPayload(List<String> parallelResults,
            String userRequest) {
        List<StructuredResultItem> resultItems = new ArrayList<>();

        // Convert each parallel result to a structured item
        for (int i = 0; i < parallelResults.size(); i++) {
            String result = parallelResults.get(i);
            String taskType = i == 0 ? "Flight Search" : (i == 1 ? "Hotel Search" : "Travel Search");

            StructuredResultItem item = StructuredResultItem.builder()
                    .type("search_result")
                    .title(taskType + " Results")
                    .description(result)
                    .metadata(Map.of(
                            "searchType", taskType.toLowerCase().replace(" ", "_"),
                            "resultIndex", i))
                    .build();

            resultItems.add(item);
        }

        // Create a summary message combining all results
        String summaryMessage = createParallelSearchSummary(parallelResults, userRequest);

        return StructuredChatPayload.builder()
                .message(summaryMessage)
                .results(resultItems)
                .build();
    }

    /**
     * Creates a summary message from parallel search results.
     */
    private String createParallelSearchSummary(List<String> parallelResults, String userRequest) {
        if (parallelResults.isEmpty()) {
            return "Không tìm thấy kết quả phù hợp cho yêu cầu của bạn.";
        }

        StringBuilder summary = new StringBuilder();
        summary.append("Tôi đã tìm kiếm song song các tùy chọn phù hợp cho yêu cầu của bạn:\n\n");

        for (int i = 0; i < parallelResults.size(); i++) {
            String taskType = i == 0 ? "🛫 Chuyến bay" : (i == 1 ? "🏨 Khách sạn" : "🔍 Tìm kiếm");
            summary.append(taskType).append(":\n");
            summary.append(parallelResults.get(i));
            if (i < parallelResults.size() - 1) {
                summary.append("\n\n");
            }
        }

        summary.append("\n\nTôi có thể giúp bạn đặt chỗ hoặc tìm kiếm thêm thông tin nếu cần!");

        return summary.toString();
    }

    /**
     * Builds error response.
     */
    private StructuredChatPayload buildErrorResponse() {
        return StructuredChatPayload.builder()
                .message(ERROR_MESSAGE)
                .results(List.of())
                .build();
    }

    /**
     * Available routing categories for travel requests.
     */
    private Map<String, String> getAvailableRoutes() {
        Map<String, String> routes = new HashMap<>();
        routes.put(ROUTE_SEARCH,
                "User wants to search for flights, hotels, or check availability");
        routes.put(ROUTE_BOOKING,
                "User wants to make a booking or needs booking validation");
        routes.put(ROUTE_INQUIRY,
                "User has questions about prices, policies, services, or general travel information");
        routes.put(ROUTE_MODIFICATION,
                "User wants to modify or cancel an existing booking");
        routes.put(ROUTE_WEATHER,
                "User wants to know the weather forecast or current weather conditions");
        routes.put(ROUTE_LOCATION,
                "User wants to find or verify a location, address, or point of interest");
        return routes;
    }

    /**
     * Logs the start of processing for debugging.
     */
    private void logProcessingStart(String userRequest, String conversationId) {
        System.out.printf("""


                ========== CORE AGENT PROCESSING ==========
                Request: %s
                Conversation: %s

                """,
                userRequest,
                conversationId);
    }

    /**
     * Validates if a string is a valid UUID format.
     */
    private boolean isValidUUID(String str) {
        try {
            UUID.fromString(str);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}
