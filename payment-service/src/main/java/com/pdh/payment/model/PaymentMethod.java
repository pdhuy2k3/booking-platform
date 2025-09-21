package com.pdh.payment.model;

import com.pdh.common.model.AbstractAuditEntity;
import com.pdh.payment.model.enums.PaymentMethodType;
import com.pdh.payment.model.enums.PaymentProvider;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Payment Method Entity
 * Supports Strategy Pattern for different payment methods
 */
@Entity
@Table(name = "payment_methods", indexes = {
    @Index(name = "idx_pm_user_id", columnList = "user_id"),
    @Index(name = "idx_pm_provider", columnList = "provider"),
    @Index(name = "idx_pm_method_type", columnList = "method_type"),
    @Index(name = "idx_pm_is_active", columnList = "is_active"),
    @Index(name = "idx_pm_is_default", columnList = "is_default"),
    @Index(name = "idx_pm_fingerprint", columnList = "fingerprint"),
    @Index(name = "idx_pm_created_at", columnList = "created_at")
})
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
public class PaymentMethod extends AbstractAuditEntity {
    
    @Id
    @Column(name = "method_id")
    private UUID methodId = UUID.randomUUID();
    
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "method_type", nullable = false)
    private PaymentMethodType methodType;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "provider", nullable = false)
    private PaymentProvider provider;
    
    @Column(name = "display_name", nullable = false, length = 100)
    private String displayName;
    
    // Card details (encrypted)
    @Column(name = "card_last_four", length = 4)
    private String cardLastFour;
    
    @Column(name = "card_brand", length = 20)
    private String cardBrand; // Visa, Mastercard, etc.
    
    @Column(name = "card_expiry_month")
    private Integer cardExpiryMonth;
    
    @Column(name = "card_expiry_year")
    private Integer cardExpiryYear;
    
    @Column(name = "card_holder_name", length = 100)
    private String cardHolderName;
    
    // Digital wallet details
    @Column(name = "wallet_id", length = 100)
    private String walletId;
    
    @Column(name = "wallet_email", length = 100)
    private String walletEmail;
    
    // Bank details
    @Column(name = "bank_name", length = 100)
    private String bankName;
    
    @Column(name = "bank_account_last_four", length = 4)
    private String bankAccountLastFour;
    
    // Provider specific data (encrypted JSON)
    @Convert(converter = com.pdh.payment.config.EncryptedStringConverter.class)
    @Column(name = "provider_data", columnDefinition = "TEXT")
    private String providerData;
    
    // Security and validation
    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified = false;
    
    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Convert(converter = com.pdh.payment.config.EncryptedStringConverter.class)
    @Column(name = "token", length = 500)
    private String token; // Encrypted payment gateway token
    
    @Column(name = "fingerprint", length = 100)
    private String fingerprint; // Unique identifier for duplicate detection
    
    // Metadata
    @Column(name = "country_code", length = 2)
    private String countryCode;
    
    @Column(name = "currency", length = 3)
    private String currency = "VND";
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    /**
     * Check if payment method supports refunds
     */
    public boolean supportsRefunds() {
        return methodType.supportsRefunds();
    }
    
    /**
     * Check if payment method requires external gateway
     */
    public boolean requiresExternalGateway() {
        return methodType.requiresExternalGateway();
    }
    
    /**
     * Get masked display for security
     */
    public String getMaskedDisplay() {
        if (cardLastFour != null) {
            return cardBrand + " •••• " + cardLastFour;
        } else if (walletEmail != null) {
            return methodType.getDisplayName() + " (" + maskEmail(walletEmail) + ")";
        } else if (bankAccountLastFour != null) {
            return bankName + " •••• " + bankAccountLastFour;
        }
        return displayName;
    }
    
    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return email;
        String[] parts = email.split("@");
        String username = parts[0];
        if (username.length() <= 2) return email;
        return username.charAt(0) + "***" + username.charAt(username.length() - 1) + "@" + parts[1];
    }
}
