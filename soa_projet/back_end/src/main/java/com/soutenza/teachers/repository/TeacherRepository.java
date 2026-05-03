package com.soutenza.teachers.repository;

import com.soutenza.teachers.domain.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TeacherRepository extends JpaRepository<Teacher, Long> {

    boolean existsByEmailIgnoreCase(String email);

    Optional<Teacher> findByUserId(Long userId);
}
