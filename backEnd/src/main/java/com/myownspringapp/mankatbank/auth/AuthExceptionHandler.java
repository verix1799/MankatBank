package com.myownspringapp.mankatbank.auth;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestControllerAdvice
public class AuthExceptionHandler {

    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    @ExceptionHandler(RuntimeException.class)
    public Map<String, String> handleRuntime(RuntimeException ex) {
        // Keep it simple for now
        if ("Invalid credentials".equals(ex.getMessage())) {
            return Map.of("message", "Invalid credentials");
        }
        throw ex; // let other runtime exceptions behave normally
    }
}
