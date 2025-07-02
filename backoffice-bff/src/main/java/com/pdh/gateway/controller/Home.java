package com.pdh.gateway.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@Controller
public class Home {
    @GetMapping({ "/", "/home" })
    public String home(Principal principal) {
        return principal != null ? "redirect:/user" : "home";
    }
}
