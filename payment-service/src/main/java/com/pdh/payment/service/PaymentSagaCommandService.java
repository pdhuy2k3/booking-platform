package com.pdh.payment.service;

import com.pdh.common.outbox.service.OutboxEventService;
import com.pdh.common.saga.SagaCommand;
import com.pdh.payment.model.Payment;
import com.pdh.payment.model.PaymentTransaction;
import com.pdh.payment.model.enums.PaymentMethodType;
import com.pdh.payment.model.enums.PaymentProvider;
import com.pdh.payment.model.enums.PaymentStatus;
import com.pdh.payment.model.enums.PaymentTransactionType;
import com.pdh.payment.repository.PaymentRepository;
import com.pdh.payment.repository.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentSagaCommandService {

    private final PaymentRepository paymentRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final OutboxEventService outboxEventService;

    @Transactional
    public void handleProcessPayment(SagaCommand command) {
        Payment payment = paymentRepository.findByBookingId(command.getBookingId())
            .orElseGet(() -> createNewPayment(command));

        payment.setSagaId(command.getSagaId());
        payment.setAmount(resolveAmount(command.getTotalAmount(), payment.getAmount()));
        payment.setCurrency(resolveCurrency(command, payment.getCurrency()));
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setConfirmedAt(ZonedDateTime.now());
        payment.setProcessedAt(ZonedDateTime.now());
        ensurePaymentReference(payment);
        ensureMethodAndProvider(payment);

        Payment savedPayment = paymentRepository.save(payment);

        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setPayment(savedPayment);
        transaction.setTransactionReference(PaymentTransaction.generateTransactionReference(PaymentTransactionType.PAYMENT));
        transaction.setTransactionType(PaymentTransactionType.PAYMENT);
        transaction.setStatus(PaymentStatus.COMPLETED);
        transaction.setAmount(savedPayment.getAmount());
        transaction.setCurrency(savedPayment.getCurrency());
        transaction.setProvider(savedPayment.getProvider());
        transaction.setSagaId(command.getSagaId());
        transaction.setSagaStep("PAYMENT_COMPLETED");
        PaymentTransaction savedTransaction = paymentTransactionRepository.save(transaction);

        publishPaymentEvent("PaymentProcessed", savedPayment, savedTransaction);
    }

    @Transactional
    public void handleRefundPayment(SagaCommand command) {
        Optional<Payment> paymentOpt = paymentRepository.findByBookingId(command.getBookingId());
        if (paymentOpt.isEmpty()) {
            log.warn("Refund command received for unknown booking {}", command.getBookingId());
            return;
        }

        Payment payment = paymentOpt.get();
        payment.setStatus(PaymentStatus.REFUND_COMPLETED);
        paymentRepository.save(payment);

        PaymentTransaction refundTransaction = new PaymentTransaction();
        refundTransaction.setPayment(payment);
        refundTransaction.setTransactionReference(PaymentTransaction.generateTransactionReference(PaymentTransactionType.REFUND));
        refundTransaction.setTransactionType(PaymentTransactionType.REFUND);
        refundTransaction.setStatus(PaymentStatus.REFUND_COMPLETED);
        refundTransaction.setAmount(resolveAmount(command.getTotalAmount(), payment.getAmount()));
        refundTransaction.setCurrency(resolveCurrency(command, payment.getCurrency()));
        refundTransaction.setProvider(payment.getProvider());
        refundTransaction.setSagaId(command.getSagaId());
        refundTransaction.setSagaStep("PAYMENT_REFUNDED");
        PaymentTransaction savedRefund = paymentTransactionRepository.save(refundTransaction);

        publishPaymentEvent("PaymentRefunded", payment, savedRefund);
    }

    @Transactional
    public void handleCancelPayment(SagaCommand command) {
        Optional<Payment> paymentOpt = paymentRepository.findByBookingId(command.getBookingId());
        if (paymentOpt.isEmpty()) {
            log.warn("Cancel payment command received for unknown booking {}", command.getBookingId());
            return;
        }

        Payment payment = paymentOpt.get();
        payment.setStatus(PaymentStatus.CANCELLED);
        paymentRepository.save(payment);

        PaymentTransaction cancellationTransaction = new PaymentTransaction();
        cancellationTransaction.setPayment(payment);
        cancellationTransaction.setTransactionReference(PaymentTransaction.generateTransactionReference(PaymentTransactionType.PAYMENT));
        cancellationTransaction.setTransactionType(PaymentTransactionType.PAYMENT);
        cancellationTransaction.setStatus(PaymentStatus.CANCELLED);
        cancellationTransaction.setAmount(payment.getAmount());
        cancellationTransaction.setCurrency(payment.getCurrency());
        cancellationTransaction.setProvider(payment.getProvider());
        cancellationTransaction.setSagaId(command.getSagaId());
        cancellationTransaction.setSagaStep("PAYMENT_CANCELLED");
        PaymentTransaction savedCancellation = paymentTransactionRepository.save(cancellationTransaction);

        publishPaymentEvent("PaymentCancelled", payment, savedCancellation);
    }

    private Payment createNewPayment(SagaCommand command) {
        Payment payment = new Payment();
        payment.setPaymentId(UUID.randomUUID());
        payment.setBookingId(command.getBookingId());
        payment.setUserId(resolveCustomerId(command));
        payment.setSagaId(command.getSagaId());
        payment.setAmount(resolveAmount(command.getTotalAmount(), BigDecimal.ZERO));
        payment.setCurrency(resolveCurrency(command, "VND"));
        payment.setDescription("Payment for booking " + command.getBookingId());
        payment.setMethodType(PaymentMethodType.CREDIT_CARD);
        payment.setProvider(PaymentProvider.MOCK_PROVIDER);
        payment.setStatus(PaymentStatus.PENDING);
        ensurePaymentReference(payment);
        return payment;
    }

    private void publishPaymentEvent(String eventType, Payment payment, PaymentTransaction transaction) {
        Map<String, Object> payload = Map.of(
            "paymentId", payment.getPaymentId(),
            "bookingId", payment.getBookingId(),
            "userId", payment.getUserId(),
            "transactionId", transaction.getTransactionId(),
            "amount", transaction.getAmount(),
            "currency", transaction.getCurrency(),
            "status", transaction.getStatus(),
            "provider", transaction.getProvider(),
            "sagaId", payment.getSagaId()
        );

        outboxEventService.publishEvent(eventType, "Payment", payment.getPaymentId().toString(), payload);
    }

    private void ensurePaymentReference(Payment payment) {
        if (payment.getPaymentReference() == null || payment.getPaymentReference().isBlank()) {
            payment.setPaymentReference(Payment.generatePaymentReference());
        }
    }

    private void ensureMethodAndProvider(Payment payment) {
        if (payment.getMethodType() == null) {
            payment.setMethodType(PaymentMethodType.CREDIT_CARD);
        }
        if (payment.getProvider() == null) {
            payment.setProvider(PaymentProvider.MOCK_PROVIDER);
        }
    }

    private BigDecimal resolveAmount(Object candidate, BigDecimal fallback) {
        if (candidate instanceof BigDecimal bigDecimal) {
            return bigDecimal;
        }
        if (candidate instanceof Number number) {
            return BigDecimal.valueOf(number.doubleValue());
        }
        return fallback != null ? fallback : BigDecimal.ZERO;
    }

    private String resolveCurrency(SagaCommand command, String fallback) {
        if (command.getMetadata() != null && command.getMetadata().containsKey("currency")) {
            return command.getMetadata().get("currency");
        }
        return fallback != null ? fallback : "VND";
    }

    private UUID resolveCustomerId(SagaCommand command) {
        if (command.getCustomerId() != null) {
            return command.getCustomerId();
        }
        return UUID.randomUUID();
    }
}
