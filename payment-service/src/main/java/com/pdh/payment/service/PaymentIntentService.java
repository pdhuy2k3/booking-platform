package com.pdh.payment.service;

import com.pdh.payment.dto.CreatePaymentIntentRequest;
import com.pdh.payment.dto.ConfirmPaymentIntentRequest;
import com.pdh.payment.dto.PaymentIntentResponse;
import com.pdh.payment.model.PaymentMethod;
import com.pdh.payment.model.enums.PaymentGateway;
import com.pdh.payment.model.enums.PaymentMethodType;
import com.pdh.payment.model.enums.PaymentProvider;
import com.pdh.payment.service.strategy.PaymentStrategyFactory;
import com.pdh.payment.service.strategy.impl.StripePaymentStrategy;
import com.pdh.payment.service.strategy.impl.VietQRPaymentStrategy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.UUID;

/**
 * Service for handling payment intents across different gateways
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class PaymentIntentService {
    
    private final PaymentStrategyFactory strategyFactory;
    
    /**
     * Create payment intent based on gateway
     */
    public PaymentIntentResponse createPaymentIntent(CreatePaymentIntentRequest request) {
        log.info("Creating payment intent for booking: {} with gateway: {}", 
                request.getBookingId(), request.getGateway());
        
        if (request.getGateway() == PaymentGateway.STRIPE) {
            return createStripePaymentIntent(request);
        } else if (request.getGateway() == PaymentGateway.VIETQR) {
            return createVietQRPaymentIntent(request);
        } else {
            throw new IllegalArgumentException("Unsupported gateway: " + request.getGateway());
        }
    }
    
    /**
     * Confirm payment intent (primarily for Stripe)
     */
    public PaymentIntentResponse confirmPaymentIntent(ConfirmPaymentIntentRequest request) {
        log.info("Confirming payment intent: {}", request.getPaymentIntentId());
        
        try {
            PaymentMethod paymentMethod = createPaymentMethodForGateway(PaymentGateway.STRIPE);
            StripePaymentStrategy stripeStrategy = (StripePaymentStrategy) strategyFactory.getStrategy(paymentMethod);
            return stripeStrategy.confirmPaymentIntent(request);
        } catch (Exception e) {
            log.error("Error confirming payment intent: {}", request.getPaymentIntentId(), e);
            throw new RuntimeException("Failed to confirm payment intent", e);
        }
    }
    
    private PaymentIntentResponse createStripePaymentIntent(CreatePaymentIntentRequest request) {
        try {
            PaymentMethod paymentMethod = createPaymentMethodForGateway(PaymentGateway.STRIPE);
            StripePaymentStrategy stripeStrategy = (StripePaymentStrategy) strategyFactory.getStrategy(paymentMethod);
            return stripeStrategy.createPaymentIntent(request);
        } catch (Exception e) {
            log.error("Error creating Stripe payment intent", e);
            throw new RuntimeException("Failed to create Stripe payment intent", e);
        }
    }
    
    private PaymentIntentResponse createVietQRPaymentIntent(CreatePaymentIntentRequest request) {
        try {
            PaymentMethod paymentMethod = createPaymentMethodForGateway(PaymentGateway.VIETQR);
            VietQRPaymentStrategy vietQRStrategy = (VietQRPaymentStrategy) strategyFactory.getStrategy(paymentMethod);
            
            // Generate QR code and payment info
            Map<String, Object> qrData = vietQRStrategy.generateQRCode(
                request.getAmount(),
                request.getDescription(),
                request.getBookingId().toString()
            );
            
            return PaymentIntentResponse.builder()
                    .paymentIntentId("vietqr_" + request.getBookingId().toString().replace("-", "").substring(0, 16))
                    .amount(request.getAmount())
                    .currency(request.getCurrency())
                    .status("requires_payment_method")
                    .gateway(PaymentGateway.VIETQR.getCode())
                    .qrCodeUrl((String) qrData.get("qrCodeUrl"))
                    .qrCodeData((String) qrData.get("qrCodeData"))
                    .transferInfo(buildVietQRTransferInfo(request))
                    .description(request.getDescription())
                    .metadata(request.getMetadata())
                    .createdAt(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                    .build();
        } catch (Exception e) {
            log.error("Error creating VietQR payment intent", e);
            throw new RuntimeException("Failed to create VietQR payment intent", e);
        }
    }
    
    private String buildVietQRTransferInfo(CreatePaymentIntentRequest request) {
        return String.format(
            "Chuyển khoản đến: %s\nSố tài khoản: %s\nSố tiền: %,.0f %s\nNội dung: %s",
            request.getAccountName() != null ? request.getAccountName() : "BookingSmart",
            request.getAccountNumber() != null ? request.getAccountNumber() : "1234567890",
            request.getAmount().doubleValue(),
            request.getCurrency(),
            request.getDescription()
        );
    }
    
    /**
     * Create PaymentMethod object for the given gateway
     */
    private PaymentMethod createPaymentMethodForGateway(PaymentGateway gateway) {
        PaymentMethod paymentMethod = new PaymentMethod();
        paymentMethod.setMethodId(UUID.randomUUID());
        
        switch (gateway) {
            case STRIPE -> {
                paymentMethod.setMethodType(PaymentMethodType.CREDIT_CARD);
                paymentMethod.setProvider(PaymentProvider.STRIPE);
                paymentMethod.setDisplayName("Stripe Credit Card");
            }
            case VIETQR -> {
                paymentMethod.setMethodType(PaymentMethodType.VIETQR);
                paymentMethod.setProvider(PaymentProvider.VIETQR);
                paymentMethod.setDisplayName("VietQR Bank Transfer");
            }
            default -> throw new UnsupportedOperationException(
                    "Unsupported payment gateway: " + gateway);
        }
        
        return paymentMethod;
    }
}
