package com.pdh.ai.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketTransportRegistration;

/**
 * WebSocket configuration for real-time voice and chat interactions.
 * 
 * <p>Architecture:</p>
 * <pre>
 * Client (Browser/Mobile) 
 *    ↕ WebSocket (STOMP over SockJS)
 * Spring WebSocket Handler
 *    ↕ Message Broker
 * Voice/Chat Processing Service
 *    ↕ AI Agent (Gemini)
 * Response back to Client
 * </pre>
 * 
 * <p>Endpoints:</p>
 * <ul>
 * <li><b>/ws/voice</b>: WebSocket connection endpoint (for both voice and chat)</li>
 * <li><b>/app/voice.send</b>: Client sends audio chunks</li>
 * <li><b>/app/chat.send</b>: Client sends text messages</li>
 * <li><b>/topic/voice.{userId}</b>: Server broadcasts voice responses</li>
 * <li><b>/topic/chat.{userId}</b>: Server broadcasts chat responses</li>
 * </ul>
 * 
 * <p>Use Cases:</p>
 * <ul>
 * <li>Real-time voice chat with AI agent</li>
 * <li>Real-time text chat with AI agent</li>
 * <li>Streaming audio transcription</li>
 * <li>Live booking assistance via voice or text</li>
 * <li>Hands-free travel planning</li>
 * </ul>
 * 
 * @author PDH
 * @since 2025-01-05
 */
@Configuration
@EnableWebSocketMessageBroker

public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    private final PrincipalPropagateInterceptor principalPropagateInterceptor;

    public WebSocketConfig(PrincipalPropagateInterceptor principalPropagateInterceptor) {
        this.principalPropagateInterceptor = principalPropagateInterceptor;
    }

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
        registry.addEndpoint("/ws/chat")
                .setAllowedOriginPatterns("*")  // Configure specific origins in production
                .withSockJS();  // Enable SockJS fallback
    }

    /**
     * Increase transport limits so we can ship base64-encoded audio chunks without
     * the broker terminating the connection.
     * 
     * <p>Size Limits:</p>
     * <ul>
     * <li><b>Message Size</b>: 10 MB (supports ~7 MB raw audio after base64 encoding)</li>
     * <li><b>Send Buffer</b>: 10 MB (matches message size)</li>
     * <li><b>Send Timeout</b>: 30 seconds (allows time for large uploads)</li>
     * </ul>
     */
    @Override
    public void configureWebSocketTransport(WebSocketTransportRegistration registry) {
        registry.setMessageSizeLimit(10 * 1024 * 1024); // 10 MB per message (supports 5MB+ audio)
        registry.setSendBufferSizeLimit(10 * 1024 * 1024); // 10 MB send buffer
        registry.setSendTimeLimit(30000); // 30 seconds timeout
    }
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(principalPropagateInterceptor);
    }
}
