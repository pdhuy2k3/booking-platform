package com.pdh.payment.service.strategy.impl;

import com.pdh.payment.config.StripeConfig;
import com.pdh.payment.dto.CreatePaymentIntentRequest;
import com.pdh.payment.dto.ConfirmPaymentIntentRequest;
import com.pdh.payment.dto.PaymentIntentResponse;
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
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
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
    
    @PostConstruct
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
            // Create Stripe PaymentIntent
            PaymentIntent paymentIntent = createPaymentIntent(payment, paymentMethod, additionalData);
            
            // Update transaction with Stripe data
            updateTransactionWithStripeData(transaction, paymentIntent);
            
            log.info("Stripe payment intent created successfully: {}", paymentIntent.getId());
            
        } catch (StripeException e) {
            log.error("Stripe payment failed for payment ID: {}", payment.getPaymentId(), e);
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
            // Create Stripe Refund
            Refund refund = createStripeRefund(originalTransaction, refundAmount, reason);
            
            // Update transaction with refund data
            updateRefundTransactionWithStripeData(refundTransaction, refund);
            
            log.info("Stripe refund created successfully: {}", refund.getId());
            
        } catch (StripeException e) {
            log.error("Stripe refund failed for transaction: {}", originalTransaction.getTransactionId(), e);
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

    // === PAYMENT INTENT METHODS ===

    /**
     * Create Stripe Payment Intent for frontend integration
     */
    public PaymentIntentResponse createPaymentIntent(CreatePaymentIntentRequest request) {
        log.info("Creating Stripe Payment Intent for booking: {}", request.getBookingId());

        try {
            // Convert amount to cents (Stripe uses smallest currency unit)
            long amountInCents = request.getAmount().multiply(new BigDecimal("100")).longValue();

            PaymentIntentCreateParams.Builder paramsBuilder = PaymentIntentCreateParams.builder()
                    .setAmount(amountInCents)
                    .setCurrency(request.getCurrency().toLowerCase())
                    .setConfirmationMethod(PaymentIntentCreateParams.ConfirmationMethod.MANUAL)
                    .setCaptureMethod(PaymentIntentCreateParams.CaptureMethod.AUTOMATIC);

            // Add payment method types
            if (request.getPaymentMethodTypes() != null && request.getPaymentMethodTypes().length > 0) {
                for (String type : request.getPaymentMethodTypes()) {
                    paramsBuilder.addPaymentMethodType(type);
                }
            } else {
                paramsBuilder.addPaymentMethodType("card");
            }

            // Add automatic payment methods if enabled
            if (request.isAutomaticPaymentMethodsEnabled()) {
                paramsBuilder.setAutomaticPaymentMethods(
                    PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                        .setEnabled(true)
                        .build()
                );
            }

            // Add metadata
            Map<String, String> metadata = new HashMap<>();
            metadata.put("booking_id", request.getBookingId().toString());
            if (request.getCustomerEmail() != null) {
                metadata.put("customer_email", request.getCustomerEmail());
            }
            if (request.getDescription() != null) {
                metadata.put("description", request.getDescription());
            }
            if (request.getMetadata() != null) {
                request.getMetadata().forEach((key, value) -> 
                    metadata.put(key, value.toString()));
            }
            paramsBuilder.putAllMetadata(metadata);

            // Add customer email for receipt
            if (request.getCustomerEmail() != null) {
                paramsBuilder.setReceiptEmail(request.getCustomerEmail());
            }

            // Add description
            if (request.getDescription() != null) {
                paramsBuilder.setDescription(request.getDescription());
            }

            PaymentIntent paymentIntent = PaymentIntent.create(paramsBuilder.build());

            return PaymentIntentResponse.builder()
                    .paymentIntentId(paymentIntent.getId())
                    .clientSecret(paymentIntent.getClientSecret())
                    .amount(request.getAmount())
                    .currency(request.getCurrency())
                    .status(paymentIntent.getStatus())
                    .gateway("stripe")
                    .paymentMethodTypes(request.getPaymentMethodTypes())
                    .description(request.getDescription())
                    .metadata(request.getMetadata())
                    .createdAt(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                    .build();

        } catch (StripeException e) {
            log.error("Failed to create Stripe Payment Intent", e);
            throw new RuntimeException("Failed to create payment intent: " + e.getMessage(), e);
        }
    }

    /**
     * Confirm Stripe Payment Intent
     */
    public PaymentIntentResponse confirmPaymentIntent(ConfirmPaymentIntentRequest request) {
        log.info("Confirming Stripe Payment Intent: {}", request.getPaymentIntentId());

        try {
            PaymentIntent paymentIntent = PaymentIntent.retrieve(request.getPaymentIntentId());

            if (request.getPaymentMethodId() != null) {
                // Confirm with payment method
                Map<String, Object> params = new HashMap<>();
                params.put("payment_method", request.getPaymentMethodId());
                if (request.getReturnUrl() != null) {
                    params.put("return_url", request.getReturnUrl());
                }
                if (request.isUseStripeSdk()) {
                    params.put("use_stripe_sdk", true);
                }

                paymentIntent = paymentIntent.confirm(params);
            } else {
                // Just confirm the existing payment intent
                paymentIntent = paymentIntent.confirm();
            }

            return PaymentIntentResponse.builder()
                    .paymentIntentId(paymentIntent.getId())
                    .clientSecret(paymentIntent.getClientSecret())
                    .amount(new BigDecimal(paymentIntent.getAmount()).divide(new BigDecimal("100")))
                    .currency(paymentIntent.getCurrency().toUpperCase())
                    .status(paymentIntent.getStatus())
                    .gateway("stripe")
                    .description(paymentIntent.getDescription())
                    .createdAt(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                    .build();

        } catch (StripeException e) {
            log.error("Failed to confirm Stripe Payment Intent: {}", request.getPaymentIntentId(), e);
            throw new RuntimeException("Failed to confirm payment intent: " + e.getMessage(), e);
        }
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
        refundTransaction.setOriginalTransactionId(originalTransaction.getTransactionId());
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

    private void handleStripeError(PaymentTransaction transaction, StripeException e) {
        String errorCode = e.getCode() != null ? e.getCode() : "STRIPE_ERROR";
        String errorMessage = e.getUserMessage() != null ? e.getUserMessage() : e.getMessage();

        transaction.setStatus(PaymentStatus.FAILED);
        transaction.setGatewayStatus("ERROR");
        transaction.setFailureReason(errorMessage);
        transaction.setFailureCode(errorCode);
        transaction.setGatewayResponse(e.getMessage());
        transaction.setProcessedAt(ZonedDateTime.now());
    }

    private void handleStripeRefundError(PaymentTransaction refundTransaction, StripeException e) {
        String errorCode = e.getCode() != null ? e.getCode() : "STRIPE_REFUND_ERROR";
        String errorMessage = e.getUserMessage() != null ? e.getUserMessage() : e.getMessage();

        refundTransaction.setStatus(PaymentStatus.REFUND_FAILED);
        refundTransaction.setGatewayStatus("ERROR");
        refundTransaction.setFailureReason(errorMessage);
        refundTransaction.setFailureCode(errorCode);
        refundTransaction.setGatewayResponse(e.getMessage());
        refundTransaction.setProcessedAt(ZonedDateTime.now());
    }
}
