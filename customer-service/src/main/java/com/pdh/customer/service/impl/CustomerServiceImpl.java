package com.pdh.customer.service.impl;

import com.pdh.customer.model.Customer;
import com.pdh.customer.repository.CustomerRepository;
import com.pdh.customer.service.CustomerService;
import com.pdh.customer.service.LogtoUserService;
import com.pdh.customer.service.LogtoUserService.LogtoUserInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Implementation of CustomerService that manages application-specific customer data
 * and integrates with Logto for authentication data
 */
@Service
@Transactional
public class CustomerServiceImpl implements CustomerService {
    
    private static final Logger logger = LoggerFactory.getLogger(CustomerServiceImpl.class);
    
    private final CustomerRepository customerRepository;
    private final LogtoUserService logtoUserService;
    
    public CustomerServiceImpl(CustomerRepository customerRepository, 
                             LogtoUserService logtoUserService) {
        this.customerRepository = customerRepository;
        this.logtoUserService = logtoUserService;
    }
    
    @Override
    public Customer createCustomer(UUID logtoUserId, String logtoSubId) {
        logger.info("Creating customer profile for Logto user ID: {}", logtoUserId);
        
        // Check if profile already exists
        Customer existingCustomer = customerRepository.findByLogtoUserId(logtoUserId);
        if (existingCustomer != null) {
            logger.warn("Customer profile already exists for Logto user ID: {}", logtoUserId);
            return existingCustomer;
        }
        
        // Get user info from Logto
        LogtoUserInfo logtoUserInfo = logtoUserService.getUserById(logtoUserId);
        if (logtoUserInfo == null) {
            throw new RuntimeException("User not found in Logto: " + logtoUserId);
        }
        
        // Create new customer with default values
        Customer customer = new Customer();
        customer.setCustomerId(logtoUserId);
        customer.setLogtoSubId(logtoSubId);
        customer.setPreferredLanguage("vi"); // Default language
        customer.setPreferredCurrency("VND"); // Default currency
        customer.setLoyaltyPoints(0); // Start with 0 points
        
        // Set phone number if available from Logto
        if (logtoUserInfo.phoneNumber() != null) {
            customer.setPhoneNumber(logtoUserInfo.phoneNumber());
        }
        
        return customerRepository.save(customer);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Customer getCustomer(UUID customerId) {
        return customerRepository.findByLogtoUserId(customerId);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Customer getCustomerBySubId(String subId) {
        return customerRepository.findByLogtoSubId(subId);
    }
    
    @Override
    public Customer updateCustomer(UUID customerId, CustomerUpdateRequest request) {
        Customer customer = getCustomer(customerId);
        if (customer == null) {
            throw new RuntimeException("Customer not found for ID: " + customerId);
        }
        
        // Update local customer fields
        if (request.preferredLanguage() != null) {
            customer.setPreferredLanguage(request.preferredLanguage());
        }
        if (request.preferredCurrency() != null) {
            customer.setPreferredCurrency(request.preferredCurrency());
        }
        if (request.phoneNumber() != null) {
            customer.setPhoneNumber(request.phoneNumber());
        }
        if (request.emergencyContactName() != null) {
            customer.setEmergencyContactName(request.emergencyContactName());
        }
        if (request.emergencyContactPhone() != null) {
            customer.setEmergencyContactPhone(request.emergencyContactPhone());
        }
        if (request.travelPreferences() != null) {
            customer.setTravelPreferences(request.travelPreferences());
        }
        
        return customerRepository.save(customer);
    }
    
    @Override
    @Transactional(readOnly = true)
    public CompleteCustomerInfo getCompleteCustomerInfo(UUID customerId) {
        // Get customer from local database
        Customer customer = getCustomer(customerId);
        if (customer == null) {
            return null;
        }
        
        // Get user info from Logto
        LogtoUserInfo logtoUserInfo = logtoUserService.getUserById(customerId);
        if (logtoUserInfo == null) {
            return null;
        }
        
        // Combine information from both sources
        return new CompleteCustomerInfo(
                customerId,
                logtoUserInfo.subId(),
                logtoUserInfo.email(),
                logtoUserInfo.fullName(),
                logtoUserInfo.profilePictureUrl(),
                // Use phone from customer if available, otherwise from Logto
                customer.getPhoneNumber() != null ? customer.getPhoneNumber() : logtoUserInfo.phoneNumber(),
                customer.getPreferredLanguage(),
                customer.getPreferredCurrency(),
                customer.getEmergencyContactName(),
                customer.getEmergencyContactPhone(),
                customer.getTravelPreferences(),
                customer.getLoyaltyPoints(),
                logtoUserInfo.isActive()
        );
    }
    
    @Override
    public Customer addLoyaltyPoints(UUID customerId, Integer points) {
        Customer customer = getCustomer(customerId);
        if (customer == null) {
            throw new RuntimeException("Customer not found for ID: " + customerId);
        }
        
        int currentPoints = customer.getLoyaltyPoints() != null ? customer.getLoyaltyPoints() : 0;
        customer.setLoyaltyPoints(currentPoints + points);
        
        logger.info("Added {} loyalty points to customer {}. New total: {}", 
                   points, customerId, customer.getLoyaltyPoints());
        
        return customerRepository.save(customer);
    }
}
