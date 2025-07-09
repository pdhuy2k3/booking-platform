package com.pdh.hotel.model;

import com.pdh.common.model.AbstractAuditEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "reviews")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
public class Review extends AbstractAuditEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "review_id")
    private UUID reviewId;
    
    @Column(name = "hotel_id", nullable = false)
    private Long hotelId;
    
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    
    @Column(name = "rating", nullable = false)
    private Integer rating;
    
    @Column(name = "comment_text", columnDefinition = "TEXT")
    private String commentText;
    
    // Reference entity
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", insertable = false, updatable = false)
    private Hotel hotel;
}
