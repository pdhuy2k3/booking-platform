package com.pdh.payment.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.payment.config.StripeConfig;
import com.pdh.payment.config.VietQRConfig;
import com.pdh.payment.dto.PaymentConfirmationData;
import com.pdh.payment.model.PaymentTransaction;
import com.pdh.payment.repository.PaymentTransactionRepository;
import com.pdh.payment.service.PaymentService;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Webhook Controller for Payment Gateway Callbacks
 * Handles webhooks from Stripe, VietQR, and other payment gateways
 */
@RestController
@RequestMapping("")
@RequiredArgsConstructor
@Slf4j
public class WebhookController {

    private final StripeConfig stripeConfig;
    private final PaymentService paymentService;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final ObjectMapper objectMapper;



 
}
