package com.pdh.gateway.controller;

import lombok.Getter;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController

public class Hello {
    @GetMapping("/hello")
    public String hello() {
        return "Hello, World!";
    }
}
