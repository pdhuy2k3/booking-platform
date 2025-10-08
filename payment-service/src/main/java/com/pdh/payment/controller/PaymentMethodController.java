package com.pdh.payment.controller;

import com.pdh.common.utils.AuthenticationUtils;
import com.pdh.payment.dto.request.AddPaymentMethodRequest;
import com.pdh.payment.dto.response.PaymentMethodResponse;
import com.pdh.payment.model.PaymentMethod;
import com.pdh.payment.service.PaymentMethodService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Payment Method Controller
 * Handles user payment method management (add, list, update, delete)
 */
@RestController
@RequestMapping("/payment-methods")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Payment Methods", description = "User payment method management operations")
@SecurityRequirement(name = "oauth2")
public class PaymentMethodController {

    private final PaymentMethodService paymentMethodService;

    /**
     * Get all payment methods for the authenticated user
     */
    @Operation(
        summary = "Get user payment methods",
        description = "Retrieve all active payment methods for the authenticated user"
    )
    @GetMapping
    public ResponseEntity<List<PaymentMethodResponse>> getUserPaymentMethods() {
        try {
            UUID userId = AuthenticationUtils.getCurrentUserIdFromContext();
            List<PaymentMethod> methods = paymentMethodService.getUserPaymentMethods(userId);
            
            List<PaymentMethodResponse> response = methods.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting payment methods", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get a specific payment method by ID
     */
    @Operation(
        summary = "Get payment method by ID",
        description = "Retrieve a specific payment method by its ID"
    )
    @GetMapping("/{methodId}")
    public ResponseEntity<PaymentMethodResponse> getPaymentMethodById(
            @Parameter(description = "Payment method ID") @PathVariable UUID methodId) {
        try {
            UUID userId = AuthenticationUtils.getCurrentUserIdFromContext();
            PaymentMethod method = paymentMethodService.getPaymentMethodById(methodId, userId);
            
            return ResponseEntity.ok(toResponse(method));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error getting payment method", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Add a new payment method
     */
    @Operation(
        summary = "Add payment method",
        description = "Add a new payment method for the authenticated user. Supports credit cards, debit cards, and bank accounts."
    )
    @PostMapping
    public ResponseEntity<PaymentMethodResponse> addPaymentMethod(
            @Valid @RequestBody AddPaymentMethodRequest request) {
        try {
            UUID userId = AuthenticationUtils.getCurrentUserIdFromContext();
            PaymentMethod method = paymentMethodService.addPaymentMethod(userId, request);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(method));
        } catch (IllegalArgumentException e) {
            log.error("Invalid payment method request", e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("Error adding payment method", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Set a payment method as default
     */
    @Operation(
        summary = "Set default payment method",
        description = "Set a payment method as the default for the user"
    )
    @PutMapping("/{methodId}/set-default")
    public ResponseEntity<PaymentMethodResponse> setDefaultPaymentMethod(
            @Parameter(description = "Payment method ID") @PathVariable UUID methodId) {
        try {
            UUID userId = AuthenticationUtils.getCurrentUserIdFromContext();
            PaymentMethod method = paymentMethodService.setDefaultPaymentMethod(userId, methodId);
            
            return ResponseEntity.ok(toResponse(method));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error setting default payment method", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Delete a payment method
     */
    @Operation(
        summary = "Delete payment method",
        description = "Delete (deactivate) a payment method"
    )
    @DeleteMapping("/{methodId}")
    public ResponseEntity<Map<String, String>> deletePaymentMethod(
            @Parameter(description = "Payment method ID") @PathVariable UUID methodId) {
        try {
            UUID userId = AuthenticationUtils.getCurrentUserIdFromContext();
            paymentMethodService.deletePaymentMethod(userId, methodId);
            
            return ResponseEntity.ok(Map.of("message", "Payment method deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error deleting payment method", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Update payment method details
     */
    @Operation(
        summary = "Update payment method",
        description = "Update payment method display name or other non-sensitive details"
    )
    @PutMapping("/{methodId}")
    public ResponseEntity<PaymentMethodResponse> updatePaymentMethod(
            @Parameter(description = "Payment method ID") @PathVariable UUID methodId,
            @RequestBody Map<String, String> updates) {
        try {
            UUID userId = AuthenticationUtils.getCurrentUserIdFromContext();
            PaymentMethod method = paymentMethodService.updatePaymentMethod(userId, methodId, updates);
            
            return ResponseEntity.ok(toResponse(method));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error updating payment method", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Verify a payment method (for future use with 3D Secure, etc.)
     */
    @Operation(
        summary = "Verify payment method",
        description = "Verify a payment method through the payment gateway"
    )
    @PostMapping("/{methodId}/verify")
    public ResponseEntity<Map<String, Object>> verifyPaymentMethod(
            @Parameter(description = "Payment method ID") @PathVariable UUID methodId) {
        try {
            UUID userId = AuthenticationUtils.getCurrentUserIdFromContext();
            boolean verified = paymentMethodService.verifyPaymentMethod(userId, methodId);
            
            return ResponseEntity.ok(Map.of(
                "verified", verified,
                "message", verified ? "Payment method verified successfully" : "Payment method verification failed"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error verifying payment method", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    // Helper method to convert entity to response DTO
    private PaymentMethodResponse toResponse(PaymentMethod method) {
        PaymentMethodResponse response = new PaymentMethodResponse();
        response.setMethodId(method.getMethodId());
        response.setDisplayName(method.getDisplayName());
        response.setMethodType(method.getMethodType());
        response.setProvider(method.getProvider());
        response.setIsDefault(method.getIsDefault());
        response.setIsActive(method.getIsActive());
        response.setIsVerified(method.getIsVerified());
        
        // Card details
        if (method.getCardLastFour() != null) {
            response.setCardLastFour(method.getCardLastFour());
            response.setCardBrand(method.getCardBrand());
            response.setCardExpiryMonth(method.getCardExpiryMonth());
            response.setCardExpiryYear(method.getCardExpiryYear());
        }
        
        // Bank details
        if (method.getBankName() != null) {
            response.setBankName(method.getBankName());
            response.setBankAccountLastFour(method.getBankAccountLastFour());
        }
        
        response.setCreatedAt(method.getCreatedAt() != null ? method.getCreatedAt().toLocalDateTime() : null);
        response.setUpdatedAt(method.getUpdatedAt() != null ? method.getUpdatedAt().toLocalDateTime() : null);
        
        return response;
    }
}
