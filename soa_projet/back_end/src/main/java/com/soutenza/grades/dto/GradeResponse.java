package com.soutenza.grades.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record GradeResponse(
        Long id,
        Long defenseId,
        Long assignmentId,
        Long teacherId,
        String teacherName,
        String juryRole,
        BigDecimal score,
        String comment,
        LocalDateTime submittedAt,
        LocalDateTime updatedAt
) {
}
