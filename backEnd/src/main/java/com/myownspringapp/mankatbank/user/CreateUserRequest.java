package com.myownspringapp.mankatbank.user;

public record CreateUserRequest(
        String email,
        String fullName,
        String password
) {}
