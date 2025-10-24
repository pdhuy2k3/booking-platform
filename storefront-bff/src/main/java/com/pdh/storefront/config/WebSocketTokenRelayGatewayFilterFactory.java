package com.pdh.storefront.config;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.client.web.server.ServerOAuth2AuthorizedClientRepository;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class WebSocketTokenRelayGatewayFilterFactory
        extends AbstractGatewayFilterFactory<WebSocketTokenRelayGatewayFilterFactory.Config> {

    private final ServerOAuth2AuthorizedClientRepository authorizedClientRepository;

    public WebSocketTokenRelayGatewayFilterFactory(
            ServerOAuth2AuthorizedClientRepository authorizedClientRepository) {
        super(Config.class);
        this.authorizedClientRepository = authorizedClientRepository;
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> exchange.getPrincipal()
                .flatMap(principal -> {
                    if (principal instanceof OAuth2AuthenticationToken oauthToken) {
                        return forwardToken(oauthToken, exchange, chain);
                    }
                    return chain.filter(exchange);
                })
                .switchIfEmpty(chain.filter(exchange));
    }

    private Mono<Void> forwardToken(OAuth2AuthenticationToken oauthToken,
                                    ServerWebExchange exchange,
                                    org.springframework.cloud.gateway.filter.GatewayFilterChain chain) {
        return authorizedClientRepository.loadAuthorizedClient(
                        oauthToken.getAuthorizedClientRegistrationId(),
                        oauthToken,
                        exchange
                )
                .flatMap(client -> relayToken(client, exchange, chain))
                .switchIfEmpty(chain.filter(exchange));
    }

    private Mono<Void> relayToken(OAuth2AuthorizedClient client,
                                  ServerWebExchange exchange,
                                  org.springframework.cloud.gateway.filter.GatewayFilterChain chain) {
        String tokenValue = client.getAccessToken().getTokenValue();
        ServerWebExchange mutated = exchange.mutate()
                .request(builder -> builder.header("Authorization", "Bearer " + tokenValue))
                .build();
        return chain.filter(mutated);
    }

    public static class Config {
        // Placeholder for potential future configuration
    }
}
