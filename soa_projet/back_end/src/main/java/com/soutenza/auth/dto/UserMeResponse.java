package com.soutenza.auth.dto;

import java.util.Set;

public record UserMeResponse(
        Long id,
        String email,
        Set<String> roles,
        boolean active
) {
}
