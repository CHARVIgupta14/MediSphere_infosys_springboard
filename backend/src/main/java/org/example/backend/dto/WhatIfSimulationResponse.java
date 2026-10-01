package org.example.backend.dto;

import java.util.ArrayList;
import java.util.List;

public class WhatIfSimulationResponse {

    private String patientId;
    private double baselineRiskPercentage;
    private double simulatedRiskPercentage;
    private double absoluteRiskReduction;
    private double relativeRiskReductionPercentage;
    private String baselineCategory;
    private String simulatedCategory;
    private List<String> interventionDrivers = new ArrayList<>();
    private String clinicalSummary;

    public WhatIfSimulationResponse() {
    }

    public String getPatientId() {
        return patientId;
    }

    public void setPatientId(String patientId) {
        this.patientId = patientId;
    }

    public double getBaselineRiskPercentage() {
        return baselineRiskPercentage;
    }

    public void setBaselineRiskPercentage(double baselineRiskPercentage) {
        this.baselineRiskPercentage = baselineRiskPercentage;
    }

    public double getSimulatedRiskPercentage() {
        return simulatedRiskPercentage;
    }

    public void setSimulatedRiskPercentage(double simulatedRiskPercentage) {
        this.simulatedRiskPercentage = simulatedRiskPercentage;
    }

    public double getAbsoluteRiskReduction() {
        return absoluteRiskReduction;
    }

    public void setAbsoluteRiskReduction(double absoluteRiskReduction) {
        this.absoluteRiskReduction = absoluteRiskReduction;
    }

    public double getRelativeRiskReductionPercentage() {
        return relativeRiskReductionPercentage;
    }

    public void setRelativeRiskReductionPercentage(double relativeRiskReductionPercentage) {
        this.relativeRiskReductionPercentage = relativeRiskReductionPercentage;
    }

    public String getBaselineCategory() {
        return baselineCategory;
    }

    public void setBaselineCategory(String baselineCategory) {
        this.baselineCategory = baselineCategory;
    }

    public String getSimulatedCategory() {
        return simulatedCategory;
    }

    public void setSimulatedCategory(String simulatedCategory) {
        this.simulatedCategory = simulatedCategory;
    }

    public List<String> getInterventionDrivers() {
        return interventionDrivers;
    }

    public void setInterventionDrivers(List<String> interventionDrivers) {
        this.interventionDrivers = interventionDrivers;
    }

    public String getClinicalSummary() {
        return clinicalSummary;
    }

    public void setClinicalSummary(String clinicalSummary) {
        this.clinicalSummary = clinicalSummary;
    }
}
