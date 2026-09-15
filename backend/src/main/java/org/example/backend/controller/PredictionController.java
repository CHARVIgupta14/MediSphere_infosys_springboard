package org.example.backend.controller;

import org.example.backend.dto.FLModelMetricsResponse;
import org.example.backend.dto.PatientPredictionRequest;
import org.example.backend.dto.PredictionSummaryResponse;
import org.example.backend.model.RiskPrediction;
import org.example.backend.service.PredictionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class PredictionController {

    private final PredictionService predictionService;

    public PredictionController(PredictionService predictionService) {
        this.predictionService = predictionService;
    }

    /**
     * POST /api/v1/predictions/predict/{patientId}
     * Fetches patient twin data, invokes ML service, stores and returns prediction.
     */
    @PostMapping("/predictions/predict/{patientId}")
    public ResponseEntity<RiskPrediction> predict(
            @PathVariable String patientId,
            @RequestBody(required = false) PatientPredictionRequest request) {

        RiskPrediction prediction = predictionService.predictForPatient(patientId, request);
        return ResponseEntity.ok(prediction);
    }

    /**
     * GET /api/v1/models/fl/latest-metrics
     * Returns FL model round, accuracy, and status.
     */
    @GetMapping("/models/fl/latest-metrics")
    public ResponseEntity<FLModelMetricsResponse> getLatestModelMetrics() {
        FLModelMetricsResponse metrics = predictionService.getLatestModelMetrics();
        return ResponseEntity.ok(metrics);
    }

    /**
     * GET /api/v1/predictions/summary
     * Returns total predictions today, model accuracy, high-risk count.
     */
    @GetMapping("/predictions/summary")
    public ResponseEntity<PredictionSummaryResponse> getPredictionSummary() {
        PredictionSummaryResponse summary = predictionService.getPredictionSummary();
        return ResponseEntity.ok(summary);
    }

    /**
     * GET /api/v1/predictions/patient/{patientId}
     * Helper endpoint to retrieve historical risk predictions for a patient.
     */
    @GetMapping("/predictions/patient/{patientId}")
    public ResponseEntity<List<RiskPrediction>> getPredictionsForPatient(
            @PathVariable String patientId) {
        return ResponseEntity.ok(predictionService.getPredictionsForPatient(patientId));
    }

    /**
     * GET /api/v1/predictions/{predid}
     * Helper endpoint to retrieve a prediction by prediction UUID.
     */
    @GetMapping("/predictions/{predid}")
    public ResponseEntity<RiskPrediction> getPredictionById(
            @PathVariable UUID predid) {
        return predictionService.getPredictionById(predid)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
