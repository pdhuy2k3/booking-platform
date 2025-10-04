package com.pdh.ai.agent;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.stereotype.Component;

import com.pdh.ai.agent.workflow.OrchestratorWorkflow;
import com.pdh.ai.agent.workflow.RoutingWorkflow;
import com.pdh.ai.agent.workers.BaseWorker;
import com.pdh.ai.agent.workers.BookingWorker;
import com.pdh.ai.agent.workers.FlightSearchWorker;
import com.pdh.ai.agent.workers.HotelSearchWorker;
import com.pdh.ai.agent.workers.WeatherSearchWorker;
import com.pdh.ai.agent.workers.LocationSearchWorker;
import com.pdh.ai.model.dto.StructuredChatPayload;
import com.pdh.ai.model.dto.StructuredResultItem;

/**
 * Core AI Agent orchestrating travel booking workflows.
 *
 * <p>This agent combines multiple agentic patterns:</p>
 * <ul>
 *   <li><b>Routing:</b> Classifies user intent (search, booking, inquiry)</li>
 *   <li><b>Orchestrator-Workers:</b> Breaks down complex tasks and delegates to specialized workers</li>
 *   <li><b>Memory:</b> Maintains conversation context across interactions</li>
 *   <li><b>Tool Calling:</b> Integrates with MCP tools for flight/hotel search</li>
 * </ul>
 *
 * <p><b>Workflow:</b></p>
 * <ol>
 *   <li>Route incoming request to appropriate workflow category</li>
 *   <li>Orchestrator analyzes and breaks down the task</li>
 *   <li>Specialized workers execute subtasks (search, validate, etc.)</li>
 *   <li>Synthesizer combines results into structured response</li>
 * </ol>
 *
 * @author BookingSmart AI Team
 */
@Component
public class CoreAgent {

    // Route constants
    private static final String ROUTE_SEARCH = "SEARCH";
    private static final String ROUTE_BOOKING = "BOOKING";
    private static final String ROUTE_INQUIRY = "INQUIRY";
    private static final String ROUTE_MODIFICATION = "MODIFICATION";
    private static final String ROUTE_WEATHER = "WEATHER";
    private static final String ROUTE_LOCATION = "LOCATION";

    // Worker names
    private static final String WORKER_AVAILABILITY_CHECKER = "AVAILABILITY_CHECKER";

    // Messages
    private static final String ERROR_MESSAGE = "Xin lỗi, tôi gặp lỗi khi xử lý yêu cầu của bạn. Vui lòng thử lại.";
    private static final String MISSING_INFO_PREFIX = "Để tôi có thể giúp bạn tốt hơn, tôi cần thêm một số thông tin:\n\n";
    private static final String MODIFICATION_NOT_IMPLEMENTED = "Tính năng thay đổi đặt chỗ đang được phát triển. Vui lòng liên hệ bộ phận hỗ trợ để được trợ giúp.";

    private final ChatClient chatClient;
    private final RoutingWorkflow routingWorkflow;
    private final FlightSearchWorker flightSearchWorker;
    private final HotelSearchWorker hotelSearchWorker;
    private final BookingWorker bookingWorker;
    private final WeatherSearchWorker weatherSearchWorker;
    private final LocationSearchWorker locationSearchWorker;

    public CoreAgent(ChatClient.Builder builder,
                     ToolCallbackProvider toolCallbackProvider,
                     ChatMemory chatMemory,
                     FlightSearchWorker flightSearchWorker,
                     HotelSearchWorker hotelSearchWorker,
                     BookingWorker bookingWorker,
                     WeatherSearchWorker weatherSearchWorker,
                     LocationSearchWorker locationSearchWorker) {

        this.flightSearchWorker = flightSearchWorker;
        this.hotelSearchWorker = hotelSearchWorker;
        this.bookingWorker = bookingWorker;
        this.weatherSearchWorker = weatherSearchWorker;
        this.locationSearchWorker = locationSearchWorker;

        // Create base chat client with memory for routing
        this.chatClient = builder
            .defaultToolCallbacks(toolCallbackProvider)
            .defaultAdvisors(MessageChatMemoryAdvisor.builder(chatMemory).build())
            .build();

        // Create routing workflow for intent classification
        this.routingWorkflow = new RoutingWorkflow(this.chatClient);
    }

    /**
     * Processes user request through the complete agent workflow.
     *
     * @param userRequest User's travel-related request
     * @param conversationId Conversation ID for memory management
     * @return Structured response with message and results
     */
    public StructuredChatPayload process(String userRequest, String conversationId) {
        logProcessingStart(userRequest, conversationId);

        try {
            // Step 1: Route the request to appropriate workflow
            RoutingWorkflow.RoutingDecision decision = routingWorkflow.route(userRequest, getAvailableRoutes());

            // Step 2: Process based on route
            return switch (decision.route()) {
                case ROUTE_SEARCH -> processSearchWorkflow(userRequest, decision, conversationId);
                case ROUTE_BOOKING -> processBookingWorkflow(userRequest, decision, conversationId);
                case ROUTE_INQUIRY -> processInquiryWorkflow(userRequest, conversationId);
                case ROUTE_MODIFICATION -> processModificationWorkflow();
                case ROUTE_WEATHER -> processWeatherWorkflow(userRequest, decision, conversationId);
                case ROUTE_LOCATION -> processLocationWorkflow(userRequest, decision, conversationId);
                default -> handleUnknownRoute(userRequest, conversationId);
            };
        } catch (Exception e) {
            System.err.println("Error in CoreAgent processing: " + e.getMessage());
            e.printStackTrace();
            return buildErrorResponse();
        }
    }

    /**
     * Processes SEARCH workflow using Orchestrator-Workers pattern.
     */
    private StructuredChatPayload processSearchWorkflow(String userRequest,
                                                        RoutingWorkflow.RoutingDecision decision,
                                                        String conversationId) {
        System.out.println("\n=== SEARCH WORKFLOW ACTIVATED ===");

        Map<String, OrchestratorWorkflow.WorkerConfig> workers = buildSearchWorkers();
        OrchestratorWorkflow orchestrator = new OrchestratorWorkflow(chatClient, workers);
        OrchestratorWorkflow.OrchestratedResponse orchestratedResult = orchestrator.process(userRequest);

        return convertToStructuredPayload(orchestratedResult);
    }

    /**
     * Builds worker configurations for search workflow.
     */
    private Map<String, OrchestratorWorkflow.WorkerConfig> buildSearchWorkers() {
        Map<String, OrchestratorWorkflow.WorkerConfig> workers = new HashMap<>();

        workers.put(flightSearchWorker.getWorkerName(), createWorkerConfig(flightSearchWorker));
        workers.put(hotelSearchWorker.getWorkerName(), createWorkerConfig(hotelSearchWorker));
        workers.put(WORKER_AVAILABILITY_CHECKER, createAvailabilityCheckerConfig());

        return workers;
    }

    /**
     * Creates worker config from a BaseWorker instance.
     */
    private OrchestratorWorkflow.WorkerConfig createWorkerConfig(BaseWorker worker) {
        return new OrchestratorWorkflow.WorkerConfig(
            worker.getWorkerName(),
            worker.getSystemPrompt(),
            worker.getOutputInstructions()
        );
    }

    /**
     * Creates availability checker worker config.
     */
    private OrchestratorWorkflow.WorkerConfig createAvailabilityCheckerConfig() {
        return new OrchestratorWorkflow.WorkerConfig(
            WORKER_AVAILABILITY_CHECKER,
            """
            You are an availability checker.
            Verify real-time availability for flights or hotels.
            Use search tools to check current capacity and availability status.
            """,
            "Return JSON with: {\"available\": boolean, \"details\": \"explanation\"}"
        );
    }

    /**
     * Processes BOOKING workflow with validation.
     */
    private StructuredChatPayload processBookingWorkflow(String userRequest,
                                                         RoutingWorkflow.RoutingDecision decision,
                                                         String conversationId) {
        System.out.println("\n=== BOOKING WORKFLOW ACTIVATED ===");

        Map<String, Object> params = decision.extractedParams() != null
            ? decision.extractedParams()
            : new HashMap<>();

        BaseWorker.WorkerResponse validationResult = bookingWorker.validate(userRequest, params);

        return buildBookingResponse(validationResult);
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
                "worker", validationResult.workerName()
            ))
            .build());

        return StructuredChatPayload.builder()
            .message(validationResult.message())
            .results(results)
            .build();
    }

    /**
     * Processes INQUIRY workflow for general questions.
     */
    private StructuredChatPayload processInquiryWorkflow(String userRequest, String conversationId) {
        System.out.println("\n=== INQUIRY WORKFLOW ACTIVATED ===");

        String response = chatClient.prompt()
            .user(userRequest)
            .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, conversationId))
            .call()
            .content();

        return StructuredChatPayload.builder()
            .message(response)
            .results(List.of())
            .build();
    }

    /**
     * Processes MODIFICATION workflow (future implementation).
     */
    private StructuredChatPayload processModificationWorkflow() {
        System.out.println("\n=== MODIFICATION WORKFLOW ACTIVATED ===");

        return StructuredChatPayload.builder()
            .message(MODIFICATION_NOT_IMPLEMENTED)
            .results(List.of())
            .build();
    }

    /**
     * Processes WEATHER workflow using WeatherSearchWorker.
     */
    private StructuredChatPayload processWeatherWorkflow(String userRequest,
                                                         RoutingWorkflow.RoutingDecision decision,
                                                         String conversationId) {
        System.out.println("\n=== WEATHER WORKFLOW ACTIVATED ===");

        Map<String, Object> params = decision.extractedParams() != null
            ? decision.extractedParams()
            : new HashMap<>();

        BaseWorker.WorkerResponse weatherResult = weatherSearchWorker.execute(userRequest, params);

        return buildWeatherResponse(weatherResult);
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
                "worker", weatherResult.workerName()
            ))
            .build());

        return StructuredChatPayload.builder()
            .message(weatherResult.message())
            .results(results)
            .build();
    }

    /**
     * Processes LOCATION workflow using LocationSearchWorker.
     */
    private StructuredChatPayload processLocationWorkflow(String userRequest,
                                                          RoutingWorkflow.RoutingDecision decision,
                                                          String conversationId) {
        System.out.println("\n=== LOCATION WORKFLOW ACTIVATED ===");

        Map<String, Object> params = decision.extractedParams() != null
            ? decision.extractedParams()
            : new HashMap<>();

        BaseWorker.WorkerResponse locationResult = locationSearchWorker.execute(userRequest, params);

        return buildLocationResponse(locationResult);
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
                "worker", locationResult.workerName()
            ))
            .build());

        return StructuredChatPayload.builder()
            .message(locationResult.message())
            .results(results)
            .build();
    }

    /**
     * Handles unknown or unsupported routes.
     */
    private StructuredChatPayload handleUnknownRoute(String userRequest, String conversationId) {
        String fallbackResponse = chatClient.prompt()
            .system("You are a helpful travel assistant. Answer the user's question as best you can.")
            .user(userRequest)
            .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, conversationId))
            .call()
            .content();

        return StructuredChatPayload.builder()
            .message(fallbackResponse)
            .results(List.of())
            .build();
    }

    /**
     * Converts orchestrated response to structured chat payload.
     */
    private StructuredChatPayload convertToStructuredPayload(
            OrchestratorWorkflow.OrchestratedResponse orchestratedResult) {

        List<StructuredResultItem> allResults = orchestratedResult.workerResults().stream()
            .filter(OrchestratorWorkflow.WorkerResult::success)
            .map(this::createResultItem)
            .collect(Collectors.toCollection(ArrayList::new));

        String finalMessage = orchestratedResult.missingInfo() != null && !orchestratedResult.missingInfo().isEmpty()
            ? buildMissingInfoMessage(orchestratedResult.missingInfo())
            : orchestratedResult.synthesizedMessage();

        return StructuredChatPayload.builder()
            .message(finalMessage)
            .results(allResults)
            .build();
    }

    /**
     * Creates a result item from worker result.
     */
    private StructuredResultItem createResultItem(OrchestratorWorkflow.WorkerResult workerResult) {
        return StructuredResultItem.builder()
            .type("info")
            .title(workerResult.workerName() + " Result")
            .description(workerResult.output())
            .metadata(Map.of("worker", workerResult.workerName()))
            .build();
    }

    /**
     * Builds user-friendly message for missing information.
     */
    private String buildMissingInfoMessage(List<String> missingInfo) {
        String items = missingInfo.stream()
            .map(info -> "• " + info)
            .collect(Collectors.joining("\n"));
        return MISSING_INFO_PREFIX + items;
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
            conversationId
        );
    }
}
