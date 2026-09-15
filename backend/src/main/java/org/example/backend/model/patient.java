package org.example.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "patients")
public class patient {

    @Id
    private String id;

    private String patientId;
    private String name;
    private String consentStatus;

    public patient() {
    }

    public patient(
            String patientId,
            String name,
            String consentStatus) {
        this.patientId = patientId;
        this.name = name;
        this.consentStatus = consentStatus;
    }

    public String getId() {
        return id;
    }

    public String getPatientId() {
        return patientId;
    }

    public void setPatientId(String patientId) {
        this.patientId = patientId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getConsentStatus() {
        return consentStatus;
    }

    public void setConsentStatus(String consentStatus) {
        this.consentStatus = consentStatus;
    }
}