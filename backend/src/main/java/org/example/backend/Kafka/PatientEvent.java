package org.example.backend.kafka;

public class PatientEvent {

    private String eventType;
    private String patientId;
    private String patientName;

    public PatientEvent() {
    }

    public PatientEvent(String eventType, String patientId, String patientName) {
        this.eventType = eventType;
        this.patientId = patientId;
        this.patientName = patientName;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
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
}