package com.pdh.payment.model;

import com.pdh.common.model.AbstractAuditEntity;
import com.pdh.payment.model.enums.PaymentStatus;
import com.pdh.payment.model.enums.PaymentMethodType;
import com.pdh.payment.model.enums.PaymentProvider;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Payment Entity
 * Core payment information with Saga pattern support
 */
@Entity
@Table(name = "payments")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
public class Payment extends AbstractAuditEntity {
    
    @Id
    @Column(name = "payment_id")
    private UUID paymentId = UUID.randomUUID();
    
    @Column(name = "payment_reference", nullable = false, unique = true, length = 50)
    private String paymentReference;
    
    // Business context
    @Column(name = "booking_id", nullable = false)
    private UUID bookingId;
    
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    
    @Column(name = "customer_id")
    private UUID customerId;
    
    // Saga Pattern fields
    @Column(name = "saga_id", nullable = false)
    private String sagaId;
    
    @Column(name = "saga_step", length = 50)
    private String sagaStep;
    
    // Payment details
    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;
    
    @Column(name = "currency", nullable = false, length = 3)
    private String currency = "VND";
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PaymentStatus status = PaymentStatus.PENDING;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "method_type", nullable = false)
    private PaymentMethodType methodType;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "provider", nullable = false)
    private PaymentProvider provider;
    
    // Payment method reference
    @Column(name = "payment_method_id")
    private UUID paymentMethodId;
    
    // Gateway integration
    @Column(name = "gateway_transaction_id", length = 100)
    private String gatewayTransactionId;
    
    @Column(name = "gateway_response", columnDefinition = "TEXT")
    private String gatewayResponse;
    
    @Column(name = "gateway_status", length = 50)
    private String gatewayStatus;
    
    // Timing
    @Column(name = "initiated_at", nullable = false)
    private ZonedDateTime initiatedAt = ZonedDateTime.now();
    
    @Column(name = "processed_at")
    private ZonedDateTime processedAt;
    
    @Column(name = "confirmed_at")
    private ZonedDateTime confirmedAt;
    
    @Column(name = "expired_at")
    private ZonedDateTime expiredAt;
    
    // Failure handling
    @Column(name = "failure_reason", columnDefinition = "TEXT")
    private String failureReason;
    
    @Column(name = "retry_count", nullable = false)
    private Integer retryCount = 0;
    
    @Column(name = "max_retries", nullable = false)
    private Integer maxRetries = 3;
    
    // Refund information
    @Column(name = "refunded_amount", precision = 12, scale = 2)
    private BigDecimal refundedAmount = BigDecimal.ZERO;
    
    @Column(name = "is_refundable", nullable = false)
    private Boolean isRefundable = true;
    
    @Column(name = "refund_deadline")
    private ZonedDateTime refundDeadline;
    
    // Security and fraud detection
    @Column(name = "ip_address", length = 45)
    private String ipAddress;
    
    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;
    
    @Column(name = "risk_score")
    private Integer riskScore;
    
    @Column(name = "is_flagged", nullable = false)
    private Boolean isFlagged = false;
    
    // Metadata
    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata; // JSON format
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    // Relationships
    @OneToMany(mappedBy = "payment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PaymentTransaction> transactions = new ArrayList<>();
    
    /**
     * Check if payment can be refunded
     */
    public boolean canBeRefunded() {
        return isRefundable && 
               status.isSuccessful() && 
               (refundDeadline == null || ZonedDateTime.now().isBefore(refundDeadline)) &&
               getRemainingRefundableAmount().compareTo(BigDecimal.ZERO) > 0;
    }
    
    /**
     * Get remaining refundable amount
     */
    public BigDecimal getRemainingRefundableAmount() {
        return amount.subtract(refundedAmount != null ? refundedAmount : BigDecimal.ZERO);
    }
    
    /**
     * Check if payment is fully refunded
     */
    public boolean isFullyRefunded() {
        return refundedAmount != null && refundedAmount.compareTo(amount) >= 0;
    }
    
    /**
     * Check if payment is partially refunded
     */
    public boolean isPartiallyRefunded() {
        return refundedAmount != null && 
               refundedAmount.compareTo(BigDecimal.ZERO) > 0 && 
               refundedAmount.compareTo(amount) < 0;
    }
    
    /**
     * Generate unique payment reference
     */
    public static String generatePaymentReference() {
        return "PAY-" + System.currentTimeMillis() + "-" + 
               UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
    
    /**
     * Check if payment needs retry
     */
    public boolean needsRetry() {
        return status == PaymentStatus.FAILED && retryCount < maxRetries;
    }
    
    /**
     * Increment retry count
     */
    public void incrementRetryCount() {
        this.retryCount++;
    }
    
    /**
     * Mark as processed
     */
    public void markAsProcessed() {
        this.processedAt = ZonedDateTime.now();
        this.status = PaymentStatus.PROCESSING;
    }
    
    /**
     * Mark as confirmed
     */
    public void markAsConfirmed() {
        this.confirmedAt = ZonedDateTime.now();
        this.status = PaymentStatus.CONFIRMED;
    }
    
    /**
     * Mark as failed with reason
     */
    public void markAsFailed(String reason) {
        this.status = PaymentStatus.FAILED;
        this.failureReason = reason;
        this.processedAt = ZonedDateTime.now();
    }
}
