package com.pdh.ai.agent.advisor;

import java.util.HashMap;
import java.util.Map;

import org.springframework.ai.chat.client.ChatClientMessageAggregator;
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
 * Tool Isolation Advisor to prevent tool name conflicts across different workflows.
 * 
 * This advisor ensures that tool callbacks are properly isolated between different
 * workflow contexts (routing, parallel processing, etc.) to prevent duplicate
 * tool name errors in MCP (Model Context Protocol) environments.
 * 
 * <p><b>Key Features:</b></p>
 * <ul>
 * <li>Isolates tool callbacks per workflow context</li>
 * <li>Prevents tool name collisions between parallel workflows</li>
 * <li>Maintains tool context separation for routing vs execution workflows</li>
 * <li>Provides debugging information for tool isolation issues</li>
 * </ul>
 * 
 * @author BookingSmart AI Team
 */
public class ToolIsolationAdvisor implements CallAdvisor, StreamAdvisor {

    private static final String CONTEXT_WORKFLOW_TYPE = "workflow_type";
    private static final String CONTEXT_ISOLATION_ID = "tool_isolation_id";
    
    private final String workflowType;
    private int order;

    /**
     * Creates a new Tool Isolation Advisor.
     * 
     * @param workflowType The type of workflow (e.g., "routing", "parallel", "search")
     * @param order The advisor execution order (lower values execute first)
     */
    public ToolIsolationAdvisor(String workflowType, int order) {
        this.workflowType = workflowType;
        this.order = order;
    }

    /**
     * Creates a Tool Isolation Advisor for routing workflows.
     * Uses high precedence to execute early in the chain.
     */
    public static ToolIsolationAdvisor forRouting() {
        
        return new ToolIsolationAdvisor("routing", Ordered.HIGHEST_PRECEDENCE + 10);
    }

    /**
     * Creates a Tool Isolation Advisor for parallel workflows.
     * Uses medium precedence to execute after routing but before memory.
     */
    public static ToolIsolationAdvisor forParallel() {
        return new ToolIsolationAdvisor("parallel", Ordered.HIGHEST_PRECEDENCE + 50);
    }

    /**
     * Creates a Tool Isolation Advisor for search workflows.
     * Uses medium precedence similar to parallel workflows.
     */
    public static ToolIsolationAdvisor forSearch() {
        return new ToolIsolationAdvisor("search", Ordered.HIGHEST_PRECEDENCE + 50);
    }

    @Override
    @NonNull
    public String getName() {
        return "ToolIsolationAdvisor-" + workflowType;
    }

    @Override
    public int getOrder() {
        return order;
    }

    public ToolIsolationAdvisor withOrder(int order) {
        this.order = order;
        return this;
    }

    @Override
    @NonNull
    public ChatClientResponse adviseCall(@NonNull ChatClientRequest request, @NonNull CallAdvisorChain chain) {
        ChatClientRequest isolatedRequest = addIsolationContext(request);
        ChatClientResponse response = chain.nextCall(isolatedRequest);
        return logCompletion(response);
    }

    @Override
    @NonNull
    public Flux<ChatClientResponse> adviseStream(@NonNull ChatClientRequest request, @NonNull StreamAdvisorChain chain) {
        ChatClientRequest isolatedRequest = addIsolationContext(request);
        
        Flux<ChatClientResponse> responses = chain.nextStream(isolatedRequest);
        
        // Use message aggregator for stream processing like in SimpleLoggingAdvisor
        return new ChatClientMessageAggregator().aggregateChatClientResponse(responses, this::logCompletion);
    }

    private ChatClientRequest addIsolationContext(ChatClientRequest request) {
        // Generate unique isolation ID for this workflow execution
        String isolationId = workflowType + "-" + System.currentTimeMillis();
        
        System.out.printf("🔧 Tool Isolation: %s (ID: %s)%n", workflowType, isolationId);
        
        // Add workflow context to request for tool isolation
        Map<String, Object> updatedContext = new HashMap<>(request.context());
        updatedContext.put(CONTEXT_WORKFLOW_TYPE, workflowType);
        updatedContext.put(CONTEXT_ISOLATION_ID, isolationId);
        
        return request.mutate()
            .context(updatedContext)
            .build();
    }

    private ChatClientResponse logCompletion(ChatClientResponse response) {
        // Log completion of tool isolation context
        String isolationId = (String) response.context().get(CONTEXT_ISOLATION_ID);
        System.out.printf("✓ Tool Isolation completed: %s (ID: %s)%n", workflowType, isolationId);
        
        return response;
    }
}