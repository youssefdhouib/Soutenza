package com.soutenza.defenses.dto;

import com.soutenza.defenses.domain.DefenseStatus;
import com.soutenza.defenses.domain.PublicationStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record DefenseResponse(
        Long id,
        String subject,
        String description,
        Long studentId,
        String studentName,
        Long supervisorId,
        String supervisorName,
        Long roomId,
        String roomName,
        LocalDateTime startDateTime,
        LocalDateTime endDateTime,
        DefenseStatus status,
        PublicationStatus publicationStatus,
        BigDecimal finalAverage,
        String finalMention,
        LocalDateTime publishedAt,
        Long publishedBy,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
