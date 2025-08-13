package com.pdh.booking.model.dto.internal;

import java.math.BigDecimal;

public record FlightDetailsDto(
    String id,
    String airline,
    String flightNumber,
    BigDecimal price,
    String currency
) {}
