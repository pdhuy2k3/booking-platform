package com.pdh.customer.repository;

import com.pdh.customer.model.LoyaltyTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface LoyaltyTransactionRepository extends JpaRepository<LoyaltyTransaction, UUID> {
    
    /**
     * Find transactions for a user with pagination
     */
    Page<LoyaltyTransaction> findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(UUID userId, Pageable pageable);
    
    /**
     * Find transactions by type for a user
     */
    List<LoyaltyTransaction> findByUserIdAndTransactionTypeAndIsDeletedFalseOrderByCreatedAtDesc(
            UUID userId, LoyaltyTransaction.TransactionType transactionType);
    
    /**
     * Find transactions by reference
     */
    List<LoyaltyTransaction> findByReferenceIdAndReferenceTypeAndIsDeletedFalse(
            UUID referenceId, LoyaltyTransaction.ReferenceType referenceType);
    
    /**
     * Calculate total points earned by user
     */
    @Query("SELECT COALESCE(SUM(lt.pointsAmount), 0) FROM LoyaltyTransaction lt " +
           "WHERE lt.userId = :userId AND lt.transactionType = 'EARNED' AND lt.isDeleted = false")
    Integer calculateTotalPointsEarned(@Param("userId") UUID userId);
    
    /**
     * Calculate total points redeemed by user
     */
    @Query("SELECT COALESCE(SUM(ABS(lt.pointsAmount)), 0) FROM LoyaltyTransaction lt " +
           "WHERE lt.userId = :userId AND lt.transactionType = 'REDEEMED' AND lt.isDeleted = false")
    Integer calculateTotalPointsRedeemed(@Param("userId") UUID userId);
    
    /**
     * Find transactions within date range
     */
    @Query("SELECT lt FROM LoyaltyTransaction lt " +
           "WHERE lt.userId = :userId AND lt.createdAt BETWEEN :startDate AND :endDate " +
           "AND lt.isDeleted = false ORDER BY lt.createdAt DESC")
    List<LoyaltyTransaction> findTransactionsInDateRange(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
    
    /**
     * Find expiring points (for notification purposes)
     */
    @Query("SELECT lt FROM LoyaltyTransaction lt " +
           "WHERE lt.userId = :userId AND lt.transactionType = 'EARNED' " +
           "AND lt.expiryDate IS NOT NULL AND lt.expiryDate BETWEEN :startDate AND :endDate " +
           "AND lt.isDeleted = false ORDER BY lt.expiryDate ASC")
    List<LoyaltyTransaction> findExpiringPoints(
            @Param("userId") UUID userId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}
