package com.pdh.ai.agent.workflow;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import lombok.Builder;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.util.Assert;

import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Orchestrator-Workers pattern implementation for AI Agent service.
 *
 * <p>This pattern breaks down complex travel booking tasks into specialized subtasks,
 * delegates them to worker agents, and synthesizes their results. The orchestrator
 * analyzes user intent to determine required actions (search flights, hotels, booking, etc.)
 * and coordinates worker execution.</p>
 *
 * <p><b>Key Components:</b></p>
 * <ul>
 *   <li>Orchestrator: Analyzes user intent and determines required worker tasks</li>
 *   <li>Workers: Specialized agents for flights, hotels, booking execution</li>
 *   <li>Synthesizer: Combines worker outputs into cohesive user response</li>
 * </ul>
 *
 * <p><b>Use Cases:</b></p>
 * <ul>
 *   <li>Complex travel queries requiring multiple searches (flights + hotels)</li>
 *   <li>Multi-step booking processes with validation</li>
 *   <li>Adaptive problem-solving based on user intent</li>
 * </ul>
 */
public class OrchestratorWorkflow {

    private static final int DEFAULT_PRIORITY = 999;
    private static final String MISSING_INFO_PREFIX = "To help you better, I need some additional information:\n";

    private final ChatClient chatClient;
    private final String orchestratorPrompt;
    private final Map<String, WorkerConfig> workers;

    public static final String DEFAULT_ORCHESTRATOR_PROMPT = """
            Analyze the user's travel request and determine what actions are needed.
            Break down the request into specific tasks for specialized workers.
            
            User Request: {request}
            
            Available Workers:
            - FLIGHT_SEARCH: Search for available flights (requires: origin, destination, date)
            - HOTEL_SEARCH: Search for hotel accommodations (requires: location, checkIn, checkOut)
            - BOOKING_VALIDATOR: Validate booking details before confirmation
            - AVAILABILITY_CHECKER: Check real-time seat/room availability
            
            Return your analysis in this JSON format:
            {
                "intent": "Brief description of user primary intent",
                "tasks": [
                    {
                        "worker": "FLIGHT_SEARCH | HOTEL_SEARCH | BOOKING_VALIDATOR | AVAILABILITY_CHECKER",
                        "description": "What this worker should do",
                        "parameters": {
                            "key": "value pairs needed for this task"
                        },
                        "priority": 1
                    }
                ],
                "missingInfo": ["List of information still needed from user"]
            }
            """;

    /**
     * Represents a task to be executed by a worker.
     */
    public record WorkerTask(
        @JsonProperty("worker") String worker,
        @JsonProperty("description") String description,
        @JsonProperty("parameters") Map<String, Object> parameters,
        @JsonProperty("priority") Integer priority
    ) {}

    /**
     * Orchestrator's analysis of the user request.
     */
    public record OrchestratorAnalysis(
        @JsonProperty("intent") String intent,
        @JsonProperty("tasks") List<WorkerTask> tasks,
        @JsonProperty("missingInfo") List<String> missingInfo
    ) {}

    /**
     * Configuration for a specialized worker.
     */
    public record WorkerConfig(
        String name,
        String systemPrompt,
        String outputInstructions
    ) {}

    /**
     * Result from a worker execution.
     */
    public record WorkerResult(
        String workerName,
        String output,
        boolean success,
        String error
    ) {}

    /**
     * Final orchestrated response.
     */
    @Builder
    public record OrchestratedResponse(
        String intent,
        List<WorkerResult> workerResults,
        List<String> missingInfo,
        String synthesizedMessage
    ) {}

    public OrchestratorWorkflow(ChatClient chatClient, Map<String, WorkerConfig> workers) {
        this(chatClient, DEFAULT_ORCHESTRATOR_PROMPT, workers);
    }

    public OrchestratorWorkflow(ChatClient chatClient, String orchestratorPrompt,
                                Map<String, WorkerConfig> workers) {
        Assert.notNull(chatClient, "ChatClient must not be null");
        Assert.hasText(orchestratorPrompt, "Orchestrator prompt must not be empty");
        Assert.notEmpty(workers, "Workers map must not be empty");

        this.chatClient = chatClient;
        this.orchestratorPrompt = orchestratorPrompt;
        this.workers = workers;
    }

    /**
     * Processes a user request using the orchestrator-workers pattern.
     *
     * @param userRequest The user's travel-related request
     * @return OrchestratedResponse containing worker results and synthesized message
     */
    public OrchestratedResponse process(String userRequest) {
        Assert.hasText(userRequest, "User request must not be empty");

        // Step 1: Orchestrator analyzes the request
        OrchestratorAnalysis analysis = analyzeRequest(userRequest);

        logAnalysis(analysis);

        // Step 2: Check if we have missing information
        if (hasMissingInfo(analysis)) {
            return buildMissingInfoResponse(analysis);
        }

        // Step 3: Execute tasks with workers (sorted by priority)
        List<WorkerResult> workerResults = executeWorkerTasks(analysis.tasks(), userRequest);

        System.out.println("\n=== WORKER RESULTS ===\n" + workerResults);

        // Step 4: Synthesize results into final response
        String synthesizedMessage = synthesizeResults(userRequest, analysis.intent(), workerResults);

        return OrchestratedResponse.builder()
            .intent(analysis.intent())
            .workerResults(workerResults)
            .missingInfo(List.of())
            .synthesizedMessage(synthesizedMessage)
            .build();
    }

    /**
     * Orchestrator analyzes user request and determines required tasks.
     */
    @SuppressWarnings("null")
    private OrchestratorAnalysis analyzeRequest(String userRequest) {
        return chatClient.prompt()
            .user(u -> u.text(orchestratorPrompt)
                .param("request", userRequest))
            .call()
            .entity(new ParameterizedTypeReference<OrchestratorAnalysis>() {});
    }

    /**
     * Executes all worker tasks sorted by priority.
     */
    private List<WorkerResult> executeWorkerTasks(List<WorkerTask> tasks, String originalRequest) {
        return tasks.stream()
            .sorted(this::compareByPriority)
            .map(task -> executeWorker(task, originalRequest))
            .toList();
    }

    /**
     * Compares two tasks by their priority.
     */
    private int compareByPriority(WorkerTask t1, WorkerTask t2) {
        int priority1 = t1.priority() != null ? t1.priority() : DEFAULT_PRIORITY;
        int priority2 = t2.priority() != null ? t2.priority() : DEFAULT_PRIORITY;
        return Integer.compare(priority1, priority2);
    }

    /**
     * Executes a specific worker task.
     */
    private WorkerResult executeWorker(WorkerTask task, String originalRequest) {
        WorkerConfig config = workers.get(task.worker());

        if (config == null) {
            return new WorkerResult(
                task.worker(),
                "",
                false,
                "Worker not found: " + task.worker()
            );
        }

        try {
            String workerPrompt = buildWorkerPrompt(config, task, originalRequest);
            String output = chatClient.prompt(workerPrompt).call().content();

            logWorkerOutput(task.worker(), output);

            return new WorkerResult(task.worker(), output, true, null);
        } catch (Exception e) {
            return new WorkerResult(
                task.worker(),
                "",
                false,
                "Worker execution failed: " + e.getMessage()
            );
        }
    }

    /**
     * Builds the prompt for a worker task.
     */
    private String buildWorkerPrompt(WorkerConfig config, WorkerTask task, String originalRequest) {
        return String.format("""
            %s
            
            Original User Request: %s
            Your Task: %s
            Parameters: %s
            
            %s
            """,
            config.systemPrompt(),
            originalRequest,
            task.description(),
            task.parameters(),
            config.outputInstructions()
        );
    }

    /**
     * Synthesizes worker results into a cohesive user message.
     */
    private String synthesizeResults(String originalRequest, String intent,
                                     List<WorkerResult> workerResults) {

        String synthesisPrompt = String.format("""
            You are a travel assistant synthesizing results from specialized workers.
            
            Original User Request: %s
            Identified Intent: %s
            
            Worker Results:
            %s
            
            Create a natural, helpful response that:
            1. Directly addresses the user's request
            2. Incorporates all successful worker results
            3. Mentions any failures gracefully
            4. Guides the user on next steps if needed
            
            Be conversational, friendly, and informative.
            """,
            originalRequest,
            intent,
            formatWorkerResults(workerResults)
        );

        return chatClient.prompt(synthesisPrompt).call().content();
    }

    /**
     * Formats worker results into a readable string.
     */
    private String formatWorkerResults(List<WorkerResult> results) {
        return results.stream()
            .map(result -> String.format("- %s: %s",
                result.workerName(),
                result.success() ? result.output() : "Failed - " + result.error()
            ))
            .collect(Collectors.joining("\n"));
    }

    /**
     * Checks if analysis has missing information.
     */
    private boolean hasMissingInfo(OrchestratorAnalysis analysis) {
        return analysis.missingInfo() != null && !analysis.missingInfo().isEmpty();
    }

    /**
     * Builds response for missing information case.
     */
    private OrchestratedResponse buildMissingInfoResponse(OrchestratorAnalysis analysis) {
        return OrchestratedResponse.builder()
            .intent(analysis.intent())
            .missingInfo(analysis.missingInfo())
            .workerResults(List.of())
            .synthesizedMessage(buildMissingInfoMessage(analysis.missingInfo()))
            .build();
    }

    /**
     * Builds user-friendly message for missing information.
     */
    private String buildMissingInfoMessage(List<String> missingInfo) {
        String items = missingInfo.stream()
            .map(info -> "- " + info)
            .collect(Collectors.joining("\n"));
        return MISSING_INFO_PREFIX + items;
    }

    /**
     * Logs the orchestrator's analysis for debugging.
     */
    private void logAnalysis(OrchestratorAnalysis analysis) {
        System.out.printf("""
            
            === ORCHESTRATOR ANALYSIS ===
            INTENT: %s
            
            TASKS: %s
            
            MISSING INFO: %s
            
            """,
            analysis.intent(),
            analysis.tasks(),
            analysis.missingInfo()
        );
    }

    /**
     * Logs worker output for debugging.
     */
    private void logWorkerOutput(String workerName, String output) {
        System.out.printf("""
            
            === WORKER [%s] OUTPUT ===
            %s
            
            """,
            workerName,
            output
        );
    }
}
