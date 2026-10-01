package org.example.backend.dto;

public class AdherenceLogRequest {

    private String activityType; // MEDICATION, EXERCISE, NUTRITION, VITAL_CHECK
    private String itemName;
    private boolean completed;
    private String notes;
    private Double recordedVital;

    public AdherenceLogRequest() {
    }

    public String getActivityType() {
        return activityType;
    }

    public void setActivityType(String activityType) {
        this.activityType = activityType;
    }

    public String getItemName() {
        return itemName;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Double getRecordedVital() {
        return recordedVital;
    }

    public void setRecordedVital(Double recordedVital) {
        this.recordedVital = recordedVital;
    }
}
