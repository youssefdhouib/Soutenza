package com.soutenza.rooms.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RoomRequest(
        @NotBlank String code,
        @NotBlank String name,
        @NotBlank String building,
        @NotNull @Min(1) Integer capacity,
        Boolean active
) {
}
