package com.pdh.customer.viewmodel;

import jakarta.validation.constraints.NotNull;
import java.util.Map;

public record CustomerAttributesRequestVm(
        @NotNull(message = "Attributes cannot be null")
        Map<String, String> attributes
) {
}
