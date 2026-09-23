package org.example.backend.controller;

import org.example.backend.Kafka.PatientEventProducer;
import org.example.backend.model.Alert;
import org.example.backend.service.AlertService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Milestone 3: Real-Time Monitoring & Alerts REST Controller
 * Exposes live clinical alerts, acknowledgment workflows, and anomaly simulation.
 */
@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "*")
public class AlertController {

    private final AlertService alertService;
    private final PatientEventProducer patientEventProducer;

    public AlertController(AlertService alertService, PatientEventProducer patientEventProducer) {
        this.alertService = alertService;
        this.patientEventProducer = patientEventProducer;
    }

    @GetMapping
    public ResponseEntity<List<Alert>> getAllAlerts() {
        return ResponseEntity.ok(alertService.getAllAlerts());
    }

    @GetMapping("/active")
    public ResponseEntity<List<Alert>> getActiveAlerts() {
        return ResponseEntity.ok(alertService.getActiveAlerts());
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Alert>> getAlertsForPatient(@PathVariable String patientId) {
        return ResponseEntity.ok(alertService.getAlertsForPatient(patientId));
    }

    @PostMapping("/{alertId}/acknowledge")
    public ResponseEntity<Alert> acknowledgeAlert(
            @PathVariable String alertId,
            @RequestParam(required = false, defaultValue = "Dr. Robert Hayes (Cardiologist)") String doctorName) {
        return ResponseEntity.ok(alertService.acknowledgeAlert(alertId, doctorName));
    }

    @PostMapping("/{alertId}/resolve")
    public ResponseEntity<Alert> resolveAlert(
            @PathVariable String alertId,
            @RequestParam(required = false, defaultValue = "Dr. Robert Hayes (Cardiologist)") String doctorName,
            @RequestParam(required = false, defaultValue = "Patient telemetry stabilized under clinical observation.") String notes) {
        return ResponseEntity.ok(alertService.resolveAlert(alertId, doctorName, notes));
    }

    @PostMapping("/{alertId}/reactivate")
    public ResponseEntity<Alert> reactivateAlert(@PathVariable String alertId) {
        return ResponseEntity.ok(alertService.reactivateAlert(alertId));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getAlertStats() {
        return ResponseEntity.ok(alertService.getAlertStats());
    }

    /**
     * Milestone 3 Demo Endpoint: Simulates a sudden critical anomaly
     * (e.g., Heart rate jumping to 145 BPM for John Doe).
     * Dispatches via Kafka and immediately triggers AlertService evaluation.
     */
    @PostMapping("/simulate")
    public ResponseEntity<Alert> simulateAnomaly(
            @RequestParam(defaultValue = "john-doe-001") String patientId,
            @RequestParam(defaultValue = "145") Integer heartRate,
            @RequestParam(defaultValue = "97.5") Double spo2,
            @RequestParam(defaultValue = "37.0") Double temperature) {

        // Publish live anomaly event to Kafka stream
        try {
            patientEventProducer.publishVitalsUpdated(patientId, heartRate, spo2, temperature);
        } catch (Exception ex) {
            // Non-blocking fallback if Kafka broker is inactive in local dev
        }

        // Evaluate and return triggered alert
        Alert alert = alertService.triggerEmergencySimulation(patientId, heartRate, spo2, temperature);
        return ResponseEntity.ok(alert);
    }
}
