package com.pdh.customer.repository;

import com.pdh.customer.model.CustomerAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerAddressRepository extends JpaRepository<CustomerAddress, UUID> {
    
    /**
     * Find all addresses for a user
     */
    List<CustomerAddress> findByUserIdAndIsDeletedFalseOrderByIsDefaultDescCreatedAtDesc(UUID userId);
    
    /**
     * Find default address for a user
     */
    Optional<CustomerAddress> findByUserIdAndIsDefaultTrueAndIsDeletedFalse(UUID userId);
    
    /**
     * Find addresses by type for a user
     */
    List<CustomerAddress> findByUserIdAndAddressTypeAndIsDeletedFalse(UUID userId, CustomerAddress.AddressType addressType);
    
    /**
     * Clear default flag for all addresses of a user (used when setting a new default)
     */
    @Modifying
    @Query("UPDATE CustomerAddress ca SET ca.isDefault = false WHERE ca.userId = :userId AND ca.isDeleted = false")
    void clearDefaultFlagForUser(@Param("userId") UUID userId);
    
    /**
     * Count addresses for a user
     */
    long countByUserIdAndIsDeletedFalse(UUID userId);
}
