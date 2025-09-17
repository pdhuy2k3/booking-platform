package com.pdh.customer.viewmodel;

import jakarta.validation.constraints.NotBlank;

public record CustomerSingleAttributeRequestVm(
        @NotBlank(message = "Value cannot be blank")
        String value
) {
}
