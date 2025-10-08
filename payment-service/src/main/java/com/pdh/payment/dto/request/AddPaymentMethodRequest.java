package com.pdh.payment.dto.request;

import com.pdh.payment.model.enums.PaymentMethodType;
import com.pdh.payment.model.enums.PaymentProvider;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Request DTO for adding a new payment method
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddPaymentMethodRequest {

    @NotNull(message = "Method type is required")
    private PaymentMethodType methodType;

    @NotNull(message = "Provider is required")
    private PaymentProvider provider;

    @NotBlank(message = "Display name is required")
    @Size(max = 100, message = "Display name must not exceed 100 characters")
    private String displayName;

    // Card-specific fields
    @Size(min = 4, max = 4, message = "Card last four must be exactly 4 digits")
    private String cardLastFour;

    @Size(max = 20, message = "Card brand must not exceed 20 characters")
    private String cardBrand; // Visa, Mastercard, Amex, etc.

    @Min(value = 1, message = "Expiry month must be between 1 and 12")
    @Max(value = 12, message = "Expiry month must be between 1 and 12")
    private Integer cardExpiryMonth;

    @Min(value = 2024, message = "Expiry year must be valid")
    private Integer cardExpiryYear;

    @Size(max = 100, message = "Cardholder name must not exceed 100 characters")
    private String cardHolderName;

    @Email(message = "Invalid email format")
    private String cardHolderEmail;

    // Bank account fields
    @Size(max = 100, message = "Bank name must not exceed 100 characters")
    private String bankName;

    @Size(min = 4, max = 4, message = "Account last four must be exactly 4 digits")
    private String bankAccountLastFour;

    // Digital wallet fields
    @Email(message = "Invalid wallet email format")
    private String walletEmail;

    // Stripe-specific fields
    private String stripePaymentMethodId; // Stripe PaymentMethod ID from frontend
    private String stripeCustomerId; // Optional: existing Stripe customer ID

    // Settings
    private Boolean setAsDefault = false;

    // Metadata
    private String billingAddress;
    private String postalCode;
    private String country;
}
