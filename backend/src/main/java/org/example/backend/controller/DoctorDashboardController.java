package org.example.backend.controller;

import org.example.backend.model.PatientTwin;
import org.example.backend.service.PatientService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctor")
@CrossOrigin(origins = "*")
public class DoctorDashboardController {

    private final PatientService patientService;

    public DoctorDashboardController(PatientService patientService) {
        this.patientService = patientService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<List<PatientTwin>> getDoctorDashboard() {

        return ResponseEntity.ok(
                patientService.getAllPatients()
        );
    }
    @GetMapping("/patients/{patientId}")
    public ResponseEntity<PatientTwin> getPatientDetails(
            @PathVariable String patientId) {

        return ResponseEntity.ok(
                patientService.getPatient360(patientId)
        );
    }
}