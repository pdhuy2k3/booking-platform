package com.pdh.payment.repository;

import com.pdh.payment.model.PaymentTransaction;
import com.pdh.payment.model.enums.PaymentTransactionType;
import com.pdh.payment.model.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Payment Transaction Repository
 */
@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, UUID> {
    
    /**
     * Find transaction by reference
     */
    Optional<PaymentTransaction> findByTransactionReference(String transactionReference);
    
    /**
     * Find transactions by payment ID
     */
    List<PaymentTransaction> findByPayment_PaymentIdOrderByCreatedAtDesc(UUID paymentId);
    
    /**
     * Find transactions by saga ID
     */
    List<PaymentTransaction> findBySagaIdOrderByCreatedAtDesc(String sagaId);
    
    /**
     * Find transactions by type
     */
    List<PaymentTransaction> findByTransactionTypeOrderByCreatedAtDesc(PaymentTransactionType transactionType);
    
    /**
     * Find transactions by status
     */
    List<PaymentTransaction> findByStatusOrderByCreatedAtDesc(PaymentStatus status);
    
    /**
     * Find transactions by gateway transaction ID
     */
    Optional<PaymentTransaction> findByGatewayTransactionId(String gatewayTransactionId);
    
    /**
     * Find compensation transactions
     */
    List<PaymentTransaction> findByIsCompensationTrueOrderByCreatedAtDesc();
    
    /**
     * Find transactions by parent transaction
     */
    List<PaymentTransaction> findByParentTransaction_TransactionIdOrderByCreatedAtDesc(UUID parentTransactionId);
    
    /**
     * Find transactions by original transaction
     */
    List<PaymentTransaction> findByOriginalTransaction_TransactionIdOrderByCreatedAtDesc(UUID originalTransactionId);
    
    /**
     * Find transactions needing retry
     */
    @Query("SELECT t FROM PaymentTransaction t WHERE t.status = :status AND t.retryCount < t.maxRetries")
    List<PaymentTransaction> findTransactionsNeedingRetry(@Param("status") PaymentStatus status);
    
    /**
     * Find expired transactions
     */
    @Query("SELECT t FROM PaymentTransaction t WHERE t.status IN (:statuses) AND t.expiredAt < :now")
    List<PaymentTransaction> findExpiredTransactions(@Param("statuses") List<PaymentStatus> statuses, @Param("now") ZonedDateTime now);
    
    /**
     * Find transactions by date range
     */
    @Query("SELECT t FROM PaymentTransaction t WHERE t.createdAt BETWEEN :startDate AND :endDate ORDER BY t.createdAt DESC")
    Page<PaymentTransaction> findByDateRange(@Param("startDate") ZonedDateTime startDate,
                                           @Param("endDate") ZonedDateTime endDate,
                                           Pageable pageable);
    
    /**
     * Find transactions by payment and type
     */
    List<PaymentTransaction> findByPayment_PaymentIdAndTransactionType(UUID paymentId, PaymentTransactionType transactionType);
    
    /**
     * Find successful refund transactions for payment
     */
    @Query("SELECT t FROM PaymentTransaction t WHERE t.payment.paymentId = :paymentId " +
           "AND t.transactionType IN ('REFUND', 'PARTIAL_REFUND') " +
           "AND t.status IN ('COMPLETED', 'CONFIRMED')")
    List<PaymentTransaction> findSuccessfulRefundsForPayment(@Param("paymentId") UUID paymentId);
    
    /**
     * Calculate total refunded amount for payment
     */
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM PaymentTransaction t WHERE t.payment.paymentId = :paymentId " +
           "AND t.transactionType IN ('REFUND', 'PARTIAL_REFUND') " +
           "AND t.status IN ('COMPLETED', 'CONFIRMED')")
    BigDecimal getTotalRefundedAmountForPayment(@Param("paymentId") UUID paymentId);
    
    /**
     * Find transactions by amount range
     */
    @Query("SELECT t FROM PaymentTransaction t WHERE t.amount BETWEEN :minAmount AND :maxAmount ORDER BY t.createdAt DESC")
    List<PaymentTransaction> findByAmountBetween(@Param("minAmount") BigDecimal minAmount, @Param("maxAmount") BigDecimal maxAmount);
    
    /**
     * Count transactions by status
     */
    long countByStatus(PaymentStatus status);
    
    /**
     * Count transactions by type
     */
    long countByTransactionType(PaymentTransactionType transactionType);
    
    /**
     * Find failed transactions for compensation
     */
    @Query("SELECT t FROM PaymentTransaction t WHERE t.status = 'FAILED' AND t.isCompensation = false " +
           "AND NOT EXISTS (SELECT 1 FROM PaymentTransaction ct WHERE ct.originalTransaction.transactionId = t.transactionId AND ct.isCompensation = true)")
    List<PaymentTransaction> findFailedTransactionsNeedingCompensation();
    
    /**
     * Find transactions by saga step
     */
    List<PaymentTransaction> findBySagaStep(String sagaStep);
    
    /**
     * Find recent transactions (last 24 hours)
     */
    @Query("SELECT t FROM PaymentTransaction t WHERE t.createdAt >= :twentyFourHoursAgo ORDER BY t.createdAt DESC")
    List<PaymentTransaction> findRecentTransactions(@Param("twentyFourHoursAgo") ZonedDateTime twentyFourHoursAgo);
    
    /**
     * Check if transaction reference exists
     */
    boolean existsByTransactionReference(String transactionReference);
    
    /**
     * Find transactions by provider
     */
    @Query("SELECT t FROM PaymentTransaction t WHERE t.provider = :provider ORDER BY t.createdAt DESC")
    List<PaymentTransaction> findByProvider(@Param("provider") String provider);
    
    /**
     * Get total amount by transaction type and date range
     */
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM PaymentTransaction t WHERE t.transactionType = :type " +
           "AND t.status IN ('COMPLETED', 'CONFIRMED') " +
           "AND t.createdAt BETWEEN :startDate AND :endDate")
    BigDecimal getTotalAmountByTypeAndDateRange(@Param("type") PaymentTransactionType type,
                                               @Param("startDate") ZonedDateTime startDate,
                                               @Param("endDate") ZonedDateTime endDate);
    
    /**
     * Find pending authorization transactions
     */
    @Query("SELECT t FROM PaymentTransaction t WHERE t.transactionType = 'AUTHORIZATION' " +
           "AND t.status = 'PENDING' AND t.expiredAt > :now")
    List<PaymentTransaction> findPendingAuthorizations(@Param("now") ZonedDateTime now);
}
