package com.pdh.customer.model;


import com.pdh.common.model.AbstractAuditEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "loyalty_transactions")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyTransaction extends AbstractAuditEntity {
    
    @Id
    @Column(name = "transaction_id")
    private UUID transactionId = UUID.randomUUID();
    
    @Column(name = "user_id", nullable = false)
    private UUID userId; // From Keycloak JWT token
    
    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false, length = 50)
    private TransactionType transactionType;
    
    @Column(name = "points_amount", nullable = false)
    private Integer pointsAmount;
    
    @Column(name = "description", nullable = false, length = 500)
    private String description;
    
    @Column(name = "reference_id")
    private UUID referenceId; // Booking ID, Order ID, etc.
    
    @Enumerated(EnumType.STRING)
    @Column(name = "reference_type", length = 50)
    private ReferenceType referenceType;
    
    // For redemptions
    @Column(name = "redemption_value", precision = 12, scale = 2)
    private BigDecimal redemptionValue;
    
    @Column(name = "redemption_currency", length = 3)
    private String redemptionCurrency;
    
    @Column(name = "expiry_date")
    private LocalDate expiryDate;
    
    public enum TransactionType {
        EARNED,     // Points earned from bookings, purchases, etc.
        REDEEMED,   // Points redeemed for discounts, upgrades, etc.
        EXPIRED,    // Points expired due to inactivity
        ADJUSTED,   // Manual adjustment by admin
        BONUS,      // Bonus points from promotions
        REFUNDED    // Points refunded due to cancellation
    }
    
    public enum ReferenceType {
        BOOKING,    // From booking transactions
        PURCHASE,   // From direct purchases
        PROMOTION,  // From promotional campaigns
        MANUAL,     // Manual adjustment
        REDEMPTION, // Point redemption
        REFUND,     // Refund transaction
        SIGNUP,     // Welcome bonus
        REFERRAL    // Referral bonus
    }
}
