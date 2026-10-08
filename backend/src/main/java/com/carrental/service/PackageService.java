package com.carrental.service;

import com.carrental.dto.PackageDtos.*;
import com.carrental.entity.RentalPackage;
import com.carrental.exception.ResourceNotFoundException;
import com.carrental.repository.BookingRepository;
import com.carrental.repository.PackageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service public class PackageService {
    private final PackageRepository packages; private final BookingRepository bookings;
    public PackageService(PackageRepository packages, BookingRepository bookings) { this.packages=packages; this.bookings=bookings; }
    @Transactional(readOnly=true) public List<PackageResponse> list() { return packages.findAll().stream().map(this::dto).toList(); }
    @Transactional(readOnly=true) public PackageResponse get(String id) { return dto(find(id)); }
    @Transactional public PackageResponse create(PackageRequest r) { RentalPackage p=new RentalPackage(); apply(p,r); return dto(packages.save(p)); }
    @Transactional public PackageResponse update(String id,PackageRequest r) { RentalPackage p=find(id); apply(p,r); return dto(packages.save(p)); }
    @Transactional public void delete(String id) { RentalPackage p=find(id); if(bookings.existsByRentalPackageId(id)) throw new IllegalArgumentException("Package has booking history and cannot be deleted"); packages.delete(p); }
    private RentalPackage find(String id) { return packages.findById(id).orElseThrow(() -> new ResourceNotFoundException("Package not found")); }
    private void apply(RentalPackage p,PackageRequest r) { p.setName(r.name().trim()); p.setUnit(r.unit()); p.setHours(r.hours()); p.setDiscount(r.discount()); p.setDescription(r.description()); }
    private PackageResponse dto(RentalPackage p) { return new PackageResponse(p.getId(),p.getName(),p.getUnit().name().toLowerCase(),p.getHours(),p.getDiscount(),p.getDescription()); }
}
