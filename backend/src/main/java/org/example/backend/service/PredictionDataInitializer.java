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
    private final org.example.backend.repository.AlertRepository alertRepository;
    private final org.example.backend.repository.CarePlanRepository carePlanRepository;
    private final CarePlanService carePlanService;

    public PredictionDataInitializer(
            FLModelRepository flModelRepository,
            RiskPredictionRepository riskPredictionRepository,
            org.example.backend.repository.PatientRepository patientRepository,
            org.example.backend.repository.AlertRepository alertRepository,
            org.example.backend.repository.CarePlanRepository carePlanRepository,
            CarePlanService carePlanService) {
        this.flModelRepository = flModelRepository;
        this.riskPredictionRepository = riskPredictionRepository;
        this.patientRepository = patientRepository;
        this.alertRepository = alertRepository;
        this.carePlanRepository = carePlanRepository;
        this.carePlanService = carePlanService;
    }

    @Override
    public void run(String... args) {
        try {
            // Guarantee demo patients exist in MongoDB
            if (patientRepository.findByPatientId("sindhu-syn-000006").isEmpty()) {
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
                log.info("Saved baseline demo PatientTwin: sindhu-syn-000006 in MongoDB");
            }

            if (patientRepository.findByPatientId("john-doe-001").isEmpty()) {
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
                log.info("Saved baseline demo PatientTwin: john-doe-001 in MongoDB");
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

            // Seed Milestone 3 Real-Time Alerts if not present
            if (alertRepository.count() == 0) {
                log.info("Initializing Milestone 3 Real-Time Alerts in MongoDB...");

                org.example.backend.model.Alert alert1 = new org.example.backend.model.Alert(
                        "john-doe-001",
                        "John Doe",
                        "HEART_RATE",
                        145.0,
                        "> 120 BPM (Acute Tachycardia Spike)",
                        "CRITICAL",
                        "Cardiologist",
                        "Dr. Robert Hayes (On-Duty Cardiologist)",
                        "CRITICAL ALERT: Acute Tachycardia detected for John Doe. Heart rate jumped to 145 BPM. Potential ventricular arrhythmia or acute cardiac decompensation.",
                        "Order immediate 12-lead ECG, assess telemetry rhythm, verify hemodynamics, prepare IV beta-blocker/antiarrhythmic protocol, notify on-call cardiologist immediately."
                );
                alertRepository.save(alert1);

                org.example.backend.model.Alert alert2 = new org.example.backend.model.Alert(
                        "sindhu-syn-000006",
                        "Sindhu Sharma",
                        "SPO2",
                        88.5,
                        "< 90% (Acute Hypoxemia)",
                        "CRITICAL",
                        "Pulmonologist / Rapid Response",
                        "Dr. Sarah Lin (Pulmonology On-Duty)",
                        "CRITICAL ALERT: Acute Hypoxemia detected for Sindhu Sharma. SpO2 dropped to 88.5%.",
                        "Initiate high-flow supplemental oxygen therapy (2-4 L/min via nasal cannula), perform arterial blood gas (ABG), alert rapid response."
                );
                alert2.setStatus("ACKNOWLEDGED");
                alert2.setAcknowledgedBy("Dr. Sarah Lin");
                alert2.setAcknowledgedAt(java.time.LocalDateTime.now().minusMinutes(15));
                alertRepository.save(alert2);

                log.info("Saved baseline Milestone 3 Alerts: John Doe (HR 145 BPM - Critical Tachycardia) and Sindhu Sharma (SpO2 88.5% - Hypoxemia)");
            }

            // Seed Milestone 4 Precision Care Plans if not present
            if (carePlanRepository.count() == 0) {
                log.info("Initializing Milestone 4 Precision Care Plans in MongoDB...");
                try {
                    org.example.backend.model.CarePlan cpJohn = carePlanService.getOrCreateCarePlanForPatient("john-doe-001");
                    log.info("Seeded Milestone 4 CarePlan in MongoDB for John Doe: ID {}", cpJohn.getCarePlanId());

                    org.example.backend.model.CarePlan cpSindhu = carePlanService.getOrCreateCarePlanForPatient("sindhu-syn-000006");
                    log.info("Seeded Milestone 4 CarePlan in MongoDB for Sindhu Sharma: ID {}", cpSindhu.getCarePlanId());
                } catch (Exception ex) {
                    log.error("Failed to seed Milestone 4 CarePlans in MongoDB: {}", ex.getMessage());
                }
            }
        } catch (Exception e) {
            log.warn("PredictionDataInitializer non-blocking notice: {}", e.getMessage());
        }
    }
}
