package com.pdh.payment.dto;

import com.pdh.payment.model.enums.PaymentMethodType;
import com.pdh.payment.model.enums.PaymentProvider;
import com.pdh.payment.model.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BackofficePaymentDto {
    private UUID paymentId;
    private String paymentReference;
    private UUID bookingId;
    private BigDecimal amount;
    private PaymentProvider provider;
    private PaymentMethodType methodType;
    private PaymentStatus status;
    private long createdAt;

    public BackofficePaymentDto(UUID paymentId, String paymentReference, UUID bookingId, BigDecimal amount, PaymentProvider provider, PaymentMethodType methodType, PaymentStatus status, ZonedDateTime createdAt) {
        this.paymentId = paymentId;
        this.paymentReference = paymentReference;
        this.bookingId = bookingId;
        this.amount = amount;
        this.provider = provider;
        this.methodType = methodType;
        this.status = status;
        this.createdAt = createdAt.toEpochSecond();
    }
}
