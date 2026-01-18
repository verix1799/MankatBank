package com.myownspringapp.mankatbank.auth;

public record LoginRequest(
        String email,
        String password
) {}
