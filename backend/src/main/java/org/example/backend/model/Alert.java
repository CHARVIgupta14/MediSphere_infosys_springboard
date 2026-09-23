package org.example.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Milestone 3: Real-Time Monitoring & Alerts Entity
 * Captures vital sign anomalies detected on the Kafka telemetry stream
 * and tracks notification dispatch to clinical specialists (e.g. Cardiologists).
 */
@Document(collection = "patient_alerts")
public class Alert {

    @Id
    private String id;

    private String patientId;
    private String patientName;
    private String vitalType;          // HEART_RATE, SPO2, TEMPERATURE, COMPOUND_DISTRESS
    private Double vitalValue;         // Triggering measurement, e.g. 145.0
    private String thresholdViolated;  // e.g. "> 120 BPM (Critical Tachycardia)"
    private String severity;           // CRITICAL, HIGH, WARNING, NORMAL
    private String status;             // ACTIVE, ACKNOWLEDGED, RESOLVED
    private String recipientRole;      // Cardiologist, Pulmonologist, Attending Physician
    private String doctorNotified;      // e.g. "Dr. Robert Hayes (Cardiologist on Duty)"
    private String message;            // Detailed clinical notification
    private String recommendedAction;   // Clinical action protocol
    private LocalDateTime timestamp;
    private String acknowledgedBy;
    private LocalDateTime acknowledgedAt;
    private String resolutionNotes;

    public Alert() {
        this.id = UUID.randomUUID().toString();
        this.timestamp = LocalDateTime.now();
        this.status = "ACTIVE";
    }

    public Alert(String patientId, String patientName, String vitalType, Double vitalValue,
                 String thresholdViolated, String severity, String recipientRole,
                 String doctorNotified, String message, String recommendedAction) {
        this.id = UUID.randomUUID().toString();
        this.patientId = patientId;
        this.patientName = patientName;
        this.vitalType = vitalType;
        this.vitalValue = vitalValue;
        this.thresholdViolated = thresholdViolated;
        this.severity = severity;
        this.recipientRole = recipientRole;
        this.doctorNotified = doctorNotified;
        this.message = message;
        this.recommendedAction = recommendedAction;
        this.status = "ACTIVE";
        this.timestamp = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getPatientId() {
        return patientId;
    }

    public void setPatientId(String patientId) {
        this.patientId = patientId;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public String getVitalType() {
        return vitalType;
    }

    public void setVitalType(String vitalType) {
        this.vitalType = vitalType;
    }

    public Double getVitalValue() {
        return vitalValue;
    }

    public void setVitalValue(Double vitalValue) {
        this.vitalValue = vitalValue;
    }

    public String getThresholdViolated() {
        return thresholdViolated;
    }

    public void setThresholdViolated(String thresholdViolated) {
        this.thresholdViolated = thresholdViolated;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRecipientRole() {
        return recipientRole;
    }

    public void setRecipientRole(String recipientRole) {
        this.recipientRole = recipientRole;
    }

    public String getDoctorNotified() {
        return doctorNotified;
    }

    public void setDoctorNotified(String doctorNotified) {
        this.doctorNotified = doctorNotified;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getRecommendedAction() {
        return recommendedAction;
    }

    public void setRecommendedAction(String recommendedAction) {
        this.recommendedAction = recommendedAction;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getAcknowledgedBy() {
        return acknowledgedBy;
    }

    public void setAcknowledgedBy(String acknowledgedBy) {
        this.acknowledgedBy = acknowledgedBy;
    }

    public LocalDateTime getAcknowledgedAt() {
        return acknowledgedAt;
    }

    public void setAcknowledgedAt(LocalDateTime acknowledgedAt) {
        this.acknowledgedAt = acknowledgedAt;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }
}
