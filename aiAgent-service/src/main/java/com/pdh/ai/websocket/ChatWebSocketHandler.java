package com.pdh.ai.websocket;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.ai.model.dto.ChatMessageRequest;
import com.pdh.ai.model.dto.ChatMessageResponse;
import com.pdh.ai.model.dto.ChatMessageResponse.ResponseType;
import com.pdh.ai.model.dto.ChatSocketRequest;
import com.pdh.ai.model.dto.StructuredChatPayload;
import com.pdh.ai.service.LLMAiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import jakarta.annotation.PreDestroy;
import java.io.IOException;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

import reactor.core.scheduler.Schedulers;

@Component
@RequiredArgsConstructor
@Slf4j
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private static final Duration HEARTBEAT_INTERVAL = Duration.ofSeconds(25);
    private static final Duration INITIAL_HEARTBEAT_DELAY = Duration.ofSeconds(25);

    private final LLMAiService llmAiService;
    private final ObjectMapper objectMapper;

    private final ScheduledExecutorService heartbeatScheduler = Executors.newScheduledThreadPool(
            1,
            new ChatSocketThreadFactory("chat-heartbeat")
    );

    private final ScheduledExecutorService workerPool = Executors.newScheduledThreadPool(
            Runtime.getRuntime().availableProcessors(),
            new ChatSocketThreadFactory("chat-worker")
    );

    private final Map<String, ScheduledFuture<?>> heartbeatRegistrations = new ConcurrentHashMap<>();
    private final reactor.core.scheduler.Scheduler workerScheduler = Schedulers.fromExecutor(workerPool);

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String userId = resolveUserId(session).orElse("anonymous");
        log.info("🧳 [AI-WS] Connection established. sessionId={}, user={}", session.getId(), userId);
        registerHeartbeat(session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        log.info("🧳 [AI-WS] Connection closed. sessionId={}, status={}", session.getId(), status);
        cancelHeartbeat(session.getId());
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        Instant startedAt = Instant.now();
        ChatSocketRequest socketRequest = parseRequest(message.getPayload());
        if (socketRequest == null) {
            log.warn("⚠️ [AI-WS] Unable to parse payload, closing sessionId={}", session.getId());
            safeSend(session, buildErrorResponse("invalid-request", "Invalid request payload", null, null));
            return;
        }

        String userId = resolveUserId(session).orElse(null);
        if (!StringUtils.hasText(userId)) {
            log.warn("⚠️ [AI-WS] Missing authenticated user, sessionId={}", session.getId());
            safeSend(session, buildErrorResponse(socketRequest.getRequestId(),
                    "Authentication is required to use the AI assistant.", socketRequest.getConversationId(), null));
            session.close(CloseStatus.NOT_ACCEPTABLE.withReason("Authentication required"));
            return;
        }

        if (!StringUtils.hasText(socketRequest.getMessage())) {
            safeSend(session, buildErrorResponse(socketRequest.getRequestId(),
                    "Message cannot be empty.", socketRequest.getConversationId(), userId));
            return;
        }

        String requestId = StringUtils.hasText(socketRequest.getRequestId())
                ? socketRequest.getRequestId()
                : UUID.randomUUID().toString();

        String conversationId = StringUtils.hasText(socketRequest.getConversationId())
                ? socketRequest.getConversationId()
                : UUID.randomUUID().toString();

        ChatMessageResponse processing = ChatMessageResponse.builder()
                .type(ResponseType.PROCESSING)
                .requestId(requestId)
                .conversationId(conversationId)
                .userId(userId)
                .userMessage(socketRequest.getMessage())
                .status("Processing")
                .timestamp(LocalDateTime.now())
                .build();
        safeSend(session, processing);

        ChatMessageRequest chatRequest = ChatMessageRequest.builder()
                .conversationId(conversationId)
                .message(socketRequest.getMessage())
                .timestamp(socketRequest.getTimestamp())
                .mode("stream")
                .build();

        AtomicReference<StructuredChatPayload> lastPayload = new AtomicReference<>();

        llmAiService.streamStructured(
                        chatRequest.getMessage(),
                        chatRequest.getConversationId(),
                        userId
                )
                .publishOn(workerScheduler)
                .subscribe(
                        payload -> {
                            lastPayload.set(payload);
                            ChatMessageResponse chunk = ChatMessageResponse.builder()
                                    .type(ResponseType.PROCESSING)
                                    .requestId(requestId)
                                    .conversationId(conversationId)
                                    .userId(userId)
                                    .userMessage(socketRequest.getMessage())
                                    .aiResponse(payload.getMessage())
                                    .results(payload.getResults())
                                    .nextRequestSuggestions(extractSuggestions(payload))
                                    .requiresConfirmation(Boolean.TRUE.equals(payload.getRequiresConfirmation()))
                                    .confirmationContext(payload.getConfirmationContext())
                                    .status("Streaming")
                                    .timestamp(LocalDateTime.now())
                                    .build();
                            safeSend(session, chunk);
                        },
                        throwable -> {
                            log.error("❌ [AI-WS] Error streaming message. requestId={}, conversationId={}, user={}",
                                    requestId, conversationId, userId, throwable);
                            safeSend(session, buildErrorResponse(requestId,
                                    "Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn.",
                                    conversationId,
                                    userId));
                        },
                        () -> {
                            StructuredChatPayload safePayload = lastPayload.get();
                            if (safePayload == null) {
                                safePayload = StructuredChatPayload.builder()
                                        .message("Xin lỗi, tôi không thể tạo phản hồi lúc này.")
                                        .results(List.of())
                                        .build();
                            }

                            ChatMessageResponse response = ChatMessageResponse.builder()
                                    .type(ResponseType.RESPONSE)
                                    .requestId(requestId)
                                    .conversationId(conversationId)
                                    .userId(userId)
                                    .userMessage(socketRequest.getMessage())
                                    .aiResponse(safePayload.getMessage())
                                    .results(safePayload.getResults())
                                    .nextRequestSuggestions(extractSuggestions(safePayload))
                                    .requiresConfirmation(Boolean.TRUE.equals(safePayload.getRequiresConfirmation()))
                                    .confirmationContext(safePayload.getConfirmationContext())
                                    .status("Completed")
                                    .timestamp(LocalDateTime.now())
                                    .processingTimeMs(Duration.between(startedAt, Instant.now()).toMillis())
                                    .build();

                            safeSend(session, response);
                        }
                );
    }

    private ChatSocketRequest parseRequest(String payload) {
        try {
            return objectMapper.readValue(payload, ChatSocketRequest.class);
        } catch (JsonProcessingException e) {
            log.warn("⚠️ [AI-WS] Failed to parse payload: {}", e.getMessage());
            return null;
        }
    }

    private void safeSend(WebSocketSession session, ChatMessageResponse response) {
        if (session == null || !session.isOpen()) {
            return;
        }
        try {
            String json = objectMapper.writeValueAsString(response);
            synchronized (session) {
                session.sendMessage(new TextMessage(json));
            }
        } catch (IOException e) {
            log.warn("⚠️ [AI-WS] Failed to send message to sessionId={}: {}", session.getId(), e.getMessage());
        }
    }

    private ChatMessageResponse buildErrorResponse(String requestId,
                                                   String message,
                                                   String conversationId,
                                                   String userId) {
        return ChatMessageResponse.builder()
                .type(ResponseType.ERROR)
                .requestId(requestId)
                .conversationId(conversationId)
                .userId(userId)
                .status("Error")
                .error(message)
                .timestamp(LocalDateTime.now())
                .build();
    }

    private List<String> extractSuggestions(StructuredChatPayload payload) {
        if (payload == null) {
            return List.of();
        }
        String[] suggestions = payload.getNextRequestSuggestions();
        if (suggestions == null || suggestions.length == 0) {
            return List.of();
        }
        return Arrays.stream(suggestions)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(StringUtils::hasText)
                .toList();
    }

    private Optional<String> resolveUserId(WebSocketSession session) {
        if (session == null) {
            return Optional.empty();
        }

        Map<String, Object> attributes = session.getAttributes();
        if (attributes != null) {
            Object usernameAttr = attributes.get("username");
            if (usernameAttr instanceof String username && StringUtils.hasText(username)) {
                return Optional.of(username);
            }
            Object jwtAttr = attributes.get("jwt");
            if (jwtAttr instanceof org.springframework.security.oauth2.jwt.Jwt jwt) {
                String preferredUsername = jwt.getClaimAsString("preferred_username");
                if (StringUtils.hasText(preferredUsername)) {
                    return Optional.of(preferredUsername);
                }
            }
        }

        // Spring Security should populate the Principal when the handshake succeeds.
        return Optional.ofNullable(session.getPrincipal())
                .map(principal -> {
                    if (principal instanceof JwtAuthenticationToken jwtAuth) {
                        String preferredUsername = jwtAuth.getToken().getClaimAsString("preferred_username");
                        if (StringUtils.hasText(preferredUsername)) {
                            return preferredUsername;
                        }
                        return jwtAuth.getName();
                    }
                    if (principal instanceof Authentication authentication) {
                        return authentication.getName();
                    }
                    return principal.getName();
                })
                .or(() -> Optional.ofNullable(attributes != null ? attributes.get("principal") : null)
                        .map(Object::toString));
    }

    private void registerHeartbeat(WebSocketSession session) {
        cancelHeartbeat(session.getId());
        ScheduledFuture<?> future = heartbeatScheduler.scheduleAtFixedRate(
                () -> {
                    if (session.isOpen()) {
                        ChatMessageResponse heartbeat = ChatMessageResponse.builder()
                                .type(ResponseType.PROCESSING)
                                .status("keepalive")
                                .timestamp(LocalDateTime.now())
                                .conversationId(null)
                                .requestId(null)
                                .build();
                        safeSend(session, heartbeat);
                    }
                },
                INITIAL_HEARTBEAT_DELAY.toSeconds(),
                HEARTBEAT_INTERVAL.toSeconds(),
                TimeUnit.SECONDS
        );
        heartbeatRegistrations.put(session.getId(), future);
    }

    private void cancelHeartbeat(String sessionId) {
        Optional.ofNullable(heartbeatRegistrations.remove(sessionId))
                .ifPresent(future -> future.cancel(true));
    }

    @PreDestroy
    public void shutdown() {
        heartbeatScheduler.shutdownNow();
        workerScheduler.dispose();
        workerPool.shutdownNow();
    }

    private static final class ChatSocketThreadFactory implements ThreadFactory {
        private final String prefix;
        private int counter = 0;

        private ChatSocketThreadFactory(String prefix) {
            this.prefix = prefix;
        }

        @Override
        public synchronized Thread newThread(Runnable runnable) {
            Thread thread = new Thread(runnable);
            thread.setName(prefix + "-" + (++counter));
            thread.setDaemon(true);
            return thread;
        }
    }
}
