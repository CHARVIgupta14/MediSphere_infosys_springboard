package org.example.backend.controller;

import org.example.backend.FHIR.fhirService;
import org.example.backend.model.PatientTwin;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/fhir")
public class FhirController {

    private final fhirService fhirService;

    public FhirController(fhirService fhirService) {
        this.fhirService = fhirService;
    }

    // Get all patients from FHIR as clean JSON
    @GetMapping("/patients")
    public String getPatients() {
        return fhirService.getPatientsJson();
    }

    // Convert a FHIR Patient into a PatientTwin
    @GetMapping("/patients/{patientId}/twin")
    public PatientTwin getPatientTwin(
            @PathVariable String patientId) {

        return fhirService.getPatientTwin(patientId);
    }

    // Import FHIR Patient → PatientTwin → MongoDB
    @PostMapping("/patients/{patientId}/import")
    public PatientTwin importPatient(
            @PathVariable String patientId) {

        return fhirService.savePatientTwin(patientId);
    }
}