package com.soutenza.jury.dto;

import com.soutenza.jury.domain.JuryRole;

public record JuryAssignmentResponse(
        Long id,
        Long defenseId,
        Long teacherId,
        String teacherName,
        JuryRole juryRole
) {
}
