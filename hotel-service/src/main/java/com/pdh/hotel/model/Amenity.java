package com.pdh.hotel.model;

import com.pdh.hotel.model.enums.AmenityCategory;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "amenities")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Amenity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "amenity_id")
    private Long amenityId;

    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "category")
    @Enumerated(EnumType.STRING)
    private AmenityCategory category;

    @Column(name = "icon_url")
    private String iconUrl;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "display_order")
    private Integer displayOrder;

    public enum AmenityCategory {
        INTERNET_CONNECTIVITY,      // WiFi, Internet
        ENTERTAINMENT,              // TV, Netflix, Cable
        COMFORT,                   // Air Conditioning, Heating
        BATHROOM,                  // Hair Dryer, Toiletries
        FOOD_BEVERAGE,            // Mini Bar, Coffee Maker
        BUSINESS,                 // Desk, Phone, Fax
        SAFETY_SECURITY,          // Safe, Security System
        ACCESSIBILITY,            // Wheelchair Access, Elevator
        PARKING,                  // Free Parking, Valet
        RECREATION,               // Pool, Gym, Spa
        SERVICES,                 // Room Service, Concierge
        KITCHEN,                  // Kitchen, Microwave, Refrigerator
        OTHER
    }
}
