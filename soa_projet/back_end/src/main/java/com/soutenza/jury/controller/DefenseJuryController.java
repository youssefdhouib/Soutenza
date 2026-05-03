package com.soutenza.jury.controller;

import com.soutenza.jury.dto.JuryAssignmentRequest;
import com.soutenza.jury.dto.JuryAssignmentResponse;
import com.soutenza.jury.service.JuryAssignmentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/defenses/{defenseId}/jury")
public class DefenseJuryController {

    private final JuryAssignmentService assignmentService;

    public DefenseJuryController(JuryAssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','JURY_MEMBER','SUPERVISOR')")
    public ResponseEntity<List<JuryAssignmentResponse>> getAssignments(@PathVariable Long defenseId) {
        return ResponseEntity.ok(assignmentService.findByDefense(defenseId));
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<JuryAssignmentResponse>> replaceAssignments(
            @PathVariable Long defenseId,
            @Valid @RequestBody List<JuryAssignmentRequest> requests
    ) {
        return ResponseEntity.ok(assignmentService.replaceAssignments(defenseId, requests));
    }
}
