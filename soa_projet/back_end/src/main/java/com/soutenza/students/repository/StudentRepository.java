package com.soutenza.students.repository;

import com.soutenza.students.domain.Student;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {

    boolean existsByStudentCodeIgnoreCase(String studentCode);

    boolean existsByEmailIgnoreCase(String email);

    Optional<Student> findByUserId(Long userId);
}
