package com.carrental.dto;

import com.carrental.entity.RentalPackage;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public final class PackageDtos {
    private PackageDtos() {}
    public record PackageRequest(@NotBlank @Size(max=100) String name, @NotNull RentalPackage.Unit unit,
        @NotNull @Positive Integer hours, @NotNull @DecimalMin("-100.00") @DecimalMax("100.00") BigDecimal discount,
        @Size(max=500) String description) {}
    public record PackageResponse(String id, String name, String unit, Integer hours, BigDecimal discount, String description) {}
}
