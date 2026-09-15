package org.example.backend.repository;

import org.example.backend.model.RiskPrediction;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RiskPredictionRepository extends MongoRepository<RiskPrediction, UUID> {

    List<RiskPrediction> findByPatientId(UUID patientId);

    Optional<RiskPrediction> findTopByPatientIdOrderByTimestampDesc(UUID patientId);

    List<RiskPrediction> findByRiskCategoryIgnoreCase(String riskCategory);

    long countByRiskCategoryIgnoreCase(String riskCategory);

    long countByTimestampBetween(Instant start, Instant end);

    List<RiskPrediction> findTop10ByOrderByTimestampDesc();
}
