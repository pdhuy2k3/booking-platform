package com.pdh.payment.controller;

import com.pdh.common.utils.AuthenticationUtils;

import com.pdh.payment.dto.*;
import com.pdh.payment.model.Payment;
import com.pdh.payment.model.PaymentMethod;
import com.pdh.payment.model.PaymentTransaction;
import com.pdh.payment.model.enums.PaymentProvider;
import com.pdh.payment.repository.PaymentMethodRepository;
import com.pdh.payment.service.PaymentService;
import com.pdh.payment.service.strategy.PaymentStrategy;
import com.pdh.payment.service.strategy.PaymentStrategyFactory;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.*;
import java.util.UUID;

/**
 * Enhanced Payment Controller with Strategy Pattern Support
 * Handles payment operations for Stripe, VietQR, and other gateways
 */
@RestController
@RequestMapping("")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentMethodRepository paymentMethodRepository;
    private final PaymentStrategyFactory strategyFactory;



    /**
     * Process payment using Strategy Pattern - Reactive implementation
     */
    @PostMapping("/process-payment")
    @PreAuthorize("hasRole('USER')")
    public Mono<ResponseEntity<Map<String, Object>>> processPaymentWithStrategy(@Valid @RequestBody PaymentProcessRequest request) {
        return Mono.fromCallable(() -> {
            try {
                UUID userId = AuthenticationUtils.getCurrentUserIdFromContext();
                
                // Convert to internal payment request
                PaymentRequest paymentRequest = request.toPaymentRequest(userId);
                
                // Create payment entity
                Payment payment = createPaymentFromRequest(paymentRequest);
                
                // Create or get payment method
                PaymentMethod paymentMethod = createOrGetPaymentMethod(paymentRequest, userId);
                
                // Process payment using strategy
                PaymentTransaction transaction = paymentService.processPayment(payment, paymentMethod, request.getAdditionalData());
                
                // Build response
                Map<String, Object> response = Map.of(
                    "success", true,
                    "transactionId", transaction.getTransactionId(),
                    "status", transaction.getStatus(),
                    "amount", transaction.getAmount(),
                    "currency", transaction.getCurrency(),
                    "gatewayTransactionId", transaction.getGatewayTransactionId() != null ? transaction.getGatewayTransactionId() : "",
                    "message", "Payment processed successfully"
                );
                
                return ResponseEntity.ok(response);
                
            } catch (Exception e) {
                log.error("Payment processing failed", e);
                Map<String, Object> errorResponse = Map.of(
                    "success", false,
                    "error", e.getMessage(),
                    "message", "Payment processing failed"
                );
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
            }
        }).subscribeOn(Schedulers.boundedElastic());
    }

    /**
     * Create Stripe PaymentIntent for frontend integration
     */
    @PostMapping("/stripe/create-payment-intent")
    @PreAuthorize("hasRole('USER')")
    public Mono<ResponseEntity<StripePaymentIntentResponse>> createStripePaymentIntent(@Valid @RequestBody StripePaymentIntentRequest request) {
        return Mono.fromCallable(() -> {
            try {
                UUID userId = AuthenticationUtils.getCurrentUserIdFromContext();
                
                // Create payment entity
                Payment payment = createPaymentFromStripeRequest(request, userId);
                
                // Create payment method
                PaymentMethod paymentMethod = createStripePaymentMethod(request, userId);
                
                // Process payment using Stripe strategy
                PaymentTransaction transaction = paymentService.processPayment(payment, paymentMethod, Map.of(
                    "customer_email", request.getCustomerEmail(),
                    "customer_name", request.getCustomerName(),
                    "billing_address", request.getBillingAddress()
                ));
                
                // Build Stripe response
                StripePaymentIntentResponse response = StripePaymentIntentResponse.builder()
                    .paymentIntentId(transaction.getGatewayTransactionId())
                    .clientSecret(transaction.getGatewayTransactionId()) // In real implementation, extract from Stripe response
                    .status(transaction.getGatewayStatus())
                    .amount(transaction.getAmount())
                    .currency(transaction.getCurrency())
                    .description(transaction.getDescription())
                    .paymentMethodId(request.getPaymentMethodId())
                    .customerId(request.getCustomerId())
                    .createdAt(transaction.getCreatedAt().toLocalDateTime())
                    .build();
                
                return ResponseEntity.ok(response);
                
            } catch (Exception e) {
                log.error("Stripe PaymentIntent creation failed", e);
                StripePaymentIntentResponse errorResponse = StripePaymentIntentResponse.builder()
                    .error(StripePaymentIntentResponse.StripeErrorDto.builder()
                        .message(e.getMessage())
                        .type("api_error")
                        .build())
                    .build();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
            }
        }).subscribeOn(Schedulers.boundedElastic());
    }

    /**
     * Confirm Stripe PaymentIntent
     */
    @PostMapping("/stripe/confirm-payment-intent/{paymentIntentId}")
    @PreAuthorize("hasRole('USER')")
    public Mono<ResponseEntity<Map<String, Object>>> confirmStripePaymentIntent(
            @PathVariable String paymentIntentId,
            @RequestBody Map<String, Object> request) {
        return Mono.fromCallable(() -> {
            try {
                // Find transaction by gateway transaction ID
                // This would typically involve a repository call
                // For now, return a mock response
                
                Map<String, Object> response = Map.of(
                    "success", true,
                    "paymentIntentId", paymentIntentId,
                    "status", "succeeded",
                    "message", "Payment confirmed successfully"
                );
                
                return ResponseEntity.ok(response);
                
            } catch (Exception e) {
                log.error("Stripe PaymentIntent confirmation failed", e);
                Map<String, Object> errorResponse = Map.of(
                    "success", false,
                    "error", e.getMessage(),
                    "message", "Payment confirmation failed"
                );
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
            }
        }).subscribeOn(Schedulers.boundedElastic());
    }

    /**
     * Process refund using Strategy Pattern
     */
    @PostMapping("/refund/{transactionId}")
    public ResponseEntity<Map<String, Object>> processRefund(
            @PathVariable UUID transactionId,
            @RequestBody RefundRequest refundRequest) {
        try {
            PaymentTransaction refundTransaction = paymentService.processRefund(
                transactionId, 
                refundRequest.getAmount(), 
                refundRequest.getReason()
            );
            
            Map<String, Object> response = Map.of(
                "success", true,
                "refundTransactionId", refundTransaction.getTransactionId(),
                "status", refundTransaction.getStatus(),
                "amount", refundTransaction.getAmount(),
                "message", "Refund processed successfully"
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Refund processing failed", e);
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "error", e.getMessage(),
                "message", "Refund processing failed"
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Verify payment status using Strategy Pattern
     */
    @GetMapping("/status/{transactionId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Object>> verifyPaymentStatus(@PathVariable UUID transactionId) {
        try {
            PaymentTransaction transaction = paymentService.verifyPaymentStatus(transactionId);
            
            Map<String, Object> response = Map.of(
                "success", true,
                "transactionId", transaction.getTransactionId(),
                "status", transaction.getStatus(),
                "gatewayStatus", transaction.getGatewayStatus(),
                "amount", transaction.getAmount(),
                "currency", transaction.getCurrency(),
                "message", "Status verified successfully"
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Payment status verification failed", e);
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "error", e.getMessage(),
                "message", "Status verification failed"
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Cancel payment using Strategy Pattern
     */
    @PostMapping("/cancel/{transactionId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Object>> cancelPayment(
            @PathVariable UUID transactionId,
            @RequestBody Map<String, String> request) {
        try {
            String reason = request.getOrDefault("reason", "User cancelled");
            PaymentTransaction cancelledTransaction = paymentService.cancelPayment(transactionId, reason);
            
            Map<String, Object> response = Map.of(
                "success", true,
                "transactionId", cancelledTransaction.getTransactionId(),
                "status", cancelledTransaction.getStatus(),
                "message", "Payment cancelled successfully"
            );
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Payment cancellation failed", e);
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "error", e.getMessage(),
                "message", "Payment cancellation failed"
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Helper methods

    private Payment createPaymentFromRequest(PaymentRequest request) {
        Payment payment = new Payment();
        payment.setPaymentReference(Payment.generatePaymentReference());
        payment.setBookingId(request.getBookingId());
        payment.setUserId(request.getUserId());
        payment.setAmount(request.getAmount());
        payment.setCurrency(request.getCurrency());
        payment.setDescription(request.getDescription());
        payment.setMethodType(request.getPaymentMethodType());
        payment.setProvider(PaymentProvider.STRIPE); // Default to Stripe for now
        payment.setSagaId(request.getSagaId());
        return payment;
    }

    private Payment createPaymentFromStripeRequest(StripePaymentIntentRequest request, UUID userId) {
        Payment payment = new Payment();
        payment.setPaymentReference(Payment.generatePaymentReference());
        payment.setBookingId(request.getBookingId());
        payment.setUserId(userId);
        payment.setAmount(request.getAmount());
        payment.setCurrency(request.getCurrency());
        payment.setDescription(request.getDescription());
        payment.setMethodType(request.getPaymentMethodType());
        payment.setProvider(PaymentProvider.STRIPE);
        payment.setSagaId(request.getSagaId());
        return payment;
    }

    private PaymentMethod createOrGetPaymentMethod(PaymentRequest request, UUID userId) {
        // This would typically check if payment method exists and create if not
        PaymentMethod paymentMethod = new PaymentMethod();
        paymentMethod.setUserId(userId);
        paymentMethod.setMethodType(request.getPaymentMethodType());
        paymentMethod.setProvider(PaymentProvider.STRIPE);
        paymentMethod.setDisplayName("Stripe Payment Method");
        paymentMethod.setIsActive(true);
        paymentMethod.setIsDefault(false);
        paymentMethod.setIsVerified(false);
        return paymentMethod;
    }

    private PaymentMethod createStripePaymentMethod(StripePaymentIntentRequest request, UUID userId) {
        PaymentMethod paymentMethod = new PaymentMethod();
        paymentMethod.setUserId(userId);
        paymentMethod.setMethodType(request.getPaymentMethodType());
        paymentMethod.setProvider(PaymentProvider.STRIPE);
        paymentMethod.setDisplayName("Stripe " + request.getPaymentMethodType().getDisplayName());
        paymentMethod.setIsActive(true);
        paymentMethod.setIsDefault(false);
        paymentMethod.setIsVerified(false);
        paymentMethod.setToken(request.getPaymentMethodId()); // Store payment method ID as token
        return paymentMethod;
    }
}
