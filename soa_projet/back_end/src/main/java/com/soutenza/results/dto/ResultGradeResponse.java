package com.soutenza.results.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ResultGradeResponse(
        Long teacherId,
        String teacherName,
        String juryRole,
        BigDecimal score,
        String comment,
        LocalDateTime submittedAt
) {
}
