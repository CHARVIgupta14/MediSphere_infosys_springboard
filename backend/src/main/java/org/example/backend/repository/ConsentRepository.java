package org.example.backend.repository;

import org.example.backend.model.consent;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface ConsentRepository
        extends MongoRepository<consent, String> {

    Optional<consent> findByPatientId(String patientId);
}