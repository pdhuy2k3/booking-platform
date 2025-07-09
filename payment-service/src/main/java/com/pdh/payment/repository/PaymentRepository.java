package com.pdh.payment.repository;

import com.pdh.payment.model.Payment;
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
 * Payment Repository
 */
@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    
    /**
     * Find payment by reference
     */
    Optional<Payment> findByPaymentReference(String paymentReference);
    
    /**
     * Find payment by booking ID
     */
    List<Payment> findByBookingIdOrderByCreatedAtDesc(UUID bookingId);
    
    /**
     * Find payment by user ID
     */
    Page<Payment> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
    
    /**
     * Find payment by saga ID
     */
    Optional<Payment> findBySagaId(String sagaId);
    
    /**
     * Find payments by status
     */
    List<Payment> findByStatusOrderByCreatedAtDesc(PaymentStatus status);
    
    /**
     * Find payments by status and user
     */
    List<Payment> findByUserIdAndStatusOrderByCreatedAtDesc(UUID userId, PaymentStatus status);
    
    /**
     * Find payments by gateway transaction ID
     */
    Optional<Payment> findByGatewayTransactionId(String gatewayTransactionId);
    
    /**
     * Find payments needing retry
     */
    @Query("SELECT p FROM Payment p WHERE p.status = :status AND p.retryCount < p.maxRetries")
    List<Payment> findPaymentsNeedingRetry(@Param("status") PaymentStatus status);
    
    /**
     * Find expired payments
     */
    @Query("SELECT p FROM Payment p WHERE p.status IN (:statuses) AND p.expiredAt < :now")
    List<Payment> findExpiredPayments(@Param("statuses") List<PaymentStatus> statuses, @Param("now") ZonedDateTime now);
    
    /**
     * Find payments by amount range
     */
    @Query("SELECT p FROM Payment p WHERE p.amount BETWEEN :minAmount AND :maxAmount ORDER BY p.createdAt DESC")
    List<Payment> findByAmountBetween(@Param("minAmount") BigDecimal minAmount, @Param("maxAmount") BigDecimal maxAmount);
    
    /**
     * Find refundable payments
     */
    @Query("SELECT p FROM Payment p WHERE p.isRefundable = true AND p.status IN ('COMPLETED', 'CONFIRMED') " +
           "AND (p.refundDeadline IS NULL OR p.refundDeadline > :now) " +
           "AND (p.refundedAmount IS NULL OR p.refundedAmount < p.amount)")
    List<Payment> findRefundablePayments(@Param("now") ZonedDateTime now);
    
    /**
     * Find payments by date range
     */
    @Query("SELECT p FROM Payment p WHERE p.createdAt BETWEEN :startDate AND :endDate ORDER BY p.createdAt DESC")
    Page<Payment> findByDateRange(@Param("startDate") ZonedDateTime startDate, 
                                 @Param("endDate") ZonedDateTime endDate, 
                                 Pageable pageable);
    
    /**
     * Find payments by user and date range
     */
    @Query("SELECT p FROM Payment p WHERE p.userId = :userId AND p.createdAt BETWEEN :startDate AND :endDate ORDER BY p.createdAt DESC")
    Page<Payment> findByUserIdAndDateRange(@Param("userId") UUID userId,
                                          @Param("startDate") ZonedDateTime startDate,
                                          @Param("endDate") ZonedDateTime endDate,
                                          Pageable pageable);
    
    /**
     * Find payments by booking and status
     */
    List<Payment> findByBookingIdAndStatus(UUID bookingId, PaymentStatus status);
    
    /**
     * Get total amount by user and date range
     */
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM Payment p WHERE p.userId = :userId " +
           "AND p.status IN ('COMPLETED', 'CONFIRMED') " +
           "AND p.createdAt BETWEEN :startDate AND :endDate")
    BigDecimal getTotalAmountByUserAndDateRange(@Param("userId") UUID userId,
                                               @Param("startDate") ZonedDateTime startDate,
                                               @Param("endDate") ZonedDateTime endDate);
    
    /**
     * Get payment count by status
     */
    @Query("SELECT COUNT(p) FROM Payment p WHERE p.status = :status")
    long countByStatus(@Param("status") PaymentStatus status);
    
    /**
     * Find flagged payments
     */
    List<Payment> findByIsFlaggedTrueOrderByCreatedAtDesc();
    
    /**
     * Find payments with high risk score
     */
    @Query("SELECT p FROM Payment p WHERE p.riskScore >= :threshold ORDER BY p.riskScore DESC, p.createdAt DESC")
    List<Payment> findHighRiskPayments(@Param("threshold") Integer threshold);
    
    /**
     * Check if payment reference exists
     */
    boolean existsByPaymentReference(String paymentReference);
    
    /**
     * Find recent payments by user (last 30 days)
     */
    @Query("SELECT p FROM Payment p WHERE p.userId = :userId AND p.createdAt >= :thirtyDaysAgo ORDER BY p.createdAt DESC")
    List<Payment> findRecentPaymentsByUser(@Param("userId") UUID userId, @Param("thirtyDaysAgo") ZonedDateTime thirtyDaysAgo);
    
    /**
     * Find payments requiring saga compensation
     */
    @Query("SELECT p FROM Payment p WHERE p.sagaId IS NOT NULL AND p.status IN ('FAILED', 'CANCELLED') " +
           "AND NOT EXISTS (SELECT 1 FROM PaymentTransaction pt WHERE pt.payment.paymentId = p.paymentId AND pt.isCompensation = true)")
    List<Payment> findPaymentsRequiringCompensation();
}
