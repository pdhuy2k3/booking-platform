package com.pdh.payment.dto;

import com.pdh.payment.model.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * DTO for payment filtering in backoffice
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentFiltersDto {
    
    private Integer page;
    private Integer size;
    private String search;
    private PaymentStatus status;
    private String provider;
    private String methodType;
    private UUID bookingId;
    private UUID userId;
    private LocalDate dateFrom;
    private LocalDate dateTo;
    private BigDecimal amountFrom;
    private BigDecimal amountTo;
    private String sort;
    private String direction;
}