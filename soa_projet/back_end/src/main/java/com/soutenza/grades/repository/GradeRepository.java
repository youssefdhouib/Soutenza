package com.soutenza.grades.repository;

import com.soutenza.grades.domain.Grade;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GradeRepository extends JpaRepository<Grade, Long> {

    List<Grade> findByDefenseIdOrderByIdAsc(Long defenseId);

    Optional<Grade> findByAssignmentId(Long assignmentId);
}
