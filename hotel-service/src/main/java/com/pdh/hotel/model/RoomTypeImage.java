package com.pdh.hotel.model;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Entity
@Table(name = "room_type_images")
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RoomTypeImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long mediaId;
    private String publicId;
    private String url;
    private boolean isPrimary;
    @ManyToOne
    @JoinColumn(name = "room_type_id", nullable = false)
    private RoomType roomType;
}
