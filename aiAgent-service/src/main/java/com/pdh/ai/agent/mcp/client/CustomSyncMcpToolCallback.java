package com.pdh.ai.agent.mcp.client;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.ai.model.dto.StructuredResultItem;
import com.pdh.ai.service.ToolResultCollector;
import io.modelcontextprotocol.client.McpSyncClient;
import io.modelcontextprotocol.spec.McpSchema;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.mcp.SyncMcpToolCallback;
import org.springframework.ai.model.ModelOptionsUtils;
import org.springframework.ai.tool.definition.DefaultToolDefinition;
import org.springframework.ai.tool.execution.ToolExecutionException;
import org.springframework.context.annotation.Primary;
import org.springframework.lang.NonNull;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Primary
public class CustomSyncMcpToolCallback extends SyncMcpToolCallback {
    
    private final McpSyncClient mcpClient;
    private final McpSchema.Tool tool;
    private final ObjectMapper objectMapper;
    private final ToolResultCollector toolResultCollector;

    public CustomSyncMcpToolCallback(McpSyncClient mcpClient, McpSchema.Tool tool, ToolResultCollector toolResultCollector) {
        super(mcpClient, tool);
        this.mcpClient = mcpClient;
        this.tool = tool;
        this.toolResultCollector = toolResultCollector;
        this.objectMapper = new ObjectMapper();
    }

    @Override
    @NonNull
    public String call(@NonNull String functionInput) {
        Map<String, Object> arguments = ModelOptionsUtils.jsonToMap(functionInput);
        McpSchema.CallToolResult response = this.mcpClient.callTool(new McpSchema.CallToolRequest(this.tool.name(), arguments));
        if (response.isError() != null && response.isError()) {
            log.warn("tools exec response error: {}", response);

            String inputSchemaJson;
            try {
                inputSchemaJson = objectMapper.writeValueAsString(tool.inputSchema());
            } catch (JsonProcessingException e) {
                log.warn("Failed to serialize tool input schema", e);
                inputSchemaJson = "{}";
            }

            throw new ToolExecutionException(new DefaultToolDefinition(tool.name(), tool.description(),
                    inputSchemaJson), new IllegalStateException("Error calling tool: " + response.content()));
        }

        String jsonPayload = ModelOptionsUtils.toJsonString(response.content());
        captureStructuredResults(jsonPayload);
        return jsonPayload;
    }

    private void captureStructuredResults(String jsonPayload) {
        try {
            List<Map<String, Object>> contentEntries = objectMapper.readValue(jsonPayload, new TypeReference<List<Map<String, Object>>>() {
            });
            List<StructuredResultItem> aggregatedItems = new ArrayList<>();

            for (Map<String, Object> entry : contentEntries) {
                Object jsonNode = entry.get("json");
                if (jsonNode == null) {
                    jsonNode = entry.get("text");
                }

                if (jsonNode instanceof Map<?, ?> mapValue) {
                    aggregatedItems.addAll(mapToolResponse((Map<String, Object>) mapValue));
                } else if (jsonNode instanceof List<?> listValue) {
                    listValue.stream()
                            .filter(Map.class::isInstance)
                            .map(item -> (Map<String, Object>) item)
                            .forEach(item -> aggregatedItems.addAll(mapToolResponse(item)));
                } else if (jsonNode instanceof String textValue) {
                    try {
                        Map<String, Object> parsed = objectMapper.readValue(textValue, new TypeReference<Map<String, Object>>() {
                        });
                        aggregatedItems.addAll(mapToolResponse(parsed));
                    } catch (JsonProcessingException ignored) {
                        log.debug("Tool response text is not JSON: {}", textValue);
                    }
                }
            }

            toolResultCollector.addResults(aggregatedItems);
        } catch (Exception ex) {
            log.warn("Failed to parse tool response for structured output: {}", ex.getMessage());
        }
    }

    private List<StructuredResultItem> mapToolResponse(Map<String, Object> payload) {
        return switch (this.tool.name()) {
            case "search_flights" -> mapFlights(payload);
            case "search_hotels" -> mapHotels(payload);
            default -> Collections.emptyList();
        };
    }

    @SuppressWarnings("unchecked")
    private List<StructuredResultItem> mapFlights(Map<String, Object> payload) {
        Object flightsNode = payload.get("flights");
        if (!(flightsNode instanceof List<?> flightsList)) {
            return Collections.emptyList();
        }

        return flightsList.stream()
                .filter(Map.class::isInstance)
                .map(entry -> (Map<String, Object>) entry)
                .map(flight -> {
                    String airline = stringValue(flight.get("airline"));
                    String flightNumber = stringValue(flight.get("flightNumber"));
                    String origin = stringValue(flight.get("origin"));
                    String destination = stringValue(flight.get("destination"));
                    String departure = stringValue(flight.get("departureTime"));
                    String arrival = stringValue(flight.get("arrivalTime"));
                    String duration = stringValue(flight.get("duration"));
                    String formattedPrice = stringValue(flight.get("formattedPrice"));
                    if (formattedPrice == null) {
                        formattedPrice = formatPrice(flight.get("price"), flight.get("currency"));
                    }

                    String title = List.of(airline, flightNumber).stream()
                            .filter(value -> value != null && !value.isBlank())
                            .collect(Collectors.joining(" "));
                    if (title.isBlank()) {
                        title = "Flight " + origin + " → " + destination;
                    }

                    String subtitle = String.format("%s → %s | %s - %s", origin, destination, departure, arrival);
                    String description = String.format("%s%s",
                            formattedPrice != null ? formattedPrice : "Giá chưa rõ",
                            duration != null && !duration.isBlank() ? " • " + duration : "");

                    return StructuredResultItem.builder()
                            .type("flight")
                            .title(title)
                            .subtitle(subtitle)
                            .description(description)
                            .metadata(flight)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @SuppressWarnings("unchecked")
    private List<StructuredResultItem> mapHotels(Map<String, Object> payload) {
        Object hotelNode = payload.get("hotels");
        if (!(hotelNode instanceof List<?> hotelsList)) {
            return Collections.emptyList();
        }

        return hotelsList.stream()
                .filter(Map.class::isInstance)
                .map(entry -> (Map<String, Object>) entry)
                .map(hotel -> {
                    String name = stringValue(hotel.get("name"));
                    String city = stringValue(hotel.get("city"));
                    String country = stringValue(hotel.get("country"));
                    String imageUrl = stringValue(hotel.get("primaryImage"));
                    String price = formatPrice(hotel.get("pricePerNight"), hotel.get("currency"));
                    String rating = hotel.get("rating") != null ? hotel.get("rating").toString() : null;

                    String subtitle = List.of(city, country).stream()
                            .filter(value -> value != null && !value.isBlank())
                            .collect(Collectors.joining(", "));
                    String description = price != null ? "Giá mỗi đêm: " + price : null;
                    if (rating != null && !rating.isBlank()) {
                        description = (description != null ? description + " • " : "") + "Đánh giá: " + rating + "/5";
                    }

                    return StructuredResultItem.builder()
                            .type("hotel")
                            .title(name != null ? name : "Khách sạn")
                            .subtitle(subtitle)
                            .description(description)
                            .imageUrl(imageUrl)
                            .metadata(hotel)
                            .build();
                })
                .collect(Collectors.toList());
    }

    private String stringValue(Object value) {
        if (value == null) {
            return null;
        }
        return String.valueOf(value);
    }

    private String formatPrice(Object amount, Object currency) {
        if (amount == null) {
            return null;
        }
        String currencyCode = currency != null ? String.valueOf(currency) : "VND";
        if (amount instanceof Number number) {
            return String.format("%,.0f %s", number.doubleValue(), currencyCode);
        }
        if (amount instanceof BigDecimal bigDecimal) {
            return String.format("%,.0f %s", bigDecimal.doubleValue(), currencyCode);
        }
        return amount.toString() + " " + currencyCode;
    }
}
