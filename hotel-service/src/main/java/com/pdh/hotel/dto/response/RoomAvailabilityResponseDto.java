package com.pdh.hotel.dto.response;

import java.time.LocalDate;
import java.util.List;

import lombok.Builder;
import lombok.Value;

/**
 * DTO returned for room availability queries in the backoffice.
 */
@Value
@Builder
public class RoomAvailabilityResponseDto {

    Long hotelId;
    Long roomTypeId;
    String roomTypeName;
    LocalDate startDate;
    LocalDate endDate;
    int activeRoomCount;
    List<RoomAvailabilityDetailDto> availability;
}
