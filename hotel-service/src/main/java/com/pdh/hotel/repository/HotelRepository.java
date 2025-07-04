package com.pdh.hotel.repository;

import com.pdh.hotel.model.Hotel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {
    
    List<Hotel> findByCityIgnoreCaseAndIsActiveTrue(String city);
    
    List<Hotel> findByCountryIgnoreCaseAndIsActiveTrue(String country);
    
    @Query("SELECT h FROM Hotel h WHERE h.isActive = true AND " +
           "(LOWER(h.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(h.city) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(h.address) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Hotel> searchHotels(@Param("keyword") String keyword);
    
    List<Hotel> findByStarRatingAndIsActiveTrue(Integer starRating);
    
    @Query("SELECT h FROM Hotel h WHERE h.isActive = true AND h.starRating >= :minRating")
    List<Hotel> findByMinStarRating(@Param("minRating") Integer minRating);
}
