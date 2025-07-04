package com.pdh.customer.controller;

import com.pdh.customer.model.Customer;
import com.pdh.customer.service.CustomerService;
import com.pdh.customer.service.CustomerService.CompleteCustomerInfo;
import com.pdh.customer.service.CustomerService.CustomerUpdateRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST Controller for customer management
 * Demonstrates integration between Logto authentication and local customer data
 */
@RestController
@RequestMapping("/api/customers")
public class CustomerController {
    
    private final CustomerService customerService;
    
    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }
    
    /**
     * Get complete customer information (Logto + Profile)
     */
    @GetMapping("/{customerId}")
    public ResponseEntity<CompleteCustomerInfo> getCompleteCustomerInfo(@PathVariable UUID customerId) {
        CompleteCustomerInfo customerInfo = customerService.getCompleteCustomerInfo(customerId);
        if (customerInfo == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(customerInfo);
    }
    
    /**
     * Get customer by subject ID
     */
    @GetMapping("/by-sub/{subId}")
    public ResponseEntity<Customer> getCustomerBySubId(@PathVariable String subId) {
        Customer customer = customerService.getCustomerBySubId(subId);
        if (customer == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(customer);
    }
    
    /**
     * Create customer profile (typically called when user first logs in)
     */
    @PostMapping("/{customerId}/profile")
    public ResponseEntity<Customer> createCustomer(@PathVariable UUID customerId, 
                                                  @RequestParam String subId) {
        Customer customer = customerService.createCustomer(customerId, subId);
        return ResponseEntity.ok(customer);
    }
    
    /**
     * Update customer profile
     */
    @PutMapping("/{customerId}")
    public ResponseEntity<Customer> updateCustomer(@PathVariable UUID customerId,
                                                  @RequestBody CustomerUpdateRequest request) {
        Customer customer = customerService.updateCustomer(customerId, request);
        return ResponseEntity.ok(customer);
    }
    
    /**
     * Add loyalty points to customer
     */
    @PostMapping("/{customerId}/loyalty-points")
    public ResponseEntity<Customer> addLoyaltyPoints(@PathVariable UUID customerId,
                                                    @RequestParam Integer points) {
        Customer customer = customerService.addLoyaltyPoints(customerId, points);
        return ResponseEntity.ok(customer);
    }
}
