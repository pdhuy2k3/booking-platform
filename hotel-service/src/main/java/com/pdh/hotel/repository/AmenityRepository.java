package com.pdh.hotel.repository;

import com.pdh.hotel.model.Amenity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AmenityRepository extends JpaRepository<Amenity, Long> {

    Optional<Amenity> findByNameIgnoreCase(String name);

    List<Amenity> findByIsActiveTrueOrderByDisplayOrderAsc();

    List<Amenity> findByCategoryAndIsActiveTrueOrderByDisplayOrderAsc(Amenity.AmenityCategory category);

    @Query("SELECT a FROM Amenity a WHERE a.isActive = true AND a.category = :category ORDER BY a.displayOrder ASC")
    List<Amenity> findActiveAmenitiesByCategory(@Param("category") Amenity.AmenityCategory category);

    @Query("SELECT DISTINCT a.category FROM Amenity a WHERE a.isActive = true ORDER BY a.category")
    List<Amenity.AmenityCategory> findDistinctActiveCategories();

    boolean existsByNameIgnoreCase(String name);
}
