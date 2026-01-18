package com.myownspringapp.mankatbank;

public record TransferRequest(Long fromId, Long toId, long amount) {}
