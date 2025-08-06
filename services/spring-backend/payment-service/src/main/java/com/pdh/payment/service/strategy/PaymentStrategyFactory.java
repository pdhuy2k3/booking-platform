package com.pdh.payment.service.strategy;

import com.pdh.payment.model.PaymentMethod;
import com.pdh.payment.model.enums.PaymentProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

/**
 * Payment Strategy Factory
 * Manages and selects appropriate payment strategies
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentStrategyFactory {
    
    private final List<PaymentStrategy> paymentStrategies;
    
    /**
     * Get payment strategy for payment method
     * @param paymentMethod Payment method
     * @return Payment strategy
     */
    public PaymentStrategy getStrategy(PaymentMethod paymentMethod) {
        log.debug("Finding strategy for payment method: {} with provider: {}", 
                 paymentMethod.getMethodType(), paymentMethod.getProvider());
        
        Optional<PaymentStrategy> strategy = paymentStrategies.stream()
                .filter(s -> s.supports(paymentMethod))
                .findFirst();
        
        if (strategy.isEmpty()) {
            log.error("No payment strategy found for payment method: {} with provider: {}", 
                     paymentMethod.getMethodType(), paymentMethod.getProvider());
            throw new UnsupportedPaymentMethodException(
                "No payment strategy available for " + paymentMethod.getMethodType() + 
                " with provider " + paymentMethod.getProvider());
        }
        
        log.debug("Selected strategy: {} for payment method: {}", 
                 strategy.get().getStrategyName(), paymentMethod.getMethodType());
        
        return strategy.get();
    }
    
    /**
     * Get strategy by provider
     * @param provider Payment provider
     * @return Payment strategy
     */
    public PaymentStrategy getStrategyByProvider(PaymentProvider provider) {
        log.debug("Finding strategy for provider: {}", provider);
        
        Optional<PaymentStrategy> strategy = paymentStrategies.stream()
                .filter(s -> s.getStrategyName().toLowerCase().contains(provider.getCode().toLowerCase()))
                .findFirst();
        
        if (strategy.isEmpty()) {
            log.error("No payment strategy found for provider: {}", provider);
            throw new UnsupportedPaymentMethodException(
                "No payment strategy available for provider " + provider);
        }
        
        return strategy.get();
    }
    
    /**
     * Get all available strategies
     * @return List of all payment strategies
     */
    public List<PaymentStrategy> getAllStrategies() {
        return paymentStrategies;
    }
    
    /**
     * Check if payment method is supported
     * @param paymentMethod Payment method to check
     * @return true if supported
     */
    public boolean isSupported(PaymentMethod paymentMethod) {
        return paymentStrategies.stream()
                .anyMatch(strategy -> strategy.supports(paymentMethod));
    }
    
    /**
     * Get strategies supporting refunds
     * @return List of strategies that support refunds
     */
    public List<PaymentStrategy> getRefundSupportingStrategies() {
        return paymentStrategies.stream()
                .filter(PaymentStrategy::supportsRefunds)
                .toList();
    }
    
    /**
     * Get strategies supporting partial refunds
     * @return List of strategies that support partial refunds
     */
    public List<PaymentStrategy> getPartialRefundSupportingStrategies() {
        return paymentStrategies.stream()
                .filter(PaymentStrategy::supportsPartialRefunds)
                .toList();
    }
    
    /**
     * Exception for unsupported payment methods
     */
    public static class UnsupportedPaymentMethodException extends RuntimeException {
        public UnsupportedPaymentMethodException(String message) {
            super(message);
        }
    }
}
