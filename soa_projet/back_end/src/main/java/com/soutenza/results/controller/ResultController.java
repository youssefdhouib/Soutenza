package com.soutenza.results.controller;

import com.soutenza.results.dto.ResultResponse;
import com.soutenza.results.service.ResultService;
import com.soutenza.security.CurrentUserService;
import com.soutenza.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/results")
public class ResultController {

    private final ResultService resultService;
    private final CurrentUserService currentUserService;

    public ResultController(ResultService resultService, CurrentUserService currentUserService) {
        this.resultService = resultService;
        this.currentUserService = currentUserService;
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<ResultResponse>> myResults() {
        return ResponseEntity.ok(resultService.getMyPublishedResults(currentUserService.getCurrentUserId()));
    }

    @GetMapping("/defense/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','JURY_MEMBER','SUPERVISOR')")
    public ResponseEntity<ResultResponse> defenseResult(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(resultService.getDefenseResultForPrivileged(id, principal.getId(), principal.getRoleSet()));
    }
}
