package com.carrental.dto;

import com.carrental.entity.Car;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public final class CarDtos {
    private CarDtos() {}
    public record CarRequest(@NotBlank @Size(max=80) String make, @NotBlank @Size(max=100) String model,
        @NotNull @Min(1900) Integer year, @NotBlank String type, String transmission, String fuel,
        @Positive Integer seats, @NotNull @Positive BigDecimal dailyRate, @PositiveOrZero BigDecimal hourlyRate,
        @PositiveOrZero BigDecimal weeklyRate, @PositiveOrZero BigDecimal monthlyRate,
        @NotNull @Positive Integer quantity, String location, String image, List<@NotBlank @Size(max=120) String> features,
        Car.Specifications specifications, @NotNull Boolean available) {}
    public record CarResponse(Long id, String make, String model, Integer year, String type, String transmission,
        String fuel, Integer seats, BigDecimal dailyRate, BigDecimal hourlyRate, BigDecimal weeklyRate,
        BigDecimal monthlyRate, Integer quantity, String location, String image, List<String> features,
        Car.Specifications specifications, Boolean available) {}
}
