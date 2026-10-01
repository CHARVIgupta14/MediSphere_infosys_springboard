package org.example.backend;

import ca.uhn.fhir.context.FhirContext;
import org.example.backend.dto.AdherenceLogRequest;
import org.example.backend.dto.CarePlanGenerateRequest;
import org.example.backend.dto.WhatIfSimulationRequest;
import org.example.backend.dto.WhatIfSimulationResponse;
import org.example.backend.model.CarePlan;
import org.example.backend.model.PatientTwin;
import org.example.backend.model.RiskPrediction;
import org.example.backend.model.VitalSigns;
import org.example.backend.repository.CarePlanRepository;
import org.example.backend.repository.PatientRepository;
import org.example.backend.repository.RiskPredictionRepository;
import org.example.backend.service.CarePlanService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class CarePlanServiceTest {

    @Mock
    private CarePlanRepository carePlanRepository;

    @Mock
    private PatientRepository patientRepository;

    @Mock
    private RiskPredictionRepository riskPredictionRepository;

    private FhirContext fhirContext;
    private CarePlanService carePlanService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        fhirContext = FhirContext.forR4();
        carePlanService = new CarePlanService(carePlanRepository, patientRepository, riskPredictionRepository, fhirContext);
    }

    @Test
    @DisplayName("Milestone 4: Should generate personalized care plan with ACC/AHA guidelines and medications")
    void testGeneratePersonalizedCarePlan() {
        PatientTwin patient = new PatientTwin();
        patient.setPatientId("P001");
        patient.setName("Aarav Sharma");
        patient.setAge(58);
        patient.setConditions(List.of("Hypertension", "Hyperlipidemia"));
        patient.setMedications(List.of("Amlodipine 5mg"));

        VitalSigns vitals = new VitalSigns();
        vitals.setHeartRate(82);
        vitals.setSpo2(98.0);
        patient.setLatestVitals(vitals);

        RiskPrediction risk = new RiskPrediction();
        risk.setProbability(0.243f);
        risk.setRiskCategory("High Risk");

        when(patientRepository.findByPatientId("P001")).thenReturn(Optional.of(patient));
        when(riskPredictionRepository.findTopByPatientIdOrderByTimestampDesc(any())).thenReturn(Optional.of(risk));
        when(carePlanRepository.save(any(CarePlan.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CarePlan plan = carePlanService.generatePersonalizedCarePlan("P001", new CarePlanGenerateRequest());

        assertNotNull(plan);
        assertEquals("P001", plan.getPatientId());
        assertEquals("Aarav Sharma", plan.getPatientName());
        assertEquals("High Risk", plan.getRiskCategory());
        assertEquals(24.3, plan.getBaselineRiskPercentage());
        assertTrue(plan.getTargetRiskPercentage() < plan.getBaselineRiskPercentage(), "Target risk must reflect clinical reduction");

        // Verify ACC/AHA guidelines included
        assertTrue(plan.getGuidelineReferences().stream().anyMatch(g -> g.contains("ACC/AHA")));
        
        // Verify medications (e.g. Statin, Lisinopril)
        assertFalse(plan.getMedications().isEmpty(), "Care plan must formulate medications");
        assertTrue(plan.getMedications().stream().anyMatch(m -> m.getMedicationName().contains("Atorvastatin")));

        // Verify lifestyle activities (Exercise, DASH diet, BP logging)
        assertEquals(4, plan.getLifestyleActivities().size());
        assertTrue(plan.getLifestyleActivities().stream().anyMatch(a -> a.getCategory().equals("EXERCISE")));
        assertTrue(plan.getLifestyleActivities().stream().anyMatch(a -> a.getCategory().equals("NUTRITION")));
    }

    @Test
    @DisplayName("Milestone 4: Counterfactual What-If Simulator accurately calculates risk reduction")
    void testWhatIfSimulationMath() {
        RiskPrediction risk = new RiskPrediction();
        risk.setProbability(0.243f); // 24.3% baseline risk
        when(riskPredictionRepository.findTopByPatientIdOrderByTimestampDesc(any())).thenReturn(Optional.of(risk));

        WhatIfSimulationRequest request = new WhatIfSimulationRequest();
        request.setPatientId("john-doe-001");
        request.setDeltaSystolicBp(15.0); // Drop BP by 15 mmHg
        request.setStopSmoking(true);      // Stop smoking
        request.setDeltaLdl(40.0);        // Drop LDL by 40 mg/dL
        request.setWeeklyExerciseMinutes(150); // 150 min exercise

        WhatIfSimulationResponse response = carePlanService.simulateWhatIf(request);

        assertNotNull(response);
        assertEquals(24.3, response.getBaselineRiskPercentage());
        assertTrue(response.getSimulatedRiskPercentage() < 12.0, "Multi-factorial intervention should drop risk below 12%");
        assertTrue(response.getAbsoluteRiskReduction() > 12.0, "Absolute risk reduction should be > 12%");
        assertTrue(response.getRelativeRiskReductionPercentage() > 50.0, "Relative risk reduction should be > 50%");
        assertEquals("High Risk", response.getBaselineCategory());
        assertEquals("Low Risk", response.getSimulatedCategory());
        assertFalse(response.getInterventionDrivers().isEmpty());
    }

    @Test
    @DisplayName("Milestone 4: Patient adherence logging updates adherence score dynamically")
    void testPatientAdherenceLogging() {
        CarePlan plan = new CarePlan();
        plan.setCarePlanId("CP-TEST-001");
        plan.setAdherenceScore(70.0);
        plan.setMedications(List.of(
                new CarePlan.CarePlanMedication("Atorvastatin", "20mg", "Daily", "Oral", "Lipids", "ACTIVE")
        ));
        plan.setLifestyleActivities(List.of(
                new CarePlan.CarePlanActivity("ACT-1", "EXERCISE", "Zone 2 Walk", "30 mins", "Daily", 7, "HIGH")
        ));

        when(carePlanRepository.findByCarePlanId("CP-TEST-001")).thenReturn(Optional.of(plan));
        when(carePlanRepository.save(any(CarePlan.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AdherenceLogRequest request = new AdherenceLogRequest();
        request.setActivityType("MEDICATION");
        request.setItemName("Atorvastatin");
        request.setCompleted(true);
        request.setNotes("Taken with evening meal");

        CarePlan updated = carePlanService.logPatientAdherence("CP-TEST-001", request);

        assertNotNull(updated);
        assertEquals(1, updated.getAdherenceLogs().size());
        assertTrue(updated.getMedications().get(0).isTakenToday());
        assertEquals(100.0, updated.getAdherenceScore());
    }
}
