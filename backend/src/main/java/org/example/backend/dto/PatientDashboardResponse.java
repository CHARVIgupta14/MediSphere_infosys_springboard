package org.example.backend.dto;

import org.example.backend.model.consent;
import org.example.backend.model.PatientTwin;

public class PatientDashboardResponse {

    private PatientTwin patient;
    private consent consent;

    public PatientDashboardResponse(
            PatientTwin patient,
            consent consent) {

        this.patient = patient;
        this.consent = consent;
    }

    public PatientTwin getPatient() {
        return patient;
    }

    public consent getConsent() {
        return consent;
    }
}
