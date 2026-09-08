package org.example.backend.Kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.backend.model.PatientTwin;
import org.example.backend.model.VitalSigns;
import org.example.backend.repository.PatientRepository;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class PatientEventConsumer {

    private final PatientRepository patientRepository;
    private final ObjectMapper objectMapper;

    public PatientEventConsumer(
            PatientRepository patientRepository,
            ObjectMapper objectMapper) {

        this.patientRepository = patientRepository;
        this.objectMapper = objectMapper;
    }

    @KafkaListener(
            topics = "medisphere-patient-events",
            groupId = "medisphere-group"
    )
    public void consumePatientEvent(String event) {

        try {

            System.out.println("=================================");
            System.out.println("Kafka event received:");
            System.out.println(event);

            PatientEvent patientEvent =
                    objectMapper.readValue(event, PatientEvent.class);

            if ("VITALS_UPDATED".equals(patientEvent.getEventType())) {

                PatientTwin patient =
                        patientRepository
                                .findByPatientId(patientEvent.getPatientId())
                                .orElseThrow(() ->
                                        new RuntimeException(
                                                "Patient not found: "
                                                        + patientEvent.getPatientId()
                                        )
                                );

                VitalSigns vitals = new VitalSigns();

                vitals.setHeartRate(patientEvent.getHeartRate());
                vitals.setSpo2(patientEvent.getSpo2());
                vitals.setTemperature(patientEvent.getTemperature());
                vitals.setTimestamp(LocalDateTime.now());

                patient.setLatestVitals(vitals);

                patientRepository.save(patient);

                System.out.println(
                        "MongoDB updated with latest vitals for patient: "
                                + patientEvent.getPatientId()
                );

                System.out.println(
                        "HR: " + patientEvent.getHeartRate()
                                + " | SpO2: " + patientEvent.getSpo2()
                                + " | Temperature: "
                                + patientEvent.getTemperature()
                );
            }

            System.out.println("=================================");

        } catch (Exception e) {

            System.out.println(
                    "Error processing Kafka event: "
                            + e.getMessage()
            );
        }
    }
}