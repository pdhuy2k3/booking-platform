package com.pdh.hotel.repository;

import com.pdh.hotel.model.Hotel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

/**
 * Repository interface for Hotel entity
 */
@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long>, JpaSpecificationExecutor<Hotel> {

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
        AND h.isActive = true
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
        AND h.isActive = true
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
        AND h.isActive = true
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
        AND h.isActive = true
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
        WHERE h.isActive = true
        ORDER BY h.starRating DESC, h.name ASC
        """)
    Page<Hotel> findAllWithDetails(Pageable pageable);
    
    /**
     * Enhanced search hotels by destination with fuzzy matching
     * @param destination search term for city or hotel name
     * @param pageable pagination information
     * @return Page of matching hotels
     */
    @Query("""
        SELECT h FROM Hotel h
        WHERE (LOWER(h.city) LIKE LOWER(CONCAT('%', :destination, '%'))
        OR LOWER(h.name) LIKE LOWER(CONCAT('%', :destination, '%'))
        OR LOWER(h.address) LIKE LOWER(CONCAT('%', :destination, '%')))
        AND h.isActive = true
        ORDER BY 
            CASE 
                WHEN LOWER(h.city) = LOWER(:destination) THEN 1
                WHEN LOWER(h.city) LIKE LOWER(CONCAT(:destination, '%')) THEN 2
                WHEN LOWER(h.name) LIKE LOWER(CONCAT(:destination, '%')) THEN 3
                ELSE 4
            END,
            h.starRating DESC, h.name ASC
        """)
    Page<Hotel> findHotelsByDestinationEnhanced(@Param("destination") String destination, Pageable pageable);
    
    /**
     * Search hotels by multiple criteria with flexible destination matching
     * @param destination search term for city or hotel name
     * @param minRating minimum star rating
     * @param maxRating maximum star rating
     * @param pageable pagination information
     * @return Page of matching hotels
     */
    @Query("""
        SELECT h FROM Hotel h
        WHERE (LOWER(h.city) LIKE LOWER(CONCAT('%', :destination, '%'))
        OR LOWER(h.name) LIKE LOWER(CONCAT('%', :destination, '%'))
        OR LOWER(h.address) LIKE LOWER(CONCAT('%', :destination, '%')))
        AND h.starRating BETWEEN :minRating AND :maxRating
        AND h.isActive = true
        ORDER BY 
            CASE 
                WHEN LOWER(h.city) = LOWER(:destination) THEN 1
                WHEN LOWER(h.city) LIKE LOWER(CONCAT(:destination, '%')) THEN 2
                WHEN LOWER(h.name) LIKE LOWER(CONCAT(:destination, '%')) THEN 3
                ELSE 4
            END,
            h.starRating DESC, h.name ASC
        """)
    Page<Hotel> findHotelsByDestinationAndRatingEnhanced(
        @Param("destination") String destination,
        @Param("minRating") BigDecimal minRating,
        @Param("maxRating") BigDecimal maxRating,
        Pageable pageable
    );
    
    
    /**
     * Find hotels by address keyword
     * @param addressKeyword keyword in address
     * @param pageable pagination information
     * @return Page of hotels matching address
     */
    @Query("""
        SELECT h FROM Hotel h
        WHERE LOWER(h.address) LIKE LOWER(CONCAT('%', :addressKeyword, '%'))
        AND h.isActive = true
        ORDER BY h.starRating DESC, h.name ASC
        """)
    Page<Hotel> findHotelsByAddress(@Param("addressKeyword") String addressKeyword, Pageable pageable);
    
    /**
     * Get unique cities for destination suggestions
     * @return List of unique city names
     */
    @Query("""
        SELECT DISTINCT h.city FROM Hotel h
        WHERE h.isActive = true AND h.city IS NOT NULL
        ORDER BY h.city
        """)
    List<String> findDistinctCities();
    
}
