package com.carrental.repository;

import com.carrental.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LocationRepository extends JpaRepository<Location, Long> {
    java.util.Optional<Location> findByNameIgnoreCase(String name);
}
