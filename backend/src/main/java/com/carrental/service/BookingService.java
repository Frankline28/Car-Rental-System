package com.carrental.service;

import com.carrental.dto.BookingDtos.*;
import com.carrental.entity.*;
import com.carrental.exception.*;
import com.carrental.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.List;

@Service public class BookingService {
    private final BookingRepository bookings; private final CarRepository cars; private final UserRepository users;
    private final PackageRepository packages; private final LocationRepository locations; private final CarAvailabilityService availability;
    public BookingService(BookingRepository bookings,CarRepository cars,UserRepository users,PackageRepository packages,LocationRepository locations,CarAvailabilityService availability) {
        this.bookings=bookings; this.cars=cars; this.users=users; this.packages=packages; this.locations=locations; this.availability=availability;
    }
    @Transactional(readOnly=true) public List<BookingResponse> mine(String email) { return bookings.findByUserEmailIgnoreCase(email).stream().map(this::dto).toList(); }
    @Transactional(readOnly=true) public List<BookingResponse> all() { return bookings.findAll().stream().map(this::dto).toList(); }
    @Transactional(readOnly=true) public BookingResponse get(Long id,String email,boolean admin) { Booking b=find(id); requireOwner(b,email,admin); return dto(b); }
    @Transactional public BookingResponse create(BookingRequest r,String email) {
        User user=users.findByEmailIgnoreCase(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Car car=cars.findLockedById(r.carId()).orElseThrow(() -> new ResourceNotFoundException("Car not found"));
        RentalPackage pkg=packages.findById(r.packageId()).orElseThrow(() -> new ResourceNotFoundException("Rental package not found"));
        Location location=locations.findByNameIgnoreCase(r.pickupLocation().trim()).orElseThrow(() -> new ResourceNotFoundException("Pickup location not found"));
        validateDates(r.startDate(),r.endDate()); validateDuration(pkg,r.quantity(),r.startDate(),r.endDate()); availability.requireAvailable(car,r.startDate(),r.endDate(),null,1);
        Booking b=new Booking(); b.setUser(user); b.setCar(car); b.setRentalPackage(pkg); b.setQuantity(r.quantity()); b.setStartDate(r.startDate()); b.setEndDate(r.endDate());
        b.setPickupLocation(location); b.setAmount(calculateAmount(car,pkg,r.quantity())); b.setStatus(Booking.BookingStatus.CONFIRMED);
        b.setPaymentMethod(r.paymentMethod()); b.setPaymentStatus(Booking.PaymentStatus.PENDING);
        return dto(bookings.save(b));
    }
    @Transactional public BookingResponse update(Long id,BookingRequest r,String email,boolean admin) {
        Booking b=find(id); requireOwner(b,email,admin);
        if(b.getStatus()!=Booking.BookingStatus.CONFIRMED || !b.getStartDate().isAfter(Instant.now())) throw new BadRequestException("Only upcoming confirmed bookings can be modified");
        Car car=cars.findLockedById(r.carId()).orElseThrow(() -> new ResourceNotFoundException("Car not found"));
        RentalPackage pkg=packages.findById(r.packageId()).orElseThrow(() -> new ResourceNotFoundException("Rental package not found"));
        Location location=locations.findByNameIgnoreCase(r.pickupLocation().trim()).orElseThrow(() -> new ResourceNotFoundException("Pickup location not found"));
        validateDates(r.startDate(),r.endDate()); validateDuration(pkg,r.quantity(),r.startDate(),r.endDate()); availability.requireAvailable(car,r.startDate(),r.endDate(),id,1);
        b.setCar(car); b.setRentalPackage(pkg); b.setQuantity(r.quantity()); b.setStartDate(r.startDate()); b.setEndDate(r.endDate());
        b.setPickupLocation(location); b.setAmount(calculateAmount(car,pkg,r.quantity())); b.setPaymentMethod(r.paymentMethod());
        return dto(bookings.save(b));
    }
    @Transactional public BookingResponse cancel(Long id,String email,boolean admin) {
        Booking b=find(id); requireOwner(b,email,admin);
        if(b.getStatus()!=Booking.BookingStatus.CONFIRMED || !b.getStartDate().isAfter(Instant.now())) throw new BadRequestException("Only upcoming confirmed bookings can be cancelled");
        b.setStatus(Booking.BookingStatus.CANCELLED);
        if(b.getPaymentStatus()==Booking.PaymentStatus.PAID) b.setPaymentStatus(Booking.PaymentStatus.REFUND_PENDING);
        return dto(bookings.save(b));
    }
    private void validateDates(Instant start,Instant end) {
        if(start==null||end==null||!start.isAfter(Instant.now())) throw new BadRequestException("Booking start must be in the future");
        if(!end.isAfter(start)) throw new BadRequestException("Booking end must be after start");
    }
    private void validateDuration(RentalPackage pkg,int quantity,Instant start,Instant end) {
        if(quantity<=0) throw new BadRequestException("Quantity must be greater than zero");
        Instant expected=start.plusSeconds(Math.multiplyExact(Math.multiplyExact((long)pkg.getHours(),quantity),3600));
        if(!expected.equals(end)) throw new BadRequestException("End date does not match the selected package duration and quantity");
    }
    private BigDecimal calculateAmount(Car car,RentalPackage pkg,int quantity) {
        BigDecimal daily=car.getDailyRate(); BigDecimal unit;
        switch(pkg.getUnit()) {
            case HOUR -> unit=car.getHourlyRate()!=null?car.getHourlyRate():daily.divide(BigDecimal.valueOf(24),4,RoundingMode.HALF_UP);
            case DAY -> unit=daily;
            case WEEK -> unit=car.getWeeklyRate()!=null?car.getWeeklyRate():daily.multiply(BigDecimal.valueOf(7));
            case MONTH -> unit=car.getMonthlyRate()!=null?car.getMonthlyRate():daily.multiply(BigDecimal.valueOf(30));
            default -> throw new BadRequestException("Unsupported package unit");
        }
        BigDecimal factor=BigDecimal.ONE.subtract(pkg.getDiscount().divide(BigDecimal.valueOf(100),6,RoundingMode.HALF_UP));
        if(factor.signum()<0) throw new BadRequestException("Package discount cannot exceed 100 percent");
        return unit.multiply(factor).multiply(BigDecimal.valueOf(quantity)).setScale(2,RoundingMode.HALF_UP);
    }
    private Booking find(Long id) { return bookings.findById(id).orElseThrow(() -> new ResourceNotFoundException("Booking not found")); }
    private void requireOwner(Booking b,String email,boolean admin) { if(!admin&&!b.getUser().getEmail().equalsIgnoreCase(email)) throw new org.springframework.security.access.AccessDeniedException("Booking belongs to another user"); }
    private BookingResponse dto(Booking b) {
        return new BookingResponse(b.getId(),b.getUser().getId(),b.getUser().getName(),b.getUser().getEmail(),b.getCar().getId(),
            b.getCar().getMake()+" "+b.getCar().getModel(),b.getCar().getImage(),b.getRentalPackage().getId(),b.getRentalPackage().getName(),
            b.getRentalPackage().getUnit().name().toLowerCase(),b.getQuantity(),b.getStartDate(),b.getEndDate(),b.getPickupLocation().getName(),
            b.getAmount(),b.getStatus(),b.getPaymentMethod(),b.getPaymentStatus(),b.getCreatedAt(),b.getUpdatedAt());
    }
}
