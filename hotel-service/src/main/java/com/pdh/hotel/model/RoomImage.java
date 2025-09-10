package com.pdh.hotel.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Builder
@Table(name = "room_images")
@AllArgsConstructor
@NoArgsConstructor
public class RoomImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long mediaId;
    private String publicId;
    private String url;
    private boolean isPrimary;
    @ManyToOne
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;
}
