package com.pdh.customer.model;

import com.pdh.common.model.AbstractAuditEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "customer_addresses")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
public class CustomerAddress extends AbstractAuditEntity {
    
    @Id
    @Column(name = "address_id")
    private UUID addressId = UUID.randomUUID();
    
    @Column(name = "user_id", nullable = false)
    private UUID userId; // From Keycloak JWT token
    
    @Enumerated(EnumType.STRING)
    @Column(name = "address_type", nullable = false, length = 50)
    private AddressType addressType;
    
    @Column(name = "is_default", nullable = false)
    private Boolean isDefault = false;
    
    // Address details
    @Column(name = "street_address", nullable = false, length = 500)
    private String streetAddress;
    
    @Column(name = "apartment_unit", length = 100)
    private String apartmentUnit;
    
    @Column(name = "city", nullable = false, length = 100)
    private String city;
    
    @Column(name = "state_province", length = 100)
    private String stateProvince;
    
    @Column(name = "postal_code", length = 20)
    private String postalCode;
    
    @Column(name = "country", nullable = false, length = 100)
    private String country;
    
    // Additional fields for shipping
    @Column(name = "recipient_name", length = 255)
    private String recipientName;
    
    @Column(name = "recipient_phone", length = 50)
    private String recipientPhone;
    
    @Column(name = "delivery_instructions", columnDefinition = "TEXT")
    private String deliveryInstructions;
    
    public enum AddressType {
        HOME, WORK, BILLING, SHIPPING
    }
}
