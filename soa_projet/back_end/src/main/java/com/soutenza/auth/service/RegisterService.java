package com.soutenza.auth.service;

import com.soutenza.auth.dto.RegisterResponse;
import com.soutenza.auth.dto.RegisterStudentRequest;
import com.soutenza.auth.dto.RegisterTeacherRequest;
import com.soutenza.common.email.EmailService;
import com.soutenza.common.exception.ApiException;
import com.soutenza.students.domain.Student;
import com.soutenza.students.repository.StudentRepository;
import com.soutenza.teachers.domain.Teacher;
import com.soutenza.teachers.repository.TeacherRepository;
import com.soutenza.users.domain.Role;
import com.soutenza.users.domain.User;
import com.soutenza.users.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Set;

@Service
public class RegisterService {

    private static final String CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#";
    private static final int PASSWORD_LENGTH = 10;

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    public RegisterService(UserRepository userRepository,
                           StudentRepository studentRepository,
                           TeacherRepository teacherRepository,
                           PasswordEncoder passwordEncoder,
                           EmailService emailService) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
    }

    @Transactional
    public RegisterResponse registerStudent(RegisterStudentRequest request) {
        String email = request.email().trim().toLowerCase();
        ensureEmailFree(email);

        String tempPassword = generatePassword();

        // 1. Create user account
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(tempPassword));
        user.setRoles(Set.of(Role.STUDENT));
        user = userRepository.save(user);

        // 2. Create student profile linked to user
        Student student = new Student();
        student.setStudentCode(request.studentCode().trim());
        student.setFirstName(request.firstName().trim());
        student.setLastName(request.lastName().trim());
        student.setEmail(email);
        student.setDepartment(request.department().trim());
        student.setLevel(request.level().trim());
        student.setUser(user);
        studentRepository.save(student);

        // 3. Send welcome email with temporary password
        String fullName = request.firstName().trim() + " " + request.lastName().trim();
        emailService.sendWelcomeEmail(email, fullName, tempPassword);

        return new RegisterResponse(user.getId(), email, "Compte étudiant créé. Email envoyé à " + email);
    }

    @Transactional
    public RegisterResponse registerTeacher(RegisterTeacherRequest request) {
        String email = request.email().trim().toLowerCase();
        ensureEmailFree(email);

        // Only allow jury-related roles
        if (request.role() != Role.JURY_MEMBER && request.role() != Role.SUPERVISOR) {
            throw new ApiException("INVALID_ROLE", HttpStatus.BAD_REQUEST, "Rôle invalide pour un enseignant");
        }

        String tempPassword = generatePassword();

        // 1. Create user account
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(tempPassword));
        user.setRoles(Set.of(request.role()));
        user = userRepository.save(user);

        // 2. Create teacher profile linked to user
        Teacher teacher = new Teacher();
        teacher.setFirstName(request.firstName().trim());
        teacher.setLastName(request.lastName().trim());
        teacher.setEmail(email);
        teacher.setRank(request.rank().trim());
        teacher.setSpecialty(request.specialty().trim());
        teacher.setUser(user);
        teacherRepository.save(teacher);

        // 3. Send welcome email with temporary password
        String fullName = request.firstName().trim() + " " + request.lastName().trim();
        emailService.sendWelcomeEmail(email, fullName, tempPassword);

        return new RegisterResponse(user.getId(), email, "Compte enseignant créé. Email envoyé à " + email);
    }

    // ----- helpers -----

    private void ensureEmailFree(String email) {
        if (userRepository.findByEmailIgnoreCase(email).isPresent()) {
            throw new ApiException("EMAIL_TAKEN", HttpStatus.CONFLICT, "Cet email est déjà utilisé");
        }
    }

    private String generatePassword() {
        SecureRandom rnd = new SecureRandom();
        StringBuilder sb = new StringBuilder(PASSWORD_LENGTH);
        for (int i = 0; i < PASSWORD_LENGTH; i++) {
            sb.append(CHARS.charAt(rnd.nextInt(CHARS.length())));
        }
        return sb.toString();
    }
}
