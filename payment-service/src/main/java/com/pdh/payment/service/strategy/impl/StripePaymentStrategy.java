package com.pdh.payment.service.strategy.impl;

import com.pdh.payment.config.StripeConfig;
import com.pdh.payment.model.Payment;
import com.pdh.payment.model.PaymentMethod;
import com.pdh.payment.model.PaymentTransaction;
import com.pdh.payment.model.enums.PaymentProvider;
import com.pdh.payment.model.enums.PaymentStatus;
import com.pdh.payment.model.enums.PaymentTransactionType;
import com.pdh.payment.service.strategy.PaymentStrategy;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.model.Refund;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.PaymentIntentRetrieveParams;
import com.stripe.param.RefundCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Stripe Payment Strategy Implementation
 * Handles Stripe payment processing with full SDK integration
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class StripePaymentStrategy implements PaymentStrategy {
    
    private final StripeConfig stripeConfig;
    
    private static final String STRATEGY_NAME = "Stripe Payment Strategy";
    private static final BigDecimal STRIPE_FEE_RATE = new BigDecimal("0.029"); // 2.9%
    private static final BigDecimal STRIPE_FIXED_FEE = new BigDecimal("0.30"); // $0.30
    
    @jakarta.annotation.PostConstruct
    public void initializeStripe() {
        if (stripeConfig.isValid()) {
            Stripe.apiKey = stripeConfig.getApi().getSecretKey();
            log.info("Stripe API initialized with key: {}***", 
                    stripeConfig.getApi().getSecretKey().substring(0, 8));
        } else {
            log.warn("Stripe configuration is invalid, strategy will not be available");
        }
    }
    
    @Override
    public PaymentTransaction processPayment(Payment payment, PaymentMethod paymentMethod, Map<String, Object> additionalData) {
        log.info("Processing Stripe payment for payment ID: {} with method: {}", 
                payment.getPaymentId(), paymentMethod.getMethodType());
        
        PaymentTransaction transaction = createBaseTransaction(payment, paymentMethod);
        
        try {
            // Create Stripe PaymentIntent with simple retry
            PaymentIntent paymentIntent = createPaymentIntentWithRetry(payment, paymentMethod, additionalData);
            
            // Update transaction with Stripe data
            updateTransactionWithStripeData(transaction, paymentIntent);
            
            log.info("Stripe payment intent created successfully: {}", paymentIntent.getId());
            
        } catch (StripeException e) {
            log.error("Stripe payment failed for payment ID: {} - {}", payment.getPaymentId(), e.getMessage());
            handleStripeError(transaction, e);
        } catch (Exception e) {
            log.error("Unexpected error during Stripe payment processing", e);
            transaction.markAsFailed("Unexpected error: " + e.getMessage(), "INTERNAL_ERROR");
        }
        
        return transaction;
    }
    
    @Override
    public PaymentTransaction processRefund(PaymentTransaction originalTransaction, BigDecimal refundAmount, String reason) {
        log.info("Processing Stripe refund for transaction: {} with amount: {}", 
                originalTransaction.getTransactionId(), refundAmount);
        
        PaymentTransaction refundTransaction = createRefundTransaction(originalTransaction, refundAmount, reason);
        
        try {
            // Create Stripe Refund with simple retry
            Refund refund = createStripeRefundWithRetry(originalTransaction, refundAmount, reason);
            
            // Update transaction with refund data
            updateRefundTransactionWithStripeData(refundTransaction, refund);
            
            log.info("Stripe refund created successfully: {}", refund.getId());
            
        } catch (StripeException e) {
            log.error("Stripe refund failed for transaction: {} - {}", originalTransaction.getTransactionId(), e.getMessage());
            handleStripeRefundError(refundTransaction, e);
        } catch (Exception e) {
            log.error("Unexpected error during Stripe refund processing", e);
            refundTransaction.markAsFailed("Unexpected error: " + e.getMessage(), "INTERNAL_ERROR");
        }
        
        return refundTransaction;
    }
    
    @Override
    public PaymentTransaction verifyPaymentStatus(PaymentTransaction transaction) {
        log.debug("Verifying Stripe payment status for transaction: {}", transaction.getTransactionId());
        
        if (transaction.getGatewayTransactionId() == null) {
            log.warn("No Stripe payment intent ID found for transaction: {}", transaction.getTransactionId());
            return transaction;
        }
        
        try {
            PaymentIntent paymentIntent = PaymentIntent.retrieve(
                transaction.getGatewayTransactionId(),
                PaymentIntentRetrieveParams.builder().build(),
                null
            );
            
            updateTransactionStatusFromStripe(transaction, paymentIntent);
            
        } catch (StripeException e) {
            log.error("Failed to verify Stripe payment status for transaction: {}", 
                    transaction.getTransactionId(), e);
        }
        
        return transaction;
    }
    
    @Override
    public PaymentTransaction cancelPayment(PaymentTransaction transaction, String reason) {
        log.info("Cancelling Stripe payment for transaction: {} with reason: {}", 
                transaction.getTransactionId(), reason);
        
        try {
            if (transaction.getGatewayTransactionId() != null) {
                PaymentIntent paymentIntent = PaymentIntent.retrieve(transaction.getGatewayTransactionId());
                
                if ("requires_payment_method".equals(paymentIntent.getStatus()) || 
                    "requires_confirmation".equals(paymentIntent.getStatus())) {
                    // Cancel the payment intent
                    paymentIntent.cancel();
                    log.info("Stripe payment intent cancelled: {}", paymentIntent.getId());
                }
            }
            
            transaction.setStatus(PaymentStatus.CANCELLED);
            transaction.setGatewayStatus("CANCELLED");
            transaction.setFailureReason(reason);
            transaction.setFailureCode("USER_CANCELLED");
            transaction.setProcessedAt(ZonedDateTime.now());
            
        } catch (StripeException e) {
            log.error("Failed to cancel Stripe payment intent", e);
            // Still mark as cancelled locally even if Stripe call fails
            transaction.setStatus(PaymentStatus.CANCELLED);
            transaction.setFailureReason(reason + " (Stripe cancellation failed: " + e.getMessage() + ")");
        }
        
        return transaction;
    }
    
    @Override
    public boolean supports(PaymentMethod paymentMethod) {
        return paymentMethod.getProvider() == PaymentProvider.STRIPE && stripeConfig.isValid();
    }
    
    @Override
    public String getStrategyName() {
        return STRATEGY_NAME;
    }
    
    @Override
    public ValidationResult validatePaymentMethod(PaymentMethod paymentMethod) {
        if (!supports(paymentMethod)) {
            return ValidationResult.failure("Payment method not supported by Stripe strategy", "UNSUPPORTED_METHOD");
        }
        
        if (!paymentMethod.getIsActive()) {
            return ValidationResult.failure("Payment method is not active", "INACTIVE_METHOD");
        }
        
        if (paymentMethod.getToken() == null || paymentMethod.getToken().trim().isEmpty()) {
            return ValidationResult.failure("Stripe payment method token is required", "MISSING_TOKEN");
        }
        
        return ValidationResult.success();
    }
    
    @Override
    public BigDecimal getProcessingFee(BigDecimal amount, PaymentMethod paymentMethod) {
        // Stripe fee: 2.9% + $0.30
        BigDecimal percentageFee = amount.multiply(STRIPE_FEE_RATE);
        return percentageFee.add(STRIPE_FIXED_FEE);
    }
    
    @Override
    public boolean supportsRefunds() {
        return true;
    }
    
    @Override
    public boolean supportsPartialRefunds() {
        return true;
    }
    
    @Override
    public int getMaxRefundWindowDays() {
        return 120; // Stripe allows refunds up to 120 days
    }

    // Helper methods

    private PaymentTransaction createBaseTransaction(Payment payment, PaymentMethod paymentMethod) {
        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setPayment(payment);
        transaction.setTransactionReference(
            PaymentTransaction.generateTransactionReference(PaymentTransactionType.PAYMENT));
        transaction.setTransactionType(PaymentTransactionType.PAYMENT);
        transaction.setStatus(PaymentStatus.PROCESSING);
        transaction.setAmount(payment.getAmount());
        transaction.setCurrency(payment.getCurrency());
        transaction.setDescription("Stripe payment for " + payment.getDescription());
        transaction.setProvider(PaymentProvider.STRIPE);
        transaction.setSagaId(payment.getSagaId());
        transaction.setSagaStep("STRIPE_PAYMENT_PROCESSING");

        // Calculate and set gateway fee
        BigDecimal gatewayFee = getProcessingFee(payment.getAmount(), paymentMethod);
        transaction.setGatewayFee(gatewayFee);

        return transaction;
    }

    private PaymentIntent createPaymentIntent(Payment payment, PaymentMethod paymentMethod,
                                            Map<String, Object> additionalData) throws StripeException {

        // Convert amount to cents (Stripe uses smallest currency unit)
        long amountInCents = payment.getAmount().multiply(new BigDecimal("100")).longValue();

        PaymentIntentCreateParams.Builder paramsBuilder = PaymentIntentCreateParams.builder()
                .setAmount(amountInCents)
                .setCurrency(stripeConfig.getSettings().getCurrency())
                .setPaymentMethod(paymentMethod.getToken())
                .setCaptureMethod(PaymentIntentCreateParams.CaptureMethod.valueOf(
                    stripeConfig.getSettings().getCaptureMethod().toUpperCase()))
                .setConfirmationMethod(PaymentIntentCreateParams.ConfirmationMethod.valueOf(
                    stripeConfig.getSettings().getConfirmationMethod().toUpperCase()))
                .setStatementDescriptor(stripeConfig.getSettings().getStatementDescriptor());

        // Add metadata
        Map<String, String> metadata = new HashMap<>();
        metadata.put("payment_id", payment.getPaymentId().toString());
        metadata.put("booking_id", payment.getBookingId().toString());
        metadata.put("user_id", payment.getUserId().toString());
        if (payment.getSagaId() != null) {
            metadata.put("saga_id", payment.getSagaId());
        }
        paramsBuilder.putAllMetadata(metadata);

        // Add customer email if available
        if (additionalData != null && additionalData.containsKey("customer_email")) {
            paramsBuilder.setReceiptEmail((String) additionalData.get("customer_email"));
        }

        return PaymentIntent.create(paramsBuilder.build());
    }

    private void updateTransactionWithStripeData(PaymentTransaction transaction, PaymentIntent paymentIntent) {
        transaction.setGatewayTransactionId(paymentIntent.getId());
        transaction.setGatewayReference("stripe_pi_" + paymentIntent.getId());
        transaction.setGatewayResponse(paymentIntent.toJson());

        // Update status based on Stripe status
        updateTransactionStatusFromStripe(transaction, paymentIntent);
    }

    private void updateTransactionStatusFromStripe(PaymentTransaction transaction, PaymentIntent paymentIntent) {
        String stripeStatus = paymentIntent.getStatus();
        transaction.setGatewayStatus(stripeStatus.toUpperCase());

        switch (stripeStatus) {
            case "succeeded" -> {
                transaction.setStatus(PaymentStatus.COMPLETED);
                transaction.markAsCompleted();
            }
            case "processing" -> transaction.setStatus(PaymentStatus.PROCESSING);
            case "requires_payment_method", "requires_confirmation", "requires_action" ->
                transaction.setStatus(PaymentStatus.PENDING);
            case "canceled" -> {
                transaction.setStatus(PaymentStatus.CANCELLED);
                transaction.setFailureReason("Payment cancelled");
                transaction.setFailureCode("CANCELLED");
            }
            case "payment_failed" -> {
                transaction.setStatus(PaymentStatus.FAILED);
                transaction.setFailureReason("Payment failed");
                transaction.setFailureCode("PAYMENT_FAILED");
            }
            default -> {
                log.warn("Unknown Stripe status: {} for transaction: {}", stripeStatus, transaction.getTransactionId());
                transaction.setStatus(PaymentStatus.PROCESSING);
            }
        }
    }

    private PaymentTransaction createRefundTransaction(PaymentTransaction originalTransaction,
                                                     BigDecimal refundAmount, String reason) {
        PaymentTransaction refundTransaction = new PaymentTransaction();
        refundTransaction.setPayment(originalTransaction.getPayment());
        refundTransaction.setTransactionReference(
            PaymentTransaction.generateTransactionReference(PaymentTransactionType.REFUND));
        refundTransaction.setTransactionType(PaymentTransactionType.REFUND);
        refundTransaction.setStatus(PaymentStatus.PROCESSING);
        refundTransaction.setAmount(refundAmount);
        refundTransaction.setCurrency(originalTransaction.getCurrency());
        refundTransaction.setDescription("Stripe refund: " + reason);
        refundTransaction.setProvider(PaymentProvider.STRIPE);
        refundTransaction.setSagaId(originalTransaction.getSagaId());
        refundTransaction.setSagaStep("STRIPE_REFUND_PROCESSING");
        refundTransaction.setOriginalTransaction(originalTransaction);
        refundTransaction.setIsCompensation(true);

        return refundTransaction;
    }

    private Refund createStripeRefund(PaymentTransaction originalTransaction,
                                    BigDecimal refundAmount, String reason) throws StripeException {

        // Convert amount to cents
        long amountInCents = refundAmount.multiply(new BigDecimal("100")).longValue();

        RefundCreateParams params = RefundCreateParams.builder()
                .setPaymentIntent(originalTransaction.getGatewayTransactionId())
                .setAmount(amountInCents)
                .setReason(RefundCreateParams.Reason.REQUESTED_BY_CUSTOMER)
                .putMetadata("original_transaction_id", originalTransaction.getTransactionId().toString())
                .putMetadata("refund_reason", reason)
                .build();

        return Refund.create(params);
    }

    private void updateRefundTransactionWithStripeData(PaymentTransaction refundTransaction, Refund refund) {
        refundTransaction.setGatewayTransactionId(refund.getId());
        refundTransaction.setGatewayReference("stripe_re_" + refund.getId());
        refundTransaction.setGatewayResponse(refund.toJson());
        refundTransaction.setGatewayStatus(refund.getStatus().toUpperCase());

        // Stripe refunds are usually successful immediately
        if ("succeeded".equals(refund.getStatus())) {
            refundTransaction.setStatus(PaymentStatus.REFUND_COMPLETED);
            refundTransaction.markAsCompleted();
        } else if ("pending".equals(refund.getStatus())) {
            refundTransaction.setStatus(PaymentStatus.REFUND_PROCESSING);
        } else if ("failed".equals(refund.getStatus())) {
            refundTransaction.setStatus(PaymentStatus.REFUND_FAILED);
            refundTransaction.markAsFailed("Refund failed", "REFUND_FAILED");
        }
    }


    /**
     * Create PaymentIntent with simple retry logic (MVP approach)
     */
    private PaymentIntent createPaymentIntentWithRetry(Payment payment, PaymentMethod paymentMethod, 
                                                     Map<String, Object> additionalData) throws StripeException {
        int maxRetries = 2;
        int attempt = 0;
        
        while (attempt < maxRetries) {
            attempt++;
            try {
                return createPaymentIntent(payment, paymentMethod, additionalData);
            } catch (StripeException e) {
                if (attempt >= maxRetries || !isRetryableError(e)) {
                    throw e;
                }
                log.warn("Stripe payment attempt {} failed, retrying... Error: {}", attempt, e.getMessage());
                try {
                    Thread.sleep(1000); // Simple 1 second delay
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Operation interrupted", ie);
                }
            }
        }
        throw new RuntimeException("Max retries exceeded");
    }

    /**
     * Create Stripe Refund with simple retry logic (MVP approach)
     */
    private Refund createStripeRefundWithRetry(PaymentTransaction originalTransaction, 
                                             BigDecimal refundAmount, String reason) throws StripeException {
        int maxRetries = 2;
        int attempt = 0;
        
        while (attempt < maxRetries) {
            attempt++;
            try {
                return createStripeRefund(originalTransaction, refundAmount, reason);
            } catch (StripeException e) {
                if (attempt >= maxRetries || !isRetryableError(e)) {
                    throw e;
                }
                log.warn("Stripe refund attempt {} failed, retrying... Error: {}", attempt, e.getMessage());
                try {
                    Thread.sleep(1000); // Simple 1 second delay
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new RuntimeException("Operation interrupted", ie);
                }
            }
        }
        throw new RuntimeException("Max retries exceeded");
    }

    /**
     * Simple retry logic - only retry on rate limits and connection errors
     */
    private boolean isRetryableError(StripeException e) {
        return e.getStatusCode() >= 500 || // Server errors
               e.getClass().getSimpleName().equals("RateLimitException") ||
               e.getClass().getSimpleName().equals("ApiConnectionException");
    }

    /**
     * Simple error handling for payments
     */
    private void handleStripeError(PaymentTransaction transaction, StripeException e) {
        String errorMessage = getUserFriendlyMessage(e);
        
        transaction.setStatus(PaymentStatus.FAILED);
        transaction.setGatewayStatus("ERROR");
        transaction.setFailureReason(errorMessage);
        transaction.setFailureCode(e.getCode() != null ? e.getCode() : "STRIPE_ERROR");
        transaction.setGatewayResponse(e.getMessage());
        transaction.setProcessedAt(ZonedDateTime.now());
    }

    /**
     * Simple error handling for refunds
     */
    private void handleStripeRefundError(PaymentTransaction refundTransaction, StripeException e) {
        String errorMessage = getUserFriendlyMessage(e);
        
        refundTransaction.setStatus(PaymentStatus.REFUND_FAILED);
        refundTransaction.setGatewayStatus("ERROR");
        refundTransaction.setFailureReason(errorMessage);
        refundTransaction.setFailureCode(e.getCode() != null ? e.getCode() : "STRIPE_REFUND_ERROR");
        refundTransaction.setGatewayResponse(e.getMessage());
        refundTransaction.setProcessedAt(ZonedDateTime.now());
    }

    /**
     * Convert Stripe errors to user-friendly messages (MVP approach)
     */
    private String getUserFriendlyMessage(StripeException e) {
        String errorCode = e.getCode();
        if (errorCode == null) {
            return "Payment processing failed. Please try again.";
        }
        
        return switch (errorCode) {
            case "card_declined" -> "Your card was declined. Please try a different payment method.";
            case "expired_card" -> "Your card has expired. Please use a different payment method.";
            case "incorrect_cvc" -> "The security code you entered is incorrect.";
            case "incorrect_number" -> "The card number you entered is incorrect.";
            case "insufficient_funds" -> "Your card has insufficient funds.";
            case "processing_error" -> "A processing error occurred. Please try again.";
            case "authentication_required" -> "Additional authentication is required for this payment.";
            default -> "Payment processing failed. Please try again or contact support.";
        };
    }
}
