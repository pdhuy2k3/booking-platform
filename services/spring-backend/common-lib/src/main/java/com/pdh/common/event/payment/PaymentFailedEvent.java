package com.pdh.common.event.payment;

import com.pdh.common.event.DomainEvent;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class PaymentFailedEvent extends DomainEvent {
    
    private String paymentId;
    private String bookingId;
    private String transactionId;
    private BigDecimal amount;
    private String currency;
    private String paymentMethod;
    private String paymentGateway;
    private String errorCode;
    private String errorMessage;
    private String gatewayResponse;
    
    @Override
    public String getAggregateId() {
        return paymentId;
    }
    
    @Override
    public String getAggregateType() {
        return "Payment";
    }
}
