package com.soutenza.publications.service;

import com.soutenza.common.exception.ApiException;
import com.soutenza.defenses.domain.Defense;
import com.soutenza.defenses.domain.DefenseStatus;
import com.soutenza.defenses.domain.PublicationStatus;
import com.soutenza.defenses.repository.DefenseRepository;
import com.soutenza.grades.repository.GradeRepository;
import com.soutenza.jury.repository.DefenseJuryAssignmentRepository;
import com.soutenza.jury.domain.JuryRole;
import com.soutenza.users.domain.User;
import com.soutenza.users.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class PublicationService {
    private static final int REQUIRED_REVIEWERS = 3;

    private final DefenseRepository defenseRepository;
    private final UserRepository userRepository;
    private final GradeRepository gradeRepository;
    private final DefenseJuryAssignmentRepository assignmentRepository;

    public PublicationService(DefenseRepository defenseRepository,
                              UserRepository userRepository,
                              GradeRepository gradeRepository,
                              DefenseJuryAssignmentRepository assignmentRepository) {
        this.defenseRepository = defenseRepository;
        this.userRepository = userRepository;
        this.gradeRepository = gradeRepository;
        this.assignmentRepository = assignmentRepository;
    }

    public Defense publish(Long defenseId, Long publisherUserId) {
        Defense defense = defenseRepository.findById(defenseId)
                .orElseThrow(() -> new ApiException("DEFENSE_NOT_FOUND", HttpStatus.NOT_FOUND, "Soutenance introuvable"));

        User publisher = userRepository.findById(publisherUserId)
                .orElseThrow(() -> new ApiException("USER_NOT_FOUND", HttpStatus.NOT_FOUND, "Utilisateur publication introuvable"));

        long gradedByCount = Math.min(gradeRepository.countByDefenseId(defenseId), REQUIRED_REVIEWERS);
        boolean hasPresident = assignmentRepository.existsByDefenseIdAndJuryRole(defenseId, JuryRole.PRESIDENT);
        boolean hasRapporteur = assignmentRepository.existsByDefenseIdAndJuryRole(defenseId, JuryRole.RAPPORTEUR);
        boolean hasExaminateur = assignmentRepository.existsByDefenseIdAndJuryRole(defenseId, JuryRole.EXAMINATEUR);

        if (!hasPresident || !hasRapporteur || !hasExaminateur) {
            throw new ApiException(
                    "INCOMPLETE_JURY",
                    HttpStatus.BAD_REQUEST,
                    "Impossible de publier: jury incomplet (president, rapporteur et examinateur requis)"
            );
        }
        if (gradedByCount < REQUIRED_REVIEWERS) {
            throw new ApiException(
                    "MISSING_GRADES",
                    HttpStatus.BAD_REQUEST,
                    "Impossible de publier: " + gradedByCount + "/" + REQUIRED_REVIEWERS + " enseignants ont note cette soutenance"
            );
        }

        defense.setPublicationStatus(PublicationStatus.PUBLISHED);
        defense.setStatus(DefenseStatus.PUBLISHED);
        defense.setPublishedAt(LocalDateTime.now());
        defense.setPublishedBy(publisher);

        return defenseRepository.save(defense);
    }
}
