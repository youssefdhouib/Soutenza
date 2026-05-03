package com.soutenza.jury.service;

import com.soutenza.common.exception.ApiException;
import com.soutenza.conflicts.service.ConflictCheckingService;
import com.soutenza.defenses.service.DefenseService;
import com.soutenza.jury.domain.JuryRole;
import com.soutenza.jury.dto.JuryAssignmentRequest;
import com.soutenza.jury.repository.DefenseJuryAssignmentRepository;
import com.soutenza.teachers.repository.TeacherRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

@ExtendWith(MockitoExtension.class)
class JuryAssignmentServiceTest {

    @Mock
    private DefenseService defenseService;

    @Mock
    private TeacherRepository teacherRepository;

    @Mock
    private DefenseJuryAssignmentRepository assignmentRepository;

    @Mock
    private ConflictCheckingService conflictCheckingService;

    private JuryAssignmentService service;

    @BeforeEach
    void setup() {
        service = new JuryAssignmentService(defenseService, teacherRepository, assignmentRepository, conflictCheckingService);
    }

    @Test
    void shouldRejectMultiplePresidents() {
        List<JuryAssignmentRequest> requests = List.of(
                new JuryAssignmentRequest(1L, JuryRole.PRESIDENT),
                new JuryAssignmentRequest(2L, JuryRole.PRESIDENT),
                new JuryAssignmentRequest(3L, JuryRole.EXAMINATEUR)
        );

        ApiException ex = assertThrows(ApiException.class, () -> service.replaceAssignments(1L, requests));
        assertEquals("TOO_MANY_PRESIDENTS", ex.getCode());
    }
}
