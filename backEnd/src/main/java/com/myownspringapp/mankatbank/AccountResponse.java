package com.myownspringapp.mankatbank;

public record AccountResponse(
        Long id,
        String ownerName,
        long balance,
        Long userId
) {}
