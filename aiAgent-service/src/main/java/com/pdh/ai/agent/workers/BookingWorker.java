package com.pdh.ai.agent.workers;

import java.util.List;
import java.util.Map;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;

import com.pdh.ai.model.dto.StructuredResultItem;
import com.pdh.ai.service.ToolResultCollector;

/**
 * Specialized worker for booking operations.
 *
 * <p>This worker handles booking-related tasks including:</p>
 * <ul>
 *   <li>Validating booking details before confirmation</li>
 *   <li>Executing booking creation (future: via MCP tool)</li>
 *   <li>Checking availability before booking</li>
 *   <li>Providing booking summaries and confirmations</li>
 * </ul>
 *
 * <p><b>Note:</b> Actual booking execution will be integrated via MCP server
 * from booking-service in the future.</p>
 *
 * @author BookingSmart AI Team
 */
@Component
public class BookingWorker extends BaseWorker {

    private static final String WORKER_NAME = "BOOKING_VALIDATOR";

    private final ChatClient chatClient;
    private final ToolResultCollector toolResultCollector;

    private static final String SYSTEM_PROMPT = """
        You are a specialized booking assistant.
        
        Your responsibilities:
        - Validate booking details for completeness and correctness
        - Check availability before attempting booking
        - Guide users through the booking process
        - Explain booking policies, cancellation terms, and payment requirements
        - Provide clear booking summaries
        
        IMPORTANT: Always confirm ALL details with the user before proceeding with a booking:
        - Flight/Hotel selection
        - Dates (departure, return, check-in, check-out)
        - Number of passengers/guests
        - Personal information requirements
        - Total price breakdown
        - Cancellation and refund policies
        
        Never proceed with booking without explicit user confirmation.
        """;

    private static final String OUTPUT_INSTRUCTIONS = """
        Return a JSON response with:
        {
            "summary": "Clear summary of booking details",
            "itemsFound": 1,
            "recommendations": "What the user needs to do next"
        }
        """;

    public BookingWorker(ChatClient.Builder builder,
                        @Qualifier("customSyncMcpToolCallbackProvider") ToolCallbackProvider toolCallbackProvider,
                        ToolResultCollector toolResultCollector) {
        this.toolResultCollector = toolResultCollector;
        this.chatClient = builder
            .defaultSystem(SYSTEM_PROMPT)
            .defaultToolCallbacks(toolCallbackProvider)
            .build();
    }

    @Override
    public String getWorkerName() {
        return WORKER_NAME;
    }

    @Override
    public String getSystemPrompt() {
        return SYSTEM_PROMPT;
    }

    @Override
    public String getOutputInstructions() {
        return OUTPUT_INSTRUCTIONS;
    }

    /**
     * Validates booking details and prepares for execution.
     *
     * @param userRequest Original user request for context
     * @param parameters Booking parameters (flight/hotel IDs, passenger info, etc.)
     * @return Validation results and next steps
     */
    public WorkerResponse validate(String userRequest, Map<String, Object> parameters) {
        toolResultCollector.clear();

        try {
            String validationPrompt = buildWorkerPrompt(
                """
                User wants to make a booking.
                
                Validate that we have all required information for booking:
                1. Service type (flight/hotel)
                2. Service ID or selection details
                3. Dates
                4. Guest/passenger information
                5. Contact details
                6. Payment method (if required)
                
                Check for any missing information and guide the user.
                """,
                userRequest,
                parameters,
                OUTPUT_INSTRUCTIONS
            );

            String response = chatClient.prompt(validationPrompt)
                .call()
                .content();

            List<StructuredResultItem> results = toolResultCollector.consume();

            return WorkerResponse.success(WORKER_NAME, response, results);
        } catch (Exception e) {
            return WorkerResponse.failure(WORKER_NAME, "Failed to validate booking: " + e.getMessage());
        } finally {
            toolResultCollector.clear();
        }
    }

    /**
     * Creates a booking (placeholder for future MCP tool integration).
     *
     * @param userRequest Original user request
     * @param parameters Confirmed booking parameters
     * @return Booking creation result
     */
    public WorkerResponse createBooking(String userRequest, Map<String, Object> parameters) {
        // TODO: This will be implemented when booking-service MCP tool is available
        return WorkerResponse.failure(
            "BOOKING_EXECUTOR",
            "Booking creation feature is coming soon! For now, please use the web interface to complete your booking."
        );
    }
}
