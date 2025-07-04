package com.pdh.gateway.controller;

import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.annotation.RegisteredOAuth2AuthorizedClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
public class DebugController {

    /**
     * Endpoint tạm thời để kiểm tra Access Token.
     * Sau khi đăng nhập thành công, truy cập vào http://localhost:8080/debug/token
     */
    @GetMapping("/debug/token")
    public Mono<String> getAccessToken(
            @RegisteredOAuth2AuthorizedClient("logto") OAuth2AuthorizedClient authorizedClient) {

        if (authorizedClient == null || authorizedClient.getAccessToken() == null) {
            return Mono.just("DEBUG: Token không tồn tại hoặc client chưa được ủy quyền.");
        }

        String tokenValue = authorizedClient.getAccessToken().getTokenValue();

        // In giá trị token ra console của backoffice-bff để kiểm tra
        System.out.println("---[ DEBUG ACCESS TOKEN ]---");
        System.out.println(tokenValue);
        System.out.println("----------------------------");

        // Kiểm tra xem token có giống JWT không (có 2 dấu chấm)
        if (tokenValue.split("\\.").length == 3) {
            return Mono.just("DEBUG: Token nhận được có vẻ là một JWT. Hãy kiểm tra console để xem giá trị đầy đủ.");
        } else {
            return Mono.just("DEBUG: Token nhận được là OPAQUE TOKEN: " + tokenValue);
        }
    }
}
