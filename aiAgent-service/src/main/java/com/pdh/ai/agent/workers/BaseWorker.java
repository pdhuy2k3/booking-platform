package com.pdh.ai.agent.workers;

import java.util.List;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.pdh.ai.model.dto.StructuredResultItem;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Base class for all specialized worker agents.
 *
 * <p>Provides common functionality and shared models to eliminate code duplication.</p>
 *
 * @author BookingSmart AI Team
 */
public abstract class BaseWorker {

    /**
     * Response from a worker execution.
     */
    public record WorkerResponse(
        String workerName,
        String message,
        List<StructuredResultItem> results,
        boolean success,
        String error
    ) {
        /**
         * Creates a successful worker response.
         */
        public static WorkerResponse success(String workerName, String message,
                                            List<StructuredResultItem> results) {
            return new WorkerResponse(workerName, message, results, true, null);
        }

        /**
         * Creates a failed worker response.
         */
        public static WorkerResponse failure(String workerName, String errorMessage) {
            return new WorkerResponse(workerName, errorMessage, List.of(), false, errorMessage);
        }
    }

    /**
     * Standard output format for worker JSON responses.
     */
    public record WorkerOutput(
        @JsonProperty("summary") String summary,
        @JsonProperty("itemsFound") Integer itemsFound,
        @JsonProperty("recommendations") String recommendations
    ) {}

    /**
     * Formats parameters map into human-readable string.
     */
    protected String formatParameters(Map<String, Object> params) {
        if (params == null || params.isEmpty()) {
            return "No parameters provided";
        }

        StringBuilder sb = new StringBuilder();
        params.forEach((key, value) ->
            sb.append("- ").append(key).append(": ").append(value).append("\n")
        );
        return sb.toString();
    }

    /**
     * Builds a standardized prompt for worker execution.
     */
    protected String buildWorkerPrompt(String taskDescription, String userRequest,
                                      Map<String, Object> params, String instructions) {
        return String.format("""
            %s
            
            Original Request: %s
            
            Extracted Parameters:
            %s
            
            %s
            """,
            taskDescription,
            userRequest,
            formatParameters(params),
            instructions
        );
    }

    /**
     * Returns the worker's unique identifier.
     */
    public abstract String getWorkerName();

    /**
     * Returns the worker's system prompt.
     */
    public abstract String getSystemPrompt();

    /**
     * Returns the worker's output instructions.
     */
    public abstract String getOutputInstructions();

    /**
     * Executes the worker with the given user request and parameters.
     * Each worker must implement its own execution logic.
     *
     * @param userRequest Original user request for context
     * @param parameters Execution parameters
     * @return Worker response with results
     */
    public abstract WorkerResponse execute(String userRequest, Map<String, Object> parameters);

    /**
     * Reactive execution method - returns streaming results.
     * Default implementation wraps the synchronous execute method.
     * Workers can override for true streaming behavior.
     *
     * @param userRequest Original user request for context
     * @param parameters Execution parameters
     * @return Mono of worker response
     */
    public Mono<WorkerResponse> executeAsync(String userRequest, Map<String, Object> parameters) {
        return Mono.fromCallable(() -> execute(userRequest, parameters))
            .doOnSubscribe(s -> System.out.println("🚀 Starting async execution: " + getWorkerName()))
            .doOnSuccess(result -> System.out.println("✅ Completed async execution: " + getWorkerName()))
            .doOnError(error -> System.err.println("❌ Failed async execution: " + getWorkerName() + " - " + error.getMessage()));
    }

    /**
     * Streaming execution method - returns streaming content.
     * Workers should override this for true streaming behavior.
     *
     * @param userRequest Original user request for context
     * @param parameters Execution parameters
     * @return Flux of streaming response content
     */
    public Flux<String> executeStream(String userRequest, Map<String, Object> parameters) {
        return executeAsync(userRequest, parameters)
            .flatMapMany(response -> Flux.just(response.message()));
    }
}
