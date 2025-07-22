package com.pdh.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for confirming Stripe payment intents
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConfirmPaymentIntentRequest {
    
    @NotBlank(message = "Payment intent ID is required")
    private String paymentIntentId;
    
    private String paymentMethodId;
    private String returnUrl;
    
    // For manual confirmation if needed
    private boolean useStripeSdk;
}
