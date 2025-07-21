package com.pdh.customer.model;

import com.pdh.common.model.AbstractAuditEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "customer_loyalty")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
public class CustomerLoyalty extends AbstractAuditEntity {
    
    @Id
    @Column(name = "loyalty_id")
    private UUID loyaltyId = UUID.randomUUID();
    
    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId; // From Keycloak JWT token
    
    @Column(name = "member_id", nullable = false, unique = true, length = 50)
    private String memberId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "tier", nullable = false, length = 20)
    private LoyaltyTier tier = LoyaltyTier.BRONZE;
    
    @Column(name = "current_points", nullable = false)
    private Integer currentPoints = 0;
    
    @Column(name = "lifetime_points", nullable = false)
    private Integer lifetimePoints = 0;
    
    @Column(name = "points_expiry_date")
    private LocalDate pointsExpiryDate;
    
    // Tier benefits
    @Column(name = "tier_achieved_date")
    private LocalDate tierAchievedDate;
    
    @Column(name = "next_tier_points")
    private Integer nextTierPoints;
    
    @Column(name = "tier_expiry_date")
    private LocalDate tierExpiryDate;
    
    // Status
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    public enum LoyaltyTier {
        BRONZE(0, 5000),
        SILVER(5000, 15000),
        GOLD(15000, 50000),
        PLATINUM(50000, Integer.MAX_VALUE);
        
        private final int minPoints;
        private final int maxPoints;
        
        LoyaltyTier(int minPoints, int maxPoints) {
            this.minPoints = minPoints;
            this.maxPoints = maxPoints;
        }
        
        public int getMinPoints() {
            return minPoints;
        }
        
        public int getMaxPoints() {
            return maxPoints;
        }
        
        public static LoyaltyTier getTierByPoints(int points) {
            for (LoyaltyTier tier : values()) {
                if (points >= tier.minPoints && points < tier.maxPoints) {
                    return tier;
                }
            }
            return PLATINUM; // Default to highest tier if points exceed all thresholds
        }
        
        public LoyaltyTier getNextTier() {
            return switch (this) {
                case BRONZE -> SILVER;
                case SILVER -> GOLD;
                case GOLD -> PLATINUM;
                case PLATINUM -> PLATINUM; // Already at highest tier
            };
        }
        
        public int getPointsToNextTier(int currentPoints) {
            LoyaltyTier nextTier = getNextTier();
            if (nextTier == this) {
                return 0; // Already at highest tier
            }
            return Math.max(0, nextTier.minPoints - currentPoints);
        }
    }
}
