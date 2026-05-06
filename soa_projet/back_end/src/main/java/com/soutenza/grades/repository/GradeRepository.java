package com.soutenza.grades.repository;

import com.soutenza.grades.domain.Grade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface GradeRepository extends JpaRepository<Grade, Long> {

    List<Grade> findByDefenseIdOrderByIdAsc(Long defenseId);

    Optional<Grade> findByAssignmentId(Long assignmentId);

    long countByDefenseId(Long defenseId);

    @Query("""
            select count(distinct g.assignment.juryRole)
            from Grade g
            where g.defense.id = :defenseId
            """)
    long countDistinctJuryRolesByDefenseId(@Param("defenseId") Long defenseId);
}
