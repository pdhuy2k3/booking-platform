package com.pdh.booking.model.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Wrapper DTO for paginated booking history responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingHistoryResponseDto {

    private List<BookingHistoryItemDto> items;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean hasNext;
}
