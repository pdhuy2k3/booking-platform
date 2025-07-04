package com.pdh.transport.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "seat_layouts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeatLayout {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "layout_id")
    private Long layoutId;
    
    @Column(name = "name", length = 100)
    private String name;
    
    @Column(name = "layout_data", nullable = false, columnDefinition = "JSONB")
    private String layoutData;
}
