package org.example.backend.repository;

import org.example.backend.model.CarePlan;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CarePlanRepository extends MongoRepository<CarePlan, String> {

    Optional<CarePlan> findByCarePlanId(String carePlanId);

    List<CarePlan> findByPatientId(String patientId);

    Optional<CarePlan> findFirstByPatientIdOrderByCreatedAtDesc(String patientId);

    List<CarePlan> findByStatus(String status);

    long countByStatus(String status);
}
