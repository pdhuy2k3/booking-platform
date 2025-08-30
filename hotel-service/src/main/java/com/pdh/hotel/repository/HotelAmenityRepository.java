package com.pdh.hotel.repository;

import com.pdh.hotel.model.Amenity;
import com.pdh.hotel.model.HotelAmenity;
import com.pdh.hotel.model.HotelAmenityId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotelAmenityRepository extends JpaRepository<HotelAmenity, HotelAmenityId> {

    List<HotelAmenity> findByHotelId(Long hotelId);

    @Modifying
    void deleteByHotelId(Long hotelId);

    @Query("select ha.amenity from HotelAmenity ha where ha.hotelId = :hotelId")
    List<Amenity> findAmenitiesByHotelId(@Param("hotelId") Long hotelId);
}

