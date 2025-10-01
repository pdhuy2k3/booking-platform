package com.pdh.ai.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.pdh.ai.ChatHistoryResponse;
import com.pdh.common.utils.AuthenticationUtils;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.memory.ChatMemoryRepository;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.web.context.annotation.SessionScope;

@Service
@SessionScope
public class LLMAiService implements AiService {

    private final ChatClient chatClient;
    private final ChatMemory chatMemory;
    private final ChatMemoryRepository chatMemoryRepository;
    private final String conversationId;
    
    public LLMAiService(ChatClient.Builder builder, 
                        
                @Qualifier("customSyncMcpToolCallbackProvider") ToolCallbackProvider toolCallbackProvider,
                       ChatMemory chatMemory,
                       ChatMemoryRepository chatMemoryRepository,
                       WeatherSearchTool weatherSearchTool,
                       LocationCoordinatesTool locationCoordinatesTool) {   
        this.chatMemory = chatMemory;
        this.chatMemoryRepository = chatMemoryRepository;
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

    @Override
    public String completeWithConversation(String message, String conversationId, String userId) {
        String actualUserId = userId != null ? userId : getCurrentUserId();
        String actualConversationId = createUserConversationId(conversationId, actualUserId);
        
        return this.chatClient.prompt()
                .user(userMessage -> userMessage.text(message))
                .advisors(a -> a.param(ChatMemory.CONVERSATION_ID, actualConversationId))
                .call()
                .content();
    }

    @Override
    public ChatHistoryResponse getChatHistory(String conversationId, String userId) {
        String actualUserId = userId != null ? userId : getCurrentUserId();
        String actualConversationId = createUserConversationId(conversationId, actualUserId);
        
        try {
            List<Message> messages = chatMemory.get(actualConversationId);
            
            List<ChatHistoryResponse.ChatMessage> chatMessages = messages.stream()
                    .map(message -> ChatHistoryResponse.ChatMessage.builder()
                            .content(message.getText())
                            .role(message.getMessageType().name().toLowerCase())
                            .timestamp(LocalDateTime.now()) // Spring AI doesn't store timestamps by default
                            .build())
                    .collect(Collectors.toList());
            
            return ChatHistoryResponse.builder()
                    .conversationId(conversationId) // Return original conversationId to client
                    .messages(chatMessages)
                    .createdAt(LocalDateTime.now())
                    .lastUpdated(LocalDateTime.now())
                    .build();
        } catch (Exception e) {
            // Return empty history if conversation doesn't exist
            return ChatHistoryResponse.builder()
                    .conversationId(conversationId)
                    .messages(List.of())
                    .createdAt(LocalDateTime.now())
                    .lastUpdated(LocalDateTime.now())
                    .build();
        }
    }

    @Override
    public void clearChatHistory(String conversationId, String userId) {
        String actualUserId = userId != null ? userId : getCurrentUserId();
        String actualConversationId = createUserConversationId(conversationId, actualUserId);
        chatMemory.clear(actualConversationId);
    }

    @Override
    public List<String> getUserConversations(String userId) {
        try {
            String actualUserId = userId != null ? userId : getCurrentUserId();
            // Get all conversation IDs and filter those belonging to the user
            List<String> allConversations = chatMemoryRepository.findConversationIds();
            String userPrefix = actualUserId + ":";
            
            return allConversations.stream()
                    .filter(id -> id.startsWith(userPrefix))
                    .map(id -> id.substring(userPrefix.length())) // Remove user prefix
                    .collect(Collectors.toList());
        } catch (Exception e) {
            return List.of();
        }
    }

    /**
     * Get current user ID from JWT token in security context
     */
    private String getCurrentUserId() {
        try {
            return AuthenticationUtils.extractUserId();
        } catch (Exception e) {
            // If unable to extract userId (e.g., no authentication), return null
            return null;
        }
    }

    /**
     * Create a composite conversation ID that includes userId for segregation
     * Format: userId:conversationId
     */
    private String createUserConversationId(String conversationId, String userId) {
        if (userId == null) {
            userId = "anonymous";
        }
        
        String actualConversationId = conversationId;
        if (actualConversationId == null) {
            actualConversationId = this.conversationId;
        }
        
        return userId + ":" + actualConversationId;
    }
}
