package com.soutenza.auth.dto;

import java.util.Set;

public record LoginResponse(
        String token,
        Long userId,
        String email,
        Set<String> roles,
        boolean active
) {
}
