package com.pdh.common.client;

import com.pdh.common.exceptions.BadRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;

/**
 * Base class for inventory clients
 * Provides common error handling, timeout patterns, and retry logic
 * Centralized in common-lib for consistency across all inventory clients
 */
@RequiredArgsConstructor
@Slf4j
public abstract class BaseInventoryClient {

    protected final WebClient webClient;
    protected final Duration defaultTimeout = Duration.ofSeconds(10);

    /**
     * Executes a request with standardized error handling
     * 
     * @param uri The endpoint URI
     * @param request The request body
     * @param responseType The expected response type
     * @param operation Description of the operation for logging
     * @return The response object
     * @throws BadRequestException if the request fails
     */
    protected <T> T executeRequest(String uri, Object request, Class<T> responseType, String operation) {
        try {
            log.debug("Executing {} request to: {}", operation, uri);
            
            T response = webClient
                .post()
                .uri(uri)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(responseType)
                .timeout(defaultTimeout)
                .block();
                
            log.debug("{} request completed successfully", operation);
            return response;
            
        } catch (WebClientResponseException e) {
            log.error("{} failed with status: {}, body: {}", operation, e.getStatusCode(), e.getResponseBodyAsString());
            
            // Map HTTP status codes to appropriate exceptions
            switch (e.getStatusCode().value()) {
                case 400:
                    throw new BadRequestException(operation + " failed: Invalid request - " + e.getResponseBodyAsString());
                case 404:
                    throw new BadRequestException(operation + " failed: Resource not found");
                case 503:
                    throw new BadRequestException(operation + " service temporarily unavailable");
                default:
                    throw new BadRequestException(operation + " failed: " + e.getMessage());
            }
        } catch (Exception e) {
            log.error("Error during {}: {}", operation, e.getMessage(), e);
            throw new BadRequestException(operation + " service unavailable: " + e.getMessage());
        }
    }

    /**
     * Executes a GET request with standardized error handling
     */
    protected <T> T executeGetRequest(String uri, Class<T> responseType, String operation) {
        try {
            log.debug("Executing {} GET request to: {}", operation, uri);
            
            T response = webClient
                .get()
                .uri(uri)
                .retrieve()
                .bodyToMono(responseType)
                .timeout(defaultTimeout)
                .block();
                
            log.debug("{} GET request completed successfully", operation);
            return response;
            
        } catch (WebClientResponseException e) {
            log.error("{} GET failed with status: {}, body: {}", operation, e.getStatusCode(), e.getResponseBodyAsString());
            throw new BadRequestException(operation + " failed: " + e.getMessage());
        } catch (Exception e) {
            log.error("Error during {} GET: {}", operation, e.getMessage(), e);
            throw new BadRequestException(operation + " service unavailable: " + e.getMessage());
        }
    }

    /**
     * Executes a request with retry logic
     */
    protected <T> T executeRequestWithRetry(String uri, Object request, Class<T> responseType, String operation, int maxRetries) {
        Exception lastException = null;
        
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                log.debug("Executing {} request (attempt {}/{})", operation, attempt, maxRetries);
                return executeRequest(uri, request, responseType, operation);
            } catch (Exception e) {
                lastException = e;
                log.warn("{} attempt {}/{} failed: {}", operation, attempt, maxRetries, e.getMessage());
                
                if (attempt < maxRetries) {
                    try {
                        // Exponential backoff: 100ms, 200ms, 400ms, etc.
                        Thread.sleep(100L * (1L << (attempt - 1)));
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new BadRequestException(operation + " interrupted during retry");
                    }
                }
            }
        }
        
        log.error("{} failed after {} attempts", operation, maxRetries);
        throw new BadRequestException(operation + " failed after " + maxRetries + " attempts: " + lastException.getMessage());
    }

    /**
     * Checks if an exception is retryable
     */
    protected boolean isRetryableException(Exception e) {
        if (e instanceof WebClientResponseException) {
            WebClientResponseException webEx = (WebClientResponseException) e;
            int statusCode = webEx.getStatusCode().value();
            // Retry on 5xx errors and 429 (Too Many Requests)
            return statusCode >= 500 || statusCode == 429;
        }
        // Retry on network-related exceptions
        return e.getCause() instanceof java.net.ConnectException ||
               e.getCause() instanceof java.net.SocketTimeoutException;
    }

    /**
     * Gets the service name for logging purposes
     */
    protected abstract String getServiceName();

    /**
     * Gets the base URL for the service
     */
    protected abstract String getBaseUrl();

    /**
     * Builds a full URL for the given endpoint
     */
    protected String buildUrl(String endpoint) {
        String baseUrl = getBaseUrl();
        if (baseUrl.endsWith("/") && endpoint.startsWith("/")) {
            return baseUrl + endpoint.substring(1);
        } else if (!baseUrl.endsWith("/") && !endpoint.startsWith("/")) {
            return baseUrl + "/" + endpoint;
        } else {
            return baseUrl + endpoint;
        }
    }

    /**
     * Validates that the client is properly configured
     */
    protected void validateConfiguration() {
        if (webClient == null) {
            throw new IllegalStateException("WebClient is not configured for " + getServiceName());
        }
        if (getBaseUrl() == null || getBaseUrl().trim().isEmpty()) {
            throw new IllegalStateException("Base URL is not configured for " + getServiceName());
        }
    }
}
