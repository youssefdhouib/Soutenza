package com.soutenza.results.service;

import com.soutenza.common.exception.ApiException;
import com.soutenza.defenses.domain.Defense;
import com.soutenza.defenses.domain.PublicationStatus;
import com.soutenza.defenses.repository.DefenseRepository;
import com.soutenza.grades.repository.GradeRepository;
import com.soutenza.jury.repository.DefenseJuryAssignmentRepository;
import com.soutenza.results.dto.ResultGradeResponse;
import com.soutenza.results.dto.ResultResponse;
import com.soutenza.students.repository.StudentRepository;
import com.soutenza.teachers.domain.Teacher;
import com.soutenza.teachers.repository.TeacherRepository;
import com.soutenza.users.domain.Role;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class ResultService {

    private final DefenseRepository defenseRepository;
    private final GradeRepository gradeRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final DefenseJuryAssignmentRepository assignmentRepository;

    public ResultService(DefenseRepository defenseRepository,
                         GradeRepository gradeRepository,
                         StudentRepository studentRepository,
                         TeacherRepository teacherRepository,
                         DefenseJuryAssignmentRepository assignmentRepository) {
        this.defenseRepository = defenseRepository;
        this.gradeRepository = gradeRepository;
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.assignmentRepository = assignmentRepository;
    }

    public List<ResultResponse> getMyPublishedResults(Long userId) {
        Long studentId = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException("STUDENT_PROFILE_MISSING", HttpStatus.NOT_FOUND, "Profil etudiant manquant"))
                .getId();

        return defenseRepository.findByStudentIdAndPublicationStatusOrderByStartDateTimeDesc(studentId, PublicationStatus.PUBLISHED)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ResultResponse getDefenseResultForPrivileged(Long defenseId, Long userId, Set<Role> roles) {
        Defense defense = defenseRepository.findById(defenseId)
                .orElseThrow(() -> new ApiException("DEFENSE_NOT_FOUND", HttpStatus.NOT_FOUND, "Soutenance introuvable"));

        if (roles.contains(Role.ADMIN)) {
            return toResponse(defense);
        }

        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException("TEACHER_PROFILE_MISSING", HttpStatus.FORBIDDEN, "Profil enseignant manquant"));

        if (roles.contains(Role.SUPERVISOR) && defense.getSupervisor().getId().equals(teacher.getId())) {
            return toResponse(defense);
        }

        if (roles.contains(Role.JURY_MEMBER)
                && assignmentRepository.findByDefenseIdAndTeacherId(defenseId, teacher.getId()).isPresent()) {
            return toResponse(defense);
        }

        throw new ApiException("FORBIDDEN_RESULT_ACCESS", HttpStatus.FORBIDDEN, "Acces interdit a ce resultat");
    }

    private ResultResponse toResponse(Defense defense) {
        List<ResultGradeResponse> grades = gradeRepository.findByDefenseIdOrderByIdAsc(defense.getId()).stream()
                .map(grade -> new ResultGradeResponse(
                        grade.getAssignment().getTeacher().getId(),
                        grade.getAssignment().getTeacher().getFirstName() + " " + grade.getAssignment().getTeacher().getLastName(),
                        grade.getAssignment().getJuryRole().name(),
                        grade.getScore(),
                        grade.getComment(),
                        grade.getSubmittedAt()
                ))
                .toList();

        return new ResultResponse(
                defense.getId(),
                defense.getSubject(),
                defense.getDescription(),
                defense.getStudent().getFirstName() + " " + defense.getStudent().getLastName(),
                defense.getSupervisor().getFirstName() + " " + defense.getSupervisor().getLastName(),
                defense.getRoom().getName(),
                defense.getStartDateTime(),
                defense.getEndDateTime(),
                defense.getStatus().name(),
                defense.getPublicationStatus().name(),
                defense.getFinalAverage(),
                defense.getFinalMention() != null ? defense.getFinalMention().getLabel() : null,
                defense.getPublishedAt(),
                defense.getPublishedBy() != null ? defense.getPublishedBy().getId() : null,
                grades
        );
    }
}
