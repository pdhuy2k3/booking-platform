package com.pdh.hotel.dto.request;

import java.time.LocalDate;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO representing a single day availability update from the backoffice UI.
 */
@Data
public class RoomAvailabilityUpdateRequestDto {

    @NotNull
    private LocalDate date;

    @NotNull
    @Min(0)
    private Integer totalInventory;

    @NotNull
    @Min(0)
    private Integer totalReserved;
}
