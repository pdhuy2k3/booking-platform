package com.pdh.ai.service;

import java.util.UUID;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.context.annotation.SessionScope;

@Service
@SessionScope
public class LLMAiService implements AiService {

    private final ChatClient chatClient;
    private final String conversationId;
    public LLMAiService(ChatClient.Builder builder, 
                        
                @Qualifier("customSyncMcpToolCallbackProvider") ToolCallbackProvider toolCallbackProvider,
                       ChatMemory chatMemory,
                       WeatherSearchTool weatherSearchTool,
                       LocationCoordinatesTool locationCoordinatesTool) {   
        this.chatClient = builder
                .defaultToolCallbacks(toolCallbackProvider)
                // .defaultTools(weatherSearchTool,locationCoordinatesTool)
                .defaultSystem("""
                        You are a helpful assistant that helps users book travel accommodations including flights and hotels.
                        You orchestrate multi-step plans using available MCP tools such as search_flights, search_hotels. (default for page number is 0 and page size is 20)
                        Use the tools to get information about flights and hotels as needed to help the user.
                        Ask user for any missing information you need to complete the booking.
                        Always remember to ask the user for confirmation before making a booking.
                        If the user asks for something you can't help with, politely decline.
                        """)
                .defaultAdvisors(
                        MessageChatMemoryAdvisor.builder(chatMemory)
                                .build())
                .build();
        
        this.conversationId = UUID.randomUUID().toString();
    }

    @Override
    public String complete(String message) {
        return this.chatClient.prompt()
                .user(userMessage -> userMessage.text(message))
                .advisors(a ->a.param(ChatMemory.CONVERSATION_ID, this.conversationId))
                .call()
                .content();
    }
}
