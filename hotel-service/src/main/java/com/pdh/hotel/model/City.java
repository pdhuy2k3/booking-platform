package com.pdh.hotel.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
// Dữ liệu tĩnh của thành phố, không thay đổi thường xuyên. Lấy từ file JSON hoặc API bên ngoài.
@Entity
@Table(name = "cities")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class City {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "city_id")
    private Long cityId;
    
    @Column(name = "name", nullable = false, length = 100)
    private String name;
    
    @Column(name = "country", nullable = false, length = 100)
    private String country;
}
