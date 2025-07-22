package com.pdh.payment.service.strategy.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.payment.config.VietQRConfig;
import com.pdh.payment.dto.CreatePaymentIntentRequest;
import com.pdh.payment.dto.ConfirmPaymentIntentRequest;
import com.pdh.payment.dto.PaymentIntentResponse;
import com.pdh.payment.model.Payment;
import com.pdh.payment.model.PaymentMethod;
import com.pdh.payment.model.PaymentTransaction;
import com.pdh.payment.model.enums.PaymentProvider;
import com.pdh.payment.model.enums.PaymentStatus;
import com.pdh.payment.model.enums.PaymentTransactionType;
import com.pdh.payment.service.strategy.PaymentStrategy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * VietQR Payment Strategy Implementation
 * Handles VietQR payment processing with API integration
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class VietQRPaymentStrategy implements PaymentStrategy {

    private final VietQRConfig vietQRConfig;
    private final ObjectMapper objectMapper;
    private final RestClient restClient;
    
    private static final String STRATEGY_NAME = "VietQR Payment Strategy";
    private static final BigDecimal VIETQR_FEE_RATE = new BigDecimal("0.01"); // 1%
    private static final BigDecimal VIETQR_FIXED_FEE = new BigDecimal("5000"); // 5,000 VND
    
    @Override
    public PaymentTransaction processPayment(Payment payment, PaymentMethod paymentMethod, Map<String, Object> additionalData) {
        log.info("Processing VietQR payment for payment ID: {} with method: {}", 
                payment.getPaymentId(), paymentMethod.getMethodType());
        
        PaymentTransaction transaction = createBaseTransaction(payment, paymentMethod);
        
        try {
            // Generate QR code for payment
            String qrCodeData = generateQRCode(payment, additionalData);
            
            // Update transaction with QR data
            updateTransactionWithQRData(transaction, qrCodeData);
            
            log.info("VietQR code generated successfully for payment ID: {}", payment.getPaymentId());
            
        } catch (Exception e) {
            log.error("VietQR payment failed for payment ID: {}", payment.getPaymentId(), e);
            handleVietQRError(transaction, e);
        }
        
        return transaction;
    }
    
    @Override
    public PaymentTransaction processRefund(PaymentTransaction originalTransaction, BigDecimal refundAmount, String reason) {
        log.info("Processing VietQR refund for transaction: {} with amount: {}", 
                originalTransaction.getTransactionId(), refundAmount);
        
        PaymentTransaction refundTransaction = createRefundTransaction(originalTransaction, refundAmount, reason);
        
        // VietQR refunds are manual processes
        refundTransaction.setStatus(PaymentStatus.REFUND_PENDING);
        refundTransaction.setGatewayStatus("MANUAL_PROCESSING");
        refundTransaction.setGatewayResponse(createManualRefundResponse(refundAmount, reason));
        
        log.info("VietQR refund marked for manual processing: {}", refundTransaction.getTransactionId());
        
        return refundTransaction;
    }
    
    @Override
    public PaymentTransaction verifyPaymentStatus(PaymentTransaction transaction) {
        log.debug("Verifying VietQR payment status for transaction: {}", transaction.getTransactionId());
        
        if (transaction.getGatewayTransactionId() == null) {
            log.warn("No VietQR transaction ID found for transaction: {}", transaction.getTransactionId());
            return transaction;
        }
        
        try {
            // Check payment status via VietQR API
            String statusResponse = checkPaymentStatusViaAPI(transaction.getGatewayTransactionId());
            updateTransactionStatusFromVietQR(transaction, statusResponse);
            
        } catch (Exception e) {
            log.error("Failed to verify VietQR payment status for transaction: {}", 
                    transaction.getTransactionId(), e);
        }
        
        return transaction;
    }
    
    @Override
    public PaymentTransaction cancelPayment(PaymentTransaction transaction, String reason) {
        log.info("Cancelling VietQR payment for transaction: {} with reason: {}", 
                transaction.getTransactionId(), reason);
        
        // VietQR payments can be cancelled by simply marking them as cancelled
        // The QR code will expire automatically
        transaction.setStatus(PaymentStatus.CANCELLED);
        transaction.setGatewayStatus("CANCELLED");
        transaction.setFailureReason(reason);
        transaction.setFailureCode("USER_CANCELLED");
        transaction.setProcessedAt(ZonedDateTime.now());
        
        return transaction;
    }
    
    @Override
    public boolean supports(PaymentMethod paymentMethod) {
        return paymentMethod.getProvider() == PaymentProvider.VIETQR && vietQRConfig.isValid();
    }
    
    @Override
    public String getStrategyName() {
        return STRATEGY_NAME;
    }
    
    @Override
    public ValidationResult validatePaymentMethod(PaymentMethod paymentMethod) {
        if (!supports(paymentMethod)) {
            return ValidationResult.failure("Payment method not supported by VietQR strategy", "UNSUPPORTED_METHOD");
        }
        
        if (!paymentMethod.getIsActive()) {
            return ValidationResult.failure("Payment method is not active", "INACTIVE_METHOD");
        }
        
        return ValidationResult.success();
    }
    
    @Override
    public BigDecimal getProcessingFee(BigDecimal amount, PaymentMethod paymentMethod) {
        // VietQR fee: 1% + 5,000 VND
        BigDecimal percentageFee = amount.multiply(VIETQR_FEE_RATE);
        return percentageFee.add(VIETQR_FIXED_FEE);
    }
    
    @Override
    public boolean supportsRefunds() {
        return false; // VietQR refunds are manual
    }
    
    @Override
    public boolean supportsPartialRefunds() {
        return false; // VietQR partial refunds are manual
    }
    
    @Override
    public int getMaxRefundWindowDays() {
        return 30; // 30 days for manual refund processing
    }

    // === PAYMENT INTENT METHODS ===
    
    /**
     * Create VietQR payment intent
     */
    public PaymentIntentResponse createPaymentIntent(CreatePaymentIntentRequest request) {
        log.info("Creating VietQR payment intent for booking: {} with amount: {}", 
                request.getBookingId(), request.getAmount());
        
        try {
            // Generate QR code data
            Map<String, Object> qrData = generateQRCode(
                request.getAmount(),
                request.getDescription(),
                request.getBookingId().toString()
            );
            
            // Create payment intent ID
            String paymentIntentId = "vietqr_" + UUID.randomUUID().toString().replace("-", "");
            
            // Build transfer information
            String transferInfo = String.format(
                "Chuyển khoản đến: %s\nSố tài khoản: %s\nSố tiền: %,.0f %s\nNội dung: %s",
                vietQRConfig.getBank().getAccountName(),
                vietQRConfig.getBank().getAccountNumber(),
                request.getAmount().doubleValue(),
                request.getCurrency(),
                request.getDescription()
            );
            
            return PaymentIntentResponse.builder()
                    .paymentIntentId(paymentIntentId)
                    .clientSecret(null) // VietQR doesn't use client secrets
                    .amount(request.getAmount())
                    .currency(request.getCurrency())
                    .status("requires_payment_method")
                    .gateway("vietqr")
                    .qrCodeUrl((String) qrData.get("qrCodeUrl"))
                    .qrCodeData((String) qrData.get("qrCodeData"))
                    .transferInfo(transferInfo)
                    .description(request.getDescription())
                    .metadata(request.getMetadata())
                    .createdAt(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                    .build();
                    
        } catch (Exception e) {
            log.error("Error creating VietQR payment intent", e);
            throw new RuntimeException("Failed to create VietQR payment intent", e);
        }
    }
    
    /**
     * Confirm VietQR payment intent (manual confirmation)
     */
    public PaymentIntentResponse confirmPaymentIntent(ConfirmPaymentIntentRequest request) {
        log.info("Confirming VietQR payment intent: {}", request.getPaymentIntentId());
        
        try {
            // VietQR payments are confirmed manually by checking bank transfers
            // This is a simplified implementation - in practice you'd check with bank APIs
            
            return PaymentIntentResponse.builder()
                    .paymentIntentId(request.getPaymentIntentId())
                    .clientSecret(null)
                    .amount(null) // Will be set from original payment intent
                    .currency("VND") // Default currency for VietQR
                    .status("requires_action") // VietQR needs manual verification
                    .gateway("vietqr")
                    .description("VietQR payment pending verification")
                    .metadata(null) // Will be retrieved from original payment intent
                    .createdAt(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                    .build();
                    
        } catch (Exception e) {
            log.error("Error confirming VietQR payment intent: {}", request.getPaymentIntentId(), e);
            throw new RuntimeException("Failed to confirm VietQR payment intent", e);
        }
    }

    /**
     * Generate QR code for payment intent
     */
    public Map<String, Object> generateQRCode(BigDecimal amount, String description, String bookingId) {
        log.info("Generating VietQR code for booking: {} with amount: {}", bookingId, amount);

        try {
            Map<String, Object> qrRequest = new HashMap<>();
            qrRequest.put("accountNo", vietQRConfig.getBank().getAccountNumber());
            qrRequest.put("accountName", vietQRConfig.getBank().getAccountName());
            qrRequest.put("acqId", vietQRConfig.getBank().getBankCode());
            qrRequest.put("amount", amount.intValue());
            qrRequest.put("addInfo", description + " " + bookingId.substring(0, 8));
            qrRequest.put("format", "text");
            qrRequest.put("template", vietQRConfig.getSettings().getTemplate());

            String response = restClient.post()
                    .uri(vietQRConfig.getQrGenerateUrl())
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .header("x-client-id", vietQRConfig.getApi().getClientId())
                    .header("x-api-key", vietQRConfig.getApi().getApiKey())
                    .body(qrRequest)
                    .retrieve()
                    .body(String.class);

            // Parse response to extract QR code data
            JsonNode responseNode = objectMapper.readTree(response);
            if (responseNode.has("code") && "00".equals(responseNode.get("code").asText())) {
                Map<String, Object> result = new HashMap<>();
                result.put("qrCodeData", responseNode.get("data").get("qrCode").asText());
                result.put("qrCodeUrl", generateQRImageUrl(responseNode.get("data").get("qrCode").asText()));
                result.put("bankInfo", Map.of(
                    "bankCode", vietQRConfig.getBank().getBankCode(),
                    "bankName", vietQRConfig.getBank().getBankName(),
                    "accountNumber", vietQRConfig.getBank().getAccountNumber(),
                    "accountName", vietQRConfig.getBank().getAccountName()
                ));
                result.put("expirationMinutes", vietQRConfig.getSettings().getQrExpirationMinutes());
                return result;
            } else {
                throw new RuntimeException("VietQR API error: " + responseNode.get("desc").asText());
            }

        } catch (Exception e) {
            log.error("Failed to generate VietQR code", e);
            throw new RuntimeException("Failed to generate QR code: " + e.getMessage(), e);
        }
    }

    private String generateQRImageUrl(String qrData) {
        // Generate QR code image URL using a QR code service
        // You can use Google Charts API or any other QR code service
        return "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=" + 
               java.net.URLEncoder.encode(qrData, java.nio.charset.StandardCharsets.UTF_8);
    }

    // Helper methods

    private PaymentTransaction createBaseTransaction(Payment payment, PaymentMethod paymentMethod) {
        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setPayment(payment);
        transaction.setTransactionReference(
            PaymentTransaction.generateTransactionReference(PaymentTransactionType.PAYMENT));
        transaction.setTransactionType(PaymentTransactionType.PAYMENT);
        transaction.setStatus(PaymentStatus.PENDING);
        transaction.setAmount(payment.getAmount());
        transaction.setCurrency(payment.getCurrency());
        transaction.setDescription("VietQR payment for " + payment.getDescription());
        transaction.setProvider(PaymentProvider.VIETQR);
        transaction.setSagaId(payment.getSagaId());
        transaction.setSagaStep("VIETQR_PAYMENT_PROCESSING");

        // Calculate and set gateway fee
        BigDecimal gatewayFee = getProcessingFee(payment.getAmount(), paymentMethod);
        transaction.setGatewayFee(gatewayFee);

        return transaction;
    }

    private String generateQRCode(Payment payment, Map<String, Object> additionalData) throws Exception {
        Map<String, Object> qrRequest = new HashMap<>();
        qrRequest.put("accountNo", vietQRConfig.getBank().getAccountNumber());
        qrRequest.put("accountName", vietQRConfig.getBank().getAccountName());
        qrRequest.put("acqId", vietQRConfig.getBank().getBankCode());
        qrRequest.put("amount", payment.getAmount().intValue());
        qrRequest.put("addInfo", generatePaymentDescription(payment));
        qrRequest.put("format", "text");
        qrRequest.put("template", vietQRConfig.getSettings().getTemplate());

        try {
            String response = restClient.post()
                    .uri(vietQRConfig.getQrGenerateUrl())
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .header("x-client-id", vietQRConfig.getApi().getClientId())
                    .header("x-api-key", vietQRConfig.getApi().getApiKey())
                    .body(qrRequest)
                    .retrieve()
                    .body(String.class);

            // Parse response to extract QR code data
            JsonNode responseNode = objectMapper.readTree(response);
            if (responseNode.has("code") && "00".equals(responseNode.get("code").asText())) {
                return responseNode.get("data").get("qrCode").asText();
            } else {
                throw new RuntimeException("VietQR API error: " + responseNode.get("desc").asText());
            }

        } catch (RestClientResponseException e) {
            log.error("VietQR API call failed: {}", e.getResponseBodyAsString());
            throw new RuntimeException("VietQR API call failed: " + e.getMessage());
        }
    }

    private String generatePaymentDescription(Payment payment) {
        return String.format("BookingSmart %s %s",
                payment.getPaymentReference(),
                payment.getBookingId().toString().substring(0, 8));
    }

    private void updateTransactionWithQRData(PaymentTransaction transaction, String qrCodeData) {
        // Generate a unique transaction ID for VietQR
        String vietQRTransactionId = "VQRPAY_" + System.currentTimeMillis();

        transaction.setGatewayTransactionId(vietQRTransactionId);
        transaction.setGatewayReference("vietqr_" + vietQRTransactionId);
        transaction.setGatewayStatus("QR_GENERATED");

        // Store QR code data in gateway response
        Map<String, Object> responseData = new HashMap<>();
        responseData.put("qr_code", qrCodeData);
        responseData.put("expiration_minutes", vietQRConfig.getSettings().getQrExpirationMinutes());
        responseData.put("bank_info", Map.of(
            "bank_code", vietQRConfig.getBank().getBankCode(),
            "bank_name", vietQRConfig.getBank().getBankName(),
            "account_number", vietQRConfig.getBank().getAccountNumber(),
            "account_name", vietQRConfig.getBank().getAccountName()
        ));

        try {
            transaction.setGatewayResponse(objectMapper.writeValueAsString(responseData));
        } catch (Exception e) {
            log.error("Failed to serialize VietQR response data", e);
            transaction.setGatewayResponse("{\"qr_code\":\"" + qrCodeData + "\"}");
        }

        // Set expiration time
        transaction.setExpiredAt(ZonedDateTime.now().plusMinutes(vietQRConfig.getSettings().getQrExpirationMinutes()));
    }

    private String checkPaymentStatusViaAPI(String transactionId) throws Exception {
        Map<String, Object> lookupRequest = new HashMap<>();
        lookupRequest.put("transactionId", transactionId);

        try {
            return restClient.post()
                    .uri(vietQRConfig.getTransactionLookupUrl())
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .header("x-client-id", vietQRConfig.getApi().getClientId())
                    .header("x-api-key", vietQRConfig.getApi().getApiKey())
                    .body(lookupRequest)
                    .retrieve()
                    .body(String.class);

        } catch (RestClientResponseException e) {
            log.error("VietQR status check failed: {}", e.getResponseBodyAsString());
            throw new RuntimeException("VietQR status check failed: " + e.getMessage());
        }
    }

    private void updateTransactionStatusFromVietQR(PaymentTransaction transaction, String statusResponse) {
        try {
            JsonNode responseNode = objectMapper.readTree(statusResponse);

            if (responseNode.has("code") && "00".equals(responseNode.get("code").asText())) {
                JsonNode dataNode = responseNode.get("data");
                String status = dataNode.get("status").asText();

                transaction.setGatewayStatus(status.toUpperCase());
                transaction.setGatewayResponse(statusResponse);

                switch (status.toLowerCase()) {
                    case "completed", "success" -> {
                        transaction.setStatus(PaymentStatus.COMPLETED);
                        transaction.markAsCompleted();

                        // Extract bank transaction details if available
                        if (dataNode.has("bankTransactionId")) {
                            transaction.setGatewayTransactionId(dataNode.get("bankTransactionId").asText());
                        }
                    }
                    case "pending", "processing" -> transaction.setStatus(PaymentStatus.PROCESSING);
                    case "failed", "error" -> {
                        transaction.setStatus(PaymentStatus.FAILED);
                        String errorMessage = dataNode.has("message") ? dataNode.get("message").asText() : "Payment failed";
                        transaction.setFailureReason(errorMessage);
                        transaction.setFailureCode("VIETQR_FAILED");
                    }
                    case "expired" -> {
                        transaction.setStatus(PaymentStatus.CANCELLED);
                        transaction.setFailureReason("QR code expired");
                        transaction.setFailureCode("QR_EXPIRED");
                    }
                    default -> {
                        log.warn("Unknown VietQR status: {} for transaction: {}", status, transaction.getTransactionId());
                        transaction.setStatus(PaymentStatus.PENDING);
                    }
                }
            } else {
                log.warn("VietQR status check returned error: {}", responseNode.get("desc").asText());
            }

        } catch (Exception e) {
            log.error("Failed to parse VietQR status response", e);
        }
    }

    private PaymentTransaction createRefundTransaction(PaymentTransaction originalTransaction,
                                                     BigDecimal refundAmount, String reason) {
        PaymentTransaction refundTransaction = new PaymentTransaction();
        refundTransaction.setPayment(originalTransaction.getPayment());
        refundTransaction.setTransactionReference(
            PaymentTransaction.generateTransactionReference(PaymentTransactionType.REFUND));
        refundTransaction.setTransactionType(PaymentTransactionType.REFUND);
        refundTransaction.setStatus(PaymentStatus.REFUND_PENDING);
        refundTransaction.setAmount(refundAmount);
        refundTransaction.setCurrency(originalTransaction.getCurrency());
        refundTransaction.setDescription("VietQR manual refund: " + reason);
        refundTransaction.setProvider(PaymentProvider.VIETQR);
        refundTransaction.setSagaId(originalTransaction.getSagaId());
        refundTransaction.setSagaStep("VIETQR_REFUND_MANUAL");
        refundTransaction.setOriginalTransactionId(originalTransaction.getTransactionId());
        refundTransaction.setIsCompensation(true);

        return refundTransaction;
    }

    private String createManualRefundResponse(BigDecimal refundAmount, String reason) {
        Map<String, Object> refundData = new HashMap<>();
        refundData.put("status", "manual_processing");
        refundData.put("refund_amount", refundAmount);
        refundData.put("reason", reason);
        refundData.put("processing_note", "VietQR refunds require manual bank transfer processing");
        refundData.put("estimated_completion_days", 3);
        refundData.put("bank_info", Map.of(
            "bank_code", vietQRConfig.getBank().getBankCode(),
            "bank_name", vietQRConfig.getBank().getBankName(),
            "account_number", vietQRConfig.getBank().getAccountNumber(),
            "account_name", vietQRConfig.getBank().getAccountName()
        ));

        try {
            return objectMapper.writeValueAsString(refundData);
        } catch (Exception e) {
            log.error("Failed to serialize VietQR refund response", e);
            return "{\"status\":\"manual_processing\",\"message\":\"Refund requires manual processing\"}";
        }
    }

    private void handleVietQRError(PaymentTransaction transaction, Exception e) {
        String errorMessage = e.getMessage() != null ? e.getMessage() : "VietQR processing error";

        transaction.setStatus(PaymentStatus.FAILED);
        transaction.setGatewayStatus("ERROR");
        transaction.setFailureReason(errorMessage);
        transaction.setFailureCode("VIETQR_ERROR");
        transaction.setGatewayResponse("{\"error\":\"" + errorMessage + "\"}");
        transaction.setProcessedAt(ZonedDateTime.now());
    }
}
