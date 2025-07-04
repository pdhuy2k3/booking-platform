package com.pdh.booking.model;

import com.pdh.common.model.AbstractAuditEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * Entity to store booking passenger information instead of JSONB
 * This provides better data integrity and query capabilities
 */
@Entity
@Table(name = "booking_passengers")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class BookingPassenger extends AbstractAuditEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;
    
    @Column(name = "passenger_type")
    @Enumerated(EnumType.STRING)
    private PassengerType passengerType = PassengerType.ADULT;
    
    @Column(name = "title")
    private String title; // Mr, Mrs, Ms, Dr, etc.
    
    @Column(name = "first_name", nullable = false)
    private String firstName;
    
    @Column(name = "last_name", nullable = false)
    private String lastName;
    
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;
    
    @Column(name = "nationality")
    private String nationality;
    
    @Column(name = "passport_number")
    private String passportNumber;
    
    @Column(name = "passport_expiry")
    private LocalDate passportExpiry;
    
    @Column(name = "seat_preference")
    private String seatPreference; // Aisle, Window, Middle
    
    @Column(name = "meal_preference")
    private String mealPreference; // Vegetarian, Halal, etc.
    
    @Column(name = "special_assistance")
    private String specialAssistance;
    
    @Column(name = "is_primary_passenger")
    private Boolean isPrimaryPassenger = false;
    
    @Column(name = "display_order")
    private Integer displayOrder;
    
    public enum PassengerType {
        ADULT, CHILD, INFANT
    }
}
