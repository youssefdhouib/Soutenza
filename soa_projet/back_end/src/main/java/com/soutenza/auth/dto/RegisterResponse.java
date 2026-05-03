package com.soutenza.auth.dto;

public record RegisterResponse(
        Long userId,
        String email,
        String message
) {
}
