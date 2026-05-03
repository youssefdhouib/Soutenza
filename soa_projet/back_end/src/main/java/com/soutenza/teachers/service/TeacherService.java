package com.soutenza.teachers.service;

import com.soutenza.common.exception.ApiException;
import com.soutenza.teachers.domain.Teacher;
import com.soutenza.teachers.dto.TeacherRequest;
import com.soutenza.teachers.dto.TeacherResponse;
import com.soutenza.teachers.repository.TeacherRepository;
import com.soutenza.users.domain.User;
import com.soutenza.users.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;

    public TeacherService(TeacherRepository teacherRepository, UserRepository userRepository) {
        this.teacherRepository = teacherRepository;
        this.userRepository = userRepository;
    }

    public List<TeacherResponse> findAll() {
        return teacherRepository.findAll().stream().map(this::toResponse).toList();
    }

    public TeacherResponse findById(Long id) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ApiException("TEACHER_NOT_FOUND", HttpStatus.NOT_FOUND, "Enseignant introuvable"));
        return toResponse(teacher);
    }

    public TeacherResponse findByUserId(Long userId) {
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException("TEACHER_PROFILE_MISSING", HttpStatus.NOT_FOUND, "Profil enseignant introuvable"));
        return toResponse(teacher);
    }
    public TeacherResponse create(TeacherRequest request) {
        ensureUniqueEmail(request.email(), null);
        Teacher teacher = new Teacher();
        applyRequest(teacher, request);
        return toResponse(teacherRepository.save(teacher));
    }

    public TeacherResponse update(Long id, TeacherRequest request) {
        Teacher teacher = teacherRepository.findById(id)
                .orElseThrow(() -> new ApiException("TEACHER_NOT_FOUND", HttpStatus.NOT_FOUND, "Enseignant introuvable"));

        ensureUniqueEmail(request.email(), id);
        applyRequest(teacher, request);
        return toResponse(teacherRepository.save(teacher));
    }

    public void delete(Long id) {
        if (!teacherRepository.existsById(id)) {
            throw new ApiException("TEACHER_NOT_FOUND", HttpStatus.NOT_FOUND, "Enseignant introuvable");
        }
        teacherRepository.deleteById(id);
    }

    private void ensureUniqueEmail(String email, Long currentId) {
        String clean = email.trim().toLowerCase();
        teacherRepository.findAll().forEach(existing -> {
            if ((currentId == null || !existing.getId().equals(currentId)) && existing.getEmail().equalsIgnoreCase(clean)) {
                throw new ApiException("TEACHER_EMAIL_EXISTS", HttpStatus.CONFLICT, "L'email enseignant existe deja");
            }
        });
    }

    private void applyRequest(Teacher teacher, TeacherRequest request) {
        teacher.setFirstName(request.firstName().trim());
        teacher.setLastName(request.lastName().trim());
        teacher.setEmail(request.email().trim().toLowerCase());
        teacher.setRank(request.rank().trim());
        teacher.setSpecialty(request.specialty().trim());
        teacher.setActive(request.active() == null || request.active());

        if (request.userId() != null) {
            User user = userRepository.findById(request.userId())
                    .orElseThrow(() -> new ApiException("USER_NOT_FOUND", HttpStatus.NOT_FOUND, "Utilisateur lie introuvable"));
            teacher.setUser(user);
        } else {
            teacher.setUser(null);
        }
    }

    private TeacherResponse toResponse(Teacher teacher) {
        return new TeacherResponse(
                teacher.getId(),
                teacher.getFirstName(),
                teacher.getLastName(),
                teacher.getEmail(),
                teacher.getRank(),
                teacher.getSpecialty(),
                teacher.isActive(),
                teacher.getUser() != null ? teacher.getUser().getId() : null
        );
    }
}


