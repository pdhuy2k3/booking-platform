# Securing WebSockets with a Server-Side Session (BFF Pattern)

## 1. Problem Statement

When using a Backend-for-Frontend (BFF) pattern with server-side sessions (like Spring Cloud Gateway with Spring Session), we face a challenge with WebSockets. The standard `TokenRelay` gateway filter does not work for the WebSocket upgrade handshake, and we want to avoid exposing JWT/access tokens to the client-side JavaScript for security reasons.

This document outlines the standard, secure pattern to authenticate WebSocket connections by leveraging the server-side session cookie.

## 2. Solution Overview

The client's browser will automatically send its session cookie with the initial WebSocket handshake request. We can use this to securely propagate the user's identity to the downstream WebSocket service.

The flow is as follows:
1.  **Client:** Initiates a WebSocket connection to the BFF without any special tokens. The browser attaches the session cookie automatically.
2.  **`storefront-bff` (Gateway):**
    *   It receives the handshake request and uses the cookie to load the user's authenticated session.
    *   A **custom gateway filter** extracts the user's access token from the session.
    *   This filter adds the token to the `Authorization` header of the request it proxies to the downstream `aiAgent-service`.
3.  **`aiAgent-service` (WebSocket Service):**
    *   A **handshake interceptor** on this service reads the `Authorization` header.
    *   It validates the JWT and, if valid, allows the WebSocket connection to be established. If invalid, it rejects the connection.

This architecture keeps tokens secure on the server-side and provides a seamless authentication experience.

## 3. Implementation Steps

### Part 1: `storefront-bff` (Spring Cloud Gateway)

#### Step 1.1: Create the Custom Gateway Filter

Create a new Java class in the `storefront-bff` project. This filter will extract the access token from the authenticated session and forward it.

**File: `src/main/java/com/pdh/storefront/config/WebSocketTokenRelayGatewayFilterFactory.java`**
```java
package com.pdh.storefront.config;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.client.web.server.ServerOAuth2AuthorizedClientRepository;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class WebSocketTokenRelayGatewayFilterFactory extends AbstractGatewayFilterFactory<Object> {

    private final ServerOAuth2AuthorizedClientRepository authorizedClientRepository;

    public WebSocketTokenRelayGatewayFilterFactory(ServerOAuth2AuthorizedClientRepository authorizedClientRepository) {
        super(Object.class);
        this.authorizedClientRepository = authorizedClientRepository;
    }

    @Override
    public GatewayFilter apply(Object config) {
        return (exchange, chain) -> exchange.getPrincipal()
            .flatMap(principal -> {
                if (principal instanceof OAuth2AuthenticationToken) {
                    OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) principal;
                    return authorizedClientRepository.loadAuthorizedClient(
                        oauthToken.getAuthorizedClientRegistrationId(),
                        principal,
                        exchange
                    ).flatMap(authorizedClient -> {
                        String accessToken = authorizedClient.getAccessToken().getTokenValue();
                        ServerWebExchange modifiedExchange = exchange.mutate()
                            .request(r -> r.header("Authorization", "Bearer " + accessToken))
                            .build();
                        return chain.filter(modifiedExchange);
                    });
                }
                return chain.filter(exchange);
            })
            .switchIfEmpty(chain.filter(exchange)); // Proceed if no authentication
    }
}
```

#### Step 1.2: Apply the Filter in `application.yml`

Update your gateway configuration to use this new filter for the WebSocket route. The name of the filter is derived from the class name (`WebSocketTokenRelay`).

**File: `src/main/resources/application.yml`**
```yaml
spring:
  cloud:
    gateway:
      routes:
        # ... other routes
        - id: aiagent-ws
          uri: lb:ws://AIAGENT-SERVICE
          predicates:
            - Path=/api/ai/ws/**
          filters:
            - RewritePath=/api/ai/ws/(?<segment>.*), /ws/${segment}
            # Apply our new custom filter instead of the standard TokenRelay
            - WebSocketTokenRelay
```

### Part 2: `aiAgent-service` (Downstream Service)

#### Step 2.1: Create a Handshake Interceptor

In the `aiAgent-service`, create an interceptor to validate the JWT from the `Authorization` header that the BFF is now adding.

**File: `src/main/java/com/pdh/aiagent/config/JwtAuthHandshakeInterceptor.java`**
```java
package com.pdh.aiagent.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Component
@Slf4j
@RequiredArgsConstructor
public class JwtAuthHandshakeInterceptor implements HandshakeInterceptor {

    // This bean should already be configured in your resource server
    private final JwtDecoder jwtDecoder;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        String authHeader = request.getHeaders().getFirst("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            try {
                Jwt jwt = jwtDecoder.decode(token);
                // The validated JWT claims can be put into the WebSocket session attributes
                // for later use in your WebSocketHandler.
                attributes.put("jwt", jwt);
                attributes.put("principal", jwt.getSubject()); // Or a custom Principal object
                log.info("WebSocket handshake approved for user: {}", jwt.getSubject());
                return true; // Handshake approved
            } catch (JwtException e) {
                log.warn("WebSocket handshake rejected due to invalid JWT: {}", e.getMessage());
                response.setStatusCode(HttpStatus.UNAUTHORIZED);
                return false; // Handshake rejected
            }
        }
        log.warn("WebSocket handshake rejected due to missing Authorization header.");
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        return false; // Handshake rejected
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Exception exception) {
        // No-op
    }
}
```

#### Step 2.2: Register the Interceptor

Create a WebSocket configuration class to register your handler and the interceptor.

**File: `src/main/java/com/pdh/aiagent/config/WebSocketConfig.java`**
```java
package com.pdh.aiagent.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private final JwtAuthHandshakeInterceptor jwtAuthHandshakeInterceptor;
    // Inject your WebSocket message handler here
    private final YourAiWebSocketHandler yourAiWebSocketHandler; 

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(yourAiWebSocketHandler, "/ws/**")
            .addInterceptors(jwtAuthHandshakeInterceptor)
            .setAllowedOrigins("*"); // TODO: Configure allowed origins properly for production
    }
}
```

### Part 3: Frontend Client (No Change Needed)

The best part of this solution is its simplicity on the client-side. Your frontend code does not need to handle tokens at all.

```javascript
// The client connects without any token, as the browser handles the session cookie
const socket = new WebSocket('wss://bookingsmart.huypd.dev/api/ai/ws/');

socket.onopen = () => {
  console.log('WebSocket connection established.');
  // Now you can send messages
  socket.send('Hello, AI!');
};

// ... other event handlers
```
