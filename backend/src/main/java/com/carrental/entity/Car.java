package com.carrental.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cars")
public class Car {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 80) private String make;
    @Column(nullable = false, length = 100) private String model;
    private Integer year;
    @Column(length = 40) private String type;
    @Column(length = 40) private String transmission;
    @Column(length = 40) private String fuel;
    private Integer seats;
    @Column(precision = 12, scale = 2) private BigDecimal dailyRate;
    @Column(precision = 12, scale = 2) private BigDecimal hourlyRate;
    @Column(precision = 12, scale = 2) private BigDecimal weeklyRate;
    @Column(precision = 12, scale = 2) private BigDecimal monthlyRate;
    private Integer quantity = 1;
    @Column(columnDefinition = "LONGTEXT") private String image;
    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "car_features", joinColumns = @JoinColumn(name = "car_id"))
    @Column(name = "feature", nullable = false, length = 120)
    private List<String> features = new ArrayList<>();
    @Embedded @AttributeOverrides({
        @AttributeOverride(name = "engine", column = @Column(name = "spec_engine")),
        @AttributeOverride(name = "power", column = @Column(name = "spec_power")),
        @AttributeOverride(name = "acceleration", column = @Column(name = "spec_acceleration"))
    }) private Specifications specifications = new Specifications();
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "location_id") private Location location;
    @Column(nullable = false) private Boolean available = true;

    @Embeddable
    public static class Specifications {
        private String engine;
        private String power;
        private String acceleration;
        public String getEngine() { return engine; }
        public void setEngine(String engine) { this.engine = engine; }
        public String getPower() { return power; }
        public void setPower(String power) { this.power = power; }
        public String getAcceleration() { return acceleration; }
        public void setAcceleration(String acceleration) { this.acceleration = acceleration; }
    }

    public Car() {}
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getMake() { return make; } public void setMake(String make) { this.make = make; }
    public String getModel() { return model; } public void setModel(String model) { this.model = model; }
    public Integer getYear() { return year; } public void setYear(Integer year) { this.year = year; }
    public String getType() { return type; } public void setType(String type) { this.type = type; }
    public String getTransmission() { return transmission; } public void setTransmission(String transmission) { this.transmission = transmission; }
    public String getFuel() { return fuel; } public void setFuel(String fuel) { this.fuel = fuel; }
    public Integer getSeats() { return seats; } public void setSeats(Integer seats) { this.seats = seats; }
    public BigDecimal getDailyRate() { return dailyRate; } public void setDailyRate(BigDecimal dailyRate) { this.dailyRate = dailyRate; }
    public BigDecimal getHourlyRate() { return hourlyRate; } public void setHourlyRate(BigDecimal hourlyRate) { this.hourlyRate = hourlyRate; }
    public BigDecimal getWeeklyRate() { return weeklyRate; } public void setWeeklyRate(BigDecimal weeklyRate) { this.weeklyRate = weeklyRate; }
    public BigDecimal getMonthlyRate() { return monthlyRate; } public void setMonthlyRate(BigDecimal monthlyRate) { this.monthlyRate = monthlyRate; }
    public Integer getQuantity() { return quantity; } public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public String getImage() { return image; } public void setImage(String image) { this.image = image; }
    public List<String> getFeatures() { return features; } public void setFeatures(List<String> features) { this.features = features == null ? new ArrayList<>() : new ArrayList<>(features); }
    public Specifications getSpecifications() { return specifications; } public void setSpecifications(Specifications specifications) { this.specifications = specifications; }
    public Location getLocation() { return location; } public void setLocation(Location location) { this.location = location; }
    public Boolean getAvailable() { return available; } public void setAvailable(Boolean available) { this.available = available; }
}
