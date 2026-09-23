package org.example.backend.repository;

import org.example.backend.model.Alert;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AlertRepository extends MongoRepository<Alert, String> {

    List<Alert> findAllByOrderByTimestampDesc();

    List<Alert> findByStatusOrderByTimestampDesc(String status);

    List<Alert> findByPatientIdOrderByTimestampDesc(String patientId);

    List<Alert> findByPatientIdAndStatusOrderByTimestampDesc(String patientId, String status);

    Optional<Alert> findTopByPatientIdAndVitalTypeAndStatusOrderByTimestampDesc(
            String patientId, String vitalType, String status);

    long countByStatus(String status);

    long countBySeverity(String severity);
}
