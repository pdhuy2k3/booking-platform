package com.pdh.ai.config;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class PrincipalPropagateInterceptor implements ChannelInterceptor {
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        var acc = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (acc != null && acc.getUser() != null) {
            var ctx = SecurityContextHolder.createEmptyContext();
            ctx.setAuthentication((Authentication) acc.getUser());
            SecurityContextHolder.setContext(ctx);
        }
        return message;
    }

}



