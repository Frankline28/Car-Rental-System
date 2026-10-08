package com.carrental.config;

import com.carrental.entity.*;
import com.carrental.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {
    private final CarRepository cars; private final PackageRepository packages; private final LocationRepository locations;
    private final UserRepository users; private final PasswordEncoder encoder;
    private final LegacyDataMigration migration;
    private final String adminPassword;
    public DataSeeder(CarRepository cars,PackageRepository packages,LocationRepository locations,UserRepository users,
                      PasswordEncoder encoder,LegacyDataMigration migration,@Value("${app.seed.admin-password:}") String adminPassword) {
        this.cars=cars; this.packages=packages; this.locations=locations; this.users=users; this.encoder=encoder; this.migration=migration; this.adminPassword=adminPassword;
    }
    @Override public void run(String... args) {
        seedLocations(); seedPackages(); migration.migrate(); seedUsers(); seedCars();
    }
    private void seedLocations() {
        for(String name:List.of("Chennai","Bengaluru","Hyderabad","Mumbai","Delhi","Airport","Downtown","City Center","West Side"))
            locations.findByNameIgnoreCase(name).orElseGet(() -> locations.save(new Location(null,name)));
    }
    private void seedPackages() {
        seedPackage("hourly","Hourly",RentalPackage.Unit.HOUR,1,"-30","Short city trips");
        seedPackage("daily","Daily",RentalPackage.Unit.DAY,24,"0","Standard day rental");
        seedPackage("weekly","Weekly",RentalPackage.Unit.WEEK,168,"12","Discounted weekly rental");
        seedPackage("monthly","Monthly",RentalPackage.Unit.MONTH,720,"30","Discounted monthly rental");
    }
    private void seedPackage(String id,String name,RentalPackage.Unit unit,int hours,String discount,String description) {
        if(!packages.existsById(id)) { RentalPackage p=new RentalPackage(); p.setId(id); p.setName(name); p.setUnit(unit); p.setHours(hours); p.setDiscount(new BigDecimal(discount)); p.setDescription(description); packages.save(p); }
    }
    private void seedUsers() {
        if(users.findByEmailIgnoreCase("admin@carrental.com").isEmpty()) {
            if(adminPassword.isBlank()) throw new IllegalStateException("Set SEED_ADMIN_PASSWORD before starting the backend to create the initial administrator");
            User admin=new User(); admin.setName("Car Rental Admin"); admin.setEmail("admin@carrental.com"); admin.setPassword(encoder.encode(adminPassword));
            admin.setRole(User.Role.ADMIN); admin.setStatus(User.UserStatus.ACTIVE); users.save(admin);
        }
        if(users.findByEmailIgnoreCase("customer@carrental.com").isEmpty()) {
            String password=System.getenv("SEED_CUSTOMER_PASSWORD");
            if(password==null||password.isBlank()) password=java.util.UUID.randomUUID()+"-S9!";
            User customer=new User(); customer.setName("Sample Customer"); customer.setEmail("customer@carrental.com"); customer.setPassword(encoder.encode(password)); customer.setRole(User.Role.CUSTOMER); customer.setStatus(User.UserStatus.ACTIVE); users.save(customer);
        }
    }
    private void seedCars() {
        if(cars.count()!=0) return;
        saveCar("Maruti Suzuki","Swift",2024,"Hatchback",new BigDecimal("1800"),5,"Chennai",4,"1197 cc");
        saveCar("Hyundai","Creta",2024,"SUV",new BigDecimal("3400"),5,"Bengaluru",3,"1493 cc");
        saveCar("Honda","City",2023,"Sedan",new BigDecimal("2600"),5,"Hyderabad",3,"1498 cc");
        saveCar("Toyota","Innova Crysta",2023,"MPV",new BigDecimal("4200"),7,"Mumbai",2,"2393 cc");
        saveCar("Mercedes-Benz","E-Class",2023,"Luxury",new BigDecimal("11000"),5,"Delhi",1,"1991 cc");
    }
    private void saveCar(String make,String model,int year,String type,BigDecimal daily,int seats,String city,int quantity,String engine) {
        Car c=new Car(); c.setMake(make); c.setModel(model); c.setYear(year); c.setType(type); c.setTransmission("Automatic"); c.setFuel("Petrol"); c.setSeats(seats);
        c.setDailyRate(daily); c.setHourlyRate(daily.divide(BigDecimal.valueOf(24),2,java.math.RoundingMode.HALF_UP));
        c.setWeeklyRate(daily.multiply(BigDecimal.valueOf(7))); c.setMonthlyRate(daily.multiply(BigDecimal.valueOf(30)));
        c.setQuantity(quantity); c.setLocation(locations.findByNameIgnoreCase(city).orElseThrow()); c.setAvailable(true); c.setFeatures(List.of("Air conditioning","Bluetooth audio","ABS"));
        Car.Specifications specs=new Car.Specifications(); specs.setEngine(engine); specs.setPower("Standard"); specs.setAcceleration("Standard"); c.setSpecifications(specs); cars.save(c);
    }
}
