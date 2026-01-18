package com.myownspringapp.mankatbank.auth;

public record RegisterRequest(
        String email,
        String fullName,
        String password
) {}
