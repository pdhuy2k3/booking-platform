package com.pdh.customer.controller;

import com.pdh.customer.dto.request.UpdateProfileRequest;
import com.pdh.customer.dto.response.CustomerProfileResponse;
import com.pdh.customer.dto.response.StorefrontCustomerProfileResponse;
import com.pdh.customer.dto.response.LoyaltyBalanceResponse;
import com.pdh.customer.dto.response.AddressResponse;
import com.pdh.customer.model.LoyaltyTransaction;
import com.pdh.customer.service.CustomerProfileService;
import com.pdh.common.dto.ApiResponse;
import com.pdh.common.util.ResponseUtils;
import com.pdh.common.constants.ErrorCodes;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import java.util.List;

@RestController
@RequestMapping("/customers")
@RequiredArgsConstructor
@Slf4j
@Validated
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerProfileController {
    
    private final CustomerProfileService customerProfileService;
    
    /**
     * Get customer profile - userId extracted from JWT token
     * Frontend calls: GET /api/customers/storefront/profile
     * BFF routes to: GET /customers/storefront/profile
     */
    @GetMapping("/storefront/profile")
    public ResponseEntity<ApiResponse<StorefrontCustomerProfileResponse>> getProfile() {
        try {
            log.info("Getting customer profile");
            StorefrontCustomerProfileResponse profile = customerProfileService.getStorefrontProfile();
            return ResponseUtils.ok(profile, "Customer profile retrieved successfully");
        } catch (Exception e) {
            log.error("Error getting customer profile", e);
            return ResponseUtils.internalError("Failed to retrieve customer profile");
        }
    }

    /**
     * Get raw customer profile (for internal use)
     * Internal calls: GET /api/customers/internal/profile
     */
    @GetMapping("/internal/profile")
    public ResponseEntity<ApiResponse<CustomerProfileResponse>> getRawProfile() {
        try {
            log.info("Getting raw customer profile");
            CustomerProfileResponse profile = customerProfileService.getProfile();
            return ResponseUtils.ok(profile, "Customer profile retrieved successfully");
        } catch (Exception e) {
            log.error("Error getting customer profile", e);
            return ResponseUtils.internalError("Failed to retrieve customer profile");
        }
    }
    
    /**
     * Update customer profile - userId extracted from JWT token
     * Frontend calls: PUT /api/customers/storefront/profile
     * BFF routes to: PUT /customers/storefront/profile
     */
    @PutMapping("/storefront/profile")
    public ResponseEntity<ApiResponse<CustomerProfileResponse>> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request, BindingResult bindingResult) {
        try {
            if (bindingResult.hasErrors()) {
                return ResponseUtils.validationError(bindingResult);
            }

            log.info("Updating customer profile");
            CustomerProfileResponse profile = customerProfileService.updateProfile(request);
            return ResponseUtils.ok(profile, "Customer profile updated successfully");
        } catch (IllegalArgumentException e) {
            log.error("Invalid profile update request", e);
            return ResponseUtils.badRequest(e.getMessage(), ErrorCodes.INVALID_CUSTOMER_DATA);
        } catch (Exception e) {
            log.error("Error updating customer profile", e);
            return ResponseUtils.internalError("Failed to update customer profile");
        }
    }
    
    /**
     * Get customer addresses - userId extracted from JWT token
     * Frontend calls: GET /api/customers/storefront/addresses
     * BFF routes to: GET /customers/storefront/addresses
     */
    @GetMapping("/storefront/addresses")
    public ResponseEntity<ApiResponse<List<AddressResponse>>> getAddresses() {
        try {
            log.info("Getting customer addresses");
            List<AddressResponse> addresses = customerProfileService.getAddresses();
            return ResponseUtils.ok(addresses, "Customer addresses retrieved successfully");
        } catch (Exception e) {
            log.error("Error getting customer addresses", e);
            return ResponseUtils.internalError("Failed to retrieve customer addresses");
        }
    }
    
    /**
     * Get loyalty balance - userId extracted from JWT token
     * Frontend calls: GET /api/customers/storefront/loyalty/balance
     * BFF routes to: GET /customers/storefront/loyalty/balance
     */
    @GetMapping("/storefront/loyalty/balance")
    public ResponseEntity<ApiResponse<LoyaltyBalanceResponse>> getLoyaltyBalance() {
        try {
            log.info("Getting loyalty balance");
            LoyaltyBalanceResponse balance = customerProfileService.getLoyaltyBalance();
            return ResponseUtils.ok(balance, "Loyalty balance retrieved successfully");
        } catch (Exception e) {
            log.error("Error getting loyalty balance", e);
            return ResponseUtils.internalError("Failed to retrieve loyalty balance");
        }
    }
    
    /**
     * Get loyalty transaction history - userId extracted from JWT token
     * Frontend calls: GET /api/customers/storefront/loyalty/history?page=0&limit=20
     * BFF routes to: GET /customers/storefront/loyalty/history?page=0&limit=20
     */
    @GetMapping("/storefront/loyalty/history")
    public ResponseEntity<ApiResponse<Page<LoyaltyTransaction>>> getLoyaltyHistory(
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int limit) {
        try {
            log.info("Getting loyalty history - page: {}, limit: {}", page, limit);

            Pageable pageable = PageRequest.of(page, limit);
            Page<LoyaltyTransaction> history = customerProfileService.getLoyaltyHistory(pageable);

            // Create pagination metadata
            ResponseUtils.PaginationMetadata pagination = new ResponseUtils.PaginationMetadata(
                    page, limit, history.getTotalElements(), history.getTotalPages());

            return ResponseUtils.paginated(history, pagination);
        } catch (Exception e) {
            log.error("Error getting loyalty history", e);
            return ResponseUtils.internalError("Failed to retrieve loyalty history");
        }
    }
    
    @PostMapping("/storefront/profile/send-verification-email")
    public ResponseEntity<ApiResponse<Void>> sendVerificationEmail() {
        customerProfileService.sendVerificationEmail();
        return ResponseUtils.accepted("Verification email sent successfully");
    }

    @PostMapping("/storefront/profile/send-update-password-email")
    public ResponseEntity<ApiResponse<Void>> sendUpdatePasswordEmail() {
        customerProfileService.sendUpdatePasswordEmail();
        return ResponseUtils.accepted("Update password email sent successfully");
    }

    @PostMapping("/storefront/profile/configure-totp")
    public ResponseEntity<ApiResponse<String>> configureTotp() {
        String totpSecret = customerProfileService.configureTotp();
        return ResponseUtils.ok(totpSecret, "TOTP secret retrieved successfully");
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    @PreAuthorize("permitAll()")
    public ResponseEntity<ApiResponse<String>> health() {
        return ResponseUtils.ok("Customer Profile Service is healthy", "Service is running normally");
    }
}
