package com.pdh.payment.mcp;

import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.ai.tool.method.MethodToolCallbackProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Payment MCP Server Configuration
 * Exposes payment operations as AI-callable tools using Spring AI MCP Server
 * Tools are defined in PaymentMcpToolService with @Tool annotations
 */
@Configuration
public class PaymentMcpServer {

    @Bean
    ToolCallbackProvider paymentTools(PaymentMcpToolService paymentMcpToolService) {
        return MethodToolCallbackProvider.builder()
                .toolObjects(paymentMcpToolService)
                .build();
    }
}
