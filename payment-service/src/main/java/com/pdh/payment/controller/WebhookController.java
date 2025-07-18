package com.pdh.payment.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.payment.config.StripeConfig;
import com.pdh.payment.config.VietQRConfig;
import com.pdh.payment.dto.PaymentConfirmationData;
import com.pdh.payment.model.PaymentTransaction;
import com.pdh.payment.repository.PaymentTransactionRepository;
import com.pdh.payment.service.PaymentService;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

/**
 * Webhook Controller for Payment Gateway Callbacks
 * Handles webhooks from Stripe, VietQR, and other payment gateways
 */
@RestController
@RequestMapping("")
@RequiredArgsConstructor
@Slf4j
public class WebhookController {

    private final StripeConfig stripeConfig;
    private final VietQRConfig vietQRConfig;
    private final PaymentService paymentService;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final ObjectMapper objectMapper;

    /**
     * Stripe webhook endpoint
     */
    @PostMapping("/stripe/webhook")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        
        log.info("Received Stripe webhook");
        
        try {
            // Verify webhook signature
            Event event = Webhook.constructEvent(payload, sigHeader, stripeConfig.getWebhook().getSecret());
            
            log.info("Processing Stripe webhook event: {}", event.getType());
            
            // Handle different event types
            switch (event.getType()) {
                case "payment_intent.succeeded" -> handlePaymentIntentSucceeded(event);
                case "payment_intent.payment_failed" -> handlePaymentIntentFailed(event);
                case "payment_intent.canceled" -> handlePaymentIntentCanceled(event);
                case "payment_intent.requires_action" -> handlePaymentIntentRequiresAction(event);
                default -> log.info("Unhandled Stripe event type: {}", event.getType());
            }
            
            return ResponseEntity.ok("Webhook processed successfully");
            
        } catch (Exception e) {
            log.error("Error processing Stripe webhook", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Webhook processing failed");
        }
    }

    /**
     * VietQR callback endpoint
     */
    @PostMapping("/vietqr/callback")
    public ResponseEntity<String> handleVietQRCallback(
            @RequestBody String payload,
            @RequestHeader(value = "X-Signature", required = false) String signature) {
        
        log.info("Received VietQR callback");
        
        try {
            // Verify callback signature if provided
            if (signature != null && !verifyVietQRSignature(payload, signature)) {
                log.warn("Invalid VietQR callback signature");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid signature");
            }
            
            // Parse callback data
            JsonNode callbackData = objectMapper.readTree(payload);
            
            String transactionId = callbackData.get("transactionId").asText();
            String status = callbackData.get("status").asText();
            BigDecimal amount = new BigDecimal(callbackData.get("amount").asText());
            String bankTransactionId = callbackData.has("bankTransactionId") ? 
                callbackData.get("bankTransactionId").asText() : null;
            
            log.info("Processing VietQR callback for transaction: {} with status: {}", transactionId, status);
            
            // Find transaction and update status
            Optional<PaymentTransaction> transactionOpt = paymentTransactionRepository.findByGatewayTransactionId(transactionId);
            if (transactionOpt.isPresent()) {
                PaymentTransaction transaction = transactionOpt.get();
                
                // Create confirmation data
                PaymentConfirmationData confirmationData = PaymentConfirmationData.forVietQR(
                    bankTransactionId != null ? bankTransactionId : transactionId,
                    callbackData.has("bankCode") ? callbackData.get("bankCode").asText() : "",
                    callbackData.has("senderAccount") ? callbackData.get("senderAccount").asText() : "",
                    callbackData.has("senderName") ? callbackData.get("senderName").asText() : "",
                    amount,
                    "VND",
                    callbackData.has("description") ? callbackData.get("description").asText() : "",
                    LocalDateTime.now()
                );
                
                // Update transaction status
                paymentService.verifyPaymentStatus(transaction.getTransactionId());
                
                log.info("VietQR callback processed successfully for transaction: {}", transactionId);
            } else {
                log.warn("Transaction not found for VietQR callback: {}", transactionId);
            }
            
            return ResponseEntity.ok("Callback processed successfully");
            
        } catch (Exception e) {
            log.error("Error processing VietQR callback", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Callback processing failed");
        }
    }

    // Helper methods for Stripe webhook handling

    private void handlePaymentIntentSucceeded(Event event) {
        PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null);
        if (paymentIntent != null) {
            updateTransactionFromStripeEvent(paymentIntent.getId(), "succeeded");
        }
    }

    private void handlePaymentIntentFailed(Event event) {
        PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null);
        if (paymentIntent != null) {
            updateTransactionFromStripeEvent(paymentIntent.getId(), "payment_failed");
        }
    }

    private void handlePaymentIntentCanceled(Event event) {
        PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null);
        if (paymentIntent != null) {
            updateTransactionFromStripeEvent(paymentIntent.getId(), "canceled");
        }
    }

    private void handlePaymentIntentRequiresAction(Event event) {
        PaymentIntent paymentIntent = (PaymentIntent) event.getDataObjectDeserializer().getObject().orElse(null);
        if (paymentIntent != null) {
            updateTransactionFromStripeEvent(paymentIntent.getId(), "requires_action");
        }
    }

    private void updateTransactionFromStripeEvent(String paymentIntentId, String status) {
        Optional<PaymentTransaction> transactionOpt = paymentTransactionRepository.findByGatewayTransactionId(paymentIntentId);
        if (transactionOpt.isPresent()) {
            PaymentTransaction transaction = transactionOpt.get();
            log.info("Updating transaction {} from Stripe webhook with status: {}", transaction.getTransactionId(), status);
            
            // Verify payment status which will update the transaction
            paymentService.verifyPaymentStatus(transaction.getTransactionId());
        } else {
            log.warn("Transaction not found for Stripe payment intent: {}", paymentIntentId);
        }
    }

    private boolean verifyVietQRSignature(String payload, String signature) {
        try {
            // Implement VietQR signature verification logic
            // This is a placeholder - actual implementation would depend on VietQR's signature scheme
            String expectedSignature = generateVietQRSignature(payload);
            return signature.equals(expectedSignature);
        } catch (Exception e) {
            log.error("Error verifying VietQR signature", e);
            return false;
        }
    }

    private String generateVietQRSignature(String payload) {
        // Placeholder for VietQR signature generation
        // Actual implementation would use VietQR's signature algorithm
        return "placeholder_signature";
    }
}
