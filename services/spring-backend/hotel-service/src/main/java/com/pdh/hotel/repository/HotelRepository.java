package com.pdh.hotel.repository;

import com.pdh.hotel.model.Hotel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

/**
 * Repository interface for Hotel entity
 */
@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {

    /**
     * Search hotels by city or name
     * @param destination search term for city or hotel name
     * @param pageable pagination information
     * @return Page of matching hotels
     */
    @Query("""
        SELECT h FROM Hotel h
        WHERE (LOWER(h.city) LIKE LOWER(CONCAT('%', :destination, '%'))
        OR LOWER(h.name) LIKE LOWER(CONCAT('%', :destination, '%')))
        AND h.isDeleted = false
        ORDER BY h.starRating DESC, h.name ASC
        """)
    Page<Hotel> findHotelsByDestination(@Param("destination") String destination, Pageable pageable);

    /**
     * Find hotels by city
     * @param city the city name
     * @param pageable pagination information
     * @return Page of hotels in the city
     */
    @Query("""
        SELECT h FROM Hotel h
        WHERE LOWER(h.city) = LOWER(:city)
        AND h.isDeleted = false
        ORDER BY h.starRating DESC, h.name ASC
        """)
    Page<Hotel> findHotelsByCity(@Param("city") String city, Pageable pageable);

    /**
     * Find hotels by star rating range
     * @param minRating minimum star rating
     * @param maxRating maximum star rating
     * @param pageable pagination information
     * @return Page of hotels within rating range
     */
    @Query("""
        SELECT h FROM Hotel h
        WHERE h.starRating BETWEEN :minRating AND :maxRating
        AND h.isDeleted = false
        ORDER BY h.starRating DESC, h.name ASC
        """)
    Page<Hotel> findHotelsByStarRatingRange(
        @Param("minRating") BigDecimal minRating,
        @Param("maxRating") BigDecimal maxRating,
        Pageable pageable
    );

    /**
     * Search hotels by multiple criteria
     * @param destination search term for city or hotel name
     * @param minRating minimum star rating
     * @param maxRating maximum star rating
     * @param pageable pagination information
     * @return Page of matching hotels
     */
    @Query("""
        SELECT h FROM Hotel h
        WHERE (LOWER(h.city) LIKE LOWER(CONCAT('%', :destination, '%'))
        OR LOWER(h.name) LIKE LOWER(CONCAT('%', :destination, '%')))
        AND h.starRating BETWEEN :minRating AND :maxRating
        AND h.isDeleted = false
        ORDER BY h.starRating DESC, h.name ASC
        """)
    Page<Hotel> findHotelsByDestinationAndRating(
        @Param("destination") String destination,
        @Param("minRating") BigDecimal minRating,
        @Param("maxRating") BigDecimal maxRating,
        Pageable pageable
    );

    /**
     * Find all hotels with details (for admin/backoffice)
     * @param pageable pagination information
     * @return Page of all hotels
     */
    @Query("""
        SELECT h FROM Hotel h
        WHERE h.isDeleted = false
        ORDER BY h.starRating DESC, h.name ASC
        """)
    Page<Hotel> findAllWithDetails(Pageable pageable);
}
