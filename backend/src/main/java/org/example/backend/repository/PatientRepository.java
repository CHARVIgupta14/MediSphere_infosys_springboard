package org.example.backend.repository;

import org.example.backend.model.PatientTwin;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface PatientRepository extends MongoRepository<PatientTwin, String> {

    Optional<PatientTwin> findByPatientId(String patientId);

    boolean existsByPatientId(String patientId);
}
