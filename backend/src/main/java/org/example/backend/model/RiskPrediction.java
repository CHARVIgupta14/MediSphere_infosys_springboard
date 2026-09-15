package org.example.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Document(collection = "risk_predictions")
public class RiskPrediction {

    @Id
    private UUID predid;

    private String condition;

    private Float probability;

    private UUID patientId;

    private Map<String, Float> shapValues = new HashMap<>();

    private String riskCategory;

    private Instant timestamp;

    private String modelVersion;

    private Integer federatedRound;

    private Map<String, Object> inputFeatures = new HashMap<>();

    private String recommendation;

    private String comparisonStat;

    public RiskPrediction() {
        this.predid = UUID.randomUUID();
        this.timestamp = Instant.now();
    }

    public RiskPrediction(UUID predid, String condition, Float probability, UUID patientId,
                          Map<String, Float> shapValues, String riskCategory) {
        this.predid = predid != null ? predid : UUID.randomUUID();
        this.condition = condition;
        this.probability = probability;
        this.patientId = patientId;
        this.shapValues = shapValues != null ? shapValues : new HashMap<>();
        this.riskCategory = riskCategory;
        this.timestamp = Instant.now();
    }

    public UUID getPredid() {
        return predid;
    }

    public void setPredid(UUID predid) {
        this.predid = predid;
    }

    public String getCondition() {
        return condition;
    }

    public void setCondition(String condition) {
        this.condition = condition;
    }

    public Float getProbability() {
        return probability;
    }

    public void setProbability(Float probability) {
        this.probability = probability;
    }

    public UUID getPatientId() {
        return patientId;
    }

    public void setPatientId(UUID patientId) {
        this.patientId = patientId;
    }

    public Map<String, Float> getShapValues() {
        return shapValues;
    }

    public void setShapValues(Map<String, Float> shapValues) {
        this.shapValues = shapValues;
    }

    public String getRiskCategory() {
        return riskCategory;
    }

    public void setRiskCategory(String riskCategory) {
        this.riskCategory = riskCategory;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }

    public String getModelVersion() {
        return modelVersion;
    }

    public void setModelVersion(String modelVersion) {
        this.modelVersion = modelVersion;
    }

    public Integer getFederatedRound() {
        return federatedRound;
    }

    public void setFederatedRound(Integer federatedRound) {
        this.federatedRound = federatedRound;
    }

    public Map<String, Object> getInputFeatures() {
        return inputFeatures;
    }

    public void setInputFeatures(Map<String, Object> inputFeatures) {
        this.inputFeatures = inputFeatures;
    }

    public String getRecommendation() {
        return recommendation;
    }

    public void setRecommendation(String recommendation) {
        this.recommendation = recommendation;
    }

    public String getComparisonStat() {
        return comparisonStat;
    }

    public void setComparisonStat(String comparisonStat) {
        this.comparisonStat = comparisonStat;
    }
}
