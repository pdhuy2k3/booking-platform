package com.pdh.hotel.dto.response;

import java.time.LocalDate;

import lombok.Builder;
import lombok.Value;

/**
 * DTO representing availability information for a single day.
 */
@Value
@Builder
public class RoomAvailabilityDetailDto {
    LocalDate date;
    int totalInventory;
    int totalReserved;
    int remaining;
    boolean autoCalculated;
}
