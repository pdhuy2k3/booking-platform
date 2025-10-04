package com.pdh.ai.config;

import java.util.List;

import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.pdh.ai.mcp.client.CustomSyncMcpToolCallbackProvider;
import com.pdh.ai.service.ToolResultCollector;

import io.modelcontextprotocol.client.McpSyncClient;

/**
 * Configuration class for exposing the custom MCP {@link ToolCallbackProvider} bean.
 */
@Configuration
public class AiToolCallbackConfig {

    @Bean
    @Qualifier("customSyncMcpToolCallbackProvider")
    public ToolCallbackProvider customSyncMcpToolCallbackProvider(List<McpSyncClient> mcpSyncClients,
                                                                  ToolResultCollector toolResultCollector) {
        return new CustomSyncMcpToolCallbackProvider(mcpSyncClients, toolResultCollector);
    }
}
