package com.pdh.payment.model;

import com.pdh.common.model.AbstractAuditEntity;
import com.pdh.payment.model.enums.PaymentTransactionType;
import com.pdh.payment.model.enums.PaymentStatus;
import com.pdh.payment.model.enums.PaymentProvider;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

/**
 * Payment Transaction Entity
 * Represents individual transactions within a payment
 */
@Entity
@Table(name = "payment_transactions")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
public class PaymentTransaction extends AbstractAuditEntity {
    
    @Id
    @Column(name = "transaction_id")
    private UUID transactionId = UUID.randomUUID();
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id", nullable = false)
    private Payment payment;
    
    @Column(name = "transaction_reference", nullable = false, length = 50)
    private String transactionReference;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false)
    private PaymentTransactionType transactionType;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private PaymentStatus status = PaymentStatus.PENDING;
    
    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;
    
    @Column(name = "currency", nullable = false, length = 3)
    private String currency = "VND";
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    // Gateway integration
    @Enumerated(EnumType.STRING)
    @Column(name = "provider", nullable = false)
    private PaymentProvider provider;
    
    @Column(name = "gateway_transaction_id", length = 100)
    private String gatewayTransactionId;
    
    @Column(name = "gateway_reference", length = 100)
    private String gatewayReference;
    
    @Column(name = "gateway_response", columnDefinition = "TEXT")
    private String gatewayResponse;
    
    @Column(name = "gateway_status", length = 50)
    private String gatewayStatus;
    
    @Column(name = "gateway_fee", precision = 12, scale = 2)
    private BigDecimal gatewayFee;
    
    // Timing
    @Column(name = "initiated_at", nullable = false)
    private ZonedDateTime initiatedAt = ZonedDateTime.now();
    
    @Column(name = "processed_at")
    private ZonedDateTime processedAt;
    
    @Column(name = "completed_at")
    private ZonedDateTime completedAt;
    
    @Column(name = "expired_at")
    private ZonedDateTime expiredAt;
    
    // Parent transaction for refunds/compensations
    @Column(name = "parent_transaction_id")
    private UUID parentTransactionId;
    
    @Column(name = "original_transaction_id")
    private UUID originalTransactionId;
    
    // Failure handling
    @Column(name = "failure_reason", columnDefinition = "TEXT")
    private String failureReason;
    
    @Column(name = "failure_code", length = 50)
    private String failureCode;
    
    @Column(name = "retry_count", nullable = false)
    private Integer retryCount = 0;
    
    @Column(name = "max_retries", nullable = false)
    private Integer maxRetries = 3;
    
    // Saga context
    @Column(name = "saga_id")
    private String sagaId;
    
    @Column(name = "saga_step", length = 50)
    private String sagaStep;
    
    @Column(name = "is_compensation", nullable = false)
    private Boolean isCompensation = false;
    
    // Security and audit
    @Column(name = "ip_address", length = 45)
    private String ipAddress;
    
    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;
    
    // Metadata
    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata; // JSON format
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    /**
     * Generate unique transaction reference
     */
    public static String generateTransactionReference(PaymentTransactionType type) {
        String prefix = switch (type) {
            case PAYMENT -> "TXN";
            case REFUND -> "REF";
            case PARTIAL_REFUND -> "PREF";
            case COMPENSATION -> "COMP";
            case CHARGEBACK -> "CHB";
            case ADJUSTMENT -> "ADJ";
            case AUTHORIZATION -> "AUTH";
            case CAPTURE -> "CAP";
            case VOID -> "VOID";
            case PROCESSING_FEE -> "FEE";
            case SERVICE_FEE -> "SFEE";
        };
        
        return prefix + "-" + System.currentTimeMillis() + "-" + 
               UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
    
    /**
     * Check if transaction is successful
     */
    public boolean isSuccessful() {
        return status.isSuccessful();
    }
    
    /**
     * Check if transaction is failed
     */
    public boolean isFailed() {
        return status == PaymentStatus.FAILED || 
               status == PaymentStatus.DECLINED || 
               status == PaymentStatus.CANCELLED;
    }
    
    /**
     * Check if transaction is in progress
     */
    public boolean isInProgress() {
        return status.isInProgress();
    }
    
    /**
     * Check if transaction needs retry
     */
    public boolean needsRetry() {
        return isFailed() && retryCount < maxRetries;
    }
    
    /**
     * Mark as processed
     */
    public void markAsProcessed() {
        this.processedAt = ZonedDateTime.now();
        this.status = PaymentStatus.PROCESSING;
    }
    
    /**
     * Mark as completed
     */
    public void markAsCompleted() {
        this.completedAt = ZonedDateTime.now();
        this.status = PaymentStatus.COMPLETED;
    }
    
    /**
     * Mark as failed with reason
     */
    public void markAsFailed(String reason, String code) {
        this.status = PaymentStatus.FAILED;
        this.failureReason = reason;
        this.failureCode = code;
        this.processedAt = ZonedDateTime.now();
    }
    
    /**
     * Increment retry count
     */
    public void incrementRetryCount() {
        this.retryCount++;
    }
    
    /**
     * Check if transaction is a debit (money going out)
     */
    public boolean isDebit() {
        return transactionType.isDebit();
    }
    
    /**
     * Check if transaction is a credit (money coming in)
     */
    public boolean isCredit() {
        return transactionType.isCredit();
    }
    
    /**
     * Get net amount considering transaction type
     */
    public BigDecimal getNetAmount() {
        return isDebit() ? amount.negate() : amount;
    }
}
