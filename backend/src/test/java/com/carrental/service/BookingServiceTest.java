package com.carrental.service;

import com.carrental.dto.BookingDtos.BookingRequest;
import com.carrental.entity.*;
import com.carrental.exception.BadRequestException;
import com.carrental.exception.BookingConflictException;
import com.carrental.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {
    @Mock BookingRepository bookings;
    @Mock CarRepository cars;
    @Mock UserRepository users;
    @Mock PackageRepository packages;
    @Mock LocationRepository locations;
    @Mock CarAvailabilityService availability;
    @InjectMocks BookingService service;

    private User customer;
    private Car car;
    private RentalPackage daily;
    private Location location;

    @BeforeEach
    void setUp() {
        service = new BookingService(bookings, cars, users, packages, locations, availability);
        customer = new User();
        customer.setId(21L);
        customer.setName("Test Customer");
        customer.setEmail("customer@example.test");
        customer.setRole(User.Role.CUSTOMER);
        customer.setStatus(User.UserStatus.ACTIVE);

        car = new Car();
        car.setId(31L);
        car.setMake("Test");
        car.setModel("Car");
        car.setImage("test.png");
        car.setQuantity(1);
        car.setAvailable(true);
        car.setDailyRate(new BigDecimal("1800.00"));

        daily = new RentalPackage();
        daily.setId("daily-test");
        daily.setName("Daily");
        daily.setUnit(RentalPackage.Unit.DAY);
        daily.setHours(24);
        daily.setDiscount(BigDecimal.ZERO);

        location = new Location(41L, "Test City");

        lenient().when(users.findByEmailIgnoreCase(customer.getEmail())).thenReturn(Optional.of(customer));
        lenient().when(cars.findLockedById(car.getId())).thenReturn(Optional.of(car));
        lenient().when(packages.findById(daily.getId())).thenReturn(Optional.of(daily));
        lenient().when(locations.findByNameIgnoreCase(location.getName())).thenReturn(Optional.of(location));
        lenient().when(bookings.save(any(Booking.class))).thenAnswer(call -> call.getArgument(0));
    }

    @Test
    void acceptsTwoDayPackagePeriodsForOneVehicleAndCalculatesPriceOnServer() {
        Instant start = futureStart();
        Instant end = start.plusSeconds(2L * 24 * 60 * 60);

        var response = service.create(request(start, end, 2), customer.getEmail());

        assertEquals(2, response.quantity());
        assertEquals(new BigDecimal("3600.00"), response.amount());
        assertEquals(Booking.BookingStatus.CONFIRMED, response.status());
        assertEquals(Booking.PaymentStatus.PENDING, response.paymentStatus());
        verify(availability).requireAvailable(car, start, end, null, 1);
    }

    @Test
    void rejectsBookingWhenAvailabilityServiceFindsAnOverlap() {
        Instant start = futureStart();
        Instant end = start.plusSeconds(24 * 60 * 60L);
        doThrow(new BookingConflictException("unavailable"))
            .when(availability).requireAvailable(car, start, end, null, 1);

        assertThrows(BookingConflictException.class,
            () -> service.create(request(start, end, 1), customer.getEmail()));
        verify(bookings, never()).save(any());
    }

    @Test
    void rejectsDurationThatDoesNotMatchPackagePeriods() {
        Instant start = futureStart();
        Instant end = start.plusSeconds(24 * 60 * 60L);

        assertThrows(BadRequestException.class,
            () -> service.create(request(start, end, 2), customer.getEmail()));
        verifyNoInteractions(availability);
        verify(bookings, never()).save(any());
    }

    @Test
    void updateRechecksAvailabilityAndExcludesTheBookingBeingUpdated() {
        Instant originalStart = futureStart();
        Booking existing = booking(51L, originalStart, originalStart.plusSeconds(24 * 60 * 60L));
        when(bookings.findById(51L)).thenReturn(Optional.of(existing));
        Instant changedStart = originalStart.plusSeconds(3 * 24 * 60 * 60L);
        Instant changedEnd = changedStart.plusSeconds(24 * 60 * 60L);
        doThrow(new BookingConflictException("unavailable"))
            .when(availability).requireAvailable(car, changedStart, changedEnd, 51L, 1);

        assertThrows(BookingConflictException.class,
            () -> service.update(51L, request(changedStart, changedEnd, 1), customer.getEmail(), false));
        verify(availability).requireAvailable(car, changedStart, changedEnd, 51L, 1);
        verify(bookings, never()).save(any());
    }

    @Test
    void customerCannotReadAnotherCustomersBooking() {
        Instant start = futureStart();
        Booking existing = booking(61L, start, start.plusSeconds(24 * 60 * 60L));
        when(bookings.findById(61L)).thenReturn(Optional.of(existing));

        assertThrows(AccessDeniedException.class,
            () -> service.get(61L, "other@example.test", false));
    }

    @Test
    void customerCannotModifyOrCancelAnotherCustomersBooking() {
        Instant start = futureStart();
        Booking existing = booking(62L, start, start.plusSeconds(24 * 60 * 60L));
        when(bookings.findById(62L)).thenReturn(Optional.of(existing));

        assertThrows(AccessDeniedException.class, () -> service.update(62L,
            request(start.plusSeconds(24 * 60 * 60L), start.plusSeconds(48 * 60 * 60L), 1),
            "other@example.test", false));
        assertThrows(AccessDeniedException.class, () -> service.cancel(62L, "other@example.test", false));
        verify(bookings, never()).save(any());
    }

    @Test
    void cancellationMarksBookingCancelledAndSavesIt() {
        Instant start = futureStart();
        Booking existing = booking(71L, start, start.plusSeconds(24 * 60 * 60L));
        when(bookings.findById(71L)).thenReturn(Optional.of(existing));

        var response = service.cancel(71L, customer.getEmail(), false);

        assertEquals(Booking.BookingStatus.CANCELLED, response.status());
        verify(bookings).save(existing);

        when(bookings.findByCarIdAndStatusAndStartDateLessThanAndEndDateGreaterThan(
            car.getId(), Booking.BookingStatus.CONFIRMED, existing.getEndDate(), existing.getStartDate()))
            .thenAnswer(call -> existing.getStatus() == call.getArgument(1)
                ? java.util.List.of(existing) : java.util.List.of());
        assertTrue(new CarAvailabilityService(bookings).isAvailable(
            car, existing.getStartDate(), existing.getEndDate(), null, 1));
    }

    private BookingRequest request(Instant start, Instant end, int periods) {
        return new BookingRequest(car.getId(), daily.getId(), periods, start, end,
            location.getName(), Booking.PaymentMethod.CARD);
    }

    private Booking booking(Long id, Instant start, Instant end) {
        Booking booking = new Booking();
        booking.setId(id);
        booking.setUser(customer);
        booking.setCar(car);
        booking.setRentalPackage(daily);
        booking.setPickupLocation(location);
        booking.setQuantity(1);
        booking.setStartDate(start);
        booking.setEndDate(end);
        booking.setAmount(new BigDecimal("1800.00"));
        booking.setPaymentMethod(Booking.PaymentMethod.CARD);
        booking.setPaymentStatus(Booking.PaymentStatus.PENDING);
        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        return booking;
    }

    private Instant futureStart() {
        return Instant.now().plusSeconds(2 * 24 * 60 * 60L).truncatedTo(java.time.temporal.ChronoUnit.SECONDS);
    }
}
