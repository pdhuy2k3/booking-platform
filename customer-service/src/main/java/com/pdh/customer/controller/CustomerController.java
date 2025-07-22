package com.pdh.customer.controller;

import com.pdh.customer.service.CustomerService;
import com.pdh.customer.viewmodel.*;
import com.pdh.common.utils.AuthenticationUtils;
import com.pdh.common.dto.ApiResponse;
import com.pdh.common.util.ResponseUtils;
import com.pdh.common.constants.ErrorCodes;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@Slf4j
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    // BACKOFFICE ADMIN ENDPOINTS
    @GetMapping("/backoffice/admin/customers")
    public ResponseEntity<ApiResponse<CustomerListVm>> getCustomers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            log.info("Getting customers - page: {}, size: {}", page, size);
            CustomerListVm customers = customerService.getCustomers(page);
            return ResponseUtils.ok(customers, "Customers retrieved successfully");
        } catch (Exception e) {
            log.error("Error getting customers", e);
            return ResponseUtils.internalError("Failed to retrieve customers");
        }
    }

    @GetMapping("/backoffice/admin/customers/{id}")
    public ResponseEntity<ApiResponse<CustomerAdminVm>> getCustomerById(@PathVariable String id) {
        try {
            log.info("Getting customer by ID: {}", id);
            CustomerAdminVm customer = customerService.getCustomerById(id);
            if (customer != null) {
                return ResponseUtils.ok(customer, "Customer retrieved successfully");
            } else {
                return ResponseUtils.notFound("Customer not found with ID: " + id);
            }
        } catch (Exception e) {
            log.error("Error getting customer by ID: {}", id, e);
            return ResponseUtils.internalError("Failed to retrieve customer");
        }
    }

    @GetMapping("/backoffice/admin/customers/search")
    public ResponseEntity<CustomerAdminVm> getCustomerByEmail(@RequestParam String email) {
        CustomerAdminVm customer = customerService.getCustomerByEmail(email);
        return ResponseEntity.ok(customer);
    }

    @PostMapping("/backoffice/admin/customers")
    public ResponseEntity<CustomerVm> createCustomer(@Valid @RequestBody CustomerPostVm customerPostVm) {
        CustomerVm customer = customerService.create(customerPostVm);
        return ResponseEntity.status(HttpStatus.CREATED).body(customer);
    }

    @PutMapping("/backoffice/admin/customers/{id}")
    public ResponseEntity<Void> updateCustomer(
            @PathVariable String id,
            @Valid @RequestBody CustomerProfileRequestVm customerProfileRequestVm) {
        customerService.updateCustomer(id, customerProfileRequestVm);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/backoffice/admin/customers/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable String id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }

    // BACKOFFICE PARTNER ENDPOINTS
    @GetMapping("/backoffice/partner/customers")
    public ResponseEntity<CustomerListVm> getCustomersForPartner(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        CustomerListVm customers = customerService.getCustomers(page);
        return ResponseEntity.ok(customers);
    }

    // STOREFRONT ENDPOINTS
    @GetMapping("/storefront/profile")
    public ResponseEntity<CustomerVm> getCustomerProfile() {
        String userId = AuthenticationUtils.extractUserId();
        CustomerVm customer = customerService.getCustomerProfile(userId);
        return ResponseEntity.ok(customer);
    }

    @PutMapping("/storefront/profile")
    public ResponseEntity<Void> updateCustomerProfile(@Valid @RequestBody CustomerProfileRequestVm customerProfileRequestVm) {
        String userId = AuthenticationUtils.extractUserId();
        customerService.updateCustomer(userId, customerProfileRequestVm);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/storefront/guest")
    public ResponseEntity<GuestUserVm> createGuestUser() {
        GuestUserVm guestUser = customerService.createGuestUser();
        return ResponseEntity.status(HttpStatus.CREATED).body(guestUser);
    }
}
