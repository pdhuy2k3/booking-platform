package com.pdh.ai.agent.advisor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClientRequest;
import org.springframework.ai.chat.client.ChatClientResponse;
import org.springframework.ai.chat.client.advisor.api.CallAdvisor;
import org.springframework.ai.chat.client.advisor.api.CallAdvisorChain;
import org.springframework.ai.chat.client.advisor.api.StreamAdvisor;
import org.springframework.ai.chat.client.advisor.api.StreamAdvisorChain;
import org.springframework.core.Ordered;
import org.springframework.lang.NonNull;
import reactor.core.publisher.Flux;

/**
 * Logging Advisor for comprehensive chat interaction monitoring.
 * 
 * This advisor provides detailed logging for all chat interactions including:
 * - Request/response tracking with unique request IDs
 * - Performance metrics (execution time)
 * - Token usage monitoring (if available)
 * - Error tracking and debugging information
 * - Workflow type identification
 * 
 * <p><b>Key Features:</b></p>
 * <ul>
 * <li>Unique request ID generation for correlation</li>
 * <li>Execution time measurement</li>
 * <li>Request/response content logging (configurable)</li>
 * <li>Error tracking with stack traces</li>
 * <li>Integration with workflow isolation context</li>
 * </ul>
 * 
 * @author BookingSmart AI Team
 */
public class LoggingAdvisor implements CallAdvisor, StreamAdvisor {

    private static final Logger logger = LoggerFactory.getLogger(LoggingAdvisor.class);
    
    private final String workflowType;
    private final boolean logContent;
    private final int order;

    /**
     * Creates a new Logging Advisor.
     * 
     * @param workflowType The type of workflow (e.g., "routing", "parallel", "search")
     * @param logContent Whether to log full request/response content
     * @param order The advisor execution order
     */
    public LoggingAdvisor(String workflowType, boolean logContent, int order) {
        this.workflowType = workflowType;
        this.logContent = logContent;
        this.order = order;
    }

    /**
     * Creates a Logging Advisor for routing workflows.
     */
    public static LoggingAdvisor forRouting() {
        return new LoggingAdvisor("routing", false, Ordered.HIGHEST_PRECEDENCE + 5);
    }

    /**
     * Creates a Logging Advisor for parallel workflows.
     */
    public static LoggingAdvisor forParallel() {
        return new LoggingAdvisor("parallel", true, Ordered.HIGHEST_PRECEDENCE + 55);
    }

    /**
     * Creates a Logging Advisor for search workflows.
     */
    public static LoggingAdvisor forSearch() {
        return new LoggingAdvisor("search", true, Ordered.HIGHEST_PRECEDENCE + 55);
    }

    /**
     * Creates a Logging Advisor for main chat workflows.
     */
    public static LoggingAdvisor forChat() {
        return new LoggingAdvisor("chat", true, Ordered.HIGHEST_PRECEDENCE + 30);
    }

    @Override
    @NonNull
    public String getName() {
        return "LoggingAdvisor-" + workflowType;
    }

    @Override
    public int getOrder() {
        return order;
    }

    @Override
    @NonNull
    public ChatClientResponse adviseCall(@NonNull ChatClientRequest request, @NonNull CallAdvisorChain chain) {
        String requestId = generateRequestId();
        long startTime = System.currentTimeMillis();
        
        // Log request start
        logRequest(requestId, request);
        
        try {
            ChatClientResponse response = chain.nextCall(request);
            
            // Log successful response
            long duration = System.currentTimeMillis() - startTime;
            logResponse(requestId, response, duration);
            
            return response;
        } catch (Exception e) {
            // Log error
            long duration = System.currentTimeMillis() - startTime;
            logError(requestId, e, duration);
            throw e;
        }
    }

    @Override
    @NonNull
    public Flux<ChatClientResponse> adviseStream(@NonNull ChatClientRequest request, @NonNull StreamAdvisorChain chain) {
        String requestId = generateRequestId();
        long startTime = System.currentTimeMillis();
        
        // Log request start
        logRequest(requestId, request);
        
        return chain.nextStream(request)
            .doOnNext(response -> {
                // Log each stream chunk if content logging is enabled
                if (logContent && logger.isDebugEnabled()) {
                    String content = extractResponseContent(response);
                    logger.debug("📡 [{}] Stream chunk: {}", 
                        requestId, 
                        content != null ? 
                            content.substring(0, Math.min(50, content.length())) + "..." : 
                            "null"
                    );
                }
            })
            .doOnComplete(() -> {
                long duration = System.currentTimeMillis() - startTime;
                logger.info("🎯 [{}] Stream completed - Type: {} - Duration: {}ms", 
                    requestId, workflowType, duration);
            })
            .doOnError(error -> {
                long duration = System.currentTimeMillis() - startTime;
                logError(requestId, error, duration);
            });
    }

    /**
     * Logs the incoming request.
     */
    private void logRequest(String requestId, ChatClientRequest request) {
        logger.info("🚀 [{}] Starting {} workflow request", requestId, workflowType);
        
        if (logContent && logger.isDebugEnabled()) {
            String userMessage = extractUserMessage(request);
            logger.debug("📝 [{}] Request content: {}", 
                requestId, 
                userMessage != null ? 
                    userMessage.substring(0, Math.min(100, userMessage.length())) + "..." : 
                    "null"
            );
        }
        
        // Log context information if available
        if (request.context() != null && !request.context().isEmpty()) {
            logger.debug("🔧 [{}] Request context: {}", requestId, request.context());
        }
        

    }

    /**
     * Logs the successful response.
     */
    private void logResponse(String requestId, ChatClientResponse response, long duration) {
        logger.info("✅ [{}] {} workflow completed - Duration: {}ms", 
            requestId, workflowType, duration);
        
        if (logContent && logger.isDebugEnabled()) {
            String content = extractResponseContent(response);
            logger.debug("📄 [{}] Response content: {}", 
                requestId, 
                content != null ? 
                    content.substring(0, Math.min(100, content.length())) + "..." : 
                    "null"
            );
        }
        
        // Log tool calls in response if available
        try {
            if (response.chatResponse() != null && response.chatResponse().getResult() != null &&
                response.chatResponse().getResult().getOutput() != null) {
                var output = response.chatResponse().getResult().getOutput();
                
                // Check if there are tool calls in the response
                if (output.getToolCalls() != null && !output.getToolCalls().isEmpty()) {
                    logger.info("🔧 [{}] Tool calls in response: {}", requestId, output.getToolCalls().size());
                    output.getToolCalls().forEach(toolCall -> {
                        logger.info("   🛠️ [{}] Tool call: {} with function: {}", 
                            requestId, toolCall.id(), toolCall.name());
                        logger.debug("   📋 [{}] Tool arguments: {}", requestId, toolCall.arguments());
                    });
                } else {
                    logger.debug("🚫 [{}] No tool calls in response", requestId);
                }
                
                // Check for finish reason
                if (output.getText() != null) {
                    logger.info("🏁 [{}] Finish reason: {}", requestId, output.getText());
                }
            }
        } catch (Exception e) {
            logger.debug("Could not extract tool call information: {}", e.getMessage());
        }
        
        // Log basic response info
        logger.debug("📊 [{}] Response received successfully", requestId);
    }

    /**
     * Logs errors that occur during processing.
     */
    private void logError(String requestId, Throwable error, long duration) {
        logger.error("❌ [{}] {} workflow failed - Duration: {}ms - Error: {}", 
            requestId, workflowType, duration, error.getMessage());
        
        if (logger.isDebugEnabled()) {
            logger.debug("🔍 [{}] Error stack trace:", requestId, error);
        }
    }

    /**
     * Extracts user message from request for logging.
     */
    private String extractUserMessage(ChatClientRequest request) {
        try {
            if (request.prompt() != null && request.prompt().getUserMessage() != null) {
                return request.prompt().getUserMessage().getText();
            }
        } catch (Exception e) {
            logger.debug("Could not extract user message: {}", e.getMessage());
        }
        return null;
    }

    /**
     * Extracts response content for logging.
     * Uses toString() as fallback since content() method may not be available in all versions.
     */
    private String extractResponseContent(ChatClientResponse response) {
        try {
            // Try reflection to get content() method if available
            var method = response.getClass().getMethod("content");
            Object result = method.invoke(response);
            return result != null ? result.toString() : null;
        } catch (Exception e) {
            // Fallback to toString representation
            logger.debug("Could not extract response content using content() method: {}", e.getMessage());
            String responseStr = response.toString();
            return responseStr.length() > 200 ? responseStr.substring(0, 200) + "..." : responseStr;
        }
    }

    /**
     * Generates a unique request ID for correlation.
     */
    private String generateRequestId() {
        return workflowType + "-" + System.currentTimeMillis() + "-" + 
               Thread.currentThread().getName().hashCode();
    }
}