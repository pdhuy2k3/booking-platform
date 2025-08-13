package com.pdh.booking.model.dto.internal;

import java.math.BigDecimal;

public record HotelDetailsDto(
    String hotelId,
    String hotelName,
    String roomId,
    String roomType,
    BigDecimal pricePerNight,
    String currency
) {}
