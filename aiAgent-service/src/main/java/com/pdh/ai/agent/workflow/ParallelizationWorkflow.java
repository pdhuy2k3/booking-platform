package com.pdh.ai.agent.workflow;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.util.Assert;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

/**
 * Implements the Parallelization Workflow pattern for efficient concurrent processing
 * of multiple LLM operations. This pattern enables parallel execution of LLM calls
 * with automated output aggregation, significantly improving throughput for
 * batch processing scenarios.
 * 
 * <p>The pattern manifests in two key variations:</p>
 * 
 * <ul>
 * <li><b>Sectioning</b>: Decomposes a complex task into independent subtasks that
 * can be processed concurrently. For example, analyzing different sections of a
 * document simultaneously.</li>
 * <li><b>Voting</b>: Executes identical prompts multiple times in parallel to
 * gather diverse perspectives or implement majority voting mechanisms. This is
 * particularly useful for validation or consensus-building tasks.</li>
 * </ul>
 *
 * <p><b>Key Benefits:</b></p>
 * <ul>
 * <li>Improved throughput through concurrent processing</li>
 * <li>Better resource utilization of LLM API capacity</li>
 * <li>Reduced overall processing time for batch operations</li>
 * <li>Enhanced result quality through multiple perspectives (in voting scenarios)</li>
 * </ul>
 *
 * <p><b>When to Use:</b></p>
 * <ul>
 * <li>Processing large volumes of similar but independent items</li>
 * <li>Tasks requiring multiple independent perspectives or validations</li>
 * <li>Scenarios where processing time is critical and tasks are parallelizable</li>
 * <li>Complex operations that can be decomposed into independent subtasks</li>
 * </ul>
 *
 * <p><b>Implementation Considerations:</b></p>
 * <ul>
 * <li>Uses virtual threads (Java 21+) for lightweight concurrency without thread pools</li>
 * <li>Virtual threads are automatically used when Spring Boot enables them</li>
 * <li>Ensure tasks are truly independent to avoid consistency issues</li>
 * <li>Consider API rate limits when determining parallel execution capacity</li>
 * <li>Monitor resource usage (memory, CPU) when scaling parallel operations</li>
 * <li>Implement appropriate error handling for parallel task failures</li>
 * </ul>
 *
 * @author BookingSmart AI Team (adapted from Christian Tzolov)
 */
public class ParallelizationWorkflow {

    private final ChatClient chatClient;

    public ParallelizationWorkflow(ChatClient chatClient) {
        this.chatClient = chatClient;
    }

    /**
     * Processes multiple inputs concurrently using virtual threads.
     * This method maintains the order of results corresponding to the input order.
     * Virtual threads are lightweight and automatically managed by the JVM.
     *
     * @param prompt   The prompt template to use for each input. The input will be appended to this prompt.
     *                 Must not be null. Example: "Search for flights from {origin} to {destination}"
     * @param inputs   List of input strings to process. Each input will be processed independently
     *                 in parallel using virtual threads. Must not be null or empty.
     * @param nWorkers This parameter is ignored in virtual thread implementation as virtual threads
     *                 are lightweight and can be created on-demand without explicit pooling.
     * @return List of processed results in the same order as the inputs. Each result contains
     *         the LLM's response for the corresponding input.
     * @throws IllegalArgumentException if prompt is null, inputs is null/empty
     * @throws RuntimeException if processing fails for any input, with the cause containing
     *         the specific error details
     */
    public List<String> parallel(String prompt, List<String> inputs, int nWorkers) {
        Assert.notNull(prompt, "Prompt cannot be null");
        Assert.notEmpty(inputs, "Inputs list cannot be empty");

        System.out.printf("🚀 Starting parallel processing of %d tasks%n", inputs.size());
        
        try {
            // Use virtual threads via CompletableFuture.supplyAsync()
            // Virtual threads are automatically used when enabled in Spring Boot
            List<CompletableFuture<String>> futures = inputs.stream()
                    .map(input -> CompletableFuture.supplyAsync(() -> {
                        long startTime = System.currentTimeMillis();
                        try {
                            System.out.printf("⚡ Processing: %s%n", 
                                input.length() > 50 ? input.substring(0, 50) + "..." : input);
                            
                            String result = chatClient.prompt(prompt + "\nInput: " + input).call().content();
                            
                            long duration = System.currentTimeMillis() - startTime;
                            System.out.printf("✅ Completed in %dms%n", duration);
                            
                            return result;
                        } catch (Exception e) {
                            long duration = System.currentTimeMillis() - startTime;
                            System.err.printf("❌ Failed after %dms: %s%n", duration, e.getMessage());
                            
                            // Return error message instead of throwing to continue other tasks
                            return "Error processing request: " + e.getMessage();
                        }
                    }))
                    .collect(Collectors.toList());

            // Wait for all tasks to complete with timeout
            CompletableFuture<Void> allFutures = CompletableFuture.allOf(
                    futures.toArray(new CompletableFuture[0]));
            
            try {
                allFutures.join(); // Virtual threads handle blocking efficiently
            } catch (Exception e) {
                System.err.println("⚠️ Some parallel tasks failed, collecting partial results");
            }

            // Collect results (including error messages)
            List<String> results = futures.stream()
                    .map(future -> {
                        try {
                            return future.join();
                        } catch (Exception e) {
                            return "Task failed: " + e.getMessage();
                        }
                    })
                    .collect(Collectors.toList());
            
            System.out.printf("🏁 Parallel processing completed: %d/%d successful%n", 
                results.stream().mapToInt(r -> r.startsWith("Error") ? 0 : 1).sum(), 
                results.size());
                
            return results;

        } catch (Exception e) {
            System.err.printf("💥 Parallel processing framework error: %s%n", e.getMessage());
            throw new RuntimeException("Parallel processing failed", e);
        }
    }

    /**
     * Specialized method for travel search tasks with parallel processing.
     * Processes flight and hotel searches concurrently.
     * 
     * @param userRequest The original user request
     * @param extractedParams Parameters extracted from routing
     * @return List of search results from parallel processing
     */
    public List<String> parallelTravelSearch(String userRequest, Map<String, Object> extractedParams) {
        List<String> searchTasks = buildSearchTasks(userRequest, extractedParams);
        
        if (searchTasks.isEmpty()) {
            return List.of("No specific search tasks identified from your request.");
        }
        
        String basePrompt = """
            You are a travel search specialist. Process the following search request efficiently.
            Use available tools to search for the best options and provide detailed results.
            Format your response in a structured way with clear recommendations.
            """;
        
        // Use 2 workers for parallel flight/hotel searches
        return parallel(basePrompt, searchTasks, Math.min(2, searchTasks.size()));
    }
    
    /**
     * Reactive version of parallel travel search.
     * Returns a Mono<List<String>> for non-blocking execution.
     */
    public Mono<List<String>> parallelTravelSearchAsync(String userRequest, Map<String, Object> extractedParams) {
        return Mono.fromCallable(() -> buildSearchTasks(userRequest, extractedParams))
            .flatMap(searchTasks -> {
                if (searchTasks.isEmpty()) {
                    return Mono.just(List.of("No specific search tasks identified from your request."));
                }
                
                String basePrompt = """
                    You are a travel search specialist. Process the following search request efficiently.
                    Use available tools to search for the best options and provide detailed results.
                    Format your response in a structured way with clear recommendations.
                    """;
                
                return parallelAsync(basePrompt, searchTasks, Math.min(2, searchTasks.size()));
            })
            .doOnSubscribe(s -> System.out.println("🚀 Starting reactive parallel travel search"))
            .doOnSuccess(results -> System.out.println("✅ Reactive parallel search completed: " + results.size() + " results"));
    }
    
    /**
     * Streaming version of parallel travel search.
     * Returns a Flux<String> that emits results as they become available.
     */
    public Flux<String> parallelTravelSearchStream(String userRequest, Map<String, Object> extractedParams) {
        return Mono.fromCallable(() -> buildSearchTasks(userRequest, extractedParams))
            .flatMapMany(searchTasks -> {
                if (searchTasks.isEmpty()) {
                    return Flux.just("No specific search tasks identified from your request.");
                }
                
                String basePrompt = """
                    You are a travel search specialist. Process the following search request efficiently.
                    Use available tools to search for the best options and provide detailed results.
                    Format your response in a structured way with clear recommendations.
                    Provide streaming updates as you find results.
                    """;
                
                return parallelStream(basePrompt, searchTasks, Math.min(2, searchTasks.size()));
            })
            .doOnSubscribe(s -> System.out.println("🌊 Starting streaming parallel travel search"))
            .doOnNext(chunk -> System.out.print("📡 Stream chunk: " + chunk.substring(0, Math.min(50, chunk.length())) + "..."))
            .doOnComplete(() -> System.out.println("\n🎯 Streaming parallel search completed"));
    }
    
    /**
     * Reactive parallel processing using virtual threads.
     */
    public Mono<List<String>> parallelAsync(String prompt, List<String> inputs, int nWorkers) {
        Assert.notNull(prompt, "Prompt cannot be null");
        Assert.notEmpty(inputs, "Inputs list cannot be empty");
        Assert.isTrue(nWorkers > 0, "Number of workers must be greater than 0");

        System.out.printf("🚀 Starting reactive parallel processing of %d tasks%n", inputs.size());
        
        return Flux.fromIterable(inputs)
            .flatMap(input -> 
                Mono.fromCallable(() -> {
                    long startTime = System.currentTimeMillis();
                    try {
                        System.out.printf("⚡ Processing: %s%n", 
                            input.length() > 50 ? input.substring(0, 50) + "..." : input);
                        
                        String result = chatClient.prompt(prompt + "\nInput: " + input).call().content();
                        
                        long duration = System.currentTimeMillis() - startTime;
                        System.out.printf("✅ Completed in %dms%n", duration);
                        
                        return result;
                    } catch (Exception e) {
                        long duration = System.currentTimeMillis() - startTime;
                        System.err.printf("❌ Failed after %dms: %s%n", duration, e.getMessage());
                        return "Error processing request: " + e.getMessage();
                    }
                })
                .subscribeOn(reactor.core.scheduler.Schedulers.boundedElastic()), // Use virtual thread scheduler
                nWorkers // Control concurrency
            )
            .collectList()
            .doOnSuccess(results -> 
                System.out.printf("🏁 Reactive parallel processing completed: %d/%d successful%n", 
                    results.stream().mapToInt(r -> r.startsWith("Error") ? 0 : 1).sum(), 
                    results.size()));
    }
    
    /**
     * Streaming parallel processing.
     */
    public Flux<String> parallelStream(String prompt, List<String> inputs, int nWorkers) {
        Assert.notNull(prompt, "Prompt cannot be null");
        Assert.notEmpty(inputs, "Inputs list cannot be empty");
        Assert.isTrue(nWorkers > 0, "Number of workers must be greater than 0");

        System.out.printf("🌊 Starting streaming parallel processing of %d tasks%n", inputs.size());
        
        return Flux.fromIterable(inputs)
            .flatMap(input -> 
                Mono.fromCallable(() -> {
                    System.out.printf("⚡ Streaming: %s%n", 
                        input.length() > 50 ? input.substring(0, 50) + "..." : input);
                    
                    return chatClient.prompt(prompt + "\nInput: " + input)
                        .stream()
                        .content();
                })
                .flatMapMany(flux -> flux)
                .subscribeOn(reactor.core.scheduler.Schedulers.boundedElastic()),
                nWorkers
            )
            .doOnNext(chunk -> System.out.print("📡"))
            .doOnComplete(() -> System.out.println("\n🎯 Streaming parallel processing completed"));
    }
    
    /**
     * Builds parallel search tasks based on user request and extracted parameters.
     */
    private List<String> buildSearchTasks(String userRequest, Map<String, Object> extractedParams) {
        List<String> tasks = new ArrayList<>();
        
        // Extract common parameters
        String origin = extractParam(extractedParams, "origin", "");
        String destination = extractParam(extractedParams, "destination", "");
        String departureDate = extractParam(extractedParams, "departureDate", "");
        
        // Build flight search task
        if (!origin.isEmpty() && !destination.isEmpty()) {
            String flightTask = String.format(
                "Search for flights from %s to %s on %s. Original request: %s",
                origin, destination, departureDate, userRequest
            );
            tasks.add(flightTask);
        }
        
        // Build hotel search task if destination is provided
        if (!destination.isEmpty()) {
            String hotelTask = String.format(
                "Search for hotels in %s for date %s. Original request: %s",
                destination, departureDate, userRequest
            );
            tasks.add(hotelTask);
        }
        
        // If no specific tasks, add general search
        if (tasks.isEmpty()) {
            tasks.add("General travel search: " + userRequest);
        }
        
        return tasks;
    }
    
    /**
     * Safely extracts parameter value with fallback.
     */
    private String extractParam(Map<String, Object> params, String key, String defaultValue) {
        if (params == null) return defaultValue;
        Object value = params.get(key);
        return value != null ? value.toString() : defaultValue;
    }
}