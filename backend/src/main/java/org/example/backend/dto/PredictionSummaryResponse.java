package org.example.backend.dto;

import java.time.Instant;

public class PredictionSummaryResponse {

    private long totalPredictionsToday;
    private Float modelAccuracy;
    private Integer round;
    private long highRiskCount;
    private String modelName;
    private Instant timestamp;

    public PredictionSummaryResponse() {
        this.timestamp = Instant.now();
    }

    public PredictionSummaryResponse(long totalPredictionsToday, Float modelAccuracy,
                                     Integer round, long highRiskCount, String modelName) {
        this.totalPredictionsToday = totalPredictionsToday;
        this.modelAccuracy = modelAccuracy;
        this.round = round;
        this.highRiskCount = highRiskCount;
        this.modelName = modelName;
        this.timestamp = Instant.now();
    }

    public long getTotalPredictionsToday() {
        return totalPredictionsToday;
    }

    public void setTotalPredictionsToday(long totalPredictionsToday) {
        this.totalPredictionsToday = totalPredictionsToday;
    }

    public Float getModelAccuracy() {
        return modelAccuracy;
    }

    public void setModelAccuracy(Float modelAccuracy) {
        this.modelAccuracy = modelAccuracy;
    }

    public Integer getRound() {
        return round;
    }

    public void setRound(Integer round) {
        this.round = round;
    }

    public long getHighRiskCount() {
        return highRiskCount;
    }

    public void setHighRiskCount(long highRiskCount) {
        this.highRiskCount = highRiskCount;
    }

    public String getModelName() {
        return modelName;
    }

    public void setModelName(String modelName) {
        this.modelName = modelName;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}
