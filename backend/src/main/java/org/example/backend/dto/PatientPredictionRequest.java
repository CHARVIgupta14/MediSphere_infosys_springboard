package org.example.backend.dto;

public class PatientPredictionRequest {

    private Float age;
    private Float bpSystolic;
    private Float bpDiastolic;
    private Float hba1c;
    private Float ldl;
    private Float egfr;
    private Integer smoking;
    private Integer familyHistory;

    public PatientPredictionRequest() {
    }

    public PatientPredictionRequest(Float age, Float bpSystolic, Float bpDiastolic,
                                  Float hba1c, Float ldl, Float egfr,
                                  Integer smoking, Integer familyHistory) {
        this.age = age;
        this.bpSystolic = bpSystolic;
        this.bpDiastolic = bpDiastolic;
        this.hba1c = hba1c;
        this.ldl = ldl;
        this.egfr = egfr;
        this.smoking = smoking;
        this.familyHistory = familyHistory;
    }

    public Float getAge() {
        return age;
    }

    public void setAge(Float age) {
        this.age = age;
    }

    public Float getBpSystolic() {
        return bpSystolic;
    }

    public void setBpSystolic(Float bpSystolic) {
        this.bpSystolic = bpSystolic;
    }

    public Float getBpDiastolic() {
        return bpDiastolic;
    }

    public void setBpDiastolic(Float bpDiastolic) {
        this.bpDiastolic = bpDiastolic;
    }

    public Float getHba1c() {
        return hba1c;
    }

    public void setHba1c(Float hba1c) {
        this.hba1c = hba1c;
    }

    public Float getLdl() {
        return ldl;
    }

    public void setLdl(Float ldl) {
        this.ldl = ldl;
    }

    public Float getEgfr() {
        return egfr;
    }

    public void setEgfr(Float egfr) {
        this.egfr = egfr;
    }

    public Integer getSmoking() {
        return smoking;
    }

    public void setSmoking(Integer smoking) {
        this.smoking = smoking;
    }

    public Integer getFamilyHistory() {
        return familyHistory;
    }

    public void setFamilyHistory(Integer familyHistory) {
        this.familyHistory = familyHistory;
    }
}
