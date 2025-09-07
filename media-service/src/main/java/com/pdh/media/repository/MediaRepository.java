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
     * Find all media for a specific entity
     */
    @Query("""
    SELECT m FROM Media m 
    WHERE m.entityType = :entityType 
      AND m.entityId = :entityId 
      AND m.isActive = :isActive 
    ORDER BY m.displayOrder
""")
    List<Media> findByEntityTypeAndEntityIdAndIsActiveOrderByDisplayOrder(
            String entityType, Long entityId, Boolean isActive);

    /**
     * Find all active media for a specific entity
     */
    default List<Media> findActiveMediaByEntity(String entityType, Long entityId) {
        return findByEntityTypeAndEntityIdAndIsActiveOrderByDisplayOrder(entityType, entityId, true);
    }

    /**
     * Find primary media for a specific entity
     */
    Optional<Media> findFirstByEntityTypeAndEntityIdAndIsPrimaryAndIsActive(
            String entityType, Long entityId, Boolean isPrimary, Boolean isActive);

    /**
     * Find primary media for a specific entity (active only)
     */
    default Optional<Media> findPrimaryMedia(String entityType, Long entityId) {
        return findFirstByEntityTypeAndEntityIdAndIsPrimaryAndIsActive(entityType, entityId, true, true);
    }

    /**
     * Find media by entity type and media type
     */
    List<Media> findByEntityTypeAndEntityIdAndMediaTypeAndIsActiveOrderByDisplayOrder(
            String entityType, Long entityId, String mediaType, Boolean isActive);

    /**
     * Find all media for multiple entities
     */
    @Query("SELECT m FROM Media m WHERE m.entityType = :entityType AND m.entityId IN :entityIds AND m.isActive = true ORDER BY m.entityId, m.displayOrder")
    List<Media> findByEntityTypeAndEntityIds(@Param("entityType") String entityType, 
                                              @Param("entityIds") List<Long> entityIds);

    /**
     * Find primary media for multiple entities
     */
    @Query("SELECT m FROM Media m WHERE m.entityType = :entityType AND m.entityId IN :entityIds AND m.isPrimary = true AND m.isActive = true")
    List<Media> findPrimaryMediaForEntities(@Param("entityType") String entityType, 
                                            @Param("entityIds") List<Long> entityIds);

    /**
     * Check if media exists for an entity
     */
    boolean existsByEntityTypeAndEntityId(String entityType, Long entityId);

    /**
     * Count media for an entity
     */
    long countByEntityTypeAndEntityIdAndIsActive(String entityType, Long entityId, Boolean isActive);

    /**
     * Delete all media for an entity (soft delete by setting isActive = false)
     */
    @Modifying
    @Query("UPDATE Media m SET m.isActive = false WHERE m.entityType = :entityType AND m.entityId = :entityId")
    void softDeleteByEntity(@Param("entityType") String entityType, @Param("entityId") Long entityId);

    /**
     * Update primary status for all media of an entity
     */
    @Modifying
    @Query("UPDATE Media m SET m.isPrimary = false WHERE m.entityType = :entityType AND m.entityId = :entityId AND m.id != :excludeId")
    void clearPrimaryExcept(@Param("entityType") String entityType, 
                            @Param("entityId") Long entityId, 
                            @Param("excludeId") Long excludeId);

    /**
     * Find media by tags
     */
    @Query("SELECT m FROM Media m WHERE m.isActive = true AND m.tags LIKE %:tag%")
    Page<Media> findByTag(@Param("tag") String tag, Pageable pageable);

    /**
     * Find media by entity type with pagination
     */
    Page<Media> findByEntityTypeAndIsActive(String entityType, Boolean isActive, Pageable pageable);

    /**
     * Update display order for media
     */
    @Modifying
    @Query("UPDATE Media m SET m.displayOrder = :displayOrder WHERE m.id = :id")
    void updateDisplayOrder(@Param("id") Long id, @Param("displayOrder") Integer displayOrder);

    /**
     * Find media by folder
     */
    List<Media> findByFolderStartingWithAndIsActive(String folderPrefix, Boolean isActive);
}
