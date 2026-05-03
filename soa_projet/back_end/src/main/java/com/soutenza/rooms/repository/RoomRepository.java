package com.soutenza.rooms.repository;

import com.soutenza.rooms.domain.Room;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomRepository extends JpaRepository<Room, Long> {

    boolean existsByCodeIgnoreCase(String code);
}
