package com.pdh.payment.model.enums;

/**
 * Payment Provider Enum
 * Used for Strategy Pattern implementation
 */
public enum PaymentProvider {
    // International Providers
    STRIPE("Stripe", "stripe"),
    PAYPAL("PayPal", "paypal"),
    SQUARE("Square", "square"),
    ADYEN("Adyen", "adyen"),
    
    // Vietnamese Providers
    VNPAY("VNPay", "vnpay"),
    MOMO("MoMo", "momo"),
    ZALOPAY("ZaloPay", "zalopay"),
    VIETQR("VietQR", "vietqr"),
    
    // Bank Providers
    VIETCOMBANK("Vietcombank", "vcb"),
    TECHCOMBANK("Techcombank", "tcb"),
    BIDV("BIDV", "bidv"),
    VIETINBANK("VietinBank", "vib"),
    
    // Mock/Test Providers
    MOCK_PROVIDER("Mock Provider", "mock"),
    TEST_PROVIDER("Test Provider", "test"),
    
    // Internal
    INTERNAL("Internal Payment System", "internal");
    
    private final String displayName;
    private final String code;
    
    PaymentProvider(String displayName, String code) {
        this.displayName = displayName;
        this.code = code;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getCode() {
        return code;
    }
    
    /**
     * Get PaymentProvider by code
     */
    public static PaymentProvider fromCode(String code) {
        for (PaymentProvider provider : values()) {
            if (provider.code.equals(code)) {
                return provider;
            }
        }
        throw new IllegalArgumentException("Unknown payment provider code: " + code);
    }
    
    /**
     * Check if provider is Vietnamese local provider
     */
    public boolean isVietnameseProvider() {
        return this == VNPAY || this == MOMO || this == ZALOPAY || this == VIETQR ||
               this == VIETCOMBANK || this == TECHCOMBANK || this == BIDV || this == VIETINBANK;
    }
    
    /**
     * Check if provider is international
     */
    public boolean isInternationalProvider() {
        return this == STRIPE || this == PAYPAL || this == SQUARE || this == ADYEN;
    }
    
    /**
     * Check if provider is for testing
     */
    public boolean isTestProvider() {
        return this == MOCK_PROVIDER || this == TEST_PROVIDER;
    }
}
