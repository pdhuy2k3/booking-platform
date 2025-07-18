package com.pdh.payment.dto;

import com.pdh.payment.model.enums.PaymentGateway;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Payment Confirmation Data DTO for Strategy Pattern
 * Contains confirmation data from different payment gateways
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentConfirmationData {
    
    private PaymentGateway gateway;
    private String externalPaymentId;
    private String transactionId;
    private String confirmationCode;
    
    // Payment details
    private BigDecimal amount;
    private String currency;
    private LocalDateTime confirmedAt;
    
    // Gateway-specific confirmation data
    private Map<String, Object> gatewayData;
    
    // Stripe-specific fields
    private String paymentIntentId;
    private String paymentMethodId;
    private String chargeId;
    private String receiptUrl;
    private String stripeCustomerId;
    private String paymentMethodDetails;
    
    // VietQR-specific fields
    private String bankCode;
    private String bankTransactionId;
    private String senderAccountNumber;
    private String senderAccountName;
    private String transferDescription;
    private LocalDateTime bankTransferTime;
    
    // Webhook/Callback data
    private String webhookSignature;
    private String callbackData;
    private boolean signatureVerified;
    
    // Additional metadata
    private String customerEmail;
    private String customerName;
    private String billingAddress;
    private Map<String, Object> metadata;
    
    /**
     * Create Stripe confirmation data
     */
    public static PaymentConfirmationData forStripe(String paymentIntentId, String chargeId, 
                                                   BigDecimal amount, String currency, 
                                                   String receiptUrl, Map<String, Object> metadata) {
        return PaymentConfirmationData.builder()
                .gateway(PaymentGateway.STRIPE)
                .externalPaymentId(paymentIntentId)
                .paymentIntentId(paymentIntentId)
                .chargeId(chargeId)
                .amount(amount)
                .currency(currency)
                .receiptUrl(receiptUrl)
                .confirmedAt(LocalDateTime.now())
                .metadata(metadata)
                .signatureVerified(true)
                .build();
    }
    
    /**
     * Create VietQR confirmation data
     */
    public static PaymentConfirmationData forVietQR(String bankTransactionId, String bankCode,
                                                   String senderAccountNumber, String senderAccountName,
                                                   BigDecimal amount, String currency,
                                                   String transferDescription, LocalDateTime bankTransferTime) {
        return PaymentConfirmationData.builder()
                .gateway(PaymentGateway.VIETQR)
                .externalPaymentId(bankTransactionId)
                .bankTransactionId(bankTransactionId)
                .bankCode(bankCode)
                .senderAccountNumber(senderAccountNumber)
                .senderAccountName(senderAccountName)
                .amount(amount)
                .currency(currency)
                .transferDescription(transferDescription)
                .bankTransferTime(bankTransferTime)
                .confirmedAt(LocalDateTime.now())
                .signatureVerified(true)
                .build();
    }
    
    /**
     * Validate confirmation data based on gateway
     */
    public boolean isValid() {
        if (gateway == null || externalPaymentId == null || amount == null) {
            return false;
        }
        
        return switch (gateway) {
            case STRIPE -> validateStripeData();
            case VIETQR -> validateVietQRData();
            default -> true;
        };
    }
    
    private boolean validateStripeData() {
        return paymentIntentId != null && !paymentIntentId.trim().isEmpty() &&
               chargeId != null && !chargeId.trim().isEmpty();
    }
    
    private boolean validateVietQRData() {
        return bankTransactionId != null && !bankTransactionId.trim().isEmpty() &&
               bankCode != null && !bankCode.trim().isEmpty() &&
               senderAccountNumber != null && !senderAccountNumber.trim().isEmpty();
    }
    
    /**
     * Get human-readable confirmation message
     */
    public String getConfirmationMessage() {
        return switch (gateway) {
            case STRIPE -> String.format("Payment confirmed via Stripe. Transaction ID: %s", chargeId);
            case VIETQR -> String.format("Bank transfer confirmed. Bank: %s, Transaction: %s", 
                                       bankCode, bankTransactionId);
            default -> String.format("Payment confirmed via %s. Transaction ID: %s", 
                                    gateway.getDisplayName(), externalPaymentId);
        };
    }
    
    /**
     * Check if confirmation requires additional verification
     */
    public boolean requiresAdditionalVerification() {
        return !signatureVerified || (gateway == PaymentGateway.VIETQR && bankTransferTime == null);
    }
}
