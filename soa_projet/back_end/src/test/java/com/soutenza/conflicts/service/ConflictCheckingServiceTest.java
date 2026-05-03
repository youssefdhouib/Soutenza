package com.soutenza.conflicts.service;

import com.soutenza.common.exception.ApiException;
import com.soutenza.defenses.repository.DefenseRepository;
import com.soutenza.jury.repository.DefenseJuryAssignmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ConflictCheckingServiceTest {

    @Mock
    private DefenseRepository defenseRepository;

    @Mock
    private DefenseJuryAssignmentRepository assignmentRepository;

    private ConflictCheckingService service;

    @BeforeEach
    void setup() {
        service = new ConflictCheckingService(defenseRepository, assignmentRepository);
    }

    @Test
    void shouldThrowRoomConflict() {
        when(defenseRepository.existsRoomConflict(eq(1L), any(), any(), eq(null), any())).thenReturn(true);

        ApiException ex = assertThrows(ApiException.class, () -> service.validateCoreConflicts(
                null,
                2L,
                3L,
                1L,
                LocalDateTime.parse("2026-06-10T09:00:00"),
                LocalDateTime.parse("2026-06-10T10:00:00")
        ));

        assertEquals("ROOM_CONFLICT", ex.getCode());
    }

    @Test
    void shouldRejectInvalidInterval() {
        ApiException ex = assertThrows(ApiException.class, () -> service.validateCoreConflicts(
                null,
                2L,
                3L,
                1L,
                LocalDateTime.parse("2026-06-10T10:00:00"),
                LocalDateTime.parse("2026-06-10T09:00:00")
        ));

        assertEquals("INVALID_TIMESLOT", ex.getCode());
    }
}
