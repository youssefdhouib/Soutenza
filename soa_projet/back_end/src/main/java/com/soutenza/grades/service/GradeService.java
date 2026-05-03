package com.soutenza.grades.service;

import com.soutenza.common.exception.ApiException;
import com.soutenza.common.util.MentionRules;
import com.soutenza.defenses.domain.Defense;
import com.soutenza.defenses.repository.DefenseRepository;
import com.soutenza.grades.domain.Grade;
import com.soutenza.grades.dto.GradeRequest;
import com.soutenza.grades.dto.GradeResponse;
import com.soutenza.grades.repository.GradeRepository;
import com.soutenza.jury.domain.DefenseJuryAssignment;
import com.soutenza.jury.repository.DefenseJuryAssignmentRepository;
import com.soutenza.teachers.domain.Teacher;
import com.soutenza.teachers.repository.TeacherRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
public class GradeService {

    private final GradeRepository gradeRepository;
    private final DefenseJuryAssignmentRepository assignmentRepository;
    private final TeacherRepository teacherRepository;
    private final DefenseRepository defenseRepository;

    public GradeService(GradeRepository gradeRepository,
                        DefenseJuryAssignmentRepository assignmentRepository,
                        TeacherRepository teacherRepository,
                        DefenseRepository defenseRepository) {
        this.gradeRepository = gradeRepository;
        this.assignmentRepository = assignmentRepository;
        this.teacherRepository = teacherRepository;
        this.defenseRepository = defenseRepository;
    }

    public List<GradeResponse> findByDefense(Long defenseId) {
        return gradeRepository.findByDefenseIdOrderByIdAsc(defenseId).stream().map(this::toResponse).toList();
    }

    @Transactional
    public GradeResponse create(Long defenseId, GradeRequest request, Long userId) {
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException("TEACHER_PROFILE_MISSING", HttpStatus.FORBIDDEN, "Profil enseignant requis"));

        DefenseJuryAssignment assignment = assignmentRepository.findByDefenseIdAndTeacherId(defenseId, teacher.getId())
                .orElseThrow(() -> new ApiException("ASSIGNMENT_NOT_FOUND", HttpStatus.FORBIDDEN, "Vous n'etes pas affecte a cette soutenance"));

        if (gradeRepository.findByAssignmentId(assignment.getId()).isPresent()) {
            throw new ApiException("GRADE_ALREADY_EXISTS", HttpStatus.CONFLICT, "La note existe deja, utilisez la mise a jour");
        }

        Grade grade = new Grade();
        grade.setDefense(assignment.getDefense());
        grade.setAssignment(assignment);
        grade.setScore(request.score());
        grade.setComment(request.comment());

        Grade saved = gradeRepository.save(grade);
        recomputeDefenseAverage(defenseId);
        return toResponse(saved);
    }

    @Transactional
    public GradeResponse update(Long defenseId, Long gradeId, GradeRequest request, Long userId) {
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException("TEACHER_PROFILE_MISSING", HttpStatus.FORBIDDEN, "Profil enseignant requis"));

        Grade grade = gradeRepository.findById(gradeId)
                .orElseThrow(() -> new ApiException("GRADE_NOT_FOUND", HttpStatus.NOT_FOUND, "Note introuvable"));

        if (!grade.getDefense().getId().equals(defenseId)) {
            throw new ApiException("GRADE_DEFENSE_MISMATCH", HttpStatus.BAD_REQUEST, "La note ne correspond pas a la soutenance");
        }

        if (!grade.getAssignment().getTeacher().getId().equals(teacher.getId())) {
            throw new ApiException("FORBIDDEN_GRADE_UPDATE", HttpStatus.FORBIDDEN, "Vous ne pouvez modifier que vos propres notes");
        }

        grade.setScore(request.score());
        grade.setComment(request.comment());
        Grade saved = gradeRepository.save(grade);

        recomputeDefenseAverage(defenseId);
        return toResponse(saved);
    }

    private void recomputeDefenseAverage(Long defenseId) {
        Defense defense = defenseRepository.findById(defenseId)
                .orElseThrow(() -> new ApiException("DEFENSE_NOT_FOUND", HttpStatus.NOT_FOUND, "Soutenance introuvable"));

        List<Grade> grades = gradeRepository.findByDefenseIdOrderByIdAsc(defenseId);
        if (grades.isEmpty()) {
            defense.setFinalAverage(null);
            defense.setFinalMention(null);
        } else {
            BigDecimal sum = grades.stream()
                    .map(Grade::getScore)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal average = sum.divide(BigDecimal.valueOf(grades.size()), 2, RoundingMode.HALF_UP);
            defense.setFinalAverage(average);
            defense.setFinalMention(MentionRules.resolveMention(average));
        }

        defenseRepository.save(defense);
    }

    private GradeResponse toResponse(Grade grade) {
        return new GradeResponse(
                grade.getId(),
                grade.getDefense().getId(),
                grade.getAssignment().getId(),
                grade.getAssignment().getTeacher().getId(),
                grade.getAssignment().getTeacher().getFirstName() + " " + grade.getAssignment().getTeacher().getLastName(),
                grade.getAssignment().getJuryRole().name(),
                grade.getScore(),
                grade.getComment(),
                grade.getSubmittedAt(),
                grade.getUpdatedAt()
        );
    }
}
