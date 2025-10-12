package com.pdh.payment.service;

import com.pdh.payment.dto.request.AddPaymentMethodRequest;
import com.pdh.payment.model.PaymentMethod;
import com.pdh.payment.model.enums.PaymentMethodType;
import com.pdh.payment.model.enums.PaymentProvider;
import com.pdh.payment.repository.PaymentMethodRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.param.CustomerCreateParams;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Payment Method Service
 * Handles user payment method management operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentMethodService {

    private final PaymentMethodRepository paymentMethodRepository;

    @Value("${stripe.api.secret-key:}")
    private String stripeSecretKey;

    /**
     * Get all active payment methods for a user
     */
    public List<PaymentMethod> getUserPaymentMethods(UUID userId) {
        log.info("Getting payment methods for user: {}", userId);
        return paymentMethodRepository.findByUserIdAndIsActiveTrueOrderByIsDefaultDescCreatedAtDesc(userId);
    }

    /**
     * Get a specific payment method by ID
     */
    public PaymentMethod getPaymentMethodById(UUID methodId, UUID userId) {
        log.info("Getting payment method: {} for user: {}", methodId, userId);
        
        PaymentMethod method = paymentMethodRepository.findById(methodId)
            .orElseThrow(() -> new IllegalArgumentException("Payment method not found"));
        
        // Verify ownership
        if (!method.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Payment method does not belong to this user");
        }
        
        return method;
    }

    /**
     * Add a new payment method for a user
     */
    @Transactional
    public PaymentMethod addPaymentMethod(UUID userId, AddPaymentMethodRequest request) {
        log.info("Adding payment method for user: {}", userId);

        // Create payment method entity
        PaymentMethod paymentMethod = new PaymentMethod();
        paymentMethod.setUserId(userId);
        paymentMethod.setMethodType(request.getMethodType());
        paymentMethod.setProvider(PaymentProvider.STRIPE);
        paymentMethod.setDisplayName(request.getDisplayName());
        paymentMethod.setIsActive(true);
        paymentMethod.setIsVerified(false);

        // Set as default if this is the first payment method
        List<PaymentMethod> existingMethods = paymentMethodRepository
            .findByUserIdAndIsActiveTrueOrderByIsDefaultDescCreatedAtDesc(userId);
        paymentMethod.setIsDefault(existingMethods.isEmpty() || request.getSetAsDefault());

        // If setting as default, unset other defaults
        if (paymentMethod.getIsDefault()) {
            existingMethods.forEach(method -> {
                method.setIsDefault(false);
                paymentMethodRepository.save(method);
            });
        }

        // Handle card-specific fields
        if (request.getMethodType() == PaymentMethodType.CREDIT_CARD || 
            request.getMethodType() == PaymentMethodType.DEBIT_CARD) {
            
            paymentMethod.setCardLastFour(request.getCardLastFour());
            paymentMethod.setCardBrand(request.getCardBrand());
            paymentMethod.setCardExpiryMonth(request.getCardExpiryMonth());
            paymentMethod.setCardExpiryYear(request.getCardExpiryYear());
            paymentMethod.setCardHolderName(request.getCardHolderName());

            if (request.getStripePaymentMethodId() != null) {
                String sanitized = request.getStripePaymentMethodId().trim();
                paymentMethod.setToken(sanitized);
                paymentMethod.setProviderData(buildStripeProviderData(
                    sanitized,
                    request.getStripeCustomerId()
                ));
            } else if (request.getStripeCustomerId() != null) {
                paymentMethod.setProviderData(buildStripeProviderData(null, request.getStripeCustomerId()));
            }

            // Generate fingerprint for duplicate detection
            paymentMethod.setFingerprint(generateFingerprint(request));
        }

        // Handle bank account fields
        if (request.getMethodType() == PaymentMethodType.BANK_TRANSFER) {
            paymentMethod.setBankName(request.getBankName());
            paymentMethod.setBankAccountLastFour(request.getBankAccountLastFour());
        }

        // Handle digital wallet fields (MOMO, ZALOPAY, etc.)
        if (request.getWalletEmail() != null) {
            paymentMethod.setWalletEmail(request.getWalletEmail());
        }

        PaymentMethod savedMethod = paymentMethodRepository.save(paymentMethod);
        
        // Create Stripe customer if using Stripe (optional - can be done later)
        if (request.getProvider() == PaymentProvider.STRIPE && request.getStripeCustomerId() != null) {
            try {
                String updatedProviderData = buildStripeProviderData(
                    savedMethod.getToken(),
                    request.getStripeCustomerId()
                );
                savedMethod.setProviderData(updatedProviderData);
                paymentMethodRepository.save(savedMethod);
            } catch (Exception e) {
                log.warn("Failed to store Stripe customer ID", e);
            }
        }

        log.info("Payment method added successfully: {}", savedMethod.getMethodId());
        return savedMethod;
    }

    /**
     * Set a payment method as default
     */
    @Transactional
    public PaymentMethod setDefaultPaymentMethod(UUID userId, UUID methodId) {
        log.info("Setting default payment method: {} for user: {}", methodId, userId);

        PaymentMethod method = getPaymentMethodById(methodId, userId);
        
        if (!method.getIsActive()) {
            throw new IllegalArgumentException("Cannot set inactive payment method as default");
        }

        // Unset all other defaults for this user
        List<PaymentMethod> userMethods = paymentMethodRepository
            .findByUserIdAndIsActiveTrueOrderByIsDefaultDescCreatedAtDesc(userId);
        
        userMethods.forEach(m -> {
            if (!m.getMethodId().equals(methodId)) {
                m.setIsDefault(false);
                paymentMethodRepository.save(m);
            }
        });

        // Set this method as default
        method.setIsDefault(true);
        return paymentMethodRepository.save(method);
    }

    /**
     * Delete (deactivate) a payment method
     */
    @Transactional
    public void deletePaymentMethod(UUID userId, UUID methodId) {
        log.info("Deleting payment method: {} for user: {}", methodId, userId);

        PaymentMethod method = getPaymentMethodById(methodId, userId);
        
        // Soft delete by marking as inactive
        method.setIsActive(false);
        method.setIsDefault(false);
        paymentMethodRepository.save(method);

        // If this was the default, set another active method as default
        if (method.getIsDefault()) {
            List<PaymentMethod> activeMethods = paymentMethodRepository
                .findByUserIdAndIsActiveTrueOrderByIsDefaultDescCreatedAtDesc(userId);
            
            if (!activeMethods.isEmpty()) {
                PaymentMethod newDefault = activeMethods.get(0);
                newDefault.setIsDefault(true);
                paymentMethodRepository.save(newDefault);
            }
        }

        log.info("Payment method deleted successfully: {}", methodId);
    }

    /**
     * Update payment method details
     */
    @Transactional
    public PaymentMethod updatePaymentMethod(UUID userId, UUID methodId, Map<String, String> updates) {
        log.info("Updating payment method: {} for user: {}", methodId, userId);

        PaymentMethod method = getPaymentMethodById(methodId, userId);

        // Update allowed fields
        if (updates.containsKey("displayName")) {
            method.setDisplayName(updates.get("displayName"));
        }

        return paymentMethodRepository.save(method);
    }

    /**
     * Verify a payment method
     */
    @Transactional
    public boolean verifyPaymentMethod(UUID userId, UUID methodId) {
        log.info("Verifying payment method: {} for user: {}", methodId, userId);

        PaymentMethod method = getPaymentMethodById(methodId, userId);

        // For now, just mark as verified
        // In production, this would involve actual verification with payment gateway
        method.setIsVerified(true);
        paymentMethodRepository.save(method);

        return true;
    }

    // Helper methods

    private String buildStripeProviderData(String paymentMethodId, String customerId) {
        StringBuilder builder = new StringBuilder();

        if (paymentMethodId != null && !paymentMethodId.isBlank()) {
            builder.append("stripePaymentMethodId=").append(paymentMethodId.trim());
        }

        if (customerId != null && !customerId.isBlank()) {
            if (builder.length() > 0) {
                builder.append(';');
            }
            builder.append("customerId=").append(customerId.trim());
        }

        return builder.length() == 0 ? null : builder.toString();
    }

    private String generateFingerprint(AddPaymentMethodRequest request) {
        // Simple fingerprint generation - in production, use more sophisticated method
        String data = String.format("%s-%s-%s-%s",
            request.getCardBrand(),
            request.getCardLastFour(),
            request.getCardExpiryMonth(),
            request.getCardExpiryYear()
        );
        return Integer.toHexString(data.hashCode());
    }

}
