package com.pdh.payment.dto;

import com.pdh.payment.model.enums.PaymentGateway;
import com.pdh.payment.model.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Payment Result DTO for Strategy Pattern
 * Contains the result of payment processing from any gateway
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResult {
    
    private boolean success;
    private String message;
    private String errorCode;
    private String errorMessage;
    
    // Payment identifiers
    private UUID paymentId;
    private String paymentReference;
    private String externalPaymentId; // Gateway-specific payment ID
    private String transactionId;
    
    // Payment details
    private UUID bookingId;
    private UUID userId;
    private BigDecimal amount;
    private String currency;
    private PaymentGateway gateway;
    private PaymentStatus status;
    
    // Gateway-specific data
    private String gatewayResponse;
    private String gatewayStatus;
    private BigDecimal gatewayFee;
    private Map<String, Object> gatewayMetadata;
    
    // Timing information
    private LocalDateTime initiatedAt;
    private LocalDateTime processedAt;
    private LocalDateTime completedAt;
    
    // Stripe-specific fields
    private String clientSecret; // For frontend confirmation
    private String paymentIntentId;
    private String paymentMethodId;
    private boolean requiresAction;
    private String nextActionType;
    private String nextActionUrl;
    
    // VietQR-specific fields
    private String qrCodeData;
    private String qrCodeImageUrl;
    private String bankTransferInfo;
    private Integer expirationMinutes;
    
    // Saga support
    private String sagaId;
    
    /**
     * Create successful payment result
     */
    public static PaymentResult success(UUID paymentId, String paymentReference, 
                                      String externalPaymentId, PaymentGateway gateway) {
        return PaymentResult.builder()
                .success(true)
                .message("Payment processed successfully")
                .paymentId(paymentId)
                .paymentReference(paymentReference)
                .externalPaymentId(externalPaymentId)
                .gateway(gateway)
                .status(PaymentStatus.PROCESSING)
                .processedAt(LocalDateTime.now())
                .build();
    }
    
    /**
     * Create failed payment result
     */
    public static PaymentResult failure(String errorCode, String errorMessage, PaymentGateway gateway) {
        return PaymentResult.builder()
                .success(false)
                .message("Payment failed")
                .errorCode(errorCode)
                .errorMessage(errorMessage)
                .gateway(gateway)
                .status(PaymentStatus.FAILED)
                .processedAt(LocalDateTime.now())
                .build();
    }
    
    /**
     * Create pending payment result (for VietQR)
     */
    public static PaymentResult pending(UUID paymentId, String paymentReference, 
                                      String qrCodeData, PaymentGateway gateway) {
        return PaymentResult.builder()
                .success(true)
                .message("Payment initiated, awaiting confirmation")
                .paymentId(paymentId)
                .paymentReference(paymentReference)
                .qrCodeData(qrCodeData)
                .gateway(gateway)
                .status(PaymentStatus.PENDING)
                .initiatedAt(LocalDateTime.now())
                .build();
    }
    
    /**
     * Create result requiring action (for Stripe 3D Secure)
     */
    public static PaymentResult requiresAction(UUID paymentId, String paymentReference, 
                                             String clientSecret, String nextActionUrl, PaymentGateway gateway) {
        return PaymentResult.builder()
                .success(false)
                .message("Payment requires additional authentication")
                .paymentId(paymentId)
                .paymentReference(paymentReference)
                .clientSecret(clientSecret)
                .requiresAction(true)
                .nextActionType("redirect_to_url")
                .nextActionUrl(nextActionUrl)
                .gateway(gateway)
                .status(PaymentStatus.PENDING)
                .processedAt(LocalDateTime.now())
                .build();
    }
    
    /**
     * Check if payment needs frontend action
     */
    public boolean needsFrontendAction() {
        return requiresAction || status == PaymentStatus.PENDING;
    }
    
    /**
     * Check if payment is in final state
     */
    public boolean isFinalState() {
        return status != null && status.isFinalState();
    }
}
