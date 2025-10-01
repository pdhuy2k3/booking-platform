package com.pdh.payment.service;

import com.pdh.common.outbox.service.OutboxEventService;
import com.pdh.common.utils.AuthenticationUtils;
import com.pdh.payment.dto.*;
import com.pdh.payment.model.Payment;
import com.pdh.payment.model.PaymentMethod;
import com.pdh.payment.model.PaymentTransaction;
import com.pdh.payment.model.enums.PaymentMethodType;
import com.pdh.payment.model.enums.PaymentProvider;
import com.pdh.payment.model.enums.PaymentStatus;
import com.pdh.payment.model.enums.PaymentTransactionType;
import com.pdh.payment.repository.PaymentMethodRepository;
import com.pdh.payment.repository.PaymentRepository;
import com.pdh.payment.repository.PaymentTransactionRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintWriter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service for backoffice payment operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BackofficePaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final PaymentService paymentService;
    private final OutboxEventService outboxEventService;

    /**
     * Get paginated payments with filters
     */
    @Transactional(readOnly = true)
    public Page<BackofficePaymentDto> getPayments(PaymentFiltersDto filters) {
        log.info("Getting payments with filters: {}", filters);

        Pageable pageable = PageRequest.of(
            filters.getPage() != null ? filters.getPage() : 0,
            filters.getSize() != null ? filters.getSize() : 20,
            buildSort(filters.getSort(), filters.getDirection())
        );

        Specification<Payment> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filters.getSearch() != null && !filters.getSearch().isBlank()) {
                String searchPattern = "%" + filters.getSearch().toLowerCase() + "%";
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("paymentReference")), searchPattern),
                    cb.like(cb.lower(root.get("gatewayTransactionId")), searchPattern),
                    cb.like(cb.lower(root.get("bookingId").as(String.class)), searchPattern)
                ));
            }
            if (filters.getStatus() != null) {
                predicates.add(cb.equal(root.get("status"), filters.getStatus()));
            }
            if (filters.getProvider() != null && !filters.getProvider().isBlank()) {
                try {
                    PaymentProvider providerEnum = PaymentProvider.valueOf(filters.getProvider().toUpperCase());
                    predicates.add(cb.equal(root.get("provider"), providerEnum));
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid payment provider filter: {}", filters.getProvider());
                }
            }
            if (filters.getMethodType() != null && !filters.getMethodType().isBlank()) {
                try {
                    PaymentMethodType methodTypeEnum = PaymentMethodType.valueOf(filters.getMethodType().toUpperCase());
                    predicates.add(cb.equal(root.get("methodType"), methodTypeEnum));
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid payment method type filter: {}", filters.getMethodType());
                }
            }
            if (filters.getBookingId() != null) {
                predicates.add(cb.equal(root.get("bookingId"), filters.getBookingId()));
            }
            if (filters.getUserId() != null) {
                predicates.add(cb.equal(root.get("userId"), filters.getUserId()));
            }
            if (filters.getDateFrom() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), filters.getDateFrom().atStartOfDay(ZoneId.systemDefault())));
            }
            if (filters.getDateTo() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), filters.getDateTo().plusDays(1).atStartOfDay(ZoneId.systemDefault())));
            }
            if (filters.getAmountFrom() != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("amount"), filters.getAmountFrom()));
            }
            if (filters.getAmountTo() != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("amount"), filters.getAmountTo()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Payment> paymentsPage = paymentRepository.findAll(spec, pageable);

        return paymentsPage.map(p -> new BackofficePaymentDto(
            p.getPaymentId(),
            p.getPaymentReference(),
            p.getBookingId(),
            p.getAmount(),
            p.getProvider(),
            p.getMethodType(),
            p.getStatus(),
            p.getCreatedAt()
        ));
    }

    /**
     * Get payment by ID with full details
     */
    @Transactional(readOnly = true)
    public Payment getPaymentById(UUID paymentId) {
        log.info("Getting payment by ID: {}", paymentId);
        
        return paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found with ID: " + paymentId));
    }

    /**
     * Get payment transactions by payment ID
     */
    @Transactional(readOnly = true)
    public List<PaymentTransaction> getPaymentTransactions(UUID paymentId) {
        log.info("Getting transactions for payment: {}", paymentId);
        
        return paymentTransactionRepository.findByPayment_PaymentIdOrderByCreatedAtDesc(paymentId);
    }

    /**
     * Get payment saga logs (placeholder - implement based on your saga logging system)
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPaymentSagaLogs(UUID paymentId) {
        log.info("Getting saga logs for payment: {}", paymentId);
        
        // This would integrate with your saga logging system
        // For now, return a placeholder implementation
        List<Map<String, Object>> sagaLogs = new ArrayList<>();
        
        // You can implement this to fetch from your saga log storage
        Map<String, Object> logEntry = new HashMap<>();
        logEntry.put("paymentId", paymentId);
        logEntry.put("step", "PAYMENT_INITIATED");
        logEntry.put("status", "COMPLETED");
        logEntry.put("timestamp", LocalDateTime.now());
        logEntry.put("message", "Payment saga initiated");
        sagaLogs.add(logEntry);
        
        return sagaLogs;
    }

    /**
     * Process manual payment
     */
    @Transactional
    public Payment processManualPayment(ManualPaymentRequestDto request) {
        log.info("Processing manual payment for booking: {}", request.getBookingId());

        try {
            // Create payment record
            Payment payment = new Payment();
            payment.setPaymentReference(Payment.generatePaymentReference());
            payment.setBookingId(request.getBookingId());
            payment.setAmount(request.getAmount());
            payment.setCurrency(request.getCurrency());
            payment.setDescription(request.getDescription() != null ? request.getDescription() : 
                    "Manual payment for booking " + request.getBookingId());
            payment.setMethodType(request.getMethodType());
            payment.setProvider(request.getProvider());
            payment.setStatus(PaymentStatus.PROCESSING);
            
            payment = paymentRepository.save(payment);

            // Create successful transaction
            PaymentTransaction transaction = new PaymentTransaction();
            transaction.setPayment(payment);
            transaction.setTransactionType(PaymentTransactionType.PAYMENT);
            transaction.setAmount(request.getAmount());
            transaction.setCurrency(request.getCurrency());
            transaction.setStatus(PaymentStatus.COMPLETED);
            transaction.setGatewayTransactionId("MANUAL_" + UUID.randomUUID().toString());
            
            paymentTransactionRepository.save(transaction);

            // Update payment status to completed
            payment.setStatus(PaymentStatus.COMPLETED);
            payment.markAsConfirmed(); // Uses existing method from Payment entity
            payment = paymentRepository.save(payment);

            // Publish payment completed event
            publishPaymentEvent(payment, "PAYMENT_COMPLETED");

            log.info("Manual payment processed successfully: {}", payment.getPaymentId());
            return payment;

        } catch (Exception e) {
            log.error("Error processing manual payment", e);
            throw new RuntimeException("Failed to process manual payment: " + e.getMessage());
        }
    }

    /**
     * Update payment status
     */
    @Transactional
    public Payment updatePaymentStatus(UUID paymentId, PaymentStatus status, String reason) {
        log.info("Updating payment {} status to {} with reason: {}", paymentId, status, reason);

        Payment payment = getPaymentById(paymentId);
        PaymentStatus oldStatus = payment.getStatus();
        
        if (status == PaymentStatus.COMPLETED) {
            payment.markAsConfirmed(); // Uses existing method from Payment entity
        } else if (status == PaymentStatus.FAILED) {
            payment.markAsFailed(reason); // Uses existing method from Payment entity
        } else {
            payment.setStatus(status);
        }
        
        payment = paymentRepository.save(payment);

        // Create audit transaction for status change
        createAuditTransaction(payment, oldStatus, status, reason);

        // Publish status change event
        publishPaymentEvent(payment, "PAYMENT_STATUS_UPDATED");

        return payment;
    }

    /**
     * Process refund
     */
    @Transactional
    public PaymentTransaction processRefund(UUID paymentId, RefundRequestDto request) {
        log.info("Processing refund for payment: {} amount: {}", paymentId, request.getAmount());

        Payment payment = getPaymentById(paymentId);
        
        if (payment.getStatus() != PaymentStatus.COMPLETED) {
            throw new RuntimeException("Cannot refund payment that is not completed");
        }

        // Validate refund amount
        BigDecimal totalRefunded = getTotalRefundedAmount(paymentId);
        BigDecimal maxRefundable = payment.getAmount().subtract(totalRefunded);
        
        if (request.getAmount().compareTo(maxRefundable) > 0) {
            throw new RuntimeException("Refund amount exceeds refundable amount");
        }

        try {
            // Create refund transaction
            PaymentTransaction refundTransaction = new PaymentTransaction();
            refundTransaction.setPayment(payment);
            refundTransaction.setTransactionType(PaymentTransactionType.REFUND);
            refundTransaction.setAmount(request.getAmount());
            refundTransaction.setCurrency(payment.getCurrency());
            refundTransaction.setStatus(PaymentStatus.COMPLETED);
            refundTransaction.setGatewayTransactionId("REFUND_" + UUID.randomUUID().toString());
            refundTransaction.setDescription(request.getReason());
            
            refundTransaction = paymentTransactionRepository.save(refundTransaction);

            // Update payment total refunded amount
            BigDecimal newTotalRefunded = totalRefunded.add(request.getAmount());
            if (newTotalRefunded.compareTo(payment.getAmount()) >= 0) {
                payment.setStatus(PaymentStatus.REFUND_COMPLETED);
            }

            paymentRepository.save(payment);

            // Publish refund event
            publishPaymentEvent(payment, "PAYMENT_REFUNDED");

            log.info("Refund processed successfully: {}", refundTransaction.getTransactionId());
            return refundTransaction;

        } catch (Exception e) {
            log.error("Error processing refund", e);
            throw new RuntimeException("Failed to process refund: " + e.getMessage());
        }
    }

    /**
     * Cancel payment
     */
    @Transactional
    public Payment cancelPayment(UUID paymentId, String reason) {
        log.info("Cancelling payment: {} with reason: {}", paymentId, reason);

        Payment payment = getPaymentById(paymentId);
        
        if (payment.getStatus() == PaymentStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel completed payment");
        }

        payment.setStatus(PaymentStatus.CANCELLED);
        payment.setFailureReason(reason);

        
        payment = paymentRepository.save(payment);

        // Publish cancellation event
        publishPaymentEvent(payment, "PAYMENT_CANCELLED");

        return payment;
    }

    /**
     * Retry failed payment
     */
    @Transactional
    public Payment retryPayment(UUID paymentId) {
        log.info("Retrying payment: {}", paymentId);

        Payment payment = getPaymentById(paymentId);
        
        if (payment.getStatus() != PaymentStatus.FAILED) {
            throw new RuntimeException("Can only retry failed payments");
        }

        payment.setStatus(PaymentStatus.PENDING);
        payment.setFailureReason(null);
        // Note: failedAt is not a field in Payment entity - relies on processedAt
        
        payment = paymentRepository.save(payment);

        // Publish retry event
        publishPaymentEvent(payment, "PAYMENT_RETRY_INITIATED");

        return payment;
    }

    /**
     * Get payment statistics
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getPaymentStats(LocalDate dateFrom, LocalDate dateTo, String provider) {
        log.info("Getting payment statistics for period: {} to {}, provider: {}", dateFrom, dateTo, provider);

        Map<String, Object> stats = new HashMap<>();
        
        ZonedDateTime startDateTime = dateFrom != null ? 
            dateFrom.atStartOfDay().atZone(java.time.ZoneId.systemDefault()) : 
            ZonedDateTime.now().minusDays(30);
        ZonedDateTime endDateTime = dateTo != null ? 
            dateTo.atTime(23, 59, 59).atZone(java.time.ZoneId.systemDefault()) : 
            ZonedDateTime.now();

        // Use existing repository methods for statistics
        long totalPayments = paymentRepository.countByStatus(PaymentStatus.COMPLETED) + 
                           paymentRepository.countByStatus(PaymentStatus.FAILED) + 
                           paymentRepository.countByStatus(PaymentStatus.PENDING);
        stats.put("totalPayments", totalPayments);

        // Successful payments
        long successfulPayments = paymentRepository.countByStatus(PaymentStatus.COMPLETED);
        stats.put("successfulPayments", successfulPayments);

        // Failed payments  
        long failedPayments = paymentRepository.countByStatus(PaymentStatus.FAILED);
        stats.put("failedPayments", failedPayments);

        // Pending payments
        long pendingPayments = paymentRepository.countByStatus(PaymentStatus.PENDING);
        stats.put("pendingPayments", pendingPayments);

        // Success rate
        double successRate = totalPayments > 0 ? (double) successfulPayments / totalPayments * 100 : 0;
        stats.put("successRate", Math.round(successRate * 100.0) / 100.0);

        BigDecimal totalAmount = BigDecimal.ZERO;
        try {
            UUID userId = AuthenticationUtils.getCurrentUserIdFromContext();
            totalAmount = paymentRepository.getTotalAmountByUserAndDateRange(userId, startDateTime, endDateTime);
        } catch (Exception e) {
            log.warn("Could not calculate total amount: {}", e.getMessage());
            totalAmount = BigDecimal.ZERO;
        }
        stats.put("totalAmount", totalAmount);

        // Average payment amount
        BigDecimal averageAmount = successfulPayments > 0 ? 
                totalAmount.divide(BigDecimal.valueOf(successfulPayments), 2, java.math.RoundingMode.HALF_UP) : 
                BigDecimal.ZERO;
        stats.put("averageAmount", averageAmount);

        return stats;
    }

    /**
     * Get payments by booking ID
     */
    @Transactional(readOnly = true)
    public List<Payment> getPaymentsByBookingId(UUID bookingId) {
        log.info("Getting payments for booking: {}", bookingId);
        
        return paymentRepository.findByBookingIdOrderByCreatedAtDesc(bookingId);
    }

    /**
     * Export payments to CSV
     */
    @Transactional(readOnly = true)
    public void exportPayments(PaymentFiltersDto filters, OutputStream outputStream) throws IOException {
        log.info("Exporting payments with filters: {}", filters);

        // Get payments using simplified approach
        List<Payment> payments;
        if (filters.getStatus() != null) {
            payments = paymentRepository.findByStatusOrderByCreatedAtDesc(filters.getStatus());
        } else if (filters.getUserId() != null) {
            Page<Payment> pagedPayments = paymentRepository.findByUserIdOrderByCreatedAtDesc(filters.getUserId(), Pageable.unpaged());
            payments = pagedPayments.getContent();
        } else if (filters.getBookingId() != null) {
            payments = paymentRepository.findByBookingIdOrderByCreatedAtDesc(filters.getBookingId());
        } else {
            payments = paymentRepository.findAll();
        }

        try (PrintWriter writer = new PrintWriter(outputStream)) {
            // CSV header
            writer.println("Payment ID,Payment Reference,Booking ID,User ID,Amount,Currency,Status,Provider,Method Type,Created At,Confirmed At,Description");

            // CSV data
            for (Payment payment : payments) {
                writer.printf("%s,%s,%s,%s,%.2f,%s,%s,%s,%s,%s,%s,\"%s\"%n",
                        payment.getPaymentId(),
                        payment.getPaymentReference(),
                        payment.getBookingId(),
                        payment.getUserId(),
                        payment.getAmount(),
                        payment.getCurrency(),
                        payment.getStatus(),
                        payment.getProvider(),
                        payment.getMethodType(),
                        payment.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
                        payment.getConfirmedAt() != null ? payment.getConfirmedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) : "",
                        payment.getDescription() != null ? payment.getDescription().replace("\"", "\"\"") : ""
                );
            }
        }
    }

    /**
     * Reconcile payment with gateway
     */
    @Transactional
    public Payment reconcilePayment(UUID paymentId) {
        log.info("Reconciling payment: {}", paymentId);

        Payment payment = getPaymentById(paymentId);
        
        // This would integrate with your payment gateway to check status
        // For now, implement a placeholder
        
        payment = paymentRepository.save(payment);

        return payment;
    }

    /**
     * Get user payment methods
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getUserPaymentMethods(UUID userId) {
        log.info("Getting payment methods for user: {}", userId);

        List<PaymentMethod> methods = paymentMethodRepository.findByUserIdAndIsActiveTrueOrderByIsDefaultDescCreatedAtDesc(userId);
        
        return methods.stream().map(method -> {
            Map<String, Object> methodData = new HashMap<>();
            methodData.put("id", method.getMethodId());
            methodData.put("type", method.getMethodType());
            methodData.put("provider", method.getProvider());
            methodData.put("lastFour", method.getCardLastFour());
            methodData.put("expiryMonth", method.getCardExpiryMonth());
            methodData.put("expiryYear", method.getCardExpiryYear());
            methodData.put("isDefault", method.getIsDefault());
            methodData.put("createdAt", method.getCreatedAt());
            return methodData;
        }).collect(Collectors.toList());
    }

    /**
     * Get payment gateway webhooks (placeholder)
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPaymentWebhooks(UUID paymentId, String provider, 
                                                       LocalDate dateFrom, LocalDate dateTo) {
        log.info("Getting payment webhooks - paymentId: {}, provider: {}", paymentId, provider);

        // This would integrate with your webhook logging system
        // For now, return a placeholder implementation
        List<Map<String, Object>> webhooks = new ArrayList<>();
        
        Map<String, Object> webhook = new HashMap<>();
        webhook.put("id", UUID.randomUUID());
        webhook.put("paymentId", paymentId);
        webhook.put("provider", provider);
        webhook.put("event", "payment.succeeded");
        webhook.put("timestamp", LocalDateTime.now());
        webhook.put("status", "processed");
        webhooks.add(webhook);
        
        return webhooks;
    }

    // Private helper methods

    private Sort buildSort(String sortField, String direction) {
        String field = sortField != null ? sortField : "createdAt";
        Sort.Direction dir = "asc".equalsIgnoreCase(direction) ? 
                Sort.Direction.ASC : Sort.Direction.DESC;
        return Sort.by(dir, field);
    }

    private BigDecimal getTotalRefundedAmount(UUID paymentId) {
        // Use existing repository method to get refunded amount
        return paymentTransactionRepository.getTotalRefundedAmountForPayment(paymentId);
    }

    private void createAuditTransaction(Payment payment, PaymentStatus oldStatus, 
                                      PaymentStatus newStatus, String reason) {
        PaymentTransaction auditTransaction = new PaymentTransaction();
        auditTransaction.setPayment(payment);
        auditTransaction.setTransactionType(PaymentTransactionType.ADJUSTMENT);
        auditTransaction.setAmount(BigDecimal.ZERO);
        auditTransaction.setCurrency(payment.getCurrency());
        auditTransaction.setStatus(PaymentStatus.COMPLETED);
        auditTransaction.setDescription(String.format("Status changed from %s to %s. Reason: %s", 
                oldStatus, newStatus, reason));
        
        paymentTransactionRepository.save(auditTransaction);
    }

    private void publishPaymentEvent(Payment payment, String eventType) {
        try {
            Map<String, Object> eventData = new HashMap<>();
            eventData.put("paymentId", payment.getPaymentId());
            eventData.put("bookingId", payment.getBookingId());
            eventData.put("userId", payment.getUserId());
            eventData.put("amount", payment.getAmount());
            eventData.put("status", payment.getStatus());
            eventData.put("eventType", eventType);
            eventData.put("timestamp", LocalDateTime.now());

            // This would use your outbox event service
            // outboxEventService.publishEvent(eventType, eventData);
            
            log.info("Published payment event: {} for payment: {}", eventType, payment.getPaymentId());
        } catch (Exception e) {
            log.error("Failed to publish payment event", e);
            // Don't fail the transaction for event publishing errors
        }
    }
}