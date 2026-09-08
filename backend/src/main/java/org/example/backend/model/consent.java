package org.example.backend.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "consents")
public class consent {

    @Id
    private String id;

    private String patientId;

    private String status;

    private String purpose;

    private LocalDateTime grantedAt;

    private LocalDateTime revokedAt;

    public consent() {
    }

    public consent(
            String patientId,
            String status,
            String purpose,
            LocalDateTime grantedAt,
            LocalDateTime revokedAt) {

        this.patientId = patientId;
        this.status = status;
        this.purpose = purpose;
        this.grantedAt = grantedAt;
        this.revokedAt = revokedAt;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPurpose() {
        return purpose;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public LocalDateTime getGrantedAt() {
        return grantedAt;
    }

    public void setGrantedAt(LocalDateTime grantedAt) {
        this.grantedAt = grantedAt;
    }

    public LocalDateTime getRevokedAt() {
        return revokedAt;
    }

    public void setRevokedAt(LocalDateTime revokedAt) {
        this.revokedAt = revokedAt;
    }
}