package com.pdh.payment.model;

import com.pdh.common.model.AbstractAuditEntity;
import com.pdh.payment.model.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

/**
 * Payment Saga Log Entity
 * Tracks saga state transitions for payment processing
 */
@Entity
@Table(name = "payment_saga_logs")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
public class PaymentSagaLog extends AbstractAuditEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_id", nullable = false)
    private Payment payment;
    
    @Column(name = "saga_id", nullable = false)
    private String sagaId;
    
    @Column(name = "transaction_id")
    private UUID transactionId;
    
    @Column(name = "step_name", nullable = false, length = 100)
    private String stepName;
    
    @Column(name = "step_type", nullable = false, length = 50)
    private String stepType; // FORWARD, COMPENSATION
    
    @Enumerated(EnumType.STRING)
    @Column(name = "from_status")
    private PaymentStatus fromStatus;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "to_status", nullable = false)
    private PaymentStatus toStatus;
    
    @Column(name = "event_type", nullable = false, length = 100)
    private String eventType;
    
    @Column(name = "event_payload", columnDefinition = "TEXT")
    private String eventPayload; // JSON format
    
    @Column(name = "compensation_data", columnDefinition = "TEXT")
    private String compensationData; // JSON format
    
    @Column(name = "is_compensation", nullable = false)
    private Boolean isCompensation = false;
    
    @Column(name = "is_successful", nullable = false)
    private Boolean isSuccessful = true;
    
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
    
    @Column(name = "error_code", length = 50)
    private String errorCode;
    
    @Column(name = "retry_count", nullable = false)
    private Integer retryCount = 0;
    
    @Column(name = "execution_time_ms")
    private Long executionTimeMs;
    
    @Column(name = "processed_at", nullable = false)
    private ZonedDateTime processedAt = ZonedDateTime.now();
    
    // Gateway response data
    @Column(name = "gateway_response", columnDefinition = "TEXT")
    private String gatewayResponse;
    
    @Column(name = "gateway_transaction_id", length = 100)
    private String gatewayTransactionId;
    
    // Context data
    @Column(name = "booking_id")
    private UUID bookingId;
    
    @Column(name = "user_id")
    private UUID userId;
    
    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata; // Additional context in JSON format
    
    /**
     * Create a saga log entry for forward step
     */
    public static PaymentSagaLog createForwardStep(
            Payment payment, 
            String stepName, 
            String eventType,
            PaymentStatus fromStatus,
            PaymentStatus toStatus,
            String eventPayload) {
        
        PaymentSagaLog log = new PaymentSagaLog();
        log.setPayment(payment);
        log.setSagaId(payment.getSagaId());
        log.setBookingId(payment.getBookingId());
        log.setUserId(payment.getUserId());
        log.setStepName(stepName);
        log.setStepType("FORWARD");
        log.setEventType(eventType);
        log.setFromStatus(fromStatus);
        log.setToStatus(toStatus);
        log.setEventPayload(eventPayload);
        log.setIsCompensation(false);
        
        return log;
    }
    
    /**
     * Create a saga log entry for compensation step
     */
    public static PaymentSagaLog createCompensationStep(
            Payment payment,
            String stepName,
            String eventType,
            PaymentStatus fromStatus,
            PaymentStatus toStatus,
            String compensationData,
            String errorMessage) {
        
        PaymentSagaLog log = new PaymentSagaLog();
        log.setPayment(payment);
        log.setSagaId(payment.getSagaId());
        log.setBookingId(payment.getBookingId());
        log.setUserId(payment.getUserId());
        log.setStepName(stepName);
        log.setStepType("COMPENSATION");
        log.setEventType(eventType);
        log.setFromStatus(fromStatus);
        log.setToStatus(toStatus);
        log.setCompensationData(compensationData);
        log.setErrorMessage(errorMessage);
        log.setIsCompensation(true);
        log.setIsSuccessful(false);
        
        return log;
    }
    
    /**
     * Mark as successful
     */
    public void markAsSuccessful() {
        this.isSuccessful = true;
        this.processedAt = ZonedDateTime.now();
    }
    
    /**
     * Mark as failed
     */
    public void markAsFailed(String errorMessage, String errorCode) {
        this.isSuccessful = false;
        this.errorMessage = errorMessage;
        this.errorCode = errorCode;
        this.processedAt = ZonedDateTime.now();
    }
    
    /**
     * Set execution time
     */
    public void setExecutionTime(long startTime) {
        this.executionTimeMs = System.currentTimeMillis() - startTime;
    }
    
    /**
     * Increment retry count
     */
    public void incrementRetryCount() {
        this.retryCount++;
    }
    
    /**
     * Check if this is a compensation step
     */
    public boolean isCompensationStep() {
        return Boolean.TRUE.equals(isCompensation);
    }
    
    /**
     * Check if step was successful
     */
    public boolean wasSuccessful() {
        return Boolean.TRUE.equals(isSuccessful);
    }
}
