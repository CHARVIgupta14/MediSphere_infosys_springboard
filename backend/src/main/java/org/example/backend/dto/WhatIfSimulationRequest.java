package org.example.backend.dto;

public class WhatIfSimulationRequest {

    private String patientId;
    private Double deltaSystolicBp;      // e.g. -15.0 mmHg
    private Boolean stopSmoking;          // e.g. true
    private Double deltaLdl;              // e.g. -40.0 mg/dL
    private Double deltaHba1c;            // e.g. -1.0 %
    private Double targetWeightLossKg;    // e.g. -5.0 kg
    private Integer weeklyExerciseMinutes;// e.g. 150 min

    public WhatIfSimulationRequest() {
    }

    public String getPatientId() {
        return patientId;
    }

    public void setPatientId(String patientId) {
        this.patientId = patientId;
    }

    public Double getDeltaSystolicBp() {
        return deltaSystolicBp;
    }

    public void setDeltaSystolicBp(Double deltaSystolicBp) {
        this.deltaSystolicBp = deltaSystolicBp;
    }

    public Boolean getStopSmoking() {
        return stopSmoking;
    }

    public void setStopSmoking(Boolean stopSmoking) {
        this.stopSmoking = stopSmoking;
    }

    public Double getDeltaLdl() {
        return deltaLdl;
    }

    public void setDeltaLdl(Double deltaLdl) {
        this.deltaLdl = deltaLdl;
    }

    public Double getDeltaHba1c() {
        return deltaHba1c;
    }

    public void setDeltaHba1c(Double deltaHba1c) {
        this.deltaHba1c = deltaHba1c;
    }

    public Double getTargetWeightLossKg() {
        return targetWeightLossKg;
    }

    public void setTargetWeightLossKg(Double targetWeightLossKg) {
        this.targetWeightLossKg = targetWeightLossKg;
    }

    public Integer getWeeklyExerciseMinutes() {
        return weeklyExerciseMinutes;
    }

    public void setWeeklyExerciseMinutes(Integer weeklyExerciseMinutes) {
        this.weeklyExerciseMinutes = weeklyExerciseMinutes;
    }
}
