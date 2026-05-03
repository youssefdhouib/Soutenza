package com.soutenza.grades.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record GradeRequest(
        @NotNull @DecimalMin("0.0") @DecimalMax("20.0") BigDecimal score,
        @Size(max = 2000) String comment
) {
}
