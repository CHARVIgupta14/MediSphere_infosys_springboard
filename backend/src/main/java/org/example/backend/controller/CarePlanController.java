package org.example.backend.controller;

import org.example.backend.dto.*;
import org.example.backend.model.CarePlan;
import org.example.backend.service.CarePlanService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/careplans")
@CrossOrigin(origins = "*")
public class CarePlanController {

    private final CarePlanService carePlanService;

    public CarePlanController(CarePlanService carePlanService) {
        this.carePlanService = carePlanService;
    }

    /**
     * GET /api/v1/careplans/patient/{patientId}
     * Retrieves active/latest personalized care plan for a patient (auto-generates if none exists).
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<CarePlan> getCarePlanForPatient(@PathVariable String patientId) {
        CarePlan carePlan = carePlanService.getOrCreateCarePlanForPatient(patientId);
        return ResponseEntity.ok(carePlan);
    }

    /**
     * POST /api/v1/careplans/generate/{patientId}
     * Formulates new AI-driven personalized care plan aligned with clinical guidelines.
     */
    @PostMapping("/generate/{patientId}")
    public ResponseEntity<CarePlan> generateCarePlan(
            @PathVariable String patientId,
            @RequestBody(required = false) CarePlanGenerateRequest request) {
        CarePlan plan = carePlanService.generatePersonalizedCarePlan(patientId, request);
        return ResponseEntity.ok(plan);
    }

    /**
     * POST /api/v1/careplans/what-if
     * Counterfactual "What-If" simulator evaluating risk reduction upon lifestyle/medical intervention.
     */
    @PostMapping("/what-if")
    public ResponseEntity<WhatIfSimulationResponse> simulateWhatIf(
            @RequestBody WhatIfSimulationRequest request) {
        WhatIfSimulationResponse response = carePlanService.simulateWhatIf(request);
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/v1/careplans/{carePlanId}/adherence
     * Patient logging adherence to medication, exercise, or vital telemetry.
     */
    @PostMapping("/{carePlanId}/adherence")
    public ResponseEntity<CarePlan> logAdherence(
            @PathVariable String carePlanId,
            @RequestBody AdherenceLogRequest request) {
        CarePlan updated = carePlanService.logPatientAdherence(carePlanId, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * PUT /api/v1/careplans/{carePlanId}
     * Attending physician modifies care plan orders, doctor notes, or status.
     */
    @PutMapping("/{carePlanId}")
    public ResponseEntity<CarePlan> updateCarePlan(
            @PathVariable String carePlanId,
            @RequestBody CarePlan carePlan) {
        CarePlan updated = carePlanService.updateCarePlan(carePlanId, carePlan);
        return ResponseEntity.ok(updated);
    }

    /**
     * POST /api/v1/careplans/{carePlanId}/medications
     * Attending doctor prescribes / adds new medication to the care plan regimen.
     */
    @PostMapping("/{carePlanId}/medications")
    public ResponseEntity<CarePlan> addMedication(
            @PathVariable String carePlanId,
            @RequestBody CarePlan.CarePlanMedication medication) {
        CarePlan updated = carePlanService.addMedication(carePlanId, medication);
        return ResponseEntity.ok(updated);
    }

    /**
     * DELETE /api/v1/careplans/{carePlanId}/medications/{medicationName}
     * Attending doctor discontinues / removes medication from the care plan regimen.
     */
    @DeleteMapping("/{carePlanId}/medications/{medicationName}")
    public ResponseEntity<CarePlan> removeMedication(
            @PathVariable String carePlanId,
            @PathVariable String medicationName) {
        CarePlan updated = carePlanService.removeMedication(carePlanId, medicationName);
        return ResponseEntity.ok(updated);
    }

    /**
     * POST /api/v1/careplans/{carePlanId}/sync-fhir
     * Bidirectional writeback of CarePlan to remote FHIR R4 server.
     */
    @PostMapping("/{carePlanId}/sync-fhir")
    public ResponseEntity<CarePlan> syncToFhir(@PathVariable String carePlanId) {
        CarePlan plan = carePlanService.getCarePlanByIdOrPatientId(carePlanId);
        CarePlan synced = carePlanService.syncToFhirServer(plan);
        return ResponseEntity.ok(synced);
    }

    /**
     * GET /api/v1/careplans/{carePlanId}/fhir-json
     * Returns official HL7 FHIR R4 CarePlan resource representation in JSON.
     */
    @GetMapping(value = "/{carePlanId}/fhir-json", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> getFhirJson(@PathVariable String carePlanId) {
        String json = carePlanService.exportFhirJson(carePlanId);
        return ResponseEntity.ok(json);
    }

    /**
     * GET /api/v1/careplans/summary
     * Clinical operations metrics: active plans, average adherence, high-risk coverage.
     */
    @GetMapping("/summary")
    public ResponseEntity<CarePlanSummaryResponse> getSummary() {
        return ResponseEntity.ok(carePlanService.getSummary());
    }
}
