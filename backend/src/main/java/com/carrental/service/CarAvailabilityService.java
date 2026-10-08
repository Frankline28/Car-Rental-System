package com.carrental.service;

import com.carrental.entity.Booking;
import com.carrental.entity.Car;
import com.carrental.entity.Booking.BookingStatus;
import com.carrental.exception.BookingConflictException;
import com.carrental.repository.BookingRepository;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.TreeMap;

@Service public class CarAvailabilityService {
    private final BookingRepository bookings;
    public CarAvailabilityService(BookingRepository bookings) { this.bookings=bookings; }
    public boolean isAvailable(Car car,Instant start,Instant end,Long ignoredBookingId,int requestedVehicles) {
        if(!Boolean.TRUE.equals(car.getAvailable()) || requestedVehicles<=0) return false;
        var overlaps=bookings.findByCarIdAndStatusAndStartDateLessThanAndEndDateGreaterThan(car.getId(),BookingStatus.CONFIRMED,end,start)
            .stream().filter(b -> ignoredBookingId==null || !ignoredBookingId.equals(b.getId())).toList();
        int active=0; TreeMap<Instant,Integer> changes=new TreeMap<>();
        for(Booking b:overlaps) {
            // The booking quantity is package duration (for example, two days),
            // not the number of fleet vehicles. Each booking reserves one car.
            if(!b.getStartDate().isAfter(start)) active++;
            else changes.merge(b.getStartDate(),1,Integer::sum);
            if(b.getEndDate().isAfter(start) && b.getEndDate().isBefore(end)) changes.merge(b.getEndDate(),-1,Integer::sum);
        }
        if(active+requestedVehicles>car.getQuantity()) return false;
        for(int delta:changes.values()) { active+=delta; if(active+requestedVehicles>car.getQuantity()) return false; }
        return true;
    }
    public void requireAvailable(Car car,Instant start,Instant end,Long ignoredBookingId,int requestedVehicles) {
        if(!isAvailable(car,start,end,ignoredBookingId,requestedVehicles))
            throw new BookingConflictException("Car is not available for the selected dates and rental duration");
    }
}
