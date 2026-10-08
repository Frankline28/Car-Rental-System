package com.carrental.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "packages")
public class RentalPackage {
    @Id @Column(length = 36) private String id;
    @Column(nullable = false, unique = true, length = 100) private String name;
    @Enumerated(EnumType.STRING) @Column(unique = true, length = 16) private Unit unit;
    private Integer hours;
    @Column(precision = 5, scale = 2) private BigDecimal discount = BigDecimal.ZERO;
    @Column(length = 500) private String description;
    public enum Unit { HOUR, DAY, WEEK, MONTH }
    @PrePersist @PreUpdate void normalize() { if (id == null) id = java.util.UUID.randomUUID().toString(); }
    public RentalPackage() {}
    public String getId() { return id; } public void setId(String id) { this.id = id; }
    public String getName() { return name; } public void setName(String name) { this.name = name; }
    public Unit getUnit() { return unit; } public void setUnit(Unit unit) { this.unit = unit; }
    public Integer getHours() { return hours; } public void setHours(Integer hours) { this.hours = hours; }
    public BigDecimal getDiscount() { return discount; } public void setDiscount(BigDecimal discount) { this.discount = discount; }
    public String getDescription() { return description; } public void setDescription(String description) { this.description = description; }
}
