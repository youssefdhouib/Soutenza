package com.soutenza.auth.controller;

import com.soutenza.auth.dto.LoginRequest;
import com.soutenza.auth.dto.LoginResponse;
import com.soutenza.auth.dto.RegisterResponse;
import com.soutenza.auth.dto.RegisterStudentRequest;
import com.soutenza.auth.dto.RegisterTeacherRequest;
import com.soutenza.auth.dto.UserMeResponse;
import com.soutenza.auth.service.AuthService;
import com.soutenza.auth.service.RegisterService;
import com.soutenza.security.CurrentUserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final RegisterService registerService;
    private final CurrentUserService currentUserService;

    public AuthController(AuthService authService,
                          RegisterService registerService,
                          CurrentUserService currentUserService) {
        this.authService = authService;
        this.registerService = registerService;
        this.currentUserService = currentUserService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<UserMeResponse> me() {
        Long userId = currentUserService.getCurrentUserId();
        return ResponseEntity.ok(authService.me(userId));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        return ResponseEntity.ok(Map.of("message", "Deconnexion effectuee"));
    }

    /** ADMIN creates a student account — auto-generates password and sends it by email */
    @PostMapping("/register/student")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RegisterResponse> registerStudent(@Valid @RequestBody RegisterStudentRequest request) {
        return ResponseEntity.ok(registerService.registerStudent(request));
    }

    /** ADMIN creates a teacher/jury account — auto-generates password and sends it by email */
    @PostMapping("/register/teacher")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<RegisterResponse> registerTeacher(@Valid @RequestBody RegisterTeacherRequest request) {
        return ResponseEntity.ok(registerService.registerTeacher(request));
    }

    /** Any authenticated user can change their password */
    @org.springframework.web.bind.annotation.PutMapping("/password")
    public ResponseEntity<Map<String, String>> changePassword(@Valid @RequestBody com.soutenza.auth.dto.ChangePasswordRequest request) {
        Long userId = currentUserService.getCurrentUserId();
        authService.changePassword(userId, request);
        return ResponseEntity.ok(Map.of("message", "Mot de passe modifié avec succès"));
    }
}
