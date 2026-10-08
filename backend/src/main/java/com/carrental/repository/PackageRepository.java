package com.carrental.repository;

import com.carrental.entity.RentalPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PackageRepository extends JpaRepository<RentalPackage, String> {
}
