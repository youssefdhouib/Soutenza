package com.soutenza.publications.controller;

import com.soutenza.defenses.dto.DefenseResponse;
import com.soutenza.defenses.service.DefenseService;
import com.soutenza.publications.service.PublicationService;
import com.soutenza.security.CurrentUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/publications")
public class PublicationController {

    private final PublicationService publicationService;
    private final DefenseService defenseService;
    private final CurrentUserService currentUserService;

    public PublicationController(PublicationService publicationService,
                                 DefenseService defenseService,
                                 CurrentUserService currentUserService) {
        this.publicationService = publicationService;
        this.defenseService = defenseService;
        this.currentUserService = currentUserService;
    }

    @PostMapping("/defenses/{id}/publish")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DefenseResponse> publish(@PathVariable Long id) {
        var defense = publicationService.publish(id, currentUserService.getCurrentUserId());
        return ResponseEntity.ok(defenseService.toResponse(defense));
    }
}
