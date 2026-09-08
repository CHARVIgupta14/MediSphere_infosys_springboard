package org.example.backend.controller;

import org.example.backend.dto.PatientDashboardResponse;
import org.example.backend.model.consent;
import org.example.backend.model.PatientTwin;
import org.example.backend.service.ConsentService;
import org.example.backend.service.PatientService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class PatientDashboardController {

    private final PatientService patientService;
    private final ConsentService consentService;

    public PatientDashboardController(
            PatientService patientService,
            ConsentService consentService) {

        this.patientService = patientService;
        this.consentService = consentService;
    }

    @GetMapping("/{patientId}")
    public ResponseEntity<PatientDashboardResponse> getDashboard(
            @PathVariable String patientId) {

        PatientTwin patient =
                patientService.getPatient360(patientId);

        consent consent =
                consentService.getConsent(patientId);

        return ResponseEntity.ok(
                new PatientDashboardResponse(
                        patient,
                        consent
                )
        );
    }
}