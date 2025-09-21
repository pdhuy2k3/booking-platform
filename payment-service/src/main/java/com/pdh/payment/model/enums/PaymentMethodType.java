package com.pdh.payment.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * Payment Method Type Enum
 * Supports Strategy Pattern for different payment methods
 */
public enum PaymentMethodType {
    // Credit/Debit Cards
    CREDIT_CARD("Credit Card", "credit_card"),
    DEBIT_CARD("Debit Card", "debit_card"),
    
    // Digital Wallets
    PAYPAL("PayPal", "paypal"),
    APPLE_PAY("Apple Pay", "apple_pay"),
    GOOGLE_PAY("Google Pay", "google_pay"),
    SAMSUNG_PAY("Samsung Pay", "samsung_pay"),
    
    // Vietnamese Payment Methods
    MOMO("MoMo E-Wallet", "momo"),
    ZALOPAY("ZaloPay", "zalopay"),
    VNPAY("VNPay", "vnpay"),
    VIETQR("VietQR", "vietqr"),
    
    // Bank Transfer
    BANK_TRANSFER("Bank Transfer", "bank_transfer"),
    INTERNET_BANKING("Internet Banking", "internet_banking"),
    
    // Cryptocurrency
    BITCOIN("Bitcoin", "bitcoin"),
    ETHEREUM("Ethereum", "ethereum"),
    
    // Buy Now Pay Later
    KLARNA("Klarna", "klarna"),
    AFTERPAY("Afterpay", "afterpay"),
    
    // Cash
    CASH_ON_DELIVERY("Cash on Delivery", "cash_on_delivery"),
    
    // Gift Cards
    GIFT_CARD("Gift Card", "gift_card"),
    
    // Other
    OTHER("Other", "other");
    
    private final String displayName;
    private final String code;
    
    PaymentMethodType(String displayName, String code) {
        this.displayName = displayName;
        this.code = code;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getCode() {
        return code;
    }

    @JsonValue
    public String toJson() {
        return this.name();
    }

    @JsonCreator
    public static PaymentMethodType fromJson(String value) {
        if (value == null || value.trim().isEmpty()) {
            throw new IllegalArgumentException("Payment method type is required");
        }

        String normalized = value.trim();

        for (PaymentMethodType type : values()) {
            if (type.name().equalsIgnoreCase(normalized) || type.code.equalsIgnoreCase(normalized)) {
                return type;
            }
        }

        if ("CARD".equalsIgnoreCase(normalized)) {
            return CREDIT_CARD;
        }

        throw new IllegalArgumentException("Unknown payment method type: " + value);
    }

    /**
     * Get PaymentMethodType by code
     */
    public static PaymentMethodType fromCode(String code) {
        for (PaymentMethodType type : values()) {
            if (type.code.equals(code)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown payment method code: " + code);
    }
    
    /**
     * Check if payment method requires external gateway
     */
    public boolean requiresExternalGateway() {
        return this != CASH_ON_DELIVERY && this != GIFT_CARD;
    }
    
    /**
     * Check if payment method supports refunds
     */
    public boolean supportsRefunds() {
        return this != CASH_ON_DELIVERY && this != GIFT_CARD;
    }
}
