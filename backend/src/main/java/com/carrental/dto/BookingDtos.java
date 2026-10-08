package com.carrental.dto;

import com.carrental.entity.Booking;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;

public final class BookingDtos {
    private BookingDtos() {}
    public record BookingRequest(@NotNull Long carId, @NotBlank String packageId, @NotNull @Positive Integer quantity,
        @NotNull Instant startDate, @NotNull Instant endDate, @NotBlank String pickupLocation,
        @NotNull Booking.PaymentMethod paymentMethod) {}
    public record BookingResponse(Long id, Long userId, String userName, String userEmail, Long carId,
        String carName, String carImage, String packageId, String packageName, String unit, Integer quantity,
        Instant startDate, Instant endDate, String pickupLocation, BigDecimal amount, Booking.BookingStatus status,
        Booking.PaymentMethod paymentMethod, Booking.PaymentStatus paymentStatus, Instant createdAt, Instant updatedAt) {}
}
