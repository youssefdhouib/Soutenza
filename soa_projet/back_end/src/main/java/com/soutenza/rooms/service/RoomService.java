package com.soutenza.rooms.service;

import com.soutenza.common.exception.ApiException;
import com.soutenza.rooms.domain.Room;
import com.soutenza.rooms.dto.RoomRequest;
import com.soutenza.rooms.dto.RoomResponse;
import com.soutenza.rooms.repository.RoomRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoomService {

    private final RoomRepository roomRepository;

    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    public List<RoomResponse> findAll() {
        return roomRepository.findAll().stream().map(this::toResponse).toList();
    }

    public RoomResponse findById(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ApiException("ROOM_NOT_FOUND", HttpStatus.NOT_FOUND, "Salle introuvable"));
        return toResponse(room);
    }

    public RoomResponse create(RoomRequest request) {
        ensureUniqueCode(request.code(), null);
        Room room = new Room();
        applyRequest(room, request);
        return toResponse(roomRepository.save(room));
    }

    public RoomResponse update(Long id, RoomRequest request) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ApiException("ROOM_NOT_FOUND", HttpStatus.NOT_FOUND, "Salle introuvable"));

        ensureUniqueCode(request.code(), id);
        applyRequest(room, request);
        return toResponse(roomRepository.save(room));
    }

    public void delete(Long id) {
        if (!roomRepository.existsById(id)) {
            throw new ApiException("ROOM_NOT_FOUND", HttpStatus.NOT_FOUND, "Salle introuvable");
        }
        roomRepository.deleteById(id);
    }

    private void ensureUniqueCode(String code, Long currentId) {
        String cleanCode = code.trim();
        roomRepository.findAll().forEach(existing -> {
            if ((currentId == null || !existing.getId().equals(currentId)) && existing.getCode().equalsIgnoreCase(cleanCode)) {
                throw new ApiException("ROOM_CODE_EXISTS", HttpStatus.CONFLICT, "Le code salle existe deja");
            }
        });
    }

    private void applyRequest(Room room, RoomRequest request) {
        room.setCode(request.code().trim());
        room.setName(request.name().trim());
        room.setBuilding(request.building().trim());
        room.setCapacity(request.capacity());
        room.setActive(request.active() == null || request.active());
    }

    private RoomResponse toResponse(Room room) {
        return new RoomResponse(room.getId(), room.getCode(), room.getName(), room.getBuilding(), room.getCapacity(), room.isActive());
    }
}
