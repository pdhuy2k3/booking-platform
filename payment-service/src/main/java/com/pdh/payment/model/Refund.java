package com.pdh.payment.model;

import com.pdh.common.model.AbstractAuditEntity;
import com.pdh.payment.model.enums.RefundStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "refunds")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Refund extends AbstractAuditEntity {
    
    @Id
    @Column(name = "refund_id")
    private UUID refundId = UUID.randomUUID();
    
    @Column(name = "original_transaction_id", nullable = false)
    private UUID originalTransactionId;
    
    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;
    
    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private RefundStatus status;
    
    @Column(name = "gateway_refund_id", length = 255)
    private String gatewayRefundId;
    
    @Column(name = "created_at", nullable = false)
    private ZonedDateTime createdAt = ZonedDateTime.now();
    
    @Column(name = "updated_at", nullable = false)
    private ZonedDateTime updatedAt = ZonedDateTime.now();
    
    // Reference entity
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "original_transaction_id", insertable = false, updatable = false)
    private Transaction originalTransaction;
}
