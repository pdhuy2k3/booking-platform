package com.pdh.ai;

import java.util.UUID;

import com.pdh.ai.service.AiService;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.stereotype.Service;
import org.springframework.web.context.annotation.SessionScope;

@Service
@SessionScope
public class LLMAiService implements AiService {

    private final ChatClient chatClient;
    private final String conversationId;
    public LLMAiService(ChatClient.Builder builder, ToolCallbackProvider toolCallbackProvider,ChatMemory chatMemory) {
        // List<ToolCallback> toolCallbacks= Arrays.asList(toolCallbackProvider.getToolCallbacks());
        this.chatClient = builder
                .defaultToolCallbacks(toolCallbackProvider)
                
                .defaultSystem("""
                        You are a helpful assistant that helps users book travel accommodations including flights and hotels.
                        You orchestrate multi-step plans using available MCP tools such as search_flights, search_hotels, get_weather_by_datetime_range, search_places. (defualt for page number is 0 and page size is 20)
                        Always confirm which fields are missing and request them in follow_up when necessary.
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
