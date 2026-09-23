package org.example.backend.service;

import org.example.backend.Kafka.PatientEventProducer;
import org.example.backend.model.Alert;
import org.example.backend.model.PatientTwin;
import org.example.backend.repository.AlertRepository;
import org.example.backend.repository.PatientRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class VitalSimulator {

    private final PatientEventProducer patientEventProducer;
    private final PatientRepository patientRepository;
    private final AlertRepository alertRepository;
    private final Random random = new Random();

    public VitalSimulator(
            PatientEventProducer patientEventProducer,
            PatientRepository patientRepository,
            AlertRepository alertRepository) {

        this.patientEventProducer = patientEventProducer;
        this.patientRepository = patientRepository;
        this.alertRepository = alertRepository;
    }

    @Scheduled(fixedRate = 5000)
    public void generateVitals() {

        List<PatientTwin> patients =
                patientRepository.findAll();

        for (PatientTwin patient : patients) {
            String pid = patient.getPatientId();

            // Check if patient has any active clinical alerts in AlertRepository
            Optional<Alert> activeHrAlert = alertRepository
                    .findTopByPatientIdAndVitalTypeAndStatusOrderByTimestampDesc(pid, "HEART_RATE", "ACTIVE");
            Optional<Alert> activeSpo2Alert = alertRepository
                    .findTopByPatientIdAndVitalTypeAndStatusOrderByTimestampDesc(pid, "SPO2", "ACTIVE");
            Optional<Alert> activeTempAlert = alertRepository
                    .findTopByPatientIdAndVitalTypeAndStatusOrderByTimestampDesc(pid, "TEMPERATURE", "ACTIVE");

            int heartRate;
            double spo2;
            double temperature;

            if (activeHrAlert.isPresent()) {
                // Patient is in active tachycardia crisis! Sustain telemetry between 140 and 148 BPM
                heartRate = 140 + random.nextInt(9);
            } else if (patient.getConditions() != null && patient.getConditions().stream().anyMatch(c -> c.equalsIgnoreCase("Hypertension"))) {
                // Chronic hypertensive patient - runs elevated/borderline (96-108 BPM)
                heartRate = 96 + random.nextInt(13);
            } else {
                // Stable resting patient (68-82 BPM)
                heartRate = 68 + random.nextInt(15);
            }

            if (activeSpo2Alert.isPresent()) {
                // Patient is in acute hypoxemic crisis!
                spo2 = 87.0 + random.nextDouble() * 2.5;
            } else {
                // Normal oxygen saturation (96-99%)
                spo2 = 96.0 + random.nextInt(4);
            }

            if (activeTempAlert.isPresent()) {
                // Active hyperpyrexia
                temperature = 39.1 + random.nextDouble() * 0.8;
            } else {
                // Normal core body temperature (36.5-37.1°C)
                temperature = 36.5 + random.nextDouble() * 0.6;
            }

            temperature = Math.round(temperature * 10.0) / 10.0;
            spo2 = Math.round(spo2 * 10.0) / 10.0;

            patientEventProducer.publishVitalsUpdated(
                    patient.getPatientId(),
                    heartRate,
                    spo2,
                    temperature
            );

            System.out.println(
                    "Vital Simulator → Patient="
                            + patient.getPatientId()
                            + " (" + patient.getName() + ")"
                            + " | HR=" + heartRate + (activeHrAlert.isPresent() ? " [CRISIS TACHYCARDIA]" : "")
                            + " | SpO2=" + spo2 + (activeSpo2Alert.isPresent() ? " [HYPOXEMIA]" : "")
                            + " | Temp=" + temperature
            );
        }
    }

    /**
     * Milestone 3: Injects an acute vital sign crisis (e.g. Heart Rate = 145 BPM)
     * directly into the Kafka telemetry stream.
     */
    public void triggerAnomalySpike(String patientId, Integer heartRate, Double spo2, Double temperature) {
        int hr = (heartRate != null && heartRate > 0) ? heartRate : 145;
        double sp = (spo2 != null && spo2 > 0) ? spo2 : 97.0;
        double temp = (temperature != null && temperature > 0) ? temperature : 37.0;

        patientEventProducer.publishVitalsUpdated(patientId, hr, sp, temp);
        System.out.println("⚡ Vital Simulator: Crisis anomaly injected for patient " + patientId + " -> HR=" + hr + " BPM (Acute Tachycardia)");
    }
}