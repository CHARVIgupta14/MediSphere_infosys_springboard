package org.example.backend.controller;

import org.example.backend.model.consent;
import org.example.backend.service.ConsentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/consent")
@CrossOrigin(origins = "*")
public class ConsentController {

    private final ConsentService consentService;

    public ConsentController(ConsentService consentService) {
        this.consentService = consentService;
    }

    @GetMapping("/{patientId}")
    public ResponseEntity<consent> getConsent(
            @PathVariable String patientId) {

        return ResponseEntity.ok(
                consentService.getConsent(patientId)
        );
    }

    @PostMapping("/{patientId}/grant")
    public ResponseEntity<consent> grantConsent(
            @PathVariable String patientId) {

        return ResponseEntity.ok(
                consentService.grantConsent(patientId)
        );
    }

    @PostMapping("/{patientId}/revoke")
    public ResponseEntity<consent> revokeConsent(
            @PathVariable String patientId) {

        return ResponseEntity.ok(
                consentService.revokeConsent(patientId)
        );
    }
}