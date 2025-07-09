package com.pdh.payment.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Payment Controller
 * Xử lý các API requests liên quan đến thanh toán
 */
@RestController
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    /**
     * Health check endpoint
     */
    @GetMapping("/backoffice/payment/health")
    public ResponseEntity<Map<String, Object>> health() {
        log.info("Payment service health check requested");
        
        Map<String, Object> healthStatus = Map.of(
            "status", "UP",
            "service", "payment-service",
            "timestamp", LocalDateTime.now(),
            "message", "Payment Service is running properly"
        );
        
        return ResponseEntity.ok(healthStatus);
    }

    // === BOOKING INTEGRATION ENDPOINTS ===
    
    /**
     * Process payment for booking (called by Booking Service)
     */
    @PostMapping("/payments/process")
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
    @PostMapping("/payments/refund")
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
    @GetMapping("/payments/{paymentId}/status")
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
}
