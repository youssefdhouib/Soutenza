package com.soutenza.teachers.dto;

public record TeacherResponse(
        Long id,
        String firstName,
        String lastName,
        String email,
        String rank,
        String specialty,
        boolean active,
        Long userId
) {
}
