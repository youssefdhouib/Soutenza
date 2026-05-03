package com.soutenza.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RegisterStudentRequest(
        @NotBlank String studentCode,
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotBlank @Email String email,
        @NotBlank String department,
        @NotBlank String level
) {
}
