package com.myownspringapp.mankatbank.auth;

public record UserResponse(
        Long id,
        String email,
        String fullName
) {}
