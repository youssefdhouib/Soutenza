package com.soutenza.grades.controller;

import com.soutenza.grades.dto.GradeRequest;
import com.soutenza.grades.dto.GradeResponse;
import com.soutenza.grades.service.GradeService;
import com.soutenza.security.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/defenses/{defenseId}/grades")
public class DefenseGradeController {

    private final GradeService gradeService;
    private final CurrentUserService currentUserService;

    public DefenseGradeController(GradeService gradeService, CurrentUserService currentUserService) {
        this.gradeService = gradeService;
        this.currentUserService = currentUserService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','JURY_MEMBER','SUPERVISOR')")
    public ResponseEntity<List<GradeResponse>> list(@PathVariable Long defenseId) {
        return ResponseEntity.ok(gradeService.findByDefense(defenseId));
    }

    @PostMapping
    @PreAuthorize("hasRole('JURY_MEMBER')")
    public ResponseEntity<GradeResponse> create(@PathVariable Long defenseId, @Valid @RequestBody GradeRequest request) {
        return ResponseEntity.ok(gradeService.create(defenseId, request, currentUserService.getCurrentUserId()));
    }

    @PutMapping("/{gradeId}")
    @PreAuthorize("hasRole('JURY_MEMBER')")
    public ResponseEntity<GradeResponse> update(@PathVariable Long defenseId,
                                                @PathVariable Long gradeId,
                                                @Valid @RequestBody GradeRequest request) {
        return ResponseEntity.ok(gradeService.update(defenseId, gradeId, request, currentUserService.getCurrentUserId()));
    }
}
