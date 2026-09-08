package org.example.backend.Kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
public class PatientEventProducer {

    private static final String TOPIC = "medisphere-patient-events";

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public PatientEventProducer(
            KafkaTemplate<String, String> kafkaTemplate,
            ObjectMapper objectMapper) {

        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
    }

    public void publishPatientCreated(
            String patientId,
            String patientName) {

        PatientEvent event = new PatientEvent(
                "PATIENT_CREATED",
                patientId,
                patientName
        );

        sendEvent(patientId, event);

        System.out.println(
                "Kafka Producer: PatientCreated event sent for "
                        + patientId
        );
    }

    public void publishVitalsUpdated(
            String patientId,
            Integer heartRate,
            Double spo2,
            Double temperature) {

        PatientEvent event = new PatientEvent(
                "VITALS_UPDATED",
                patientId,
                heartRate,
                spo2,
                temperature
        );

        sendEvent(patientId, event);

        System.out.println(
                "Kafka Producer: VitalsUpdated event sent for "
                        + patientId
                        + " | HR=" + heartRate
                        + " | SpO2=" + spo2
                        + " | Temp=" + temperature
        );
    }

    private void sendEvent(
            String patientId,
            PatientEvent event) {

        try {

            String json = objectMapper.writeValueAsString(event);

            kafkaTemplate.send(
                    TOPIC,
                    patientId,
                    json
            );

        } catch (JsonProcessingException e) {

            throw new RuntimeException(
                    "Failed to convert Kafka event to JSON",
                    e
            );
        }
    }
}