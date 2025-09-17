package com.pdh.customer.viewmodel;

public record AddressInfo(
    String street,
    String city,
    String state,
    String country,
    String postalCode
) {}
