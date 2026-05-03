package com.soutenza.teachers.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record TeacherRequest(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotBlank @Email String email,
        @NotBlank String rank,
        @NotBlank String specialty,
        Boolean active,
        Long userId
) {
}
