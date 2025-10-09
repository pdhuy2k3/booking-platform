package com.pdh.customer.controller;

import com.pdh.customer.utils.TurnstileValidator;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@Tag(name = "Turnstile", description = "Cloudflare Turnstile validation API")
public class TurnstileController {

    private final TurnstileValidator turnstileValidator;

    public TurnstileController(TurnstileValidator turnstileValidator) {
        this.turnstileValidator = turnstileValidator;
    }

    @PostMapping("/turnstile/verify")
    @Operation(summary = "Verify Cloudflare Turnstile token")
    public ResponseEntity<Map<String, Object>> verifyTurnstile(
            @RequestBody TurnstileVerificationRequest request,
            HttpServletRequest httpRequest) {
        
        String clientIp = getClientIpAddress(httpRequest);
        boolean isValid = turnstileValidator.validateToken(request.token(), clientIp);

        Map<String, Object> response = new HashMap<>();
        response.put("success", isValid);
        response.put("timestamp", System.currentTimeMillis());

        if (isValid) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            // Return the first IP in the list (the original client IP)
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }

        return request.getRemoteAddr();
    }

    public record TurnstileVerificationRequest(String token) {}
}