package com.pdh.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StripePaymentConfirmationRequest {

    @NotNull(message = "Booking ID is required")
    private UUID bookingId;

    private String sagaId;

    @NotBlank(message = "Payment intent ID is required")
    private String paymentIntentId;

    @NotNull(message = "Transaction ID is required")
    private UUID transactionId;
}
