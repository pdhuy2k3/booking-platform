package com.pdh.ai.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Payload received over the AI chat WebSocket.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatSocketRequest {

    /**
     * Client generated identifier so responses can be correlated.
     */
    private String requestId;

    /**
     * Optional conversation identifier. The server will generate one when absent.
     */
    private String conversationId;

    /**
     * Text message sent by the user.
     */
    private String message;

    /**
     * Epoch milliseconds captured on the client. Informational only.
     */
    private Long timestamp;

    /**
     * Hint for future message types. Defaults to "prompt".
     */
    @Builder.Default
    private String type = "prompt";
}
