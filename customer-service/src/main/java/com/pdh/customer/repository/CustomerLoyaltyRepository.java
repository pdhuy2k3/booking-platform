package com.pdh.customer.repository;

import com.pdh.customer.model.CustomerLoyalty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerLoyaltyRepository extends JpaRepository<CustomerLoyalty, UUID> {
    
    /**
     * Find loyalty program by user ID
     */
    Optional<CustomerLoyalty> findByUserIdAndIsDeletedFalse(UUID userId);
    
    /**
     * Find loyalty program by member ID
     */
    Optional<CustomerLoyalty> findByMemberIdAndIsDeletedFalse(String memberId);
    
    /**
     * Check if member ID exists
     */
    boolean existsByMemberIdAndIsDeletedFalse(String memberId);

    /**
     * Check if loyalty program exists for user ID
     */
    boolean existsByUserIdAndIsDeletedFalse(UUID userId);

    /**
     * Find active loyalty programs by tier
     */
    List<CustomerLoyalty> findByTierAndIsActiveTrueAndIsDeletedFalse(CustomerLoyalty.LoyaltyTier tier);
    
    /**
     * Count active loyalty members
     */
    @Query("SELECT COUNT(cl) FROM CustomerLoyalty cl WHERE cl.isActive = true AND cl.isDeleted = false")
    long countActiveMembers();

    long countByUserIdAndIsDeletedFalse(UUID userId);

    /**
     * Count members by tier
     */
    @Query("SELECT COUNT(cl) FROM CustomerLoyalty cl WHERE cl.tier = :tier AND cl.isActive = true AND cl.isDeleted = false")
    long countMembersByTier(@Param("tier") CustomerLoyalty.LoyaltyTier tier);
    
    /**
     * Find top loyalty members by lifetime points
     */
    @Query("SELECT cl FROM CustomerLoyalty cl WHERE cl.isActive = true AND cl.isDeleted = false ORDER BY cl.lifetimePoints DESC")
    List<CustomerLoyalty> findTopMembersByLifetimePoints();
}
