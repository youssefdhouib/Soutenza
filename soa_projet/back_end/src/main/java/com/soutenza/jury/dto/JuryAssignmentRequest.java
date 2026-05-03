package com.soutenza.jury.dto;

import com.soutenza.jury.domain.JuryRole;
import jakarta.validation.constraints.NotNull;

public record JuryAssignmentRequest(
        @NotNull Long teacherId,
        @NotNull JuryRole juryRole
) {
}
