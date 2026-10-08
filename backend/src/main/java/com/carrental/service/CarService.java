package com.carrental.service;

import com.carrental.dto.CarDtos.*;
import com.carrental.entity.Car;
import com.carrental.entity.Location;
import com.carrental.exception.ResourceNotFoundException;
import com.carrental.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.List;
import java.util.Locale;

@Service
public class CarService {
    private final CarRepository cars; private final LocationRepository locations; private final BookingRepository bookings; private final CarAvailabilityService availability;
    public CarService(CarRepository cars, LocationRepository locations, BookingRepository bookings,CarAvailabilityService availability) { this.cars=cars; this.locations=locations; this.bookings=bookings; this.availability=availability; }
    @Transactional(readOnly=true) public List<CarResponse> list(String location, String type, String q, Instant start, Instant end) {
        if ((start == null) != (end == null)) throw new IllegalArgumentException("Both start and end are required for availability filtering");
        if (start != null && (!start.isBefore(end) || start.isBefore(Instant.now()))) throw new IllegalArgumentException("Date range must be valid and in the future");
        String query = q == null ? "" : q.toLowerCase(Locale.ROOT);
        return cars.findAll().stream().filter(c -> location == null || location.isBlank() || (c.getLocation()!=null && c.getLocation().getName().equalsIgnoreCase(location)))
            .filter(c -> type == null || type.isBlank() || (c.getType()!=null && c.getType().equalsIgnoreCase(type)))
            .filter(c -> query.isBlank() || (c.getMake()+" "+c.getModel()).toLowerCase(Locale.ROOT).contains(query))
            .filter(c -> start == null || availability.isAvailable(c,start,end,null,1)).map(this::dto).toList();
    }
    @Transactional(readOnly=true) public CarResponse get(Long id) { return dto(cars.findById(id).orElseThrow(() -> new ResourceNotFoundException("Car not found"))); }
    @Transactional public CarResponse create(CarRequest request) { Car c = new Car(); apply(c,request); return dto(cars.save(c)); }
    @Transactional public CarResponse update(Long id, CarRequest request) { Car c=cars.findById(id).orElseThrow(() -> new ResourceNotFoundException("Car not found")); apply(c,request); return dto(cars.save(c)); }
    @Transactional public void delete(Long id) {
        Car c=cars.findById(id).orElseThrow(() -> new ResourceNotFoundException("Car not found"));
        if (bookings.existsByCarId(id)) throw new IllegalArgumentException("Car has booking history and cannot be deleted; mark it unavailable instead");
        cars.delete(c);
    }
    private void apply(Car c, CarRequest r) {
        c.setMake(r.make()); c.setModel(r.model()); c.setYear(r.year()); c.setType(r.type()); c.setTransmission(r.transmission()); c.setFuel(r.fuel()); c.setSeats(r.seats());
        c.setDailyRate(r.dailyRate()); c.setHourlyRate(r.hourlyRate()); c.setWeeklyRate(r.weeklyRate()); c.setMonthlyRate(r.monthlyRate()); c.setQuantity(r.quantity());
        c.setImage(r.image()); c.setFeatures(r.features()); c.setSpecifications(r.specifications()); c.setAvailable(r.available()); c.setLocation(resolveLocation(r.location()));
    }
    private Location resolveLocation(String name) {
        if (name == null || name.isBlank()) throw new IllegalArgumentException("Location is required");
        return locations.findByNameIgnoreCase(name.trim()).orElseThrow(() -> new ResourceNotFoundException("Location not found: "+name));
    }
    private CarResponse dto(Car c) { return new CarResponse(c.getId(),c.getMake(),c.getModel(),c.getYear(),c.getType(),c.getTransmission(),c.getFuel(),c.getSeats(),c.getDailyRate(),c.getHourlyRate(),c.getWeeklyRate(),c.getMonthlyRate(),c.getQuantity(),c.getLocation()==null?null:c.getLocation().getName(),c.getImage(),List.copyOf(c.getFeatures()),c.getSpecifications(),c.getAvailable()); }
}
