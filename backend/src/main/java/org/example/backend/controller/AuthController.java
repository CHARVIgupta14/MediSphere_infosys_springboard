package org.example.backend.controller;

import org.example.backend.dto.LoginRequest;
import org.example.backend.model.PatientTwin;
import org.example.backend.repository.PatientRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final PatientRepository patientRepository;

    public AuthController(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request) {

        PatientTwin patient = patientRepository
                .findByPatientId(request.getPatientId())
                .orElse(null);

        if (patient == null) {
            return ResponseEntity
                    .status(401)
                    .body("Invalid patient ID or password");
        }

        // Basic login for now
        if (!request.getPassword().equals("1234")) {
            return ResponseEntity
                    .status(401)
                    .body("Invalid patient ID or password");
        }

        return ResponseEntity.ok(patient);
    }
}