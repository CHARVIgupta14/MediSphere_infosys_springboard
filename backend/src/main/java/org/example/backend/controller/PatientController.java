package org.example.backend.controller;



import org.example.backend.dto.PatientRequest;
import org.example.backend.model.PatientTwin;
import org.example.backend.model.VitalSigns;
import org.example.backend.service.PatientService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

    @RestController
    @RequestMapping("/api/patients")
    @CrossOrigin(origins = "*")
    public class PatientController {

        private final PatientService patientService;

        public PatientController(PatientService patientService) {
            this.patientService = patientService;
        }

        @PostMapping
        public ResponseEntity<PatientTwin> createPatient(
                @Valid @RequestBody PatientRequest request) {

            return ResponseEntity.status(201)
                    .body(patientService.createPatient(request));
        }

        @GetMapping
        public ResponseEntity<List<PatientTwin>> getAllPatients() {

            return ResponseEntity.ok(
                    patientService.getAllPatients()
            );
        }

        @GetMapping("/{patientId}")
        public ResponseEntity<PatientTwin> getPatient(
                @PathVariable String patientId) {

            return ResponseEntity.ok(
                    patientService.getPatient(patientId)
            );
        }

        @PutMapping("/{patientId}")
        public ResponseEntity<PatientTwin> updatePatient(
                @PathVariable String patientId,
                @Valid @RequestBody PatientRequest request) {

            return ResponseEntity.ok(
                    patientService.updatePatient(patientId, request)
            );
        }

        @DeleteMapping("/{patientId}")
        public ResponseEntity<Void> deletePatient(
                @PathVariable String patientId) {

            patientService.deletePatient(patientId);

            return ResponseEntity.noContent().build();
        }

        @PutMapping("/{patientId}/vitals")
        public ResponseEntity<PatientTwin> updateVitals(
                @PathVariable String patientId,
                @RequestBody VitalSigns vitals) {

            return ResponseEntity.ok(
                    patientService.updateVitals(patientId, vitals)
            );
        }

        @GetMapping("/{patientId}/360")
        public ResponseEntity<PatientTwin> getPatient360(
                @PathVariable String patientId) {

            return ResponseEntity.ok(
                    patientService.getPatient360(patientId)
            );
        }

}
