package org.example.backend.service;

import org.example.backend.model.FLModel;
import org.example.backend.model.RiskPrediction;
import org.example.backend.repository.FLModelRepository;
import org.example.backend.repository.RiskPredictionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Component
public class PredictionDataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(PredictionDataInitializer.class);

    private final FLModelRepository flModelRepository;
    private final RiskPredictionRepository riskPredictionRepository;
    private final org.example.backend.repository.PatientRepository patientRepository;

    public PredictionDataInitializer(
            FLModelRepository flModelRepository,
            RiskPredictionRepository riskPredictionRepository,
            org.example.backend.repository.PatientRepository patientRepository) {
        this.flModelRepository = flModelRepository;
        this.riskPredictionRepository = riskPredictionRepository;
        this.patientRepository = patientRepository;
    }

    @Override
    public void run(String... args) {
        try {
            // Seed demo patients if patient collection is empty
            if (patientRepository.count() == 0) {
                log.info("Initializing baseline PatientTwins in MongoDB...");
                org.example.backend.model.PatientTwin sindhu = new org.example.backend.model.PatientTwin();
                sindhu.setPatientId("sindhu-syn-000006");
                sindhu.setName("Sindhu Sharma");
                sindhu.setAge(42);
                sindhu.setGender("Female");
                sindhu.setBloodGroup("B+");
                sindhu.setConditions(java.util.List.of("Type 2 Diabetes", "Hypertension"));
                sindhu.setMedications(java.util.List.of("Metformin 500mg", "Lisinopril 10mg"));
                sindhu.setLatestVitals(new org.example.backend.model.VitalSigns(76, 98.5, 36.8, java.time.LocalDateTime.now()));
                patientRepository.save(sindhu);

                org.example.backend.model.PatientTwin john = new org.example.backend.model.PatientTwin();
                john.setPatientId("john-doe-001");
                john.setName("John Doe");
                john.setAge(58);
                john.setGender("Male");
                john.setBloodGroup("O+");
                john.setConditions(java.util.List.of("Hypertension", "Pre-Diabetes", "Hyperlipidemia"));
                john.setMedications(java.util.List.of("Amlodipine 5mg", "Atorvastatin 20mg"));
                john.setLatestVitals(new org.example.backend.model.VitalSigns(82, 97.2, 37.0, java.time.LocalDateTime.now()));
                patientRepository.save(john);
                log.info("Saved baseline demo PatientTwins: sindhu-syn-000006 and john-doe-001");
            }
            // Seed FLModel if not present
            if (flModelRepository.count() == 0) {
                log.info("Initializing Milestone 2 Federated Learning Model metrics in MongoDB...");
                FLModel model = new FLModel();
                model.setModelid(UUID.randomUUID());
                model.setRound(47);
                model.setAccuracy(0.914f);
                model.setTimestamp(Instant.now());
                model.setModelName("CVD-Risk-v3.2");
                model.setStatus("ACTIVE");
                model.setParticipatingNodes(3);
                model.setLoss(0.218f);

                flModelRepository.save(model);
                log.info("Saved initial FLModel: CVD-Risk-v3.2 (Round 47, Accuracy 91.4%)");
            }

            // Seed initial John Doe cardiovascular risk prediction if not present
            if (riskPredictionRepository.count() == 0) {
                log.info("Initializing baseline CVD Risk Prediction for John Doe...");
                RiskPrediction johnDoe = new RiskPrediction();
                johnDoe.setPredid(UUID.randomUUID());
                johnDoe.setPatientId(UUID.nameUUIDFromBytes("john-doe".getBytes()));
                johnDoe.setCondition("Cardiovascular Disease");
                johnDoe.setProbability(0.243f);
                johnDoe.setRiskCategory("High Risk");
                johnDoe.setModelVersion("CVD-Risk-v3.2");
                johnDoe.setFederatedRound(47);
                johnDoe.setTimestamp(Instant.now());
                johnDoe.setRecommendation("Intensify statin, BP target <130/80");
                johnDoe.setComparisonStat("Population average 12.1% vs Patient 2x higher risk");

                Map<String, Float> shapMap = new LinkedHashMap<>();
                shapMap.put("HbA1c", 0.08f);
                shapMap.put("BP", 0.06f);
                shapMap.put("Age", 0.05f);
                shapMap.put("LDL", 0.03f);
                shapMap.put("Smoking", 0.02f);
                shapMap.put("Family History", 0.015f);
                shapMap.put("eGFR", -0.012f);
                johnDoe.setShapValues(shapMap);

                Map<String, Object> features = new LinkedHashMap<>();
                features.put("Age", 58);
                features.put("BP", "142/90 mmHg");
                features.put("HbA1c", "7.8%");
                features.put("LDL", "154 mg/dL");
                features.put("eGFR", "62 mL/min/1.73m²");
                features.put("Smoking", "Current Smoker");
                features.put("FamilyHistory", "Positive");
                johnDoe.setInputFeatures(features);

                riskPredictionRepository.save(johnDoe);
                log.info("Saved baseline RiskPrediction for John Doe (10-yr CVD Risk: 24.3%)");
            }
        } catch (Exception e) {
            log.warn("PredictionDataInitializer non-blocking notice: {}", e.getMessage());
        }
    }
}
