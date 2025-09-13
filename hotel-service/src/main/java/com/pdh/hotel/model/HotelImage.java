package com.pdh.hotel.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "hotel_images")
public class HotelImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long mediaId;
    private String publicId;
    private String url;
    private boolean isPrimary;
    @ManyToOne
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;
}
