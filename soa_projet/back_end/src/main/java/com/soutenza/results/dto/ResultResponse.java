package com.soutenza.results.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ResultResponse(
        Long defenseId,
        String subject,
        String description,
        String studentName,
        String supervisorName,
        String roomName,
        LocalDateTime startDateTime,
        LocalDateTime endDateTime,
        String status,
        String publicationStatus,
        BigDecimal finalAverage,
        String finalMention,
        LocalDateTime publishedAt,
        Long publishedBy,
        List<ResultGradeResponse> grades
) {
}
