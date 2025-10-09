package com.pdh.ai.agent.workflow;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Component;
import org.springframework.util.Assert;

/**
 * Implements the Parallelization Workflow pattern for efficient concurrent processing
 * of multiple LLM operations in BookingSmart travel platform.
 * 
 * <p>The pattern manifests in two key variations:</p>
 * 
 * <ul>
 * <li><b>Sectioning</b>: Decomposes a complex travel task into independent subtasks that
 * can be processed concurrently. For example, analyzing flights, hotels, and activities 
 * for multiple destinations simultaneously.</li>
 * <li><b>Voting</b>: Executes identical prompts multiple times in parallel to
 * gather diverse travel recommendations or implement consensus-building for destination choices.</li>
 * </ul>
 *
 * <p><b>Key Benefits for BookingSmart:</b></p>
 * <ul>
 * <li>Improved throughput for multi-destination search</li>
 * <li>Better resource utilization of LLM API capacity</li>
 * <li>Reduced overall processing time for complex itinerary planning</li>
 * <li>Enhanced recommendation quality through multiple perspectives</li>
 * </ul>
 *
 * <p><b>BookingSmart Use Cases:</b></p>
 * <ul>
 * <li>Parallel flight search across multiple routes</li>
 * <li>Concurrent hotel availability checks for different cities</li>
 * <li>Multi-destination itinerary generation</li>
 * <li>Parallel processing of user booking requests</li>
 * <li>Concurrent validation of travel document requirements</li>
 * </ul>
 *
 * <p><b>Implementation Considerations:</b></p>
 * <ul>
 * <li>Ensure tasks are truly independent (e.g., different destinations, different services)</li>
 * <li>Consider LLM API rate limits when determining parallel execution capacity</li>
 * <li>Monitor resource usage (memory, CPU) when scaling parallel operations</li>
 * <li>Implement appropriate error handling for individual task failures</li>
 * </ul>
 *
 * @author BookingSmart Team
 * @see org.springframework.ai.chat.client.ChatClient
 * @see <a href="https://www.anthropic.com/research/building-effective-agents">Building Effective Agents</a>
 */
@Component
public class ParallelizationWorkflow {

    private static final Logger logger = LoggerFactory.getLogger(ParallelizationWorkflow.class);

    private final ChatClient chatClient;

    /**
     * Constructs a new ParallelizationWorkflow with the specified chat client.
     *
     * @param chatClient the Spring AI chat client used to make parallel LLM calls
     */
    public ParallelizationWorkflow(ChatClient chatClient) {
        this.chatClient = chatClient;
    }

    /**
     * Processes multiple inputs concurrently using a fixed thread pool and the same prompt template.
     * This method maintains the order of results corresponding to the input order, which is crucial
     * for maintaining context in travel itinerary planning.
     *
     * <p><b>Example Usage for BookingSmart:</b></p>
     * <pre>{@code
     * // Parallel destination analysis
     * List<String> destinations = List.of("Hanoi", "Da Nang", "Ho Chi Minh City", "Phu Quoc");
     * List<String> analyses = workflow.parallel(
     *     "Analyze this Vietnamese destination for tourism potential including best time to visit, attractions, and budget:",
     *     destinations,
     *     4
     * );
     * 
     * // Parallel flight route evaluation
     * List<String> routes = List.of("HAN-SGN", "HAN-DAD", "SGN-PQC");
     * List<String> evaluations = workflow.parallel(
     *     "Evaluate this flight route for seasonal demand and pricing strategy:",
     *     routes,
     *     3
     * );
     * }</pre>
     *
     * @param prompt   The prompt template to use for each input. The input will be appended to this prompt.
     *                 Must not be null. Example: "Analyze travel demand for destination:"
     * @param inputs   List of input strings to process. Each input will be processed independently
     *                 in parallel. Must not be null or empty. Example: ["Hanoi", "Da Nang", "Phu Quoc"]
     * @param nWorkers The number of concurrent worker threads to use. This controls the maximum
     *                 number of simultaneous LLM API calls. Must be greater than 0. Consider API
     *                 rate limits when setting this value. Recommended: 2-4 for most use cases.
     * @return List of processed results in the same order as the inputs. Each result contains
     *         the LLM's response for the corresponding input.
     * @throws IllegalArgumentException if prompt is null, inputs is null/empty, or nWorkers <= 0
     * @throws RuntimeException if processing fails for any input, with the cause containing
     *         the specific error details
     */
    public List<String> parallel(String prompt, List<String> inputs, int nWorkers) {
        Assert.notNull(prompt, "Prompt cannot be null");
        Assert.notEmpty(inputs, "Inputs list cannot be empty");
        Assert.isTrue(nWorkers > 0, "Number of workers must be greater than 0");

        logger.info("🔄 [PARALLEL-WORKFLOW] Starting parallel processing: {} inputs with {} workers", 
                    inputs.size(), nWorkers);
        
        ExecutorService executor = Executors.newFixedThreadPool(nWorkers);
        long startTime = System.currentTimeMillis();
        
        try {
            List<CompletableFuture<String>> futures = inputs.stream()
                    .map(input -> CompletableFuture.supplyAsync(() -> {
                        try {
                            logger.debug("🔹 [PARALLEL-WORKFLOW] Processing input: {}", 
                                        input.length() > 50 ? input.substring(0, 50) + "..." : input);
                            
                            String result = chatClient.prompt(prompt + "\nInput: " + input).call().content();
                            
                            logger.debug("✅ [PARALLEL-WORKFLOW] Completed input: {}", 
                                        input.length() > 50 ? input.substring(0, 50) + "..." : input);
                            
                            return result;
                        } catch (Exception e) {
                            logger.error("❌ [PARALLEL-WORKFLOW] Failed to process input: {}", input, e);
                            throw new RuntimeException("Failed to process input: " + input, e);
                        }
                    }, executor))
                    .collect(Collectors.toList());

            // Wait for all tasks to complete
            CompletableFuture<Void> allFutures = CompletableFuture.allOf(
                    futures.toArray(CompletableFuture[]::new));
            allFutures.join();

            List<String> results = futures.stream()
                    .map(CompletableFuture::join)
                    .collect(Collectors.toList());
            
            long duration = System.currentTimeMillis() - startTime;
            logger.info("✅ [PARALLEL-WORKFLOW] Completed all {} tasks in {}ms (avg: {}ms per task)", 
                       inputs.size(), duration, duration / inputs.size());
            
            return results;

        } finally {
            executor.shutdown();
        }
    }

    /**
     * Processes multiple inputs with a single shared context. Useful for analyzing
     * related items with common background information.
     *
     * <p><b>Example Usage:</b></p>
     * <pre>{@code
     * String context = "User budget: $5000, Travel dates: June 15-30, Preferences: Beach, Culture";
     * List<String> destinations = List.of("Bali", "Phuket", "Maldives");
     * List<String> evaluations = workflow.parallelWithContext(
     *     "Evaluate if this destination matches the user requirements:",
     *     context,
     *     destinations,
     *     3
     * );
     * }</pre>
     *
     * @param prompt   The prompt template
     * @param context  Shared context information prepended to all prompts
     * @param inputs   List of items to process
     * @param nWorkers Number of parallel workers
     * @return List of results in the same order as inputs
     */
    public List<String> parallelWithContext(String prompt, String context, List<String> inputs, int nWorkers) {
        Assert.hasText(context, "Context cannot be empty");
        
        String enhancedPrompt = "Context: " + context + "\n\n" + prompt;
        return parallel(enhancedPrompt, inputs, nWorkers);
    }

    /**
     * Voting pattern: Execute the same prompt multiple times to get diverse perspectives.
     * Useful for generating multiple travel recommendations or validating decisions.
     *
     * <p><b>Example Usage:</b></p>
     * <pre>{@code
     * // Get 3 different itinerary suggestions for the same destination
     * List<String> itineraries = workflow.voting(
     *     "Create a 3-day itinerary for Hanoi focusing on culture and cuisine",
     *     3
     * );
     * }</pre>
     *
     * @param prompt   The prompt to execute multiple times
     * @param nVotes   Number of times to execute (number of perspectives/votes)
     * @return List of diverse responses
     */
    public List<String> voting(String prompt, int nVotes) {
        Assert.hasText(prompt, "Prompt cannot be empty");
        Assert.isTrue(nVotes > 0, "Number of votes must be greater than 0");

        logger.info("🗳️ [PARALLEL-WORKFLOW] Starting voting pattern: {} iterations", nVotes);
        
        // Create n identical prompts with slight variation to encourage diversity
        List<String> prompts = java.util.stream.IntStream.range(0, nVotes)
                .mapToObj(i -> String.format("Perspective %d:", i + 1))
                .collect(Collectors.toList());
        
        return parallel(prompt, prompts, Math.min(nVotes, 4)); // Cap workers at 4
    }
}
