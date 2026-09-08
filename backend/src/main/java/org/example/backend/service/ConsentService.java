package org.example.backend.service;

import org.example.backend.model.consent;
import org.example.backend.repository.ConsentRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ConsentService {

    private final ConsentRepository consentRepository;

    public ConsentService(ConsentRepository consentRepository) {
        this.consentRepository = consentRepository;
    }

    public consent getConsent(String patientId) {

        return consentRepository
                .findByPatientId(patientId)
                .orElseGet(() -> new consent(
                        patientId,
                        "NOT_GRANTED",
                        "Patient health data access",
                        null,
                        null
                ));
    }

    public consent grantConsent(String patientId) {

        consent consent = consentRepository
                .findByPatientId(patientId)
                .orElseGet(consent::new);

        consent.setPatientId(patientId);
        consent.setStatus("GRANTED");
        consent.setPurpose("Patient health data access");
        consent.setGrantedAt(LocalDateTime.now());
        consent.setRevokedAt(null);

        return consentRepository.save(consent);
    }

    public consent revokeConsent(String patientId) {

        consent consent = consentRepository
                .findByPatientId(patientId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Consent record not found for patient: "
                                        + patientId
                        )
                );

        consent.setStatus("REVOKED");
        consent.setRevokedAt(LocalDateTime.now());

        return consentRepository.save(consent);
    }
}