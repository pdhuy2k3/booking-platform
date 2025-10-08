package com.pdh.payment.dto.response;

import com.pdh.payment.model.enums.PaymentMethodType;
import com.pdh.payment.model.enums.PaymentProvider;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Response DTO for payment method information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentMethodResponse {

    private UUID methodId;
    private String displayName;
    private PaymentMethodType methodType;
    private PaymentProvider provider;
    private Boolean isDefault;
    private Boolean isActive;
    private Boolean isVerified;

    // Card details (masked)
    private String cardLastFour;
    private String cardBrand;
    private Integer cardExpiryMonth;
    private Integer cardExpiryYear;

    // Bank details (masked)
    private String bankName;
    private String bankAccountLastFour;

    // Wallet details
    private String walletEmail;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Get a user-friendly description of the payment method
     */
    public String getDescription() {
        if (cardBrand != null && cardLastFour != null) {
            return String.format("%s ending in %s", cardBrand, cardLastFour);
        } else if (bankName != null && bankAccountLastFour != null) {
            return String.format("%s account ending in %s", bankName, bankAccountLastFour);
        } else if (walletEmail != null) {
            return String.format("Wallet: %s", walletEmail);
        } else {
            return displayName;
        }
    }

    /**
     * Check if the payment method is expired (for cards)
     */
    public boolean isExpired() {
        if (cardExpiryMonth == null || cardExpiryYear == null) {
            return false;
        }

        LocalDateTime now = LocalDateTime.now();
        int currentYear = now.getYear();
        int currentMonth = now.getMonthValue();

        return cardExpiryYear < currentYear || 
               (cardExpiryYear == currentYear && cardExpiryMonth < currentMonth);
    }
}
