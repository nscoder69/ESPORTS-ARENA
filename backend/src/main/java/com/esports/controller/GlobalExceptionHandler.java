package com.esports.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import java.util.Map;
import java.util.HashMap;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleException(Exception e) {
        e.printStackTrace(); // Log stack trace
        
        Map<String, String> response = new HashMap<>();
        response.put("error", e.getClass().getSimpleName());
        response.put("message", e.getMessage());
        
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        
        if (e instanceof RuntimeException || e instanceof IllegalArgumentException) {
            status = HttpStatus.BAD_REQUEST;
        }
        
        if (e instanceof org.springframework.web.server.ResponseStatusException) {
            org.springframework.web.server.ResponseStatusException rse = (org.springframework.web.server.ResponseStatusException) e;
            status = HttpStatus.valueOf(rse.getStatusCode().value());
            response.put("message", rse.getReason());
        }
        
        return ResponseEntity.status(status).body(response);
    }
}
