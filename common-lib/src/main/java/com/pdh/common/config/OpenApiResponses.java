package com.pdh.common.config;

import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Common OpenAPI response annotations for BookingSmart services
 */
public class OpenApiResponses {

    /**
     * Standard success response
     */
    @Target({ElementType.METHOD, ElementType.TYPE})
    @Retention(RetentionPolicy.RUNTIME)
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Operation successful",
                    content = @Content(schema = @Schema(implementation = com.pdh.common.dto.response.ApiResponse.class))),
            @ApiResponse(responseCode = "400", description = "Bad request - invalid input parameters",
                    content = @Content(schema = @Schema(implementation = com.pdh.common.dto.response.ApiResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required",
                    content = @Content(schema = @Schema(implementation = com.pdh.common.dto.response.ApiResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions",
                    content = @Content(schema = @Schema(implementation = com.pdh.common.dto.response.ApiResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error",
                    content = @Content(schema = @Schema(implementation = com.pdh.common.dto.response.ApiResponse.class)))
    })
    public @interface StandardApiResponses {
    }

    /**
     * Response for endpoints that can return 404 Not Found
     */
    @Target({ElementType.METHOD, ElementType.TYPE})
    @Retention(RetentionPolicy.RUNTIME)
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Operation successful",
                    content = @Content(schema = @Schema(implementation = com.pdh.common.dto.response.ApiResponse.class))),
            @ApiResponse(responseCode = "400", description = "Bad request - invalid input parameters",
                    content = @Content(schema = @Schema(implementation = com.pdh.common.dto.response.ApiResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required",
                    content = @Content(schema = @Schema(implementation = com.pdh.common.dto.response.ApiResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions",
                    content = @Content(schema = @Schema(implementation = com.pdh.common.dto.response.ApiResponse.class))),
            @ApiResponse(responseCode = "404", description = "Resource not found",
                    content = @Content(schema = @Schema(implementation = com.pdh.common.dto.response.ApiResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error",
                    content = @Content(schema = @Schema(implementation = com.pdh.common.dto.response.ApiResponse.class)))
    })
    public @interface StandardApiResponsesWithNotFound {
    }

    /**
     * Response for creation endpoints (POST)
     */
    @Target({ElementType.METHOD, ElementType.TYPE})
    @Retention(RetentionPolicy.RUNTIME)
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Resource created successfully",
                    content = @Content(schema = @Schema(implementation = com.pdh.common.dto.response.ApiResponse.class))),
            @ApiResponse(responseCode = "400", description = "Bad request - invalid input parameters",
                    content = @Content(schema = @Schema(implementation = com.pdh.common.dto.response.ApiResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required",
                    content = @Content(schema = @Schema(implementation = com.pdh.common.dto.response.ApiResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions",
                    content = @Content(schema = @Schema(implementation = com.pdh.common.dto.response.ApiResponse.class))),
            @ApiResponse(responseCode = "409", description = "Conflict - resource already exists",
                    content = @Content(schema = @Schema(implementation = com.pdh.common.dto.response.ApiResponse.class))),
            @ApiResponse(responseCode = "422", description = "Unprocessable entity - business logic validation failed",
                    content = @Content(schema = @Schema(implementation = com.pdh.common.dto.response.ApiResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error",
                    content = @Content(schema = @Schema(implementation = com.pdh.common.dto.response.ApiResponse.class)))
    })
    public @interface CreationApiResponses {
    }

    /**
     * Response for update endpoints (PUT/PATCH)
     */
    @Target({ElementType.METHOD, ElementType.TYPE})
    @Retention(RetentionPolicy.RUNTIME)
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Resource updated successfully",
                    content = @Content(schema = @Schema(implementation = com.pdh.common.dto.response.ApiResponse.class))),
            @ApiResponse(responseCode = "400", description = "Bad request - invalid input parameters",
                    content = @Content(schema = @Schema(implementation = com.pdh.common.dto.response.ApiResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required",
                    content = @Content(schema = @Schema(implementation = com.pdh.common.dto.response.ApiResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions",
                    content = @Content(schema = @Schema(implementation = com.pdh.common.dto.response.ApiResponse.class))),
            @ApiResponse(responseCode = "404", description = "Resource not found",
                    content = @Content(schema = @Schema(implementation = com.pdh.common.dto.response.ApiResponse.class))),
            @ApiResponse(responseCode = "422", description = "Unprocessable entity - business logic validation failed",
                    content = @Content(schema = @Schema(implementation = com.pdh.common.dto.response.ApiResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error",
                    content = @Content(schema = @Schema(implementation = com.pdh.common.dto.response.ApiResponse.class)))
    })
    public @interface UpdateApiResponses {
    }

    /**
     * Response for deletion endpoints (DELETE)
     */
    @Target({ElementType.METHOD, ElementType.TYPE})
    @Retention(RetentionPolicy.RUNTIME)
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Resource deleted successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required",
                    content = @Content(schema = @Schema(implementation = com.pdh.common.dto.response.ApiResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions",
                    content = @Content(schema = @Schema(implementation = com.pdh.common.dto.response.ApiResponse.class))),
            @ApiResponse(responseCode = "404", description = "Resource not found",
                    content = @Content(schema = @Schema(implementation = com.pdh.common.dto.response.ApiResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error",
                    content = @Content(schema = @Schema(implementation = com.pdh.common.dto.response.ApiResponse.class)))
    })
    public @interface DeletionApiResponses {
    }

    /**
     * Response for paginated list endpoints
     */
    @Target({ElementType.METHOD, ElementType.TYPE})
    @Retention(RetentionPolicy.RUNTIME)
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "List retrieved successfully",
                    content = @Content(schema = @Schema(implementation = com.pdh.common.dto.response.PagedResponse.class))),
            @ApiResponse(responseCode = "400", description = "Bad request - invalid query parameters",
                    content = @Content(schema = @Schema(implementation = com.pdh.common.dto.response.ApiResponse.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized - authentication required",
                    content = @Content(schema = @Schema(implementation = com.pdh.common.dto.response.ApiResponse.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden - insufficient permissions",
                    content = @Content(schema = @Schema(implementation = com.pdh.common.dto.response.ApiResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error",
                    content = @Content(schema = @Schema(implementation = com.pdh.common.dto.response.ApiResponse.class)))
    })
    public @interface PaginatedApiResponses {
    }
}