package com.pdh.customer.model;

import com.pdh.customer.model.enums.GroupRole;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

/**
 * Customer Group Entity - Represents a travel group (family, friends, business team)
 */
@Entity
@Table(name = "customer_groups")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerGroup {
    
    @Id
    @Column(name = "group_id")
    private UUID groupId;
    
    @Column(name = "group_name", nullable = false, length = 255)
    private String groupName;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "created_by", nullable = false)
    private UUID createdBy; // Customer ID who created this group
    
    @Column(name = "created_at", nullable = false)
    private ZonedDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private ZonedDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = ZonedDateTime.now();
        updatedAt = ZonedDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = ZonedDateTime.now();
    }
}
