package com.pdh.customer.repository;

import com.pdh.customer.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

/**
 * Repository interface for Customer entity
 */
@Repository
public interface CustomerRepository extends JpaRepository<Customer, UUID> {
    
    /**
     * Find customer by Logto user ID
     */
    @Query("SELECT c FROM Customer c WHERE c.customerId = :logtoUserId")
    Customer findByLogtoUserId(@Param("logtoUserId") UUID logtoUserId);
    
    /**
     * Find customer by Logto subject ID
     */
    @Query("SELECT c FROM Customer c WHERE c.logtoSubId = :logtoSubId")
    Customer findByLogtoSubId(@Param("logtoSubId") String logtoSubId);
    
    /**
     * Check if customer exists by Logto user ID
     */
    boolean existsByCustomerId(UUID customerId);
    
    /**
     * Check if customer exists by Logto subject ID
     */
    boolean existsByLogtoSubId(String logtoSubId);
}
