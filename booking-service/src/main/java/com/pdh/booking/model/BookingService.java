package com.pdh.booking.model;

import com.pdh.common.model.AbstractAuditEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Entity to store additional booking services and addons instead of JSONB
 * This provides better data integrity and query capabilities
 */
@Entity
@Table(name = "booking_services")
@Data

@NoArgsConstructor
@AllArgsConstructor
public class BookingService extends AbstractAuditEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;
    
    @Column(name = "service_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private ServiceType serviceType;
    
    @Column(name = "service_name", nullable = false)
    private String serviceName;
    
    @Column(name = "service_description")
    private String serviceDescription;
    
    @Column(name = "quantity")
    private Integer quantity = 1;
    
    @Column(name = "unit_price", precision = 10, scale = 2)
    private java.math.BigDecimal unitPrice;
    
    @Column(name = "total_price", precision = 10, scale = 2)
    private java.math.BigDecimal totalPrice;
    
    @Column(name = "currency")
    private String currency = "VND";
    
    @Column(name = "is_mandatory")
    private Boolean isMandatory = false;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "display_order")
    private Integer displayOrder;
    
    public enum ServiceType {
        BAGGAGE,           // Extra baggage
        SEAT_SELECTION,    // Preferred seat selection
        MEAL,              // Special meals
        INSURANCE,         // Travel insurance
        TRANSPORTATION,    // Airport transfer
        WIFI,              // In-flight WiFi
        LOUNGE_ACCESS,     // Airport lounge
        FAST_TRACK,        // Fast track security
        ROOM_UPGRADE,      // Hotel room upgrade
        EARLY_CHECKIN,     // Early hotel check-in
        LATE_CHECKOUT,     // Late hotel checkout
        SPA_SERVICE,       // Hotel spa services
        OTHER
    }
}
