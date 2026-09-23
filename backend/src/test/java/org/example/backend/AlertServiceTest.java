package org.example.backend;

import org.example.backend.model.Alert;
import org.example.backend.model.PatientTwin;
import org.example.backend.repository.AlertRepository;
import org.example.backend.repository.PatientRepository;
import org.example.backend.service.AlertService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

class AlertServiceTest {

    private AlertRepository alertRepository;
    private PatientRepository patientRepository;
    private AlertService alertService;

    @BeforeEach
    void setUp() {
        alertRepository = Mockito.mock(AlertRepository.class);
        patientRepository = Mockito.mock(PatientRepository.class);
        alertService = new AlertService(alertRepository, patientRepository);

        PatientTwin patient = new PatientTwin();
        patient.setPatientId("john-doe-001");
        patient.setName("John Doe");
        when(patientRepository.findByPatientId("john-doe-001")).thenReturn(Optional.of(patient));

        when(alertRepository.save(any(Alert.class))).thenAnswer(invocation -> invocation.getArgument(0));
    }

    @Test
    void testMilestone3TachycardiaSpikeTo145BpmAlertsCardiologist() {
        // Milestone 3 scenario: Heart rate suddenly increases to 145 bpm
        List<Alert> alerts = alertService.evaluateVitalsAndAlert(
                "john-doe-001",
                "John Doe",
                145,   // Sudden acute spike
                97.5,
                37.0
        );

        assertNotNull(alerts);
        assertEquals(1, alerts.size());

        Alert alert = alerts.get(0);
        assertEquals("HEART_RATE", alert.getVitalType());
        assertEquals(145.0, alert.getVitalValue());
        assertEquals("CRITICAL", alert.getSeverity());
        assertEquals("Cardiologist", alert.getRecipientRole());
        assertTrue(alert.getDoctorNotified().contains("Cardiologist"));
        assertTrue(alert.getMessage().contains("145 BPM"));
        assertTrue(alert.getRecommendedAction().contains("12-lead ECG"));
        assertEquals("ACTIVE", alert.getStatus());
    }

    @Test
    void testAcuteHypoxemiaAlertsPulmonologist() {
        List<Alert> alerts = alertService.evaluateVitalsAndAlert(
                "john-doe-001",
                "John Doe",
                82,
                87.0,  // Severe hypoxia
                36.8
        );

        assertNotNull(alerts);
        assertEquals(1, alerts.size());

        Alert alert = alerts.get(0);
        assertEquals("SPO2", alert.getVitalType());
        assertEquals(87.0, alert.getVitalValue());
        assertEquals("CRITICAL", alert.getSeverity());
        assertTrue(alert.getRecipientRole().contains("Pulmonologist"));
        assertTrue(alert.getRecommendedAction().contains("oxygen"));
    }

    @Test
    void testNormalVitalsDoNotTriggerAlerts() {
        List<Alert> alerts = alertService.evaluateVitalsAndAlert(
                "john-doe-001",
                "John Doe",
                78,    // Normal HR
                98.5,  // Normal SpO2
                36.8   // Normal Temp
        );

        assertNotNull(alerts);
        assertTrue(alerts.isEmpty());
    }
}
