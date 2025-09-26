package com.pdh.ai.controller;

import com.pdh.ai.ChatRequest;
import com.pdh.ai.service.AiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
@RestController
public class ChatController {
    private final AiService aiService;

    public ChatController(AiService aiService) {
        this.aiService = aiService;
    }



    @PostMapping("/chat/message")
    public ResponseEntity<Map<String, Object>> sendMessage(@RequestBody ChatRequest chatRequest) {
        try
        {String response = aiService.complete(chatRequest.getMessage());
        Map<String, Object> map = new HashMap<>();
        map.put("userMessage", chatRequest.getMessage());
        map.put("aiResponse", response);
        return ResponseEntity.ok(map);
        }
        catch (Exception e)
        {
            System.out.println("Error: " + e.getMessage());
            Map<String, Object> map = new HashMap<>();
            map.put("error", e.getMessage());
            return ResponseEntity.status(500).body(map);
        }
    }
}
