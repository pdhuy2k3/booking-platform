package com.pdh.ai.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * WebSocket configuration for real-time voice interaction.
 * 
 * <p>Architecture:</p>
 * <pre>
 * Client (Browser/Mobile) 
 *    ↕ WebSocket (STOMP over SockJS)
 * Spring WebSocket Handler
 *    ↕ Message Broker
 * Voice Processing Service (Mistral AI)
 *    ↕ AI Agent (Gemini)
 * Response back to Client
 * </pre>
 * 
 * <p>Endpoints:</p>
 * <ul>
 * <li><b>/ws/voice</b>: WebSocket connection endpoint</li>
 * <li><b>/app/voice.send</b>: Client sends audio chunks</li>
 * <li><b>/topic/voice.{userId}</b>: Server broadcasts responses</li>
 * </ul>
 * 
 * <p>Use Cases:</p>
 * <ul>
 * <li>Real-time voice chat with AI agent</li>
 * <li>Streaming audio transcription</li>
 * <li>Live booking assistance via voice</li>
 * <li>Hands-free travel planning</li>
 * </ul>
 * 
 * @author PDH
 * @since 2025-01-05
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /**
     * Configure message broker for pub/sub messaging.
     * 
     * <p>Configuration:</p>
     * <ul>
     * <li><b>/app</b>: Application destination prefix (client → server)</li>
     * <li><b>/topic</b>: Topic prefix for broadcasts (server → client)</li>
     * <li><b>/user</b>: User destination prefix for private messages</li>
     * </ul>
     * 
     * @param registry Message broker registry
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Enable simple in-memory message broker
        // For production, consider RabbitMQ or ActiveMQ
        registry.enableSimpleBroker("/topic", "/user");

        // Prefix for messages bound for @MessageMapping methods
        registry.setApplicationDestinationPrefixes("/app");
        
        // Prefix for user-specific messages
        registry.setUserDestinationPrefix("/user");
    }

    /**
     * Register STOMP endpoints for WebSocket connections.
     * 
     * <p>SockJS Fallback:</p>
     * Automatically falls back to HTTP streaming or long polling
     * if WebSocket is not available (e.g., corporate firewalls).
     * 
     * <p>CORS Configuration:</p>
     * Allows connections from frontend applications on different origins.
     * 
     * @param registry STOMP endpoint registry
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws/voice")

                .setAllowedOriginPatterns("*")  // Configure specific origins in production
                .withSockJS();  // Enable SockJS fallback
    }
}
