# Securing WebSockets with a Server-Side Session (BFF Pattern)

## 1. Problem Statement

When using a Backend-for-Frontend (BFF) pattern with server-side sessions (like Spring Cloud Gateway with Spring Session), we face a challenge with WebSockets. The standard `TokenRelay` gateway filter does not work for the WebSocket upgrade handshake, and we want to avoid exposing JWT/access tokens to the client-side JavaScript for security reasons.

We also run behind a Cloudflare Tunnel free plan. Any HTTP request that takes longer than 100 seconds is terminated with a `504 Gateway Timeout`, which breaks long-running AI responses that stream tokens for >100 seconds. A dedicated WebSocket channel lets us bypass the per-request timeout while keeping security guarantees.

This document outlines the standard, secure pattern to authenticate WebSocket connections by leveraging the server-side session cookie.

## 2. Solution Overview

The client's browser will automatically send its session cookie with the initial WebSocket handshake request. We can use this to securely propagate the user's identity to the downstream WebSocket service and then keep the socket open for token streaming that exceeds Cloudflare's 100-second HTTP cap.

The flow is as follows:
1.  **Client:** Initiates a WebSocket connection to the BFF without any special tokens. The browser attaches the session cookie automatically.
2.  **`storefront-bff` (Gateway):**
    *   It receives the handshake request and uses the cookie to load the user's authenticated session.
    *   A **custom gateway filter** extracts the user's access token from the session.
    *   This filter adds the token to the `Authorization` header of the request it proxies to the downstream `aiAgent-service`.
3.  **`aiAgent-service` (WebSocket Service):**
    *   A **handshake interceptor** on this service reads the `Authorization` header.
    *   It validates the JWT and, if valid, allows the WebSocket connection to be established. If invalid, it rejects the connection.

This architecture keeps tokens secure on the server-side, avoids the Cloudflare timeout window by streaming over WebSockets, and provides a seamless authentication experience.

### Why WebSockets Instead of HTTP Streaming?
- Cloudflare closes HTTP requests at 100 seconds even if the backend flushes partial data; WebSockets stay open as long as traffic flows.
- We can send incremental AI tokens or progress pings, which the frontend renders immediately and doubles as a keepalive signal.
- When no tokens are ready, the backend can send lightweight heartbeat frames to prevent idle closures by intermediaries.

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

#### Step 1.3: Enforce Idle Timeouts and Heartbeats

Configure `storefront-bff`'s WebFlux/WebSocket settings to send periodic pings (e.g., every 25 seconds) if the downstream handler is silent. This prevents Cloudflare and browsers from tearing down the tunnel. Likewise, configure a sane idle timeout (e.g., 5 minutes) so abandoned sockets are cleaned up.

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

#### Step 2.3: Stream AI Tokens & Heartbeats
- Implement your AI handler so that it pushes partial tokens/messages down the socket as soon as they are available.
- When the AI model is busy for more than ~10 seconds, send a heartbeat (e.g., JSON `{type: "keepalive"}`) to keep the tunnel alive.
- Close the socket with an application-level status code when the response is complete or if an error occurs; the BFF can translate it to an HTTP status for observability.

### Part 3: Message Envelope & Observability

Define a simple JSON message schema shared between frontend and backend:
```json
{ "type": "token", "content": "partial text" }
{ "type": "metadata", "event": "started", "requestId": "..." }
{ "type": "keepalive" }
{ "type": "error", "message": "..." }
```
- Include `requestId` so the BFF can correlate WebSocket events with upstream HTTP telemetry.
- Add rate limiting / concurrency caps in the BFF to avoid denial-of-service.

Log WebSocket lifecycle events (`handshake`, `authenticated`, `closed`, `idle-timeout`) so we can detect Cloudflare disconnects versus application failures.

### Part 4: Frontend Client (Token Streaming)

The frontend connects without any manual tokens—the browser forwards the session cookie automatically. Update the client to handle streaming tokens and reconnect behaviour:

```javascript
const socket = new WebSocket('wss://bookingsmart.huypd.dev/api/ai/ws/');

socket.onopen = () => {
  socket.send(JSON.stringify({ type: 'prompt', prompt: userPrompt, requestId }));
};

socket.onmessage = (event) => {
  const payload = JSON.parse(event.data);
  switch (payload.type) {
    case 'token':
      appendToken(payload.content);
      break;
    case 'metadata':
      handleMetadata(payload);
      break;
    case 'keepalive':
      // no-op
      break;
    case 'error':
      displayError(payload.message);
      break;
  }
};

socket.onclose = (event) => {
  notifyUserIfUnexpected(event);
  attemptReconnectIfNeeded();
};
```

Ensure the UI drains the stream incrementally to give users feedback before the AI run finishes. This pattern keeps us within Cloudflare's limits while maintaining security and observability.
