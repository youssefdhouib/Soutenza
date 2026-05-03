package com.soutenza.auth.dto;

import com.soutenza.users.domain.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RegisterTeacherRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotBlank @Email String email,
        @NotBlank String rank,
        @NotBlank String specialty,
        @NotNull Role role   // JURY_MEMBER or SUPERVISOR
) {
}
