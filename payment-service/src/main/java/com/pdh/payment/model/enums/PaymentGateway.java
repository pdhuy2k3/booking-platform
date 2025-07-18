package com.pdh.payment.model.enums;

/**
 * Payment Gateway Enum for Strategy Pattern
 * Defines supported payment gateways with their configurations
 */
public enum PaymentGateway {
    STRIPE("Stripe", "stripe", PaymentProvider.STRIPE, true, true, true),
    VIETQR("VietQR", "vietqr", PaymentProvider.VIETQR, true, false, true),
    PAYPAL("PayPal", "paypal", PaymentProvider.PAYPAL, true, true, true),
    VNPAY("VNPay", "vnpay", PaymentProvider.VNPAY, true, true, true),
    MOMO("MoMo", "momo", PaymentProvider.MOMO, true, true, true),
    ZALOPAY("ZaloPay", "zalopay", PaymentProvider.ZALOPAY, true, true, true),
    MOCK("Mock Gateway", "mock", PaymentProvider.MOCK_PROVIDER, true, true, true);
    
    private final String displayName;
    private final String code;
    private final PaymentProvider provider;
    private final boolean supportsInstantPayment;
    private final boolean supportsRefunds;
    private final boolean supportsStatusCheck;
    
    PaymentGateway(String displayName, String code, PaymentProvider provider, 
                   boolean supportsInstantPayment, boolean supportsRefunds, boolean supportsStatusCheck) {
        this.displayName = displayName;
        this.code = code;
        this.provider = provider;
        this.supportsInstantPayment = supportsInstantPayment;
        this.supportsRefunds = supportsRefunds;
        this.supportsStatusCheck = supportsStatusCheck;
    }
    
    public String getDisplayName() {
        return displayName;
    }
    
    public String getCode() {
        return code;
    }
    
    public PaymentProvider getProvider() {
        return provider;
    }
    
    public boolean supportsInstantPayment() {
        return supportsInstantPayment;
    }
    
    public boolean supportsRefunds() {
        return supportsRefunds;
    }
    
    public boolean supportsStatusCheck() {
        return supportsStatusCheck;
    }
    
    /**
     * Get PaymentGateway by code
     */
    public static PaymentGateway fromCode(String code) {
        for (PaymentGateway gateway : values()) {
            if (gateway.code.equalsIgnoreCase(code)) {
                return gateway;
            }
        }
        throw new IllegalArgumentException("Unknown payment gateway code: " + code);
    }
    
    /**
     * Get PaymentGateway by provider
     */
    public static PaymentGateway fromProvider(PaymentProvider provider) {
        for (PaymentGateway gateway : values()) {
            if (gateway.provider == provider) {
                return gateway;
            }
        }
        throw new IllegalArgumentException("Unknown payment provider: " + provider);
    }
    
    /**
     * Check if gateway is available for production
     */
    public boolean isProductionReady() {
        return this == STRIPE || this == VIETQR;
    }
    
    /**
     * Check if gateway requires external API calls
     */
    public boolean requiresExternalApi() {
        return this != MOCK;
    }
}
