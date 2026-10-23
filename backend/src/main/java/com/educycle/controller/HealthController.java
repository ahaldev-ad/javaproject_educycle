package com.educycle.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class HealthController {

    private final long startTime = System.currentTimeMillis();

    @RequestMapping(
        value = {"/health", "/healthz", "/api/health", "/ping"},
        method = {RequestMethod.GET, RequestMethod.HEAD}
    )
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "UP");
        response.put("service", "EduCycle-Backend");
        response.put("timestamp", Instant.now().toString());
        response.put("uptimeSeconds", (System.currentTimeMillis() - startTime) / 1000);
        return ResponseEntity.ok(response);
    }
}
