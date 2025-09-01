package com.pdh.ai;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.MessageWindowChatMemory;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.stereotype.Service;

@Service
public class LLMAiService implements AiService {

    private final ChatClient chatClient;

    public LLMAiService(ChatClient.Builder builder, ToolCallbackProvider toolCallbackProvider) {
        this.chatClient = builder
                .defaultToolCallbacks(toolCallbackProvider)
                .defaultAdvisors(
                        MessageChatMemoryAdvisor.builder(
                                        MessageWindowChatMemory.builder().build())
                                .build())
                .build();
    }

    @Override
    public String complete(String message) {
        return this.chatClient.prompt()
                .user(message)
                .call()
                .content();
    }
}
