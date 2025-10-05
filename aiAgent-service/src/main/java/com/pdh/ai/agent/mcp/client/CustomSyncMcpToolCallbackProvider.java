package com.pdh.ai.agent.mcp.client;

import io.modelcontextprotocol.client.McpSyncClient;
import io.modelcontextprotocol.spec.McpSchema;
import org.springframework.ai.mcp.SyncMcpToolCallbackProvider;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.ai.tool.support.ToolUtils;
import org.springframework.context.annotation.Primary;
import org.springframework.util.Assert;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.function.BiPredicate;

import com.pdh.ai.service.ToolResultCollector;
@Primary
public class CustomSyncMcpToolCallbackProvider extends SyncMcpToolCallbackProvider {

    private final List<McpSyncClient> mcpClients;
    private final BiPredicate<McpSyncClient, McpSchema.Tool> toolFilter;
    private final ToolResultCollector toolResultCollector;

    /**
     * Constructor for CustomSyncMcpToolCallbackProvider with tool filter.
     *
     * @param toolFilter The filter to apply to tools.
     * @param mcpClients The list of MCP clients.
     */
    public CustomSyncMcpToolCallbackProvider(BiPredicate<McpSyncClient, McpSchema.Tool> toolFilter,
                                             List<McpSyncClient> mcpClients,
                                             ToolResultCollector toolResultCollector) {
        Assert.notNull(mcpClients, "MCP clients must not be null");
        Assert.notNull(toolFilter, "Tool filter must not be null");
        Assert.notNull(toolResultCollector, "ToolResultCollector must not be null");
        this.mcpClients = mcpClients;
        this.toolFilter = toolFilter;
        this.toolResultCollector = toolResultCollector;
    }

    /**
     * Constructor for CustomSyncMcpToolCallbackProvider without tool filter.
     *
     * @param mcpClients The list of MCP clients.
     */
    public CustomSyncMcpToolCallbackProvider(List<McpSyncClient> mcpClients,
                                             ToolResultCollector toolResultCollector) {
        this((mcpClient, tool) -> true, mcpClients, toolResultCollector);
    }


}
