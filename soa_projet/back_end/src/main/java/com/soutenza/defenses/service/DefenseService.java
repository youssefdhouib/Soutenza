package com.soutenza.defenses.service;

import com.soutenza.common.exception.ApiException;
import com.soutenza.conflicts.service.ConflictCheckingService;
import com.soutenza.defenses.domain.Defense;
import com.soutenza.defenses.domain.DefenseStatus;
import com.soutenza.defenses.domain.PublicationStatus;
import com.soutenza.defenses.dto.DefenseRequest;
import com.soutenza.defenses.dto.DefenseResponse;
import com.soutenza.defenses.repository.DefenseRepository;
import com.soutenza.rooms.domain.Room;
import com.soutenza.rooms.repository.RoomRepository;
import com.soutenza.students.domain.Student;
import com.soutenza.students.repository.StudentRepository;
import com.soutenza.teachers.domain.Teacher;
import com.soutenza.teachers.repository.TeacherRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DefenseService {

    private final DefenseRepository defenseRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final RoomRepository roomRepository;
    private final ConflictCheckingService conflictCheckingService;

    public DefenseService(DefenseRepository defenseRepository,
                          StudentRepository studentRepository,
                          TeacherRepository teacherRepository,
                          RoomRepository roomRepository,
                          ConflictCheckingService conflictCheckingService) {
        this.defenseRepository = defenseRepository;
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.roomRepository = roomRepository;
        this.conflictCheckingService = conflictCheckingService;
    }

    public List<DefenseResponse> findAll() {
        return defenseRepository.findAll().stream().map(this::toResponse).toList();
    }

    public DefenseResponse findById(Long id) {
        return toResponse(getEntity(id));
    }

    public DefenseResponse create(DefenseRequest request) {
        Student student = studentRepository.findById(request.studentId())
                .orElseThrow(() -> new ApiException("STUDENT_NOT_FOUND", HttpStatus.NOT_FOUND, "Etudiant introuvable"));

        Teacher supervisor = teacherRepository.findById(request.supervisorId())
                .orElseThrow(() -> new ApiException("SUPERVISOR_NOT_FOUND", HttpStatus.NOT_FOUND, "Encadrant introuvable"));

        Room room = roomRepository.findById(request.roomId())
                .orElseThrow(() -> new ApiException("ROOM_NOT_FOUND", HttpStatus.NOT_FOUND, "Salle introuvable"));

        conflictCheckingService.validateCoreConflicts(
                null,
                student.getId(),
                supervisor.getId(),
                room.getId(),
                request.startDateTime(),
                request.endDateTime()
        );

        Defense defense = new Defense();
        applyRequest(defense, request, student, supervisor, room);

        defense.setPublicationStatus(PublicationStatus.UNPUBLISHED);
        return toResponse(defenseRepository.save(defense));
    }

    public DefenseResponse update(Long id, DefenseRequest request) {
        Defense defense = getEntity(id);

        Student student = studentRepository.findById(request.studentId())
                .orElseThrow(() -> new ApiException("STUDENT_NOT_FOUND", HttpStatus.NOT_FOUND, "Etudiant introuvable"));

        Teacher supervisor = teacherRepository.findById(request.supervisorId())
                .orElseThrow(() -> new ApiException("SUPERVISOR_NOT_FOUND", HttpStatus.NOT_FOUND, "Encadrant introuvable"));

        Room room = roomRepository.findById(request.roomId())
                .orElseThrow(() -> new ApiException("ROOM_NOT_FOUND", HttpStatus.NOT_FOUND, "Salle introuvable"));

        conflictCheckingService.validateCoreConflicts(
                defense.getId(),
                student.getId(),
                supervisor.getId(),
                room.getId(),
                request.startDateTime(),
                request.endDateTime()
        );

        applyRequest(defense, request, student, supervisor, room);
        return toResponse(defenseRepository.save(defense));
    }

    public void delete(Long id) {
        if (!defenseRepository.existsById(id)) {
            throw new ApiException("DEFENSE_NOT_FOUND", HttpStatus.NOT_FOUND, "Soutenance introuvable");
        }
        defenseRepository.deleteById(id);
    }

    public List<DefenseResponse> findMyJuryDefenses(Long teacherId) {
        return defenseRepository.findByAssignedTeacher(teacherId).stream().map(this::toResponse).toList();
    }

    public List<DefenseResponse> findMyStudentDefenses(Long studentId) {
        return defenseRepository.findByStudentIdOrderByStartDateTimeDesc(studentId).stream().map(this::toResponse).toList();
    }

    public Defense getEntity(Long id) {
        return defenseRepository.findById(id)
                .orElseThrow(() -> new ApiException("DEFENSE_NOT_FOUND", HttpStatus.NOT_FOUND, "Soutenance introuvable"));
    }

    private void applyRequest(Defense defense, DefenseRequest request, Student student, Teacher supervisor, Room room) {
        defense.setSubject(request.subject().trim());
        defense.setDescription(request.description().trim());
        defense.setStudent(student);
        defense.setSupervisor(supervisor);
        defense.setRoom(room);
        defense.setStartDateTime(request.startDateTime());
        defense.setEndDateTime(request.endDateTime());
        defense.setStatus(request.status() == null ? DefenseStatus.PLANNED : request.status());
    }

    public DefenseResponse toResponse(Defense defense) {
        String studentName = defense.getStudent().getFirstName() + " " + defense.getStudent().getLastName();
        String supervisorName = defense.getSupervisor().getFirstName() + " " + defense.getSupervisor().getLastName();

        return new DefenseResponse(
                defense.getId(),
                defense.getSubject(),
                defense.getDescription(),
                defense.getStudent().getId(),
                studentName,
                defense.getSupervisor().getId(),
                supervisorName,
                defense.getRoom().getId(),
                defense.getRoom().getName(),
                defense.getStartDateTime(),
                defense.getEndDateTime(),
                defense.getStatus(),
                defense.getPublicationStatus(),
                defense.getFinalAverage(),
                defense.getFinalMention() != null ? defense.getFinalMention().getLabel() : null,
                defense.getPublishedAt(),
                defense.getPublishedBy() != null ? defense.getPublishedBy().getId() : null,
                defense.getCreatedAt(),
                defense.getUpdatedAt()
        );
    }
}
