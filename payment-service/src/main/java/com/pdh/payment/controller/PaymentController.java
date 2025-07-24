package com.pdh.payment.controller;

import com.pdh.common.utils.AuthenticationUtils;
import com.pdh.payment.client.CustomerServiceClient;
import com.pdh.payment.dto.PaymentProcessRequest;
import com.pdh.payment.dto.PaymentRequest;
import com.pdh.payment.dto.PaymentResult;
import com.pdh.payment.dto.RefundRequest;
import com.pdh.payment.dto.RefundResult;
import com.pdh.payment.model.Payment;
import com.pdh.payment.model.PaymentMethod;
import com.pdh.payment.model.PaymentTransaction;
import com.pdh.payment.model.enums.PaymentGateway;
import com.pdh.payment.model.enums.PaymentMethodType;
import com.pdh.payment.model.enums.PaymentProvider;
import com.pdh.payment.model.enums.PaymentStatus;
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

import java.math.BigDecimal;
import java.time.LocalDateTime;
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
    private final CustomerServiceClient customerServiceClient;

    /**
     * Health check endpoint with gateway status
     */
    @GetMapping("/health")
    public Mono<ResponseEntity<Map<String, Object>>> health() {
        log.info("Payment service health check requested");

        return Mono.fromCallable(() -> {
            Map<String, Object> healthStatus = new HashMap<>();
            healthStatus.put("status", "UP");
            healthStatus.put("service", "payment-service");
            healthStatus.put("timestamp", LocalDateTime.now());
            healthStatus.put("message", "Payment Service is running properly");

            // Add gateway health status
            try {
                List<PaymentStrategy> strategies = strategyFactory.getAllStrategies();
                Map<String, Boolean> gatewayHealth = new HashMap<>();
                List<String> availableGateways = new ArrayList<>();

                for (PaymentStrategy strategy : strategies) {
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

            return ResponseEntity.ok(healthStatus);
        })
        .subscribeOn(Schedulers.boundedElastic());
    }

    // === NEW STRATEGY PATTERN ENDPOINTS ===

    /**
     * Process payment using Strategy Pattern - Reactive implementation
     */
    @PostMapping("/process-payment")
    @PreAuthorize("hasRole('USER')")
    public Mono<ResponseEntity<Map<String, Object>>> processPaymentWithStrategy(@Valid @RequestBody PaymentProcessRequest request) {
        log.info("Processing payment with strategy for booking: {} using gateway: {}",
                request.getBookingId(), request.getGateway());

        return Mono.fromCallable(() -> {
            // Get user ID from JWT
            String userId = AuthenticationUtils.extractUserId();

            // Fetch customer profile from customer service
            CustomerServiceClient.CustomerProfile customerProfile =
                customerServiceClient.getCustomerProfile(UUID.fromString(userId));

            // Create Payment entity
            Payment payment = createPaymentFromRequest(request);

            // Get or create payment method
            PaymentMethod paymentMethod = getOrCreatePaymentMethod(request);

            // Add customer data to additional data for payment processing
            Map<String, Object> additionalData = new HashMap<>(request.getAdditionalData() != null ?
                request.getAdditionalData() : new HashMap<>());
            additionalData.put("customer_email", customerProfile.getEmail());
            additionalData.put("customer_name", customerProfile.getFullName());
            additionalData.put("customer_phone", customerProfile.getPhone());
            additionalData.put("billing_address", customerProfile.getAddress());
            additionalData.put("billing_city", customerProfile.getCity());
            additionalData.put("billing_state", customerProfile.getState());
            additionalData.put("billing_country", customerProfile.getCountry());
            additionalData.put("billing_postal_code", customerProfile.getPostalCode());

            // Process payment using strategy
            PaymentTransaction transaction = paymentService.processPayment(payment, paymentMethod, additionalData);

            // Build response
            Map<String, Object> response = buildPaymentResponse(payment, transaction);

            log.info("Payment processed successfully: {}", payment.getPaymentId());
            return ResponseEntity.ok(response);
        })
        .subscribeOn(Schedulers.boundedElastic())
        .onErrorResume(IllegalArgumentException.class, e -> {
            log.error("Invalid payment request: {}", e.getMessage());
            return Mono.just(ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", e.getMessage(),
                "timestamp", LocalDateTime.now()
            )));
        })
        .onErrorResume(Exception.class, e -> {
            log.error("Payment processing failed", e);
            return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", "error",
                "message", "Payment processing failed: " + e.getMessage(),
                "timestamp", LocalDateTime.now()
            )));
        });
    }

    /**
     * Process refund using Strategy Pattern
     */
    @PostMapping("/refund/{transactionId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Object>> processRefund(
            @PathVariable UUID transactionId,
            @RequestBody RefundRequest refundRequest) {
        log.info("Processing refund for transaction: {} with amount: {}", transactionId, refundRequest.getAmount());

        try {
            PaymentTransaction refundTransaction = paymentService.processRefund(
                transactionId, refundRequest.getAmount(), refundRequest.getReason());

            Map<String, Object> response = buildRefundResponse(refundTransaction);

            log.info("Refund processed successfully: {}", refundTransaction.getTransactionId());
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.error("Invalid refund request: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "status", "error",
                "message", e.getMessage(),
                "timestamp", LocalDateTime.now()
            ));
        } catch (Exception e) {
            log.error("Refund processing failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", "error",
                "message", "Refund processing failed: " + e.getMessage(),
                "timestamp", LocalDateTime.now()
            ));
        }
    }

    /**
     * Verify payment status using Strategy Pattern
     */
    @GetMapping("/status/{transactionId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Map<String, Object>> verifyPaymentStatus(@PathVariable UUID transactionId) {
        log.info("Verifying payment status for transaction: {}", transactionId);

        try {
            PaymentTransaction transaction = paymentService.verifyPaymentStatus(transactionId);

            Map<String, Object> response = Map.of(
                "transactionId", transaction.getTransactionId(),
                "status", transaction.getStatus(),
                "amount", transaction.getAmount(),
                "currency", transaction.getCurrency(),
                "gateway", transaction.getProvider(),
                "gatewayStatus", transaction.getGatewayStatus() != null ? transaction.getGatewayStatus() : "",
                "timestamp", LocalDateTime.now()
            );

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Status verification failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", "error",
                "message", "Status verification failed: " + e.getMessage(),
                "timestamp", LocalDateTime.now()
            ));
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
        log.info("Cancelling payment for transaction: {}", transactionId);

        try {
            String reason = request.getOrDefault("reason", "User cancelled");
            PaymentTransaction cancelledTransaction = paymentService.cancelPayment(transactionId, reason);

            Map<String, Object> response = Map.of(
                "transactionId", cancelledTransaction.getTransactionId(),
                "status", cancelledTransaction.getStatus(),
                "reason", reason,
                "timestamp", LocalDateTime.now()
            );

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Payment cancellation failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", "error",
                "message", "Payment cancellation failed: " + e.getMessage(),
                "timestamp", LocalDateTime.now()
            ));
        }
    }

    // === LEGACY BOOKING INTEGRATION ENDPOINTS ===
    
    /**
     * Process payment for booking (called by Booking Service)
     */
    @PostMapping("/process")
    public ResponseEntity<Map<String, Object>> processPayment(@RequestBody Map<String, Object> request) {
        log.info("Payment processing request: {}", request);
        
        String bookingId = (String) request.get("bookingId");
        String sagaId = (String) request.get("sagaId");
        BigDecimal amount = new BigDecimal(request.get("amount").toString());
        String currency = (String) request.get("currency");
        String customerId = (String) request.get("customerId");
        
        // Mock implementation - in real scenario, this would:
        // 1. Validate payment details
        // 2. Call payment gateway (Stripe, PayPal, etc.)
        // 3. Return payment result
        
        // Simulate payment processing (mock success)
        String paymentId = "PAY-" + UUID.randomUUID().toString().substring(0, 8);
        
        Map<String, Object> response = Map.of(
            "status", "success",
            "message", "Payment processed successfully",
            "paymentId", paymentId,
            "bookingId", bookingId,
            "sagaId", sagaId,
            "amount", amount,
            "currency", currency,
            "customerId", customerId,
            "transactionTime", LocalDateTime.now()
        );
        
        log.info("Payment processing response: {}", response);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Refund payment (compensation)
     */
    @PostMapping("/refund")
    public ResponseEntity<Map<String, Object>> refundPayment(@RequestBody Map<String, Object> request) {
        log.info("Payment refund request: {}", request);
        
        String bookingId = (String) request.get("bookingId");
        String sagaId = (String) request.get("sagaId");
        BigDecimal amount = new BigDecimal(request.get("amount").toString());
        String currency = (String) request.get("currency");
        String reason = (String) request.get("reason");
        
        // Mock implementation - in real scenario, this would:
        // 1. Find original payment
        // 2. Process refund through payment gateway
        // 3. Update payment status
        
        String refundId = "REF-" + UUID.randomUUID().toString().substring(0, 8);
        
        Map<String, Object> response = Map.of(
            "status", "success",
            "message", "Refund processed successfully",
            "refundId", refundId,
            "bookingId", bookingId,
            "sagaId", sagaId,
            "amount", amount,
            "currency", currency,
            "reason", reason,
            "refundTime", LocalDateTime.now()
        );
        
        log.info("Payment refund response: {}", response);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Verify payment status
     */
    @GetMapping("{paymentId}/status")
    public ResponseEntity<Map<String, Object>> verifyPaymentStatus(@PathVariable String paymentId) {
        log.info("Payment status verification request for: {}", paymentId);
        
        // Mock implementation - in real scenario, this would:
        // 1. Query payment gateway for status
        // 2. Return current payment status
        
        Map<String, Object> response = Map.of(
            "paymentId", paymentId,
            "status", "completed",
            "message", "Payment completed successfully",
            "verificationTime", LocalDateTime.now()
        );
        
        log.info("Payment status response: {}", response);
        return ResponseEntity.ok(response);
    }

    // === HELPER METHODS ===

    private Payment createPaymentFromRequest(PaymentProcessRequest request) {
        // Get user ID from JWT token
        String userId = AuthenticationUtils.extractUserId();

        Payment payment = new Payment();
        payment.setPaymentId(UUID.randomUUID());
        payment.setPaymentReference("PAY-" + System.currentTimeMillis());
        payment.setBookingId(request.getBookingId());
        payment.setUserId(UUID.fromString(userId));
        payment.setSagaId(request.getSagaId());
        payment.setAmount(request.getAmount());
        payment.setCurrency(request.getCurrency());
        payment.setDescription(request.getDescription() != null ? request.getDescription() :
                              "Payment for booking " + request.getBookingId());
        payment.setStatus(PaymentStatus.PENDING);
        payment.setProvider(mapGatewayToProvider(request.getGateway()));
        payment.setMethodType(request.getPaymentMethodType());

        return payment;
    }

    private PaymentMethod getOrCreatePaymentMethod(PaymentProcessRequest request) {
        // Get user ID from JWT token
        String userId = AuthenticationUtils.extractUserId();

        // If payment method ID is provided, try to find existing method
        if (request.getPaymentMethodId() != null) {
            Optional<PaymentMethod> existingMethod = paymentMethodRepository.findById(UUID.fromString(request.getPaymentMethodId()));
            if (existingMethod.isPresent()) {
                return existingMethod.get();
            }
        }

        // Create new payment method
        PaymentMethod paymentMethod = new PaymentMethod();
        paymentMethod.setMethodId(UUID.randomUUID());
        paymentMethod.setUserId(UUID.fromString(userId));
        paymentMethod.setMethodType(request.getPaymentMethodType());
        paymentMethod.setProvider(mapGatewayToProvider(request.getGateway()));
        paymentMethod.setDisplayName(request.getGateway().getDisplayName());
        paymentMethod.setToken(request.getPaymentMethodToken());
        paymentMethod.setIsActive(true);
        paymentMethod.setIsVerified(false);
        paymentMethod.setIsDefault(false);
        paymentMethod.setCurrency(request.getCurrency());

        // Set gateway-specific data
        if (request.getGateway() == PaymentGateway.VIETQR) {
            paymentMethod.setBankName(request.getBankCode());
            paymentMethod.setBankAccountLastFour(request.getAccountNumber() != null ?
                request.getAccountNumber().substring(Math.max(0, request.getAccountNumber().length() - 4)) : null);
        }

        return paymentMethodRepository.save(paymentMethod);
    }

    private PaymentProvider mapGatewayToProvider(PaymentGateway gateway) {
        return switch (gateway) {
            case STRIPE -> PaymentProvider.STRIPE;
            case VIETQR -> PaymentProvider.VIETQR;
            case PAYPAL -> PaymentProvider.PAYPAL;
            case VNPAY -> PaymentProvider.VNPAY;
            case MOMO -> PaymentProvider.MOMO;
            case ZALOPAY -> PaymentProvider.ZALOPAY;
            case MOCK -> PaymentProvider.MOCK_PROVIDER;
        };
    }

    private Map<String, Object> buildPaymentResponse(Payment payment, PaymentTransaction transaction) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", transaction.getStatus().isSuccessful() ? "success" :
                    (transaction.getStatus() == PaymentStatus.PENDING ? "pending" : "failed"));
        response.put("paymentId", payment.getPaymentId());
        response.put("transactionId", transaction.getTransactionId());
        response.put("bookingId", payment.getBookingId());
        response.put("amount", transaction.getAmount());
        response.put("currency", transaction.getCurrency());
        response.put("gateway", transaction.getProvider());
        response.put("paymentStatus", transaction.getStatus());
        response.put("timestamp", LocalDateTime.now());

        // Add gateway-specific data
        if (transaction.getGatewayResponse() != null) {
            try {
                // Parse gateway response for frontend-specific data
                if (transaction.getProvider() == PaymentProvider.STRIPE) {
                    response.put("clientSecret", extractClientSecret(transaction.getGatewayResponse()));
                } else if (transaction.getProvider() == PaymentProvider.VIETQR) {
                    response.put("qrCode", extractQRCode(transaction.getGatewayResponse()));
                }
            } catch (Exception e) {
                log.warn("Failed to parse gateway response", e);
            }
        }

        if (transaction.getFailureReason() != null) {
            response.put("errorMessage", transaction.getFailureReason());
            response.put("errorCode", transaction.getFailureCode());
        }

        return response;
    }

    private Map<String, Object> buildRefundResponse(PaymentTransaction refundTransaction) {
        Map<String, Object> response = new HashMap<>();
        response.put("status", refundTransaction.getStatus() == PaymentStatus.REFUND_COMPLETED ? "success" :
                    (refundTransaction.getStatus() == PaymentStatus.REFUND_PENDING ? "pending" : "failed"));
        response.put("refundId", refundTransaction.getTransactionId());
        response.put("originalTransactionId", refundTransaction.getOriginalTransactionId());
        response.put("amount", refundTransaction.getAmount());
        response.put("currency", refundTransaction.getCurrency());
        response.put("gateway", refundTransaction.getProvider());
        response.put("refundStatus", refundTransaction.getStatus());
        response.put("timestamp", LocalDateTime.now());

        if (refundTransaction.getFailureReason() != null) {
            response.put("errorMessage", refundTransaction.getFailureReason());
            response.put("errorCode", refundTransaction.getFailureCode());
        }

        return response;
    }

    private String extractClientSecret(String gatewayResponse) {
        try {
            // Parse Stripe response to extract client secret
            // This is a simplified implementation
            if (gatewayResponse.contains("client_secret")) {
                int start = gatewayResponse.indexOf("client_secret") + 15;
                int end = gatewayResponse.indexOf("\"", start);
                return gatewayResponse.substring(start, end);
            }
        } catch (Exception e) {
            log.warn("Failed to extract client secret from gateway response", e);
        }
        return null;
    }

    private String extractQRCode(String gatewayResponse) {
        try {
            // Parse VietQR response to extract QR code
            if (gatewayResponse.contains("qr_code")) {
                int start = gatewayResponse.indexOf("qr_code") + 10;
                int end = gatewayResponse.indexOf("\"", start);
                return gatewayResponse.substring(start, end);
            }
        } catch (Exception e) {
            log.warn("Failed to extract QR code from gateway response", e);
        }
        return null;
    }
}
