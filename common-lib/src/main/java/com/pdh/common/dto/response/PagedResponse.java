package com.pdh.common.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Paginated response wrapper for list endpoints
 * 
 * @param <T> The type of items in the list
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Paginated response wrapper")
public class PagedResponse<T> {

    @Schema(description = "List of items for current page")
    private List<T> content;

    @Schema(description = "Current page number (0-based)", example = "0")
    private int page;

    @Schema(description = "Number of items per page", example = "20")
    private int size;

    @Schema(description = "Total number of items across all pages", example = "150")
    private long totalElements;

    @Schema(description = "Total number of pages", example = "8")
    private int totalPages;

    @Schema(description = "Whether there are more pages after current", example = "true")
    private boolean hasNext;

    @Schema(description = "Whether there are pages before current", example = "false")
    private boolean hasPrevious;

    @Schema(description = "Whether this is the first page", example = "true")
    private boolean first;

    @Schema(description = "Whether this is the last page", example = "false")
    private boolean last;

    /**
     * Creates a paged response from Spring Data Page
     */
    public static <T> PagedResponse<T> from(org.springframework.data.domain.Page<T> page) {
        PagedResponse<T> response = new PagedResponse<>();
        response.setContent(page.getContent());
        response.setPage(page.getNumber());
        response.setSize(page.getSize());
        response.setTotalElements(page.getTotalElements());
        response.setTotalPages(page.getTotalPages());
        response.setHasNext(page.hasNext());
        response.setHasPrevious(page.hasPrevious());
        response.setFirst(page.isFirst());
        response.setLast(page.isLast());
        return response;
    }

    /**
     * Creates a paged response with custom content and pagination info
     */
    public static <T> PagedResponse<T> of(List<T> content, int page, int size, long totalElements) {
        PagedResponse<T> response = new PagedResponse<>();
        response.setContent(content);
        response.setPage(page);
        response.setSize(size);
        response.setTotalElements(totalElements);
        response.setTotalPages((int) Math.ceil((double) totalElements / size));
        response.setHasNext(page < response.getTotalPages() - 1);
        response.setHasPrevious(page > 0);
        response.setFirst(page == 0);
        response.setLast(page == response.getTotalPages() - 1);
        return response;
    }
}