package org.example.backend.service;

import org.example.backend.Kafka.PatientEventProducer;
import org.example.backend.model.PatientTwin;
import org.example.backend.repository.PatientRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

@Service
public class VitalSimulator {

    private final PatientEventProducer patientEventProducer;
    private final PatientRepository patientRepository;
    private final Random random = new Random();

    public VitalSimulator(
            PatientEventProducer patientEventProducer,
            PatientRepository patientRepository) {

        this.patientEventProducer = patientEventProducer;
        this.patientRepository = patientRepository;
    }

    @Scheduled(fixedRate = 5000)
    public void generateVitals() {

        List<PatientTwin> patients =
                patientRepository.findAll();

        for (PatientTwin patient : patients) {

            int heartRate =
                    75 + random.nextInt(21);       // 75–95

            double spo2 =
                    96 + random.nextInt(4);        // 96–99

            double temperature =
                    36.5 + random.nextDouble() * 0.6;

            temperature =
                    Math.round(temperature * 10.0) / 10.0;

            patientEventProducer.publishVitalsUpdated(
                    patient.getPatientId(),
                    heartRate,
                    spo2,
                    temperature
            );

            System.out.println(
                    "Vital Simulator → Patient="
                            + patient.getPatientId()
                            + " | HR=" + heartRate
                            + " | SpO2=" + spo2
                            + " | Temp=" + temperature
            );
        }
    }
}