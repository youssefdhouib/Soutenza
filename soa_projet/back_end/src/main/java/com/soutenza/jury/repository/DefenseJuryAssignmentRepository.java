package com.soutenza.jury.repository;

import com.soutenza.defenses.domain.DefenseStatus;
import com.soutenza.jury.domain.DefenseJuryAssignment;
import com.soutenza.jury.domain.JuryRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface DefenseJuryAssignmentRepository extends JpaRepository<DefenseJuryAssignment, Long> {

    List<DefenseJuryAssignment> findByDefenseIdOrderByIdAsc(Long defenseId);

    long countByDefenseId(Long defenseId);

    boolean existsByDefenseIdAndJuryRole(Long defenseId, JuryRole juryRole);

    void deleteByDefenseId(Long defenseId);

    Optional<DefenseJuryAssignment> findByDefenseIdAndTeacherId(Long defenseId, Long teacherId);

    @Query("""
            select (count(a) > 0)
            from DefenseJuryAssignment a
            where (:ignoreDefenseId is null or a.defense.id <> :ignoreDefenseId)
              and a.teacher.id = :teacherId
              and a.defense.status <> :cancelled
              and :startDateTime < a.defense.endDateTime
              and :endDateTime > a.defense.startDateTime
            """)
    boolean existsTeacherConflict(@Param("teacherId") Long teacherId,
                                  @Param("startDateTime") LocalDateTime startDateTime,
                                  @Param("endDateTime") LocalDateTime endDateTime,
                                  @Param("ignoreDefenseId") Long ignoreDefenseId,
                                  @Param("cancelled") DefenseStatus cancelled);
}
