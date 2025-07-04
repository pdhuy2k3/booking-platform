package com.pdh.customer.model;

import com.pdh.customer.model.enums.GroupRole;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

/**
 * Customer Group Membership Entity - Represents a customer's membership in a travel group
 */
@Entity
@Table(name = "customer_group_memberships")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomerGroupMembership {
    
    @Id
    @Column(name = "membership_id")
    private UUID membershipId;
    
    @Column(name = "customer_id", nullable = false)
    private UUID customerId;
    
    @Column(name = "group_id", nullable = false)
    private UUID groupId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "role_in_group", nullable = false)
    private GroupRole roleInGroup;
    
    @Column(name = "joined_at", nullable = false)
    private ZonedDateTime joinedAt;
    
    @PrePersist
    protected void onCreate() {
        joinedAt = ZonedDateTime.now();
    }
}
