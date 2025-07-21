package com.pdh.customer.repository;

import com.pdh.customer.model.CustomerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerProfileRepository extends JpaRepository<CustomerProfile, UUID> {
    
    /**
     * Find customer profile by user ID from Keycloak JWT token
     */
    Optional<CustomerProfile> findByUserIdAndIsDeletedFalse(UUID userId);

    /**
     * Check if customer profile exists for user ID
     */
    boolean existsByUserIdAndIsDeletedFalse(UUID userId);

    /**
     * Find customer profile by passport number (for verification purposes)
     */
    @Query("SELECT cp FROM CustomerProfile cp WHERE cp.passportNumber = :passportNumber AND cp.isDeleted = false")
    Optional<CustomerProfile> findByPassportNumber(@Param("passportNumber") String passportNumber);
    
    /**
     * Count active customer profiles
     */
    @Query("SELECT COUNT(cp) FROM CustomerProfile cp WHERE cp.isDeleted = false")
    long countActiveProfiles();

    long countByUserIdAndIsDeletedFalse(UUID userId);
}
