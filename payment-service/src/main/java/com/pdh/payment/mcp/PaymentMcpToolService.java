package com.pdh.payment.mcp;

import com.pdh.payment.dto.PaymentProcessRequest;
import com.pdh.payment.dto.PaymentRequest;
import com.pdh.payment.model.Payment;
import com.pdh.payment.model.PaymentMethod;
import com.pdh.payment.model.PaymentTransaction;
import com.pdh.payment.model.enums.PaymentMethodType;
import com.pdh.payment.model.enums.PaymentProvider;
import com.pdh.payment.repository.PaymentMethodRepository;
import com.pdh.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Payment MCP Tool Service - Simplified for Recording Only
 * 
 * This service ONLY records payment outcomes in our database.
 * Actual payment processing is handled by Stripe MCP Server in AI Agent Service.
 * 
 * Flow:
 * 1. AI Agent → Stripe MCP Server (process payment)
 * 2. AI Agent → This Service (record result in database)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentMcpToolService {

    private final PaymentService paymentService;
    private final PaymentMethodRepository paymentMethodRepository;

    /**
     * Get payment methods stored in our database with Stripe payment method IDs
     * AI Agent will use these IDs with Stripe MCP Server for actual charging
     */
    @Tool(
        name = "get_user_stored_payment_methods",
        description = "Get payment methods stored in BookingSmart database. Returns Stripe payment method IDs " +
                "(pm_xxx) that can be used with Stripe MCP Server for charging. " +
                "Each method includes: methodId (our DB ID), stripePaymentMethodId (use with Stripe), " +
                "stripeCustomerId (if available), displayName, card details, and isDefault flag. " +
                "IMPORTANT: Use the stripePaymentMethodId field with Stripe MCP tools, not our methodId."
    )
    public Map<String, Object> getUserStoredPaymentMethods(
            @ToolParam(description = "User ID to get payment methods for (UUID format)", required = true)
            String userId
    ) {
        try {
            log.info("AI Tool: Getting payment methods for user={}", userId);

            UUID userUuid = UUID.fromString(userId);
            List<PaymentMethod> paymentMethods = paymentMethodRepository
                    .findByUserIdAndIsActiveTrueOrderByIsDefaultDescCreatedAtDesc(userUuid);

            if (paymentMethods.isEmpty()) {
                return Map.of(
                    "success", true,
                    "paymentMethods", Collections.emptyList(),
                    "message", "No payment methods found. User needs to add a payment method first.",
                    "suggestion", "User should add a credit card or other payment method before making a booking."
                );
            }

            List<Map<String, Object>> methods = paymentMethods.stream()
                .map(pm -> {
                    Map<String, Object> methodMap = new LinkedHashMap<>();
                    methodMap.put("methodId", pm.getMethodId().toString());
                    methodMap.put("displayName", pm.getDisplayName());
                    methodMap.put("methodType", pm.getMethodType().toString());
                    methodMap.put("provider", pm.getProvider().toString());
                    methodMap.put("isDefault", pm.getIsDefault());
                    
                    // Card details if available
                    if (pm.getCardLastFour() != null) {
                        methodMap.put("cardLastFour", pm.getCardLastFour());
                    }
                    if (pm.getCardBrand() != null) {
                        methodMap.put("cardBrand", pm.getCardBrand());
                    }
                    if (pm.getCardExpiryMonth() != null && pm.getCardExpiryYear() != null) {
                        methodMap.put("cardExpiry", String.format("%02d/%d", 
                                pm.getCardExpiryMonth(), pm.getCardExpiryYear()));
                    }
                    
                    // CRITICAL: Extract Stripe payment method ID from providerData
                    // This is what AI Agent needs to use with Stripe MCP Server
                    if (pm.getProviderData() != null && !pm.getProviderData().isEmpty()) {
                        String[] parts = pm.getProviderData().split(";");
                        String stripePaymentMethodId = parts[0].trim();
                        methodMap.put("stripePaymentMethodId", stripePaymentMethodId); // pm_xxx - Use with Stripe MCP
                        
                        // Extract Stripe customer ID if available
                        for (String part : parts) {
                            if (part.contains("customerId=")) {
                                String customerId = part.split("=")[1].trim();
                                methodMap.put("stripeCustomerId", customerId); // cus_xxx
                                break;
                            }
                        }
                    }
                    
                    // Bank details if available
                    if (pm.getBankName() != null) {
                        methodMap.put("bankName", pm.getBankName());
                    }
                    if (pm.getBankAccountLastFour() != null) {
                        methodMap.put("accountLastFour", pm.getBankAccountLastFour());
                    }
                    
                    return methodMap;
                })
                .collect(Collectors.toList());

            // Find default method
            Optional<PaymentMethod> defaultMethod = paymentMethods.stream()
                .filter(PaymentMethod::getIsDefault)
                .findFirst();

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("success", true);
            response.put("paymentMethods", methods);
            response.put("totalMethods", methods.size());
            
            if (defaultMethod.isPresent()) {
                response.put("defaultMethodId", defaultMethod.get().getMethodId().toString());
                response.put("suggestion", "User has a default payment method. You can use it for quick checkout.");
            } else {
                response.put("suggestion", "User should select a payment method to proceed with payment.");
            }

            return response;

        } catch (Exception e) {
            log.error("AI Tool: Error getting payment methods", e);
            return createErrorResponse("Failed to get payment methods: " + e.getMessage());
        }
    }

    /**
     * Record successful payment from Stripe in our database
     * Call this AFTER successfully charging via Stripe MCP Server
     */
    @Tool(
        name = "record_successful_payment",
        description = "Record a successful Stripe payment in BookingSmart database. " +
                "Call this ONLY AFTER successfully processing payment via Stripe MCP Server. " +
                "Required: stripePaymentIntentId (from Stripe PaymentIntent), bookingId, userId, amount, currency. " +
                "Optional: stripePaymentMethodId, stripeCustomerId for linking. " +
                "This creates payment record in our database for audit and booking confirmation."
    )
    public Map<String, Object> recordSuccessfulPayment(
            @ToolParam(description = "Booking ID to process payment for (UUID format)", required = true)
            String bookingId,
            
            @ToolParam(description = "User ID making the payment (UUID format)", required = true)
            String userId,
            
            @ToolParam(description = "Payment amount (decimal number)", required = true)
            BigDecimal amount,
            
            @ToolParam(description = "Currency code (e.g., 'USD', 'VND', 'EUR')", required = true)
            String currency,
            
            @ToolParam(description = "Payment method ID to use (UUID format). Get from get_user_payment_methods tool.", required = true)
            String paymentMethodId,
            
            @ToolParam(description = "Description or reference for the payment", required = false)
            String description,
            
            @ToolParam(description = "Saga ID from booking creation for correlation", required = false)
            String sagaId
    ) {
        try {
            log.info("AI Tool: Processing payment - bookingId={}, amount={} {}, paymentMethodId={}", 
                    bookingId, amount, currency, paymentMethodId);

            // Get payment method
            UUID methodUuid = UUID.fromString(paymentMethodId);
            Optional<PaymentMethod> methodOpt = paymentMethodRepository.findById(methodUuid);
            
            if (methodOpt.isEmpty()) {
                return createErrorResponse("Payment method not found. Please use get_user_payment_methods to get valid payment method ID.");
            }

            PaymentMethod paymentMethod = methodOpt.get();
            
            // Verify payment method belongs to user
            if (!paymentMethod.getUserId().toString().equals(userId)) {
                return createErrorResponse("Payment method does not belong to this user.");
            }

            if (!paymentMethod.getIsActive()) {
                return createErrorResponse("Payment method is not active. Please select another payment method.");
            }

            // Create payment entity
            Payment payment = new Payment();
            payment.setPaymentReference(Payment.generatePaymentReference());
            payment.setBookingId(UUID.fromString(bookingId));
            payment.setUserId(UUID.fromString(userId));
            payment.setAmount(amount);
            payment.setCurrency(currency);
            payment.setDescription(description != null ? description : "Payment for booking " + bookingId);
            payment.setMethodType(paymentMethod.getMethodType());
            payment.setProvider(paymentMethod.getProvider());
            if (sagaId != null) {
                payment.setSagaId(sagaId);
            }

            // Process payment with off-session flag for server-side processing
            Map<String, Object> additionalData = new HashMap<>();
            additionalData.put("paymentMethodId", paymentMethodId);
            additionalData.put("offSession", true); // Mark as off-session for stored payment method charging
            additionalData.put("initiatedBy", "mcp_server");
            
            PaymentTransaction transaction = paymentService.processPayment(payment, paymentMethod, additionalData);

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("success", true);
            response.put("transactionId", transaction.getTransactionId().toString());
            response.put("paymentReference", payment.getPaymentReference());
            response.put("status", transaction.getStatus().toString());
            response.put("amount", transaction.getAmount());
            response.put("currency", transaction.getCurrency());
            response.put("paymentMethod", Map.of(
                "type", paymentMethod.getMethodType().toString(),
                "displayName", paymentMethod.getDisplayName(),
                "lastFour", paymentMethod.getCardLastFour() != null ? 
                        paymentMethod.getCardLastFour() : "N/A"
            ));
            
            if (transaction.getGatewayTransactionId() != null) {
                response.put("gatewayTransactionId", transaction.getGatewayTransactionId());
            }
            
            response.put("message", "Payment processed successfully");
            response.put("nextStep", "Payment complete. Booking should be confirmed now. Check booking status.");

            return response;

        } catch (Exception e) {
            log.error("AI Tool: Error processing payment", e);
            return createErrorResponse("Failed to process payment: " + e.getMessage());
        }
    }

    /**
     * Get payment status and history for a booking
     */
    @Tool(
        name = "get_booking_payment_status",
        description = "Get payment status and transaction history for a booking. " +
                "Returns all payment attempts, transaction statuses, amounts, and payment methods used. " +
                "Useful for checking if payment was successful or troubleshooting payment issues."
    )
    public Map<String, Object> getBookingPaymentStatus(
            @ToolParam(description = "Booking ID to check payment status for (UUID format)", required = true)
            String bookingId,
            
            @ToolParam(description = "User ID who owns the booking (UUID format)", required = true)
            String userId
    ) {
        try {
            log.info("AI Tool: Getting payment status for bookingId={}", bookingId);

            UUID bookingUuid = UUID.fromString(bookingId);
            UUID userUuid = UUID.fromString(userId);

            // Get payment for booking
            Optional<Payment> paymentOpt = paymentService.getPaymentByBookingId(bookingUuid);
            
            if (paymentOpt.isEmpty()) {
                return Map.of(
                    "success", true,
                    "hasPayment", false,
                    "message", "No payment found for this booking yet. Payment may still be pending."
                );
            }

            Payment payment = paymentOpt.get();
            
            // Verify payment belongs to user
            if (!payment.getUserId().equals(userUuid)) {
                return createErrorResponse("Payment does not belong to this user.");
            }

            // Get payment transactions
            List<PaymentTransaction> transactions = paymentService.getPaymentTransactions(payment.getPaymentId());

            List<Map<String, Object>> transactionList = transactions.stream()
                .map(txn -> {
                    Map<String, Object> txnMap = new LinkedHashMap<>();
                    txnMap.put("transactionId", txn.getTransactionId().toString());
                    txnMap.put("status", txn.getStatus().toString());
                    txnMap.put("amount", txn.getAmount());
                    txnMap.put("currency", txn.getCurrency());
                    txnMap.put("createdAt", txn.getCreatedAt());
                    if (txn.getFailureReason() != null) {
                        txnMap.put("failureReason", txn.getFailureReason());
                    }
                    return txnMap;
                })
                .collect(Collectors.toList());

            Map<String, Object> response = new LinkedHashMap<>();
            response.put("success", true);
            response.put("hasPayment", true);
            response.put("paymentId", payment.getPaymentId().toString());
            response.put("paymentReference", payment.getPaymentReference());
            response.put("status", payment.getStatus().toString());
            response.put("totalAmount", payment.getAmount());
            response.put("currency", payment.getCurrency());
            response.put("methodType", payment.getMethodType().toString());
            response.put("provider", payment.getProvider().toString());
            response.put("transactions", transactionList);
            response.put("totalTransactions", transactionList.size());

            // Add status-specific message
            switch (payment.getStatus()) {
                case COMPLETED:
                case CONFIRMED:
                    response.put("message", "Payment completed successfully.");
                    break;
                case PENDING:
                case PROCESSING:
                    response.put("message", "Payment is pending confirmation.");
                    break;
                case FAILED:
                case DECLINED:
                case ERROR:
                    response.put("message", "Payment failed. Please try again with a different payment method.");
                    break;
                case CANCELLED:
                    response.put("message", "Payment was cancelled.");
                    break;
                case REFUND_COMPLETED:
                    response.put("message", "Payment has been refunded.");
                    break;
                case REFUND_PENDING:
                case REFUND_PROCESSING:
                case REFUND_FAILED:
                    response.put("message", "Refund is being processed.");
                    break;
                case COMPENSATION_PENDING:
                case COMPENSATION_COMPLETED:
                case COMPENSATION_FAILED:
                    response.put("message", "Payment compensation in progress.");
                    break;
                case TIMEOUT:
                    response.put("message", "Payment timed out. Please try again.");
                    break;
            }

            return response;

        } catch (Exception e) {
            log.error("AI Tool: Error getting payment status", e);
            return createErrorResponse("Failed to get payment status: " + e.getMessage());
        }
    }

    private Map<String, Object> createErrorResponse(String message) {
        return Map.of(
            "success", false,
            "error", message
        );
    }
}
