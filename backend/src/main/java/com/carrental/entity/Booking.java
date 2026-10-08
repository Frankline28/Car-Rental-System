package com.carrental.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "bookings", indexes = {
    @Index(name = "idx_booking_car_dates", columnList = "car_id,start_at,end_at,status"),
    @Index(name = "idx_booking_user", columnList = "user_id")
})
public class Booking {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id") private User user;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "car_id") private Car car;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "package_id") private RentalPackage rentalPackage;
    private Integer quantity;
    @Column(name = "start_at") private Instant startDate;
    @Column(name = "end_at") private Instant endDate;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "pickup_location_id") private Location pickupLocation;
    @Column(precision = 12, scale = 2) private BigDecimal amount;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private BookingStatus status = BookingStatus.CONFIRMED;
    @Enumerated(EnumType.STRING) @Column(length = 20) private PaymentMethod paymentMethod;
    @Enumerated(EnumType.STRING) @Column(length = 20) private PaymentStatus paymentStatus = PaymentStatus.PENDING;
    @Column(name = "car_name") private String carName;
    @Column(name = "car_image", columnDefinition = "LONGTEXT") private String carImage;
    @Column(name = "date") private String date;
    @Column(name = "total_amount") private Double totalAmount;
    @Column(name = "package_name") private String packageName;
    @Column(name = "duration") private Integer duration;
    @Column(name = "duration_unit") private String durationUnit;
    @Column(name = "start_date") private String startDateStr;
    @Column(name = "end_date") private String endDateStr;
    @Column(updatable = false) private Instant createdAt;
    private Instant updatedAt;
    public enum BookingStatus { CONFIRMED, CANCELLED, COMPLETED }
    public enum PaymentMethod { CARD, WALLET, CASH, UPI }
    public enum PaymentStatus { PENDING, PAID, REFUND_PENDING, REFUNDED }
    @PrePersist void onCreate() { 
        Instant now = Instant.now(); 
        createdAt = now; 
        updatedAt = now; 
        syncColumns(); 
    }
    @PreUpdate void onUpdate() { 
        updatedAt = Instant.now(); 
        syncColumns(); 
    }
    private void syncColumns() {
        if (car != null) {
            this.carName = car.getMake() + " " + car.getModel();
            this.carImage = car.getImage();
        }
        if (rentalPackage != null) {
            this.packageName = rentalPackage.getName();
            this.durationUnit = rentalPackage.getUnit() != null ? rentalPackage.getUnit().name().toLowerCase() : null;
        }
        this.duration = quantity;
        if (amount != null) {
            this.totalAmount = amount.doubleValue();
        }
        if (startDate != null) {
            this.startDateStr = startDate.toString();
        }
        if (endDate != null) {
            this.endDateStr = endDate.toString();
        }
        if (startDate != null && endDate != null) {
            this.date = startDate.toString() + " to " + endDate.toString();
        }
    }
    public Booking() {}
    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public User getUser() { return user; } public void setUser(User user) { this.user = user; }
    public Car getCar() { return car; } public void setCar(Car car) { this.car = car; }
    public RentalPackage getRentalPackage() { return rentalPackage; } public void setRentalPackage(RentalPackage value) { rentalPackage = value; }
    public Integer getQuantity() { return quantity; } public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public Instant getStartDate() { return startDate; } public void setStartDate(Instant value) { startDate = value; }
    public Instant getEndDate() { return endDate; } public void setEndDate(Instant value) { endDate = value; }
    public Location getPickupLocation() { return pickupLocation; } public void setPickupLocation(Location value) { pickupLocation = value; }
    public BigDecimal getAmount() { return amount; } public void setAmount(BigDecimal amount) { this.amount = amount; }
    public BookingStatus getStatus() { return status; } public void setStatus(BookingStatus status) { this.status = status; }
    public PaymentMethod getPaymentMethod() { return paymentMethod; } public void setPaymentMethod(PaymentMethod value) { paymentMethod = value; }
    public PaymentStatus getPaymentStatus() { return paymentStatus; } public void setPaymentStatus(PaymentStatus value) { paymentStatus = value; }
    public String getCarName() { return carName; } public void setCarName(String carName) { this.carName = carName; }
    public String getCarImage() { return carImage; } public void setCarImage(String carImage) { this.carImage = carImage; }
    public String getDate() { return date; } public void setDate(String date) { this.date = date; }
    public Double getTotalAmount() { return totalAmount; } public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
    public String getPackageName() { return packageName; } public void setPackageName(String packageName) { this.packageName = packageName; }
    public Integer getDuration() { return duration; } public void setDuration(Integer duration) { this.duration = duration; }
    public String getDurationUnit() { return durationUnit; } public void setDurationUnit(String durationUnit) { this.durationUnit = durationUnit; }
    public Instant getCreatedAt() { return createdAt; } public Instant getUpdatedAt() { return updatedAt; }
}
