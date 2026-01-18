package com.myownspringapp.mankatbank.auth;

public record LoginResponse(
        Long userId,
        String email,
        String accessToken
) {}
