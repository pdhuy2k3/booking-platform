package com.pdh.payment.repository;

import com.pdh.payment.model.PaymentSagaLog;
import com.pdh.payment.model.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Payment Saga Log Repository
 */
@Repository
public interface PaymentSagaLogRepository extends JpaRepository<PaymentSagaLog, Long> {
    
    /**
     * Find saga logs by saga ID
     */
    List<PaymentSagaLog> findBySagaIdOrderByProcessedAtAsc(String sagaId);
    
    /**
     * Find saga logs by payment ID
     */
    List<PaymentSagaLog> findByPayment_PaymentIdOrderByProcessedAtAsc(UUID paymentId);
    
    /**
     * Find saga logs by booking ID
     */
    List<PaymentSagaLog> findByBookingIdOrderByProcessedAtAsc(UUID bookingId);
    
    /**
     * Find saga logs by user ID
     */
    List<PaymentSagaLog> findByUserIdOrderByProcessedAtDesc(UUID userId);
    
    /**
     * Find saga logs by step name
     */
    List<PaymentSagaLog> findByStepNameOrderByProcessedAtDesc(String stepName);
    
    /**
     * Find compensation logs
     */
    List<PaymentSagaLog> findByIsCompensationTrueOrderByProcessedAtDesc();
    
    /**
     * Find failed saga logs
     */
    List<PaymentSagaLog> findByIsSuccessfulFalseOrderByProcessedAtDesc();
    
    /**
     * Find saga logs by event type
     */
    List<PaymentSagaLog> findByEventTypeOrderByProcessedAtDesc(String eventType);
    
    /**
     * Find saga logs by status transition
     */
    List<PaymentSagaLog> findByFromStatusAndToStatusOrderByProcessedAtDesc(PaymentStatus fromStatus, PaymentStatus toStatus);
    
    /**
     * Find saga logs by date range
     */
    @Query("SELECT sl FROM PaymentSagaLog sl WHERE sl.processedAt BETWEEN :startDate AND :endDate ORDER BY sl.processedAt DESC")
    List<PaymentSagaLog> findByDateRange(@Param("startDate") ZonedDateTime startDate, @Param("endDate") ZonedDateTime endDate);
    
    /**
     * Find recent saga logs (last 24 hours)
     */
    @Query("SELECT sl FROM PaymentSagaLog sl WHERE sl.processedAt >= :twentyFourHoursAgo ORDER BY sl.processedAt DESC")
    List<PaymentSagaLog> findRecentSagaLogs(@Param("twentyFourHoursAgo") ZonedDateTime twentyFourHoursAgo);
    
    /**
     * Find saga logs with errors
     */
    @Query("SELECT sl FROM PaymentSagaLog sl WHERE sl.errorMessage IS NOT NULL ORDER BY sl.processedAt DESC")
    List<PaymentSagaLog> findSagaLogsWithErrors();
    
    /**
     * Find long-running saga steps
     */
    @Query("SELECT sl FROM PaymentSagaLog sl WHERE sl.executionTimeMs > :thresholdMs ORDER BY sl.executionTimeMs DESC")
    List<PaymentSagaLog> findLongRunningSagaSteps(@Param("thresholdMs") Long thresholdMs);
    
    /**
     * Find saga logs by transaction ID
     */
    List<PaymentSagaLog> findByTransactionIdOrderByProcessedAtAsc(UUID transactionId);
    
    /**
     * Find latest saga log for saga
     */
    @Query("SELECT sl FROM PaymentSagaLog sl WHERE sl.sagaId = :sagaId ORDER BY sl.processedAt DESC LIMIT 1")
    PaymentSagaLog findLatestBySagaId(@Param("sagaId") String sagaId);
    
    /**
     * Find latest saga log for payment
     */
    @Query("SELECT sl FROM PaymentSagaLog sl WHERE sl.payment.paymentId = :paymentId ORDER BY sl.processedAt DESC LIMIT 1")
    PaymentSagaLog findLatestByPaymentId(@Param("paymentId") UUID paymentId);
    
    /**
     * Count saga logs by saga ID
     */
    long countBySagaId(String sagaId);
    
    /**
     * Count failed saga logs
     */
    long countByIsSuccessfulFalse();
    
    /**
     * Count compensation logs
     */
    long countByIsCompensationTrue();
    
    /**
     * Find sagas requiring retry
     */
    @Query("SELECT DISTINCT sl.sagaId FROM PaymentSagaLog sl WHERE sl.isSuccessful = false AND sl.retryCount < 3")
    List<String> findSagasRequiringRetry();
    
    /**
     * Find incomplete sagas (sagas with no successful completion)
     */
    @Query("SELECT DISTINCT sl.sagaId FROM PaymentSagaLog sl WHERE sl.sagaId NOT IN " +
           "(SELECT sl2.sagaId FROM PaymentSagaLog sl2 WHERE sl2.stepName = 'SAGA_COMPLETED' AND sl2.isSuccessful = true)")
    List<String> findIncompleteSagas();
    
    /**
     * Find saga logs by step type
     */
    List<PaymentSagaLog> findByStepTypeOrderByProcessedAtDesc(String stepType);
    
    /**
     * Find compensation logs for saga
     */
    @Query("SELECT sl FROM PaymentSagaLog sl WHERE sl.sagaId = :sagaId AND sl.isCompensation = true ORDER BY sl.processedAt ASC")
    List<PaymentSagaLog> findCompensationLogsBySagaId(@Param("sagaId") String sagaId);
    
    /**
     * Get average execution time by step name
     */
    @Query("SELECT AVG(sl.executionTimeMs) FROM PaymentSagaLog sl WHERE sl.stepName = :stepName AND sl.executionTimeMs IS NOT NULL")
    Double getAverageExecutionTimeByStepName(@Param("stepName") String stepName);
    
    /**
     * Find saga logs with high retry count
     */
    @Query("SELECT sl FROM PaymentSagaLog sl WHERE sl.retryCount >= :threshold ORDER BY sl.retryCount DESC, sl.processedAt DESC")
    List<PaymentSagaLog> findHighRetryCountLogs(@Param("threshold") Integer threshold);
    
    /**
     * Find saga logs by error code
     */
    @Query("SELECT sl FROM PaymentSagaLog sl WHERE sl.errorCode = :errorCode ORDER BY sl.processedAt DESC")
    List<PaymentSagaLog> findByErrorCode(@Param("errorCode") String errorCode);
}
