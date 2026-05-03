package com.soutenza.defenses.controller;

import com.soutenza.common.exception.ApiException;
import com.soutenza.defenses.dto.DefenseRequest;
import com.soutenza.defenses.dto.DefenseResponse;
import com.soutenza.defenses.service.DefenseService;
import com.soutenza.students.repository.StudentRepository;
import com.soutenza.teachers.repository.TeacherRepository;
import com.soutenza.security.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/defenses")
public class DefenseController {

    private final DefenseService defenseService;
    private final CurrentUserService currentUserService;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;

    public DefenseController(DefenseService defenseService,
                             CurrentUserService currentUserService,
                             TeacherRepository teacherRepository,
                             StudentRepository studentRepository) {
        this.defenseService = defenseService;
        this.currentUserService = currentUserService;
        this.teacherRepository = teacherRepository;
        this.studentRepository = studentRepository;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DefenseResponse>> all() {
        return ResponseEntity.ok(defenseService.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DefenseResponse> one(@PathVariable Long id) {
        return ResponseEntity.ok(defenseService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DefenseResponse> create(@Valid @RequestBody DefenseRequest request) {
        return ResponseEntity.ok(defenseService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DefenseResponse> update(@PathVariable Long id, @Valid @RequestBody DefenseRequest request) {
        return ResponseEntity.ok(defenseService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        defenseService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Soutenance supprimee"));
    }

    @GetMapping("/mine/jury")
    @PreAuthorize("hasRole('JURY_MEMBER')")
    public ResponseEntity<List<DefenseResponse>> myJuryDefenses() {
        Long userId = currentUserService.getCurrentUserId();
        Long teacherId = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException("TEACHER_PROFILE_MISSING", HttpStatus.NOT_FOUND, "Profil enseignant manquant"))
                .getId();
        return ResponseEntity.ok(defenseService.findMyJuryDefenses(teacherId));
    }

    @GetMapping("/mine/student")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<DefenseResponse>> myStudentDefenses() {
        Long userId = currentUserService.getCurrentUserId();
        Long studentId = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException("STUDENT_PROFILE_MISSING", HttpStatus.NOT_FOUND, "Profil etudiant manquant"))
                .getId();
        return ResponseEntity.ok(defenseService.findMyStudentDefenses(studentId));
    }
}
