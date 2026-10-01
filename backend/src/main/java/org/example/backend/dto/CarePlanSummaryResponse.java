package org.example.backend.dto;

import java.util.Map;

public class CarePlanSummaryResponse {

    private long totalActiveCarePlans;
    private double populationAdherenceRate; // e.g. 78.2%
    private long highRiskCoveredCount;
    private long pendingReviewCount;
    private Map<String, Long> carePlansByStatus;

    public CarePlanSummaryResponse() {
    }

    public CarePlanSummaryResponse(long totalActiveCarePlans, double populationAdherenceRate, long highRiskCoveredCount, long pendingReviewCount, Map<String, Long> carePlansByStatus) {
        this.totalActiveCarePlans = totalActiveCarePlans;
        this.populationAdherenceRate = populationAdherenceRate;
        this.highRiskCoveredCount = highRiskCoveredCount;
        this.pendingReviewCount = pendingReviewCount;
        this.carePlansByStatus = carePlansByStatus;
    }

    public long getTotalActiveCarePlans() {
        return totalActiveCarePlans;
    }

    public void setTotalActiveCarePlans(long totalActiveCarePlans) {
        this.totalActiveCarePlans = totalActiveCarePlans;
    }

    public double getPopulationAdherenceRate() {
        return populationAdherenceRate;
    }

    public void setPopulationAdherenceRate(double populationAdherenceRate) {
        this.populationAdherenceRate = populationAdherenceRate;
    }

    public long getHighRiskCoveredCount() {
        return highRiskCoveredCount;
    }

    public void setHighRiskCoveredCount(long highRiskCoveredCount) {
        this.highRiskCoveredCount = highRiskCoveredCount;
    }

    public long getPendingReviewCount() {
        return pendingReviewCount;
    }

    public void setPendingReviewCount(long pendingReviewCount) {
        this.pendingReviewCount = pendingReviewCount;
    }

    public Map<String, Long> getCarePlansByStatus() {
        return carePlansByStatus;
    }

    public void setCarePlansByStatus(Map<String, Long> carePlansByStatus) {
        this.carePlansByStatus = carePlansByStatus;
    }
}
