package com.soutenza.defenses.dto;

import com.soutenza.defenses.domain.DefenseStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record DefenseRequest(
        @NotBlank String subject,
        @NotBlank String description,
        @NotNull Long studentId,
        @NotNull Long supervisorId,
        @NotNull Long roomId,
        @NotNull LocalDateTime startDateTime,
        @NotNull LocalDateTime endDateTime,
        DefenseStatus status
) {
}
