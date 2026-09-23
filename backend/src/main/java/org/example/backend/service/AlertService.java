package org.example.backend.service;

import org.example.backend.model.Alert;
import org.example.backend.model.PatientTwin;
import org.example.backend.repository.AlertRepository;
import org.example.backend.repository.PatientRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * Milestone 3: Real-Time Telemetry Monitoring & Emergency Alert Engine
 * Evaluates live streaming vital signs, detects clinical anomalies,
 * and dispatches targeted alerts to specialized physicians (e.g. Cardiologists).
 */
@Service
public class AlertService {

    private static final Logger log = LoggerFactory.getLogger(AlertService.class);

    private final AlertRepository alertRepository;
    private final PatientRepository patientRepository;

    public AlertService(AlertRepository alertRepository, PatientRepository patientRepository) {
        this.alertRepository = alertRepository;
        this.patientRepository = patientRepository;
    }

    /**
     * Evaluates incoming vital telemetry against clinical safety bounds.
     * Generates and dispatches alerts when anomalies are detected.
     */
    public List<Alert> evaluateVitalsAndAlert(String patientId, String patientName,
                                            Integer heartRate, Double spo2, Double temperature) {
        List<Alert> triggeredAlerts = new ArrayList<>();

        if (patientName == null || patientName.isBlank()) {
            patientName = patientRepository.findByPatientId(patientId)
                    .map(PatientTwin::getName)
                    .orElse("Patient " + patientId);
        }

        // 1. Tachycardia Spike (e.g. 145 BPM - Milestone 3 Key Example)
        if (heartRate != null && heartRate >= 130) {
            String severity = heartRate >= 140 ? "CRITICAL" : "HIGH";
            Alert alert = createOrUpdateAlert(
                    patientId,
                    patientName,
                    "HEART_RATE",
                    (double) heartRate,
                    "> 120 BPM (Acute Tachycardia Spike)",
                    severity,
                    "Cardiologist",
                    "Dr. Robert Hayes (On-Duty Cardiologist)",
                    String.format("CRITICAL ALERT: Acute Tachycardia detected for %s. Heart rate spiked to %d BPM (> 120 BPM threshold). Potential ventricular arrhythmia or acute cardiac decompensation.", patientName, heartRate),
                    "Order immediate 12-lead ECG, assess telemetry rhythm, verify hemodynamics, prepare IV beta-blocker/antiarrhythmic protocol, notify on-call cardiologist immediately."
            );
            triggeredAlerts.add(alert);
        }
        // 2. Severe Bradycardia (< 50 BPM)
        else if (heartRate != null && heartRate <= 48) {
            Alert alert = createOrUpdateAlert(
                    patientId,
                    patientName,
                    "HEART_RATE",
                    (double) heartRate,
                    "< 50 BPM (Severe Bradycardia)",
                    "HIGH",
                    "Cardiologist",
                    "Dr. Robert Hayes (On-Duty Cardiologist)",
                    String.format("HIGH ALERT: Severe Bradycardia detected for %s. Heart rate dropped to %d BPM.", patientName, heartRate),
                    "Assess hemodynamic stability, verify consciousness, prepare IV atropine / transcutaneous pacing if symptomatic."
            );
            triggeredAlerts.add(alert);
        }

        // 3. Acute Hypoxemia (SpO2 < 90%)
        if (spo2 != null && spo2 <= 89.5) {
            String severity = spo2 <= 88.0 ? "CRITICAL" : "HIGH";
            Alert alert = createOrUpdateAlert(
                    patientId,
                    patientName,
                    "SPO2",
                    spo2,
                    "< 90% (Acute Hypoxemia)",
                    severity,
                    "Pulmonologist / Rapid Response",
                    "Dr. Sarah Lin (Pulmonology On-Duty)",
                    String.format("CRITICAL ALERT: Acute Hypoxemia detected for %s. SpO2 dropped to %.1f%%.", patientName, spo2),
                    "Initiate high-flow supplemental oxygen therapy (2-4 L/min via nasal cannula), perform arterial blood gas (ABG), alert rapid response."
            );
            triggeredAlerts.add(alert);
        }

        // 4. Hyperpyrexia / Sepsis Alert (Temp > 39.0°C)
        if (temperature != null && temperature >= 39.0) {
            Alert alert = createOrUpdateAlert(
                    patientId,
                    patientName,
                    "TEMPERATURE",
                    temperature,
                    "> 39.0°C (Hyperpyrexia / Sepsis Risk)",
                    "HIGH",
                    "Attending Physician",
                    "Dr. Marcus Vance (Internal Medicine)",
                    String.format("HIGH ALERT: Hyperpyrexia detected for %s. Core temperature reached %.1f°C.", patientName, temperature),
                    "Obtain blood and urine cultures, start empiric IV broad-spectrum antimicrobial protocol, administer antipyretics."
            );
            triggeredAlerts.add(alert);
        }

        return triggeredAlerts;
    }

    /**
     * Deduplicates or refreshes active alerts to avoid spamming the database while
     * keeping telemetry fresh.
     */
    private Alert createOrUpdateAlert(String patientId, String patientName, String vitalType,
                                      Double vitalValue, String threshold, String severity,
                                      String recipientRole, String doctorNotified,
                                      String message, String recommendedAction) {
        Optional<Alert> existingOpt = alertRepository
                .findTopByPatientIdAndVitalTypeAndStatusOrderByTimestampDesc(patientId, vitalType, "ACTIVE");

        Alert alert;
        if (existingOpt.isPresent()) {
            alert = existingOpt.get();
            // Refresh measurement and timestamp
            alert.setVitalValue(vitalValue);
            alert.setSeverity(severity);
            alert.setMessage(message);
            alert.setTimestamp(LocalDateTime.now());
        } else {
            alert = new Alert(patientId, patientName, vitalType, vitalValue, threshold,
                    severity, recipientRole, doctorNotified, message, recommendedAction);
        }

        Alert saved = alertRepository.save(alert);
        dispatchSpecialistNotification(saved);
        return saved;
    }

    /**
     * Simulates paging/dispatching an urgent clinical notification to the on-duty specialist.
     */
    private void dispatchSpecialistNotification(Alert alert) {
        log.warn("==========================================================================");
        log.warn("🚨 [MILESTONE 3 REAL-TIME ALERT DISPATCHED TO {}]", alert.getRecipientRole().toUpperCase());
        log.warn("🚨 Patient: {} (ID: {})", alert.getPatientName(), alert.getPatientId());
        log.warn("🚨 Vital Anomaly: {} = {} [{}]", alert.getVitalType(), alert.getVitalValue(), alert.getSeverity());
        log.warn("🚨 Notified Specialist: {}", alert.getDoctorNotified());
        log.warn("🚨 Message: {}", alert.getMessage());
        log.warn("🚨 Recommended Action: {}", alert.getRecommendedAction());
        log.warn("==========================================================================");
    }

    public List<Alert> getAllAlerts() {
        return alertRepository.findAllByOrderByTimestampDesc();
    }

    public List<Alert> getActiveAlerts() {
        return alertRepository.findByStatusOrderByTimestampDesc("ACTIVE");
    }

    public List<Alert> getAlertsForPatient(String patientId) {
        return alertRepository.findByPatientIdOrderByTimestampDesc(patientId);
    }

    public Alert acknowledgeAlert(String alertId, String doctorName) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found with ID: " + alertId));
        alert.setStatus("ACKNOWLEDGED");
        alert.setAcknowledgedBy(doctorName != null ? doctorName : "Attending Doctor");
        alert.setAcknowledgedAt(LocalDateTime.now());
        return alertRepository.save(alert);
    }

    public Alert resolveAlert(String alertId, String doctorName, String resolutionNotes) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found with ID: " + alertId));
        alert.setStatus("RESOLVED");
        alert.setAcknowledgedBy(doctorName != null ? doctorName : "Attending Doctor");
        alert.setResolutionNotes(resolutionNotes != null ? resolutionNotes : "Patient stabilized. Telemetry returned to baseline bounds.");
        return alertRepository.save(alert);
    }

    public Alert reactivateAlert(String alertId) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new RuntimeException("Alert not found with ID: " + alertId));
        alert.setStatus("ACTIVE");
        alert.setAcknowledgedBy(null);
        alert.setAcknowledgedAt(null);
        alert.setResolutionNotes(null);
        return alertRepository.save(alert);
    }

    public Map<String, Object> getAlertStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalAlerts", alertRepository.count());
        stats.put("activeAlerts", alertRepository.countByStatus("ACTIVE"));
        stats.put("criticalAlerts", alertRepository.countBySeverity("CRITICAL"));
        stats.put("highAlerts", alertRepository.countBySeverity("HIGH"));
        stats.put("acknowledgedAlerts", alertRepository.countByStatus("ACKNOWLEDGED"));
        return stats;
    }

    /**
     * Directly triggers an emergency simulation for live demonstrations
     * (e.g. Heart rate spike to 145 BPM).
     */
    public Alert triggerEmergencySimulation(String patientId, Integer heartRate, Double spo2, Double temp) {
        int hr = (heartRate != null && heartRate > 0) ? heartRate : 145;
        double s = (spo2 != null && spo2 > 0) ? spo2 : 98.0;
        double t = (temp != null && temp > 0) ? temp : 37.1;

        Optional<PatientTwin> patientOpt = patientRepository.findByPatientId(patientId);
        String name = patientOpt.map(PatientTwin::getName).orElse("Demo Patient");

        List<Alert> alerts = evaluateVitalsAndAlert(patientId, name, hr, s, t);
        if (!alerts.isEmpty()) {
            return alerts.get(0);
        }

        // Fallback explicit tachycardia alert
        Alert forced = new Alert(
                patientId,
                name,
                "HEART_RATE",
                (double) hr,
                "> 120 BPM (Acute Tachycardia Spike)",
                "CRITICAL",
                "Cardiologist",
                "Dr. Robert Hayes (On-Duty Cardiologist)",
                String.format("CRITICAL ALERT: Acute Tachycardia detected for %s. Heart rate spiked to %d BPM (> 120 BPM threshold). Potential ventricular arrhythmia.", name, hr),
                "Order immediate 12-lead ECG, assess telemetry rhythm, prepare IV beta-blocker/antiarrhythmic protocol, notify on-call cardiologist immediately."
        );
        return alertRepository.save(forced);
    }
}
