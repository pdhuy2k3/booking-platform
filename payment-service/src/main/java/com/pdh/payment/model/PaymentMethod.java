package com.pdh.payment.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "payment_methods")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentMethod {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "payment_method_id")
    private Long paymentMethodId;
    
    @Column(name = "provider_name", nullable = false, unique = true, length = 50)
    private String providerName;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
