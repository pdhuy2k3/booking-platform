package com.pdh.customer.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoyaltyBalanceResponse {
    
    private String memberId;
    private String tier;
    private Integer currentPoints;
    private Integer lifetimePoints;
    private Integer nextTierPoints;
    private String nextTierName;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate pointsExpiryDate;
    
    private Boolean isActive;
}
