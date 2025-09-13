package com.pdh.media.repository;

import com.pdh.media.model.Media;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Media entity
 */
@Repository
public interface MediaRepository extends JpaRepository<Media, Long> {

    /**
     * Find media by public ID
     */
    Optional<Media> findByPublicId(String publicId);

    /**
     * Find media by type
     */
    List<Media> findByMediaType(String mediaType);

    /**
     * Find media by type with pagination
     */
    Page<Media> findByMediaType(String mediaType, Pageable pageable);

    /**
     * Find active media
     */
    List<Media> findByIsActiveTrue();

    /**
     * Find active media with pagination
     */
    Page<Media> findByIsActiveTrue(Pageable pageable);

    /**
     * Check if media exists by public ID
     */
    boolean existsByPublicId(String publicId);

    /**
     * Find media IDs by public IDs
     */
    @Query("SELECT m.id FROM Media m WHERE m.publicId IN :publicIds")
    List<Long> findIdsByPublicIdIn(@Param("publicIds") List<String> publicIds);

    /**
     * Find media by public IDs
     */
    List<Media> findByPublicIdIn(List<String> publicIds);

    /**
     * Delete by public ID
     */
    @Modifying
    @Query("DELETE FROM Media m WHERE m.publicId = :publicId")
    void deleteByPublicId(@Param("publicId") String publicId);

    /**
     * Update media as inactive
     */
    @Modifying
    @Query("UPDATE Media m SET m.isActive = false WHERE m.id = :id")
    void markAsInactive(@Param("id") Long id);

  
}
