package com.soutenza.jury.service;

import com.soutenza.common.exception.ApiException;
import com.soutenza.conflicts.service.ConflictCheckingService;
import com.soutenza.defenses.domain.Defense;
import com.soutenza.defenses.service.DefenseService;
import com.soutenza.jury.domain.DefenseJuryAssignment;
import com.soutenza.jury.domain.JuryRole;
import com.soutenza.jury.dto.JuryAssignmentRequest;
import com.soutenza.jury.dto.JuryAssignmentResponse;
import com.soutenza.jury.repository.DefenseJuryAssignmentRepository;
import com.soutenza.teachers.domain.Teacher;
import com.soutenza.teachers.repository.TeacherRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class JuryAssignmentService {

    private final DefenseService defenseService;
    private final TeacherRepository teacherRepository;
    private final DefenseJuryAssignmentRepository assignmentRepository;
    private final ConflictCheckingService conflictCheckingService;

    public JuryAssignmentService(DefenseService defenseService,
                                 TeacherRepository teacherRepository,
                                 DefenseJuryAssignmentRepository assignmentRepository,
                                 ConflictCheckingService conflictCheckingService) {
        this.defenseService = defenseService;
        this.teacherRepository = teacherRepository;
        this.assignmentRepository = assignmentRepository;
        this.conflictCheckingService = conflictCheckingService;
    }

    public List<JuryAssignmentResponse> findByDefense(Long defenseId) {
        return assignmentRepository.findByDefenseIdOrderByIdAsc(defenseId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public List<JuryAssignmentResponse> replaceAssignments(Long defenseId, List<JuryAssignmentRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            throw new ApiException("JURY_ASSIGNMENT_REQUIRED", HttpStatus.BAD_REQUEST, "Affectations jury manquantes");
        }

        long presidentCount = requests.stream().filter(r -> r.juryRole() == JuryRole.PRESIDENT).count();
        long rapporteurCount = requests.stream().filter(r -> r.juryRole() == JuryRole.RAPPORTEUR).count();
        long examinateurCount = requests.stream().filter(r -> r.juryRole() == JuryRole.EXAMINATEUR).count();

        if (presidentCount > 1) {
            throw new ApiException("TOO_MANY_PRESIDENTS", HttpStatus.BAD_REQUEST, "Une seule presidence est autorisee");
        }
        if (rapporteurCount > 1) {
            throw new ApiException("TOO_MANY_RAPPORTEURS", HttpStatus.BAD_REQUEST, "Un seul rapporteur est autorise");
        }
        if (examinateurCount < 1) {
            throw new ApiException("EXAMINATEUR_REQUIRED", HttpStatus.BAD_REQUEST, "Au moins un examinateur est requis");
        }

        Set<Long> uniqueTeachers = new HashSet<>();
        requests.forEach(request -> {
            if (!uniqueTeachers.add(request.teacherId())) {
                throw new ApiException("DUPLICATE_TEACHER", HttpStatus.BAD_REQUEST, "Un enseignant ne peut etre assigne qu'une fois");
            }
        });

        Defense defense = defenseService.getEntity(defenseId);

        requests.forEach(request -> conflictCheckingService.validateJuryMemberAvailability(
                request.teacherId(),
                defense.getStartDateTime(),
                defense.getEndDateTime(),
                defenseId
        ));

        assignmentRepository.deleteByDefenseId(defenseId);

        List<DefenseJuryAssignment> created = requests.stream().map(request -> {
            Teacher teacher = teacherRepository.findById(request.teacherId())
                    .orElseThrow(() -> new ApiException("TEACHER_NOT_FOUND", HttpStatus.NOT_FOUND, "Enseignant introuvable"));

            DefenseJuryAssignment assignment = new DefenseJuryAssignment();
            assignment.setDefense(defense);
            assignment.setTeacher(teacher);
            assignment.setJuryRole(request.juryRole());
            return assignment;
        }).map(assignmentRepository::save).toList();

        return created.stream().map(this::toResponse).toList();
    }

    private JuryAssignmentResponse toResponse(DefenseJuryAssignment assignment) {
        return new JuryAssignmentResponse(
                assignment.getId(),
                assignment.getDefense().getId(),
                assignment.getTeacher().getId(),
                assignment.getTeacher().getFirstName() + " " + assignment.getTeacher().getLastName(),
                assignment.getJuryRole()
        );
    }
}
