package com.pdh.gateway.config;

import com.pdh.gateway.service.DynamicResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.registration.ReactiveClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.server.DefaultServerOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.server.ServerOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class CustomServerOAuth2AuthorizationRequestResolver implements ServerOAuth2AuthorizationRequestResolver {

    private final DefaultServerOAuth2AuthorizationRequestResolver defaultResolver;
    private final DynamicResourceService dynamicResourceService;

    @Autowired
    public CustomServerOAuth2AuthorizationRequestResolver(
            ReactiveClientRegistrationRepository clientRegistrationRepository,
            DynamicResourceService dynamicResourceService) {
        this.defaultResolver = new DefaultServerOAuth2AuthorizationRequestResolver(clientRegistrationRepository);
        this.dynamicResourceService = dynamicResourceService;
    }

    @Override
    public Mono<OAuth2AuthorizationRequest> resolve(ServerWebExchange exchange) {
        return this.defaultResolver.resolve(exchange)
                .map(authorizationRequest -> customizeAuthorizationRequest(authorizationRequest, exchange));
    }

    @Override
    public Mono<OAuth2AuthorizationRequest> resolve(ServerWebExchange exchange, String clientRegistrationId) {
        return this.defaultResolver.resolve(exchange, clientRegistrationId)
                .map(authorizationRequest -> customizeAuthorizationRequest(authorizationRequest, exchange));
    }

    private OAuth2AuthorizationRequest customizeAuthorizationRequest(OAuth2AuthorizationRequest authorizationRequest, ServerWebExchange exchange) {
        String path = exchange.getRequest().getPath().value();
        String resourceUrl = dynamicResourceService.getResourceUrl(path);

        OAuth2AuthorizationRequest.Builder builder = OAuth2AuthorizationRequest.from(authorizationRequest);
        builder.additionalParameters(params -> params.put("resource", resourceUrl));

        return builder.build();
    }
}
