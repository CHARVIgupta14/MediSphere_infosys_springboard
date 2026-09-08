package org.example.backend.Kafka;

public class PatientEvent {

    private String eventType;
    private String patientId;
    private String patientName;

    private Integer heartRate;
    private Double spo2;
    private Double temperature;

    public PatientEvent() {
    }

    public PatientEvent(
            String eventType,
            String patientId,
            String patientName) {

        this.eventType = eventType;
        this.patientId = patientId;
        this.patientName = patientName;
    }

    public PatientEvent(
            String eventType,
            String patientId,
            Integer heartRate,
            Double spo2,
            Double temperature) {

        this.eventType = eventType;
        this.patientId = patientId;
        this.heartRate = heartRate;
        this.spo2 = spo2;
        this.temperature = temperature;
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

    public Integer getHeartRate() {
        return heartRate;
    }

    public void setHeartRate(Integer heartRate) {
        this.heartRate = heartRate;
    }

    public Double getSpo2() {
        return spo2;
    }

    public void setSpo2(Double spo2) {
        this.spo2 = spo2;
    }

    public Double getTemperature() {
        return temperature;
    }

    public void setTemperature(Double temperature) {
        this.temperature = temperature;
    }
}