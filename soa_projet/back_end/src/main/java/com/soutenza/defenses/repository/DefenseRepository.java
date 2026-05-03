package com.soutenza.defenses.repository;

import com.soutenza.defenses.domain.Defense;
import com.soutenza.defenses.domain.DefenseStatus;
import com.soutenza.defenses.domain.PublicationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface DefenseRepository extends JpaRepository<Defense, Long> {

    @Query("""
            select (count(d) > 0)
            from Defense d
            where (:ignoreId is null or d.id <> :ignoreId)
              and d.status <> :cancelled
              and d.room.id = :roomId
              and :startDateTime < d.endDateTime
              and :endDateTime > d.startDateTime
            """)
    boolean existsRoomConflict(@Param("roomId") Long roomId,
                               @Param("startDateTime") LocalDateTime startDateTime,
                               @Param("endDateTime") LocalDateTime endDateTime,
                               @Param("ignoreId") Long ignoreId,
                               @Param("cancelled") DefenseStatus cancelled);

    @Query("""
            select (count(d) > 0)
            from Defense d
            where (:ignoreId is null or d.id <> :ignoreId)
              and d.status <> :cancelled
              and d.student.id = :studentId
              and :startDateTime < d.endDateTime
              and :endDateTime > d.startDateTime
            """)
    boolean existsStudentConflict(@Param("studentId") Long studentId,
                                  @Param("startDateTime") LocalDateTime startDateTime,
                                  @Param("endDateTime") LocalDateTime endDateTime,
                                  @Param("ignoreId") Long ignoreId,
                                  @Param("cancelled") DefenseStatus cancelled);

    @Query("""
            select (count(d) > 0)
            from Defense d
            where (:ignoreId is null or d.id <> :ignoreId)
              and d.status <> :cancelled
              and d.supervisor.id = :supervisorId
              and :startDateTime < d.endDateTime
              and :endDateTime > d.startDateTime
            """)
    boolean existsSupervisorConflict(@Param("supervisorId") Long supervisorId,
                                     @Param("startDateTime") LocalDateTime startDateTime,
                                     @Param("endDateTime") LocalDateTime endDateTime,
                                     @Param("ignoreId") Long ignoreId,
                                     @Param("cancelled") DefenseStatus cancelled);

    List<Defense> findByStudentIdOrderByStartDateTimeDesc(Long studentId);

    List<Defense> findByStudentIdAndPublicationStatusOrderByStartDateTimeDesc(Long studentId, PublicationStatus publicationStatus);

    @Query("""
            select d from Defense d
            join DefenseJuryAssignment a on a.defense.id = d.id
            where a.teacher.id = :teacherId
            order by d.startDateTime desc
            """)
    List<Defense> findByAssignedTeacher(@Param("teacherId") Long teacherId);
}
