package com.pdh.customer.dto.response;

import com.pdh.customer.model.CustomerAddress;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressResponse {
    
    private UUID addressId;
    private CustomerAddress.AddressType addressType;
    private Boolean isDefault;
    
    // Address details
    private String streetAddress;
    private String apartmentUnit;
    private String city;
    private String stateProvince;
    private String postalCode;
    private String country;
    
    // Additional fields for shipping
    private String recipientName;
    private String recipientPhone;
    private String deliveryInstructions;
}
