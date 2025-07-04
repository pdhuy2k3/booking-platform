package com.pdh.transport.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "operators")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Operator {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "operator_id")
    private Long operatorId;
    
    @Column(name = "name", nullable = false, length = 100)
    private String name;
}
