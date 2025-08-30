package com.pdh.hotel.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Simple message response DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponseDto {
    private String message;
    
    /**
     * Create with message
     */
    public static MessageResponseDto of(String message) {
        return MessageResponseDto.builder()
                .message(message)
                .build();
    }
}
