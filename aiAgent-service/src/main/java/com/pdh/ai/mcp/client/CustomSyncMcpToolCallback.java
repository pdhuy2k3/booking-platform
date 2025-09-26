package com.pdh.ai.mcp.client;

import io.modelcontextprotocol.client.McpSyncClient;
import io.modelcontextprotocol.spec.McpSchema;
import org.springframework.ai.mcp.SyncMcpToolCallback;
import org.springframework.ai.model.ModelOptionsUtils;
import org.springframework.ai.tool.definition.DefaultToolDefinition;
import org.springframework.ai.tool.execution.ToolExecutionException;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.springframework.lang.NonNull;

import java.util.Map;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class CustomSyncMcpToolCallback extends SyncMcpToolCallback {
    private final McpSyncClient mcpClient;
    private final McpSchema.Tool tool;
    private final ObjectMapper objectMapper;
    /**
     * Creates a new {@code SyncMcpToolCallback} instance.
     *
     * @param mcpClient the MCP client to use for tool execution
     * @param tool      the MCP tool definition to adapt
     */
    public CustomSyncMcpToolCallback(McpSyncClient mcpClient, McpSchema.Tool tool) {
        super(mcpClient, tool);
        this.mcpClient = mcpClient;
        this.tool = tool;
        this.objectMapper = new ObjectMapper();
    }

    @Override
    @NonNull
    public String call(@NonNull String functionInput) {
        Map<String, Object> arguments = ModelOptionsUtils.jsonToMap(functionInput);
        // Note that we use the original tool name here, not the adapted one from
        // getToolDefinition
        McpSchema.CallToolResult response = this.mcpClient.callTool(new McpSchema.CallToolRequest(this.tool.name(), arguments));
        if (response.isError() != null && response.isError()) {
            log.warn("tools exec response error: {}", response);

            String inputSchemaJson;
            try {
                inputSchemaJson = objectMapper.writeValueAsString(tool.inputSchema());
            } catch (JsonProcessingException e) {
                log.warn("Failed to serialize tool input schema", e);
                inputSchemaJson = "{}";
            }
            
            throw new ToolExecutionException(new DefaultToolDefinition(tool.name(), tool.description(), 
                inputSchemaJson),
                new IllegalStateException("Error calling tool: " + response.content()));
        }
        return ModelOptionsUtils.toJsonString(response.content());
    }


}
