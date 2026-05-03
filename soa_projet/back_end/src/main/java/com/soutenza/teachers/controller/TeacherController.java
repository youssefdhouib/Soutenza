package com.soutenza.teachers.controller;

import com.soutenza.security.CurrentUserService;
import com.soutenza.teachers.dto.TeacherRequest;
import com.soutenza.teachers.dto.TeacherResponse;
import com.soutenza.teachers.service.TeacherService;
import jakarta.validation.Valid;
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
@RequestMapping("/api/teachers")
public class TeacherController {

    private final TeacherService teacherService;
    private final CurrentUserService currentUserService;

    public TeacherController(TeacherService teacherService, CurrentUserService currentUserService) {
        this.teacherService = teacherService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TeacherResponse>> all() {
        return ResponseEntity.ok(teacherService.findAll());
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('JURY_MEMBER','SUPERVISOR')")
    public ResponseEntity<TeacherResponse> me() {
        return ResponseEntity.ok(teacherService.findByUserId(currentUserService.getCurrentUserId()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TeacherResponse> one(@PathVariable Long id) {
        return ResponseEntity.ok(teacherService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TeacherResponse> create(@Valid @RequestBody TeacherRequest request) {
        return ResponseEntity.ok(teacherService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TeacherResponse> update(@PathVariable Long id, @Valid @RequestBody TeacherRequest request) {
        return ResponseEntity.ok(teacherService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        teacherService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Enseignant supprime"));
    }
}
