package com.soutenza.rooms.dto;

public record RoomResponse(
        Long id,
        String code,
        String name,
        String building,
        Integer capacity,
        boolean active
) {
}
