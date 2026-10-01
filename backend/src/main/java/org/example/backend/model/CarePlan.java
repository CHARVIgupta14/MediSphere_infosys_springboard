package org.example.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Document(collection = "care_plans")
public class CarePlan {

    @Id
    private String id;

    private String carePlanId;
    private String patientId;
    private String patientName;
    private String title;
    private String status; // ACTIVE, COMPLETED, DRAFT, ARCHIVED
    private String riskCategory; // High Risk, Moderate Risk, Low Risk
    private Double baselineRiskPercentage;
    private Double targetRiskPercentage;
    private Integer durationWeeks;
    private LocalDateTime startDate;
    private LocalDateTime targetEndDate;
    private Double adherenceScore; // e.g. 78.5
    private String clinicalRationale;
    private List<String> guidelineReferences = new ArrayList<>();

    private List<CarePlanMedication> medications = new ArrayList<>();
    private List<CarePlanActivity> lifestyleActivities = new ArrayList<>();
    private List<CarePlanGoal> clinicalGoals = new ArrayList<>();
    private List<CarePlanMilestone> milestones = new ArrayList<>();
    private List<AdherenceLogEntry> adherenceLogs = new ArrayList<>();

    private String fhirCarePlanResourceId;
    private String fhirSyncStatus; // SYNCED, PENDING, LOCAL_ONLY
    private String attendingDoctorNotes;
    private String attendingPhysician;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public CarePlan() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCarePlanId() {
        return carePlanId;
    }

    public void setCarePlanId(String carePlanId) {
        this.carePlanId = carePlanId;
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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRiskCategory() {
        return riskCategory;
    }

    public void setRiskCategory(String riskCategory) {
        this.riskCategory = riskCategory;
    }

    public Double getBaselineRiskPercentage() {
        return baselineRiskPercentage;
    }

    public void setBaselineRiskPercentage(Double baselineRiskPercentage) {
        this.baselineRiskPercentage = baselineRiskPercentage;
    }

    public Double getTargetRiskPercentage() {
        return targetRiskPercentage;
    }

    public void setTargetRiskPercentage(Double targetRiskPercentage) {
        this.targetRiskPercentage = targetRiskPercentage;
    }

    public Integer getDurationWeeks() {
        return durationWeeks;
    }

    public void setDurationWeeks(Integer durationWeeks) {
        this.durationWeeks = durationWeeks;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getTargetEndDate() {
        return targetEndDate;
    }

    public void setTargetEndDate(LocalDateTime targetEndDate) {
        this.targetEndDate = targetEndDate;
    }

    public Double getAdherenceScore() {
        return adherenceScore;
    }

    public void setAdherenceScore(Double adherenceScore) {
        this.adherenceScore = adherenceScore;
    }

    public String getClinicalRationale() {
        return clinicalRationale;
    }

    public void setClinicalRationale(String clinicalRationale) {
        this.clinicalRationale = clinicalRationale;
    }

    public List<String> getGuidelineReferences() {
        return guidelineReferences;
    }

    public void setGuidelineReferences(List<String> guidelineReferences) {
        this.guidelineReferences = guidelineReferences;
    }

    public List<CarePlanMedication> getMedications() {
        return medications;
    }

    public void setMedications(List<CarePlanMedication> medications) {
        this.medications = medications;
    }

    public List<CarePlanActivity> getLifestyleActivities() {
        return lifestyleActivities;
    }

    public void setLifestyleActivities(List<CarePlanActivity> lifestyleActivities) {
        this.lifestyleActivities = lifestyleActivities;
    }

    public List<CarePlanGoal> getClinicalGoals() {
        return clinicalGoals;
    }

    public void setClinicalGoals(List<CarePlanGoal> clinicalGoals) {
        this.clinicalGoals = clinicalGoals;
    }

    public List<CarePlanMilestone> getMilestones() {
        return milestones;
    }

    public void setMilestones(List<CarePlanMilestone> milestones) {
        this.milestones = milestones;
    }

    public List<AdherenceLogEntry> getAdherenceLogs() {
        return adherenceLogs;
    }

    public void setAdherenceLogs(List<AdherenceLogEntry> adherenceLogs) {
        this.adherenceLogs = adherenceLogs;
    }

    public String getFhirCarePlanResourceId() {
        return fhirCarePlanResourceId;
    }

    public void setFhirCarePlanResourceId(String fhirCarePlanResourceId) {
        this.fhirCarePlanResourceId = fhirCarePlanResourceId;
    }

    public String getFhirSyncStatus() {
        return fhirSyncStatus;
    }

    public void setFhirSyncStatus(String fhirSyncStatus) {
        this.fhirSyncStatus = fhirSyncStatus;
    }

    public String getAttendingDoctorNotes() {
        return attendingDoctorNotes;
    }

    public void setAttendingDoctorNotes(String attendingDoctorNotes) {
        this.attendingDoctorNotes = attendingDoctorNotes;
    }

    public String getAttendingPhysician() {
        return attendingPhysician;
    }

    public void setAttendingPhysician(String attendingPhysician) {
        this.attendingPhysician = attendingPhysician;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // --- Sub-classes ---

    public static class CarePlanMedication {
        private String medicationName;
        private String dosage;
        private String frequency;
        private String route;
        private String indication;
        private String status; // ACTIVE, TITRATING, DISCONTINUED
        private boolean takenToday;

        public CarePlanMedication() {}

        public CarePlanMedication(String medicationName, String dosage, String frequency, String route, String indication, String status) {
            this.medicationName = medicationName;
            this.dosage = dosage;
            this.frequency = frequency;
            this.route = route;
            this.indication = indication;
            this.status = status;
            this.takenToday = false;
        }

        public String getMedicationName() {
            return medicationName;
        }

        public void setMedicationName(String medicationName) {
            this.medicationName = medicationName;
        }

        public String getDosage() {
            return dosage;
        }

        public void setDosage(String dosage) {
            this.dosage = dosage;
        }

        public String getFrequency() {
            return frequency;
        }

        public void setFrequency(String frequency) {
            this.frequency = frequency;
        }

        public String getRoute() {
            return route;
        }

        public void setRoute(String route) {
            this.route = route;
        }

        public String getIndication() {
            return indication;
        }

        public void setIndication(String indication) {
            this.indication = indication;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public boolean isTakenToday() {
            return takenToday;
        }

        public void setTakenToday(boolean takenToday) {
            this.takenToday = takenToday;
        }
    }

    public static class CarePlanActivity {
        private String id;
        private String category; // EXERCISE, NUTRITION, MONITORING, LIFESTYLE
        private String title;
        private String description;
        private String targetFrequency;
        private Integer targetWeeklyCompletions;
        private Integer currentWeeklyCompletions;
        private String priority;
        private boolean completedToday;

        public CarePlanActivity() {}

        public CarePlanActivity(String id, String category, String title, String description, String targetFrequency, Integer targetWeeklyCompletions, String priority) {
            this.id = id;
            this.category = category;
            this.title = title;
            this.description = description;
            this.targetFrequency = targetFrequency;
            this.targetWeeklyCompletions = targetWeeklyCompletions;
            this.currentWeeklyCompletions = 0;
            this.priority = priority;
            this.completedToday = false;
        }

        public String getId() {
            return id;
        }

        public void setId(String id) {
            this.id = id;
        }

        public String getCategory() {
            return category;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getTargetFrequency() {
            return targetFrequency;
        }

        public void setTargetFrequency(String targetFrequency) {
            this.targetFrequency = targetFrequency;
        }

        public Integer getTargetWeeklyCompletions() {
            return targetWeeklyCompletions;
        }

        public void setTargetWeeklyCompletions(Integer targetWeeklyCompletions) {
            this.targetWeeklyCompletions = targetWeeklyCompletions;
        }

        public Integer getCurrentWeeklyCompletions() {
            return currentWeeklyCompletions;
        }

        public void setCurrentWeeklyCompletions(Integer currentWeeklyCompletions) {
            this.currentWeeklyCompletions = currentWeeklyCompletions;
        }

        public String getPriority() {
            return priority;
        }

        public void setPriority(String priority) {
            this.priority = priority;
        }

        public boolean isCompletedToday() {
            return completedToday;
        }

        public void setCompletedToday(boolean completedToday) {
            this.completedToday = completedToday;
        }
    }

    public static class CarePlanGoal {
        private String metric;
        private String baselineValue;
        private String targetValue;
        private String currentEstimatedValue;
        private String unit;
        private boolean onTrack;

        public CarePlanGoal() {}

        public CarePlanGoal(String metric, String baselineValue, String targetValue, String currentEstimatedValue, String unit, boolean onTrack) {
            this.metric = metric;
            this.baselineValue = baselineValue;
            this.targetValue = targetValue;
            this.currentEstimatedValue = currentEstimatedValue;
            this.unit = unit;
            this.onTrack = onTrack;
        }

        public String getMetric() {
            return metric;
        }

        public void setMetric(String metric) {
            this.metric = metric;
        }

        public String getBaselineValue() {
            return baselineValue;
        }

        public void setBaselineValue(String baselineValue) {
            this.baselineValue = baselineValue;
        }

        public String getTargetValue() {
            return targetValue;
        }

        public void setTargetValue(String targetValue) {
            this.targetValue = targetValue;
        }

        public String getCurrentEstimatedValue() {
            return currentEstimatedValue;
        }

        public void setCurrentEstimatedValue(String currentEstimatedValue) {
            this.currentEstimatedValue = currentEstimatedValue;
        }

        public String getUnit() {
            return unit;
        }

        public void setUnit(String unit) {
            this.unit = unit;
        }

        public boolean isOnTrack() {
            return onTrack;
        }

        public void setOnTrack(boolean onTrack) {
            this.onTrack = onTrack;
        }
    }

    public static class CarePlanMilestone {
        private Integer weekNumber;
        private String objective;
        private String clinicalCheck;
        private boolean achieved;

        public CarePlanMilestone() {}

        public CarePlanMilestone(Integer weekNumber, String objective, String clinicalCheck, boolean achieved) {
            this.weekNumber = weekNumber;
            this.objective = objective;
            this.clinicalCheck = clinicalCheck;
            this.achieved = achieved;
        }

        public Integer getWeekNumber() {
            return weekNumber;
        }

        public void setWeekNumber(Integer weekNumber) {
            this.weekNumber = weekNumber;
        }

        public String getObjective() {
            return objective;
        }

        public void setObjective(String objective) {
            this.objective = objective;
        }

        public String getClinicalCheck() {
            return clinicalCheck;
        }

        public void setClinicalCheck(String clinicalCheck) {
            this.clinicalCheck = clinicalCheck;
        }

        public boolean isAchieved() {
            return achieved;
        }

        public void setAchieved(boolean achieved) {
            this.achieved = achieved;
        }
    }

    public static class AdherenceLogEntry {
        private String logId;
        private LocalDateTime timestamp;
        private String activityType; // MEDICATION, EXERCISE, NUTRITION, VITAL_CHECK
        private String itemName;
        private boolean completed;
        private String notes;
        private Double recordedVital;

        public AdherenceLogEntry() {}

        public AdherenceLogEntry(String logId, LocalDateTime timestamp, String activityType, String itemName, boolean completed, String notes) {
            this.logId = logId;
            this.timestamp = timestamp;
            this.activityType = activityType;
            this.itemName = itemName;
            this.completed = completed;
            this.notes = notes;
        }

        public String getLogId() {
            return logId;
        }

        public void setLogId(String logId) {
            this.logId = logId;
        }

        public LocalDateTime getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
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
}
