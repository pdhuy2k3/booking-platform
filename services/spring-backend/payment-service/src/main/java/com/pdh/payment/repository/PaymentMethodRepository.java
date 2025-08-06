package com.pdh.payment.repository;

import com.pdh.payment.model.PaymentMethod;
import com.pdh.payment.model.enums.PaymentMethodType;
import com.pdh.payment.model.enums.PaymentProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Payment Method Repository
 */
@Repository
public interface PaymentMethodRepository extends JpaRepository<PaymentMethod, UUID> {
    
    /**
     * Find payment methods by user ID
     */
    List<PaymentMethod> findByUserIdAndIsActiveTrueOrderByIsDefaultDescCreatedAtDesc(UUID userId);
    
    /**
     * Find all payment methods by user (including inactive)
     */
    List<PaymentMethod> findByUserIdOrderByIsDefaultDescCreatedAtDesc(UUID userId);
    
    /**
     * Find default payment method for user
     */
    Optional<PaymentMethod> findByUserIdAndIsDefaultTrueAndIsActiveTrue(UUID userId);
    
    /**
     * Find payment methods by type
     */
    List<PaymentMethod> findByMethodTypeAndIsActiveTrueOrderByCreatedAtDesc(PaymentMethodType methodType);
    
    /**
     * Find payment methods by provider
     */
    List<PaymentMethod> findByProviderAndIsActiveTrueOrderByCreatedAtDesc(PaymentProvider provider);
    
    /**
     * Find payment methods by user and type
     */
    List<PaymentMethod> findByUserIdAndMethodTypeAndIsActiveTrueOrderByCreatedAtDesc(UUID userId, PaymentMethodType methodType);
    
    /**
     * Find payment methods by user and provider
     */
    List<PaymentMethod> findByUserIdAndProviderAndIsActiveTrueOrderByCreatedAtDesc(UUID userId, PaymentProvider provider);
    
    /**
     * Find payment method by fingerprint
     */
    Optional<PaymentMethod> findByFingerprintAndIsActiveTrue(String fingerprint);
    
    /**
     * Find payment method by token
     */
    Optional<PaymentMethod> findByTokenAndIsActiveTrue(String token);
    
    /**
     * Find verified payment methods by user
     */
    List<PaymentMethod> findByUserIdAndIsVerifiedTrueAndIsActiveTrueOrderByIsDefaultDescCreatedAtDesc(UUID userId);
    
    /**
     * Find unverified payment methods by user
     */
    List<PaymentMethod> findByUserIdAndIsVerifiedFalseAndIsActiveTrueOrderByCreatedAtDesc(UUID userId);
    
    /**
     * Check if user has default payment method
     */
    boolean existsByUserIdAndIsDefaultTrueAndIsActiveTrue(UUID userId);
    
    /**
     * Count active payment methods for user
     */
    long countByUserIdAndIsActiveTrue(UUID userId);
    
    /**
     * Count payment methods by type
     */
    long countByMethodTypeAndIsActiveTrue(PaymentMethodType methodType);
    
    /**
     * Find payment methods by card last four digits
     */
    @Query("SELECT pm FROM PaymentMethod pm WHERE pm.userId = :userId AND pm.cardLastFour = :lastFour AND pm.isActive = true")
    List<PaymentMethod> findByUserIdAndCardLastFour(@Param("userId") UUID userId, @Param("lastFour") String lastFour);
    
    /**
     * Find payment methods by wallet email
     */
    @Query("SELECT pm FROM PaymentMethod pm WHERE pm.userId = :userId AND pm.walletEmail = :email AND pm.isActive = true")
    List<PaymentMethod> findByUserIdAndWalletEmail(@Param("userId") UUID userId, @Param("email") String email);
    
    /**
     * Find expired payment methods
     */
    @Query("SELECT pm FROM PaymentMethod pm WHERE pm.cardExpiryYear < :currentYear " +
           "OR (pm.cardExpiryYear = :currentYear AND pm.cardExpiryMonth < :currentMonth) " +
           "AND pm.isActive = true")
    List<PaymentMethod> findExpiredCards(@Param("currentYear") Integer currentYear, @Param("currentMonth") Integer currentMonth);
    
    /**
     * Find payment methods expiring soon (within 2 months)
     */
    @Query("SELECT pm FROM PaymentMethod pm WHERE " +
           "(pm.cardExpiryYear = :currentYear AND pm.cardExpiryMonth <= :targetMonth) " +
           "OR (pm.cardExpiryYear = :targetYear AND pm.cardExpiryMonth <= :targetMonthNextYear) " +
           "AND pm.isActive = true")
    List<PaymentMethod> findCardsExpiringSoon(@Param("currentYear") Integer currentYear, 
                                             @Param("targetMonth") Integer targetMonth,
                                             @Param("targetYear") Integer targetYear,
                                             @Param("targetMonthNextYear") Integer targetMonthNextYear);
    
    /**
     * Find duplicate payment methods by fingerprint
     */
    @Query("SELECT pm FROM PaymentMethod pm WHERE pm.fingerprint = :fingerprint AND pm.userId != :excludeUserId AND pm.isActive = true")
    List<PaymentMethod> findDuplicatesByFingerprint(@Param("fingerprint") String fingerprint, @Param("excludeUserId") UUID excludeUserId);
    
    /**
     * Find payment methods by country
     */
    List<PaymentMethod> findByCountryCodeAndIsActiveTrueOrderByCreatedAtDesc(String countryCode);
    
    /**
     * Find payment methods by currency
     */
    List<PaymentMethod> findByCurrencyAndIsActiveTrueOrderByCreatedAtDesc(String currency);
    
    /**
     * Check if fingerprint exists for different user
     */
    @Query("SELECT COUNT(pm) > 0 FROM PaymentMethod pm WHERE pm.fingerprint = :fingerprint AND pm.userId != :userId AND pm.isActive = true")
    boolean existsByFingerprintAndDifferentUser(@Param("fingerprint") String fingerprint, @Param("userId") UUID userId);
}
