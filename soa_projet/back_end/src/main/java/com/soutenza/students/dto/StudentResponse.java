package com.soutenza.students.dto;

public record StudentResponse(
        Long id,
        String studentCode,
        String firstName,
        String lastName,
        String email,
        String department,
        String level,
        boolean active,
        Long userId
) {
}
