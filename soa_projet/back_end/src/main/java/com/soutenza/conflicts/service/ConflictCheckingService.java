package com.soutenza.conflicts.service;

import com.soutenza.common.exception.ApiException;
import com.soutenza.defenses.domain.DefenseStatus;
import com.soutenza.defenses.repository.DefenseRepository;
import com.soutenza.jury.repository.DefenseJuryAssignmentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class ConflictCheckingService {

    private final DefenseRepository defenseRepository;
    private final DefenseJuryAssignmentRepository assignmentRepository;

    public ConflictCheckingService(DefenseRepository defenseRepository, DefenseJuryAssignmentRepository assignmentRepository) {
        this.defenseRepository = defenseRepository;
        this.assignmentRepository = assignmentRepository;
    }

    public void validateCoreConflicts(Long ignoreDefenseId,
                                      Long studentId,
                                      Long supervisorId,
                                      Long roomId,
                                      LocalDateTime start,
                                      LocalDateTime end) {
        validateInterval(start, end);

        if (defenseRepository.existsRoomConflict(roomId, start, end, ignoreDefenseId, DefenseStatus.CANCELLED)) {
            throw conflict("ROOM_CONFLICT", "La salle est deja occupee sur ce creneau", "room");
        }

        if (defenseRepository.existsStudentConflict(studentId, start, end, ignoreDefenseId, DefenseStatus.CANCELLED)) {
            throw conflict("STUDENT_CONFLICT", "L'etudiant est deja planifie sur ce creneau", "student");
        }

        if (defenseRepository.existsSupervisorConflict(supervisorId, start, end, ignoreDefenseId, DefenseStatus.CANCELLED)) {
            throw conflict("SUPERVISOR_CONFLICT", "L'encadrant a deja une soutenance sur ce creneau", "supervisor");
        }
    }

    public void validateJuryMemberAvailability(Long teacherId,
                                               LocalDateTime start,
                                               LocalDateTime end,
                                               Long ignoreDefenseId) {
        validateInterval(start, end);

        if (assignmentRepository.existsTeacherConflict(
                teacherId,
                start,
                end,
                ignoreDefenseId,
                DefenseStatus.CANCELLED
        )) {
            throw conflict("JURY_CONFLICT", "Le membre du jury est deja engage sur ce creneau", "juryMember");
        }
    }

    private void validateInterval(LocalDateTime start, LocalDateTime end) {
        if (start == null || end == null || !start.isBefore(end)) {
            throw new ApiException("INVALID_TIMESLOT", HttpStatus.BAD_REQUEST, "Le creneau horaire est invalide");
        }
    }

    private ApiException conflict(String code, String message, String conflictType) {
        Map<String, Object> details = new LinkedHashMap<>();
        details.put("conflictType", conflictType);
        return new ApiException(code, HttpStatus.CONFLICT, message, details);
    }
}
