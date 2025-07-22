package com.pdh.payment.controller;

import com.pdh.common.utils.AuthenticationUtils;
import com.pdh.common.dto.ApiResponse;
import com.pdh.common.util.ReactiveResponseUtils;
import com.pdh.common.constants.ErrorCodes;
import com.pdh.payment.config.StripeConfig;
import com.pdh.payment.dto.PaymentProcessRequest;
import com.pdh.payment.dto.RefundRequest;
import com.pdh.payment.dto.CreatePaymentIntentRequest;
import com.pdh.payment.dto.ConfirmPaymentIntentRequest;
import com.pdh.payment.dto.PaymentIntentResponse;
import com.pdh.payment.model.Payment;
import com.pdh.payment.model.PaymentMethod;
import com.pdh.payment.model.PaymentTransaction;
import com.pdh.payment.model.enums.PaymentGateway;
import com.pdh.payment.model.enums.PaymentMethodType;
import com.pdh.payment.model.enums.PaymentProvider;
import com.pdh.payment.model.enums.PaymentStatus;
import com.pdh.payment.service.PaymentService;
import com.pdh.payment.service.PaymentIntentService;
import com.pdh.payment.service.strategy.PaymentStrategy;
import com.pdh.payment.service.strategy.PaymentStrategyFactory;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.time.LocalDateTime;
import java.util.*;
import java.util.Arrays;

/**
 * Payment Controller with Reactive WebFlux implementation
 * Handles payment operations for Stripe, VietQR, and other gateways
 */
@RestController
@RequestMapping("")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentIntentService paymentIntentService;
    private final PaymentStrategyFactory strategyFactory;
    private final StripeConfig stripeConfig;

    /**
     * Health check endpoint with gateway status - Reactive
     */
    @GetMapping("/health")
    public Mono<Map<String, Object>> health() {
        log.info("Payment service health check requested");

        return Mono.fromCallable(() -> {
                Map<String, Object> healthStatus = new HashMap<>();
                healthStatus.put("status", "UP");
                healthStatus.put("service", "payment-service");
                healthStatus.put("timestamp", LocalDateTime.now());
                healthStatus.put("message", "Payment Service is running properly");

                // Check gateway health status
                try {
                    Map<String, Boolean> gatewayHealth = new HashMap<>();
                    List<String> availableGateways = new ArrayList<>();

                    for (PaymentStrategy strategy : strategyFactory.getAllStrategies()) {
                        String gatewayName = strategy.getStrategyName().toLowerCase().replace(" payment strategy", "");
                        gatewayHealth.put(gatewayName, true); // Assume available for now
                        availableGateways.add(gatewayName);
                    }

                    healthStatus.put("gateways", gatewayHealth);
                    healthStatus.put("available_gateways", availableGateways);
                } catch (Exception e) {
                    log.warn("Failed to get gateway health status", e);
                    healthStatus.put("gateways", "unavailable");
                }

                return healthStatus;
            })
            .subscribeOn(Schedulers.boundedElastic())
            .onErrorResume(e -> {
                log.error("Health check failed", e);
                Map<String, Object> errorStatus = new HashMap<>();
                errorStatus.put("status", "DOWN");
                errorStatus.put("error", e.getMessage());
                return Mono.just(errorStatus);
            });
    }

    // === PAYMENT INTENT ENDPOINTS ===

    /**
     * Get available payment methods for the user - Reactive
     * Frontend calls: GET /api/payments/storefront/payment-methods
     * BFF routes to: GET /payments/storefront/payment-methods
     */
    @GetMapping("/storefront/payment-methods")
    public Mono<ApiResponse<Map<String, Object>>> getPaymentMethods() {
        return Mono.fromCallable(() -> {
                // Mock payment methods for now
                List<Map<String, Object>> paymentMethods = Arrays.asList(
                    Map.of("id", "stripe", "type", "CREDIT_CARD", "displayName", "Credit Card", "provider", "STRIPE", "isDefault", true),
                    Map.of("id", "vietqr", "type", "BANK_TRANSFER", "displayName", "VietQR", "provider", "VIETQR", "isDefault", false)
                );

                Map<String, Object> result = new HashMap<>();
                result.put("payment_methods", paymentMethods);
                result.put("count", paymentMethods.size());
                return result;
            })
            .subscribeOn(Schedulers.boundedElastic())
            .flatMap(result -> ReactiveResponseUtils.ok(result, "Payment methods retrieved successfully"))
            .onErrorResume(Exception.class, e -> {
                log.error("Error retrieving payment methods", e);
                return ReactiveResponseUtils.internalError("Failed to retrieve payment methods");
            });
    }

    /**
     * Create payment intent (unified endpoint for all gateways) - Reactive
     * Frontend calls: POST /api/payments/storefront/payment-intent
     * BFF routes to: POST /payments/storefront/payment-intent
     */
    @PostMapping("/storefront/payment-intent")
    public Mono<ApiResponse<PaymentIntentResponse>> createPaymentIntent(@Valid @RequestBody CreatePaymentIntentRequest request) {
        log.info("Creating payment intent for booking: {} with gateway: {}", request.getBookingId(), request.getGateway());

        return Mono.fromCallable(() -> paymentIntentService.createPaymentIntent(request))
            .subscribeOn(Schedulers.boundedElastic())
            .flatMap(response -> ReactiveResponseUtils.created(response, "Payment intent created successfully"))
            .onErrorResume(IllegalArgumentException.class, e -> {
                log.error("Invalid payment intent request", e);
                return ReactiveResponseUtils.badRequest(e.getMessage(), ErrorCodes.INVALID_PAYMENT_METHOD);
            })
            .onErrorResume(Exception.class, e -> {
                log.error("Failed to create payment intent", e);
                return ReactiveResponseUtils.internalError("Failed to create payment intent");
            });
    }

    /**
     * Confirm payment intent (unified endpoint for all gateways) - Reactive
     * Frontend calls: POST /api/payments/storefront/payment-intent/confirm
     * BFF routes to: POST /payments/storefront/payment-intent/confirm
     */
    @PostMapping("/storefront/payment-intent/confirm")
    public Mono<ApiResponse<PaymentIntentResponse>> confirmPaymentIntent(@Valid @RequestBody ConfirmPaymentIntentRequest request) {
        log.info("Confirming payment intent: {}", request.getPaymentIntentId());

        return Mono.fromCallable(() -> paymentIntentService.confirmPaymentIntent(request))
            .subscribeOn(Schedulers.boundedElastic())
            .flatMap(response -> ReactiveResponseUtils.ok(response, "Payment intent confirmed successfully"))
            .onErrorResume(IllegalArgumentException.class, e -> {
                log.error("Invalid payment confirmation request", e);
                return ReactiveResponseUtils.badRequest(e.getMessage(), ErrorCodes.INVALID_PAYMENT_METHOD);
            })
            .onErrorResume(Exception.class, e -> {
                log.error("Failed to confirm payment intent", e);
                return ReactiveResponseUtils.internalError("Failed to confirm payment intent");
            });
    }

    // === STRATEGY PATTERN ENDPOINTS ===

    /**
     * Process payment using Strategy Pattern - Reactive
     */
    @PostMapping("/process-payment")
    public Mono<Map<String, Object>> processPaymentWithStrategy(@Valid @RequestBody PaymentProcessRequest request) {
        log.info("Processing payment with strategy for booking: {} using gateway: {}",
                request.getBookingId(), request.getGateway());

        return Mono.fromCallable(() -> {
                // Create Payment entity
                Payment payment = createPaymentFromRequest(request);

                // Get or create payment method
                PaymentMethod paymentMethod = getOrCreatePaymentMethod(request);

                // Add customer data to additional data for payment processing
                Map<String, Object> additionalData = new HashMap<>(request.getAdditionalData() != null ?
                    request.getAdditionalData() : new HashMap<>());
                
                // Process payment using strategy
                PaymentTransaction transaction = paymentService.processPayment(payment, paymentMethod, additionalData);

                // Build response
                Map<String, Object> response = buildPaymentResponse(payment, transaction);

                log.info("Payment processed successfully: {}", payment.getPaymentId());
                return response;
            })
            .subscribeOn(Schedulers.boundedElastic())
            .onErrorResume(IllegalArgumentException.class, e -> {
                log.error("Invalid payment request: {}", e.getMessage());
                return Mono.just(Map.of(
                    "status", "error",
                    "message", e.getMessage(),
                    "timestamp", LocalDateTime.now()
                ));
            })
            .onErrorResume(Exception.class, e -> {
                log.error("Payment processing failed", e);
                return Mono.just(Map.of(
                    "status", "error",
                    "message", "Payment processing failed: " + e.getMessage(),
                    "timestamp", LocalDateTime.now()
                ));
            });
    }

    /**
     * Process storefront payment - Reactive
     */
    @PostMapping("/storefront/process-payment")
    public Mono<Map<String, Object>> processStorefrontPayment(@Valid @RequestBody PaymentProcessRequest request) {
        log.info("Processing storefront payment for booking: {}", request.getBookingId());

        return Mono.fromCallable(() -> {
                // Set default gateway if not specified
                if (request.getGateway() == null) {
                    request.setGateway(PaymentGateway.STRIPE);
                }
                return request;
            })
            .flatMap(this::processPaymentWithStrategy)
            .subscribeOn(Schedulers.boundedElastic())
            .onErrorResume(Exception.class, e -> {
                log.error("Storefront payment processing failed", e);
                return Mono.just(Map.of(
                    "status", "error",
                    "message", "Payment processing failed: " + e.getMessage(),
                    "timestamp", LocalDateTime.now()
                ));
            });
    }

    /**
     * Cancel storefront payment - Reactive
     * Frontend calls: POST /api/payments/storefront/cancel-payment
     * BFF routes to: POST /payments/storefront/cancel-payment
     */
    @PostMapping("/storefront/cancel-payment")
    public Mono<ApiResponse<Map<String, Object>>> cancelStorefrontPayment(
            @RequestParam String paymentId,
            @RequestParam(required = false) String reason) {

        log.info("Cancelling storefront payment: {} with reason: {}", paymentId, reason);

        return Mono.fromCallable(() -> {
                // Logic to cancel payment
                Map<String, Object> cancellationResult = new HashMap<>();
                cancellationResult.put("status", "cancelled");
                cancellationResult.put("payment_id", paymentId);
                cancellationResult.put("reason", reason != null ? reason : "User cancelled");
                return cancellationResult;
            })
            .subscribeOn(Schedulers.boundedElastic())
            .flatMap(result -> ReactiveResponseUtils.ok(result, "Payment cancelled successfully"))
            .onErrorResume(Exception.class, e -> {
                log.error("Payment cancellation failed for payment: {}", paymentId, e);
                return ReactiveResponseUtils.internalError("Payment cancellation failed");
            });
    }

    /**
     * Get Stripe configuration for frontend - Reactive
     * Frontend calls: GET /api/payments/storefront/stripe/config
     * BFF routes to: GET /payments/storefront/stripe/config
     */
    @GetMapping("/storefront/stripe/config")
    public Mono<ApiResponse<Map<String, Object>>> getStripeConfig() {
        return Mono.fromCallable(() -> {
                Map<String, Object> config = new HashMap<>();
                config.put("publishable_key", stripeConfig.getPublishableKey());
                config.put("currency", "usd"); // or get from config
                config.put("country", "US"); // or get from config
                return config;
            })
            .subscribeOn(Schedulers.boundedElastic())
            .flatMap(config -> ReactiveResponseUtils.ok(config, "Stripe configuration retrieved successfully"))
            .onErrorResume(Exception.class, e -> {
                log.error("Error getting Stripe config", e);
                return ReactiveResponseUtils.internalError("Failed to get Stripe configuration");
            });
    }

    // === REFUND ENDPOINTS ===

    /**
     * Process refund - Reactive
     * Frontend calls: POST /api/payments/refunds/{transactionId}
     * BFF routes to: POST /payments/refunds/{transactionId}
     */
    @PostMapping("/refunds/{transactionId}")
    public Mono<ApiResponse<Map<String, Object>>> processRefund(
            @PathVariable UUID transactionId,
            @Valid @RequestBody RefundRequest request) {
        log.info("Processing refund for transaction: {}", transactionId);

        return Mono.fromCallable(() -> {
                PaymentTransaction refundTransaction = paymentService.processRefund(
                    transactionId,
                    request.getAmount(),
                    request.getReason()
                );

                Map<String, Object> refundResult = new HashMap<>();
                refundResult.put("refund_transaction_id", refundTransaction.getTransactionId());
                refundResult.put("refund_amount", refundTransaction.getAmount());
                refundResult.put("refund_status", refundTransaction.getStatus());
                refundResult.put("original_transaction_id", transactionId);
                return refundResult;
            })
            .subscribeOn(Schedulers.boundedElastic())
            .flatMap(result -> ReactiveResponseUtils.ok(result, "Refund processed successfully"))
            .onErrorResume(IllegalArgumentException.class, e -> {
                log.error("Invalid refund request for transaction: {}", transactionId, e);
                return ReactiveResponseUtils.badRequest(e.getMessage(), ErrorCodes.INVALID_PAYMENT_METHOD);
            })
            .onErrorResume(Exception.class, e -> {
                log.error("Refund processing failed for transaction: {}", transactionId, e);
                return ReactiveResponseUtils.internalError("Refund processing failed");
            });
    }

    // === HELPER METHODS ===

    private Payment createPaymentFromRequest(PaymentProcessRequest request) {
        Payment payment = new Payment();
        payment.setBookingId(request.getBookingId());
        payment.setUserId(UUID.fromString(AuthenticationUtils.extractUserId()));
        payment.setAmount(request.getAmount());
        payment.setCurrency(request.getCurrency());
        payment.setDescription(request.getDescription());
        payment.setStatus(PaymentStatus.PENDING);
        return payment;
    }

    private PaymentMethod getOrCreatePaymentMethod(PaymentProcessRequest request) {
        // For now, create a mock payment method based on the gateway
        PaymentMethod paymentMethod = new PaymentMethod();
        paymentMethod.setMethodType(getPaymentMethodTypeFromGateway(request.getGateway()));
        paymentMethod.setProvider(getPaymentProviderFromGateway(request.getGateway()));
        paymentMethod.setIsActive(true);
        paymentMethod.setIsDefault(false);
        return paymentMethod;
    }

    private PaymentMethodType getPaymentMethodTypeFromGateway(PaymentGateway gateway) {
        return switch (gateway) {
            case STRIPE -> PaymentMethodType.CREDIT_CARD;
            case VIETQR -> PaymentMethodType.BANK_TRANSFER;
            default -> PaymentMethodType.CREDIT_CARD;
        };
    }

    private PaymentProvider getPaymentProviderFromGateway(PaymentGateway gateway) {
        return switch (gateway) {
            case STRIPE -> PaymentProvider.STRIPE;
            case VIETQR -> PaymentProvider.VIETQR;
            default -> PaymentProvider.STRIPE;
        };
    }

    private Map<String, Object> buildPaymentResponse(Payment payment, PaymentTransaction transaction) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "success");
        response.put("payment_id", payment.getPaymentId());
        response.put("transaction_id", transaction.getTransactionId());
        response.put("amount", transaction.getAmount());
        response.put("currency", transaction.getCurrency());
        response.put("payment_status", transaction.getStatus());
        response.put("gateway", transaction.getProvider());
        response.put("gateway_transaction_id", transaction.getGatewayTransactionId());
        
        // Add gateway-specific data if available
        if (transaction.getGatewayResponse() != null) {
            response.put("gateway_response", transaction.getGatewayResponse());
        }
        
        response.put("timestamp", LocalDateTime.now());
        return response;
    }
}
