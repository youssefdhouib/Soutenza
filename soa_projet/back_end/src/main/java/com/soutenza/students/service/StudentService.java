package com.soutenza.students.service;

import com.soutenza.common.exception.ApiException;
import com.soutenza.students.domain.Student;
import com.soutenza.students.dto.StudentRequest;
import com.soutenza.students.dto.StudentResponse;
import com.soutenza.students.repository.StudentRepository;
import com.soutenza.users.domain.User;
import com.soutenza.users.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;

    public StudentService(StudentRepository studentRepository, UserRepository userRepository) {
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
    }

    public List<StudentResponse> findAll() {
        return studentRepository.findAll().stream().map(this::toResponse).toList();
    }

    public StudentResponse findById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ApiException("STUDENT_NOT_FOUND", HttpStatus.NOT_FOUND, "Etudiant introuvable"));
        return toResponse(student);
    }

    public StudentResponse findByUserId(Long userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException("STUDENT_PROFILE_MISSING", HttpStatus.NOT_FOUND, "Profil etudiant introuvable"));
        return toResponse(student);
    }

    public StudentResponse create(StudentRequest request) {
        ensureUniqueFields(request, null);

        Student student = new Student();
        applyRequest(student, request);
        return toResponse(studentRepository.save(student));
    }

    public StudentResponse update(Long id, StudentRequest request) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ApiException("STUDENT_NOT_FOUND", HttpStatus.NOT_FOUND, "Etudiant introuvable"));

        ensureUniqueFields(request, id);
        applyRequest(student, request);
        return toResponse(studentRepository.save(student));
    }

    public void delete(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ApiException("STUDENT_NOT_FOUND", HttpStatus.NOT_FOUND, "Etudiant introuvable"));
                
        User user = student.getUser();
        studentRepository.delete(student);
        
        if (user != null) {
            userRepository.delete(user);
        }
    }

    private void applyRequest(Student student, StudentRequest request) {
        student.setStudentCode(request.studentCode().trim());
        student.setFirstName(request.firstName().trim());
        student.setLastName(request.lastName().trim());
        student.setEmail(request.email().trim().toLowerCase());
        student.setDepartment(request.department().trim());
        student.setLevel(request.level().trim());
        student.setActive(request.active() == null || request.active());

        if (request.userId() != null) {
            User user = userRepository.findById(request.userId())
                    .orElseThrow(() -> new ApiException("USER_NOT_FOUND", HttpStatus.NOT_FOUND, "Utilisateur lie introuvable"));
            student.setUser(user);
        } else {
            student.setUser(null);
        }
    }

    private void ensureUniqueFields(StudentRequest request, Long currentId) {
        String code = request.studentCode().trim();
        String email = request.email().trim().toLowerCase();

        studentRepository.findAll().forEach(existing -> {
            if ((currentId == null || !existing.getId().equals(currentId)) && existing.getStudentCode().equalsIgnoreCase(code)) {
                throw new ApiException("STUDENT_CODE_EXISTS", HttpStatus.CONFLICT, "Le code etudiant existe deja");
            }
            if ((currentId == null || !existing.getId().equals(currentId)) && existing.getEmail().equalsIgnoreCase(email)) {
                throw new ApiException("STUDENT_EMAIL_EXISTS", HttpStatus.CONFLICT, "L'email etudiant existe deja");
            }
        });
    }

    private StudentResponse toResponse(Student student) {
        return new StudentResponse(
                student.getId(),
                student.getStudentCode(),
                student.getFirstName(),
                student.getLastName(),
                student.getEmail(),
                student.getDepartment(),
                student.getLevel(),
                student.isActive(),
                student.getUser() != null ? student.getUser().getId() : null
        );
    }
}
