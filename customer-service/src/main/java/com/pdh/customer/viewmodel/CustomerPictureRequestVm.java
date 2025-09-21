package com.pdh.customer.viewmodel;

import jakarta.validation.constraints.NotBlank;

public record CustomerPictureRequestVm(
    @NotBlank(message = "Picture URL is required")
    String pictureUrl
) {
}
